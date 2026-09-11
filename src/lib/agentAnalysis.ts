import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { createServiceClient } from './supabase'

const AgentAnalysisSchema = z.object({
  overall_status: z.string(),
  key_insights: z.array(z.string()),
  top_recommendation: z.string(),
})

export type AgentAnalysis = z.infer<typeof AgentAnalysisSchema>

interface WorkoutSetRow {
  session_id: string
  exercise: string
  reps_hit: string | null
  load: number | null
  rpe: string | null
}

// Cache the last analysis briefly — the dashboard recap and the /agent page
// both call this, and there's no reason to pay for a fresh Claude call on
// every page load.
let cached: { at: number; data: AgentAnalysis } | null = null
const CACHE_MS = 15 * 60 * 1000

export async function getAgentAnalysis(): Promise<AgentAnalysis> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.data

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set — add it to .env.local (and to Vercel env vars) to enable agent analysis')
  }

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

  const workouts = (sessions ?? []).map((s: { id: string; date: string; type: string; notes: string | null }) => ({
    date: s.date,
    type: s.type,
    notes: s.notes,
    sets: (setsBySession[s.id] ?? []).map(x => ({ exercise: x.exercise, load: x.load, reps_hit: x.reps_hit, rpe: x.rpe })),
  }))

  const sleep = dailyStats ?? []

  if (workouts.length === 0 && sleep.length === 0) {
    const empty: AgentAnalysis = {
      overall_status: 'No data logged in the last 7 days',
      key_insights: [],
      top_recommendation: 'Log a workout or run the Garmin sync to get an analysis.',
    }
    cached = { at: Date.now(), data: empty }
    return empty
  }

  const anthropic = new Anthropic()

  const response = await anthropic.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 2048,
    output_config: {
      effort: 'low',
      format: zodOutputFormat(AgentAnalysisSchema),
    },
    system: "You are a training analyst for a triathlete who lifts weights and does swim/bike/run endurance training. Review the last 7 days of logged workouts and Garmin recovery/sleep stats and give a concise, actionable summary. Reference specific exercises, loads, or recovery metrics by name where relevant. Do not invent data that isn't present — if a category (e.g. sleep) has no data, say so instead of guessing.",
    messages: [{
      role: 'user',
      content: `Last 7 days of logged workouts (JSON):\n${JSON.stringify(workouts)}\n\nLast 7 days of Garmin daily recovery/sleep stats (JSON):\n${JSON.stringify(sleep)}\n\nAnalyze training load, recovery trends, and consistency. Respond with overall_status (one sentence), key_insights (3-5 short, specific bullet points), and top_recommendation (one concrete action for the next few days).`,
    }],
  })

  const parsed = response.parsed_output
  if (!parsed) throw new Error('Claude did not return valid structured output')

  cached = { at: Date.now(), data: parsed }
  return parsed
}
