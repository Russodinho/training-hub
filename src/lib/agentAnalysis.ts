import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import OpenAI from 'openai'
import { z } from 'zod'
import { createServiceClient } from './supabase'

const CoachingAnalysisSchema = z.object({
  final_recommendation: z.string(),
  today_action: z.string(),
  debate_summary: z.string(),
  confidence: z.number().min(0).max(100),
})

export type CoachingAnalysis = z.infer<typeof CoachingAnalysisSchema>

interface WorkoutSetRow {
  session_id: string
  exercise: string
  reps_hit: string | null
  load: number | null
  rpe: string | null
}

interface WorkoutSummary {
  date: string
  type: string
  notes: string | null
  sets: { exercise: string; load: number | null; reps_hit: string | null; rpe: string | null }[]
}

interface DailyStatRow {
  date: string
  resting_hr: number | null
  sleep_score: number | null
  stress_avg: number | null
  body_battery_min: number | null
  body_battery_max: number | null
  steps: number | null
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

async function fetchLast7Days(): Promise<{ workouts: WorkoutSummary[]; sleep: DailyStatRow[] }> {
  const sb = createServiceClient()
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const sinceStr = since.toISOString().split('T')[0]

  const [{ data: sessions }, { data: dailyStats }] = await Promise.all([
    sb.from('workout_sessions')
      .select('id, date, type, notes')
      .gte('date', sinceStr)
      .order('date', { ascending: true }),
    sb.from('garmin_daily_stats')
      .select('date, resting_hr, sleep_score, stress_avg, body_battery_min, body_battery_max, steps')
      .gte('date', sinceStr)
      .order('date', { ascending: true }),
  ])

  const sessionIds = (sessions ?? []).map((s: { id: string }) => s.id)
  const { data: sets } = sessionIds.length
    ? await sb.from('workout_sets').select('session_id, exercise, reps_hit, load, rpe').in('session_id', sessionIds)
    : { data: [] as WorkoutSetRow[] }

  const setsBySession: Record<string, WorkoutSetRow[]> = {}
  for (const s of (sets ?? []) as WorkoutSetRow[]) {
    if (!setsBySession[s.session_id]) setsBySession[s.session_id] = []
    setsBySession[s.session_id].push(s)
  }

  const workouts: WorkoutSummary[] = (sessions ?? []).map((s: { id: string; date: string; type: string; notes: string | null }) => ({
    date: s.date,
    type: s.type,
    notes: s.notes,
    sets: (setsBySession[s.id] ?? []).map(x => ({ exercise: x.exercise, load: x.load, reps_hit: x.reps_hit, rpe: x.rpe })),
  }))

  return { workouts, sleep: (dailyStats ?? []) as DailyStatRow[] }
}

async function readCache(date: string): Promise<CoachingAnalysis | null> {
  const sb = createServiceClient()
  const { data } = await sb.from('agent_cache').select('*').eq('date', date).maybeSingle()
  if (!data) return null
  return {
    final_recommendation: data.final_recommendation,
    today_action: data.today_action,
    debate_summary: data.debate_summary,
    confidence: data.confidence,
  }
}

// Plain insert (not upsert) — the `date` unique constraint in
// 0005_agent_cache.sql is the real guard against duplicate rows. If two
// requests race and both miss the cache, the loser's insert hits a unique
// violation (Postgres code 23505); that's expected and fine — the winner's
// row is what both callers should return, so we just swallow it here.
async function writeCache(date: string, analysis: CoachingAnalysis): Promise<void> {
  const sb = createServiceClient()
  const { error } = await sb.from('agent_cache').insert({ date, ...analysis })
  if (error && error.code !== '23505') {
    console.error('agent_cache insert failed', error)
  }
}

// Three-step coaching loop: Claude drafts an analysis, GPT-4 critiques it,
// Claude refines the draft into the final structured recommendation.
async function runCoachingLoop(workouts: WorkoutSummary[], sleep: DailyStatRow[]): Promise<CoachingAnalysis> {
  const dataBlock = `Last 7 days of logged workouts (JSON):\n${JSON.stringify(workouts)}\n\nLast 7 days of Garmin daily recovery/sleep stats (JSON):\n${JSON.stringify(sleep)}`

  const anthropic = new Anthropic()
  const openai = new OpenAI()

  // Step 1 — Claude drafts an initial analysis
  const draftResponse = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1024,
    output_config: { effort: 'medium' },
    system: "You are a training coach for a triathlete who lifts weights and does swim/bike/run endurance training. Write a concise initial analysis of their last 7 days of workouts and recovery/sleep data: what's going well, what's concerning, and a draft recommendation. This draft will be critiqued by a second reviewer before being finalized, so be specific and cite the data, but flag any uncertainty. Do not invent data that isn't present.",
    messages: [{
      role: 'user',
      content: `${dataBlock}\n\nProvide your initial analysis and a draft recommendation.`,
    }],
  })
  const draft = draftResponse.content.find(b => b.type === 'text')?.text ?? ''

  // Step 2 — GPT-4 critiques the draft
  const critique = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content: 'You are a skeptical second-opinion reviewer for an AI training coach. You will be given raw 7-day training/recovery data and a draft analysis + recommendation from another AI coach. Critique the draft directly and concisely: point out anything unsupported by the data, contradictions, missed risks (overtraining, poor recovery, inconsistent logging), or alternative interpretations worth considering.',
      },
      {
        role: 'user',
        content: `${dataBlock}\n\nDraft analysis from the other coach:\n${draft}\n\nCritique this draft.`,
      },
    ],
  })
  const critiqueText = critique.choices[0]?.message?.content ?? 'No critique returned.'

  // Step 3 — Claude refines the draft using the critique into the final structured output
  const finalResponse = await anthropic.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 1024,
    output_config: {
      effort: 'medium',
      format: zodOutputFormat(CoachingAnalysisSchema),
    },
    system: 'You are the lead coach. You wrote an initial draft analysis of a triathlete\'s last 7 days, and a second reviewer critiqued it. Incorporate valid critique points, disregard invalid ones, and produce the final coaching output.',
    messages: [{
      role: 'user',
      content: `${dataBlock}\n\nYour draft analysis:\n${draft}\n\nSecond reviewer's critique:\n${critiqueText}\n\nProduce the final output: final_recommendation (2-3 sentences, the overall verdict incorporating the critique), today_action (one concrete, specific action for today), debate_summary (1-2 sentences on what the critique caught, confirmed, or changed), and confidence (0-100 — how confident you are given data completeness and agreement between the draft and critique).`,
    }],
  })

  const parsed = finalResponse.parsed_output
  if (!parsed) throw new Error('Claude did not return valid structured output for the final coaching analysis')
  return parsed
}

export async function getAgentAnalysis(forceRefresh = false): Promise<CoachingAnalysis> {
  const date = todayStr()

  // Cache check comes before anything else — including the API key checks
  // below — so a cache hit never touches Claude or OpenAI at all.
  if (!forceRefresh) {
    const cached = await readCache(date)
    if (cached) return cached
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set — add it to .env.local (and to Vercel env vars) to enable the coaching agent')
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set — add it to .env.local (and to Vercel env vars) to enable the coaching agent\'s critique step')
  }

  const { workouts, sleep } = await fetchLast7Days()

  if (workouts.length === 0 && sleep.length === 0) {
    const empty: CoachingAnalysis = {
      final_recommendation: 'No data logged in the last 7 days — nothing to analyze yet.',
      today_action: 'Log a workout or run the Garmin sync so the coaching agent has something to work with.',
      debate_summary: 'Skipped — no data to critique.',
      confidence: 0,
    }
    await writeCache(date, empty)
    return empty
  }

  const analysis = await runCoachingLoop(workouts, sleep)
  await writeCache(date, analysis)
  return analysis
}
