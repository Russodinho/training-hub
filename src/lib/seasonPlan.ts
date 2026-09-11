// Generates a training plan + stretch goals tailored to whatever race is
// actually next (any sport, any distance) — replaces the old hardcoded
// 7-week plan that only ever matched the original May-Sept race set.
// Cached per race_id (supabase/migrations/0009_season_plans.sql), not per
// day: a training arc doesn't need daily regeneration like the coach
// check-ins do. Also writes the race-day-specific parts back onto the
// race itself (timeline/strategy) so Race Day picks them up automatically.

import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import { getSupabaseClient, updateRaceTimelineStrategy } from './supabase'
import type { Race } from './supabase'
import type { AthleteContext } from './agentContext'
import { AGENT_CONFIGS } from './agentPrompts'

const SeasonPlanSchema = z.object({
  philosophy: z.string(),
  phases: z.array(z.object({
    title: z.string(),
    dateRange: z.string(),
    notes: z.array(z.string()),
    weeks: z.array(z.object({
      label: z.string(),
      dateRange: z.string(),
      rows: z.array(z.object({ sport: z.string(), detail: z.string() })),
    })),
  })),
  raceDayTargets: z.array(z.object({ segment: z.string(), target: z.string(), note: z.string() })),
  stretchGoals: z.array(z.object({ icon: z.string(), title: z.string(), body: z.string() })),
  progressions: z.array(z.object({
    sport: z.string(),
    milestones: z.array(z.object({ date: z.string(), target: z.string(), note: z.string() })),
  })),
  readinessChecklist: z.array(z.string()),
  raceTimeline: z.array(z.object({ time: z.string(), item: z.string(), highlight: z.boolean().optional() })),
  raceStrategy: z.array(z.object({ segment: z.string(), note: z.string() })),
})

export type SeasonPlan = z.infer<typeof SeasonPlanSchema>

export async function getSeasonPlan(raceId: string): Promise<SeasonPlan | null> {
  const { data } = await getSupabaseClient().from('season_plans').select('plan').eq('race_id', raceId).maybeSingle()
  return (data?.plan as SeasonPlan) ?? null
}

export async function generateSeasonPlan(ctx: AthleteContext, race: Race): Promise<SeasonPlan> {
  const daysOut = ctx.season.daysToNextRace ?? 0
  const combinedExpertise = ['swim', 'bike', 'run', 'strength', 'planner']
    .map(id => AGENT_CONFIGS[id as keyof typeof AGENT_CONFIGS].expertise)
    .join('\n')

  const anthropic = new Anthropic()
  const response = await anthropic.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 16000,
    output_config: {
      effort: 'high',
      format: zodOutputFormat(SeasonPlanSchema),
    },
    system: `You are a triathlon coaching team (swim, bike, run, strength, and scheduling coaches combined) building a full training plan for Matt, a dual-sport triathlete/soccer player, aimed at one specific upcoming race. Build the entire plan around this race's actual sport, distance(s), and days remaining — do not assume it's a triathlon if it isn't, and do not assume any fixed number of weeks; size the plan to the real time available. Reference his real current context (recent training, recovery, body comp) rather than generic advice. Never invent race history that isn't in the context.

Combined coaching expertise you're drawing on:
${combinedExpertise}`,
    messages: [{
      role: 'user',
      content: `Next race: ${race.name} · ${race.sport} · ${JSON.stringify(race.distances)} · ${race.date} · ${daysOut} days out · tier: ${race.type ?? 'n/a'}

Live athlete context:
${JSON.stringify(ctx)}

Build:
1. A short training philosophy statement.
2. Phased training blocks (base/build/sharpen/taper as appropriate for ${daysOut} days out — fewer phases if little time remains, don't force a 7-week structure onto a short runway) with weekly session rows per sport.
3. Race-day pacing targets per segment.
4. 4-8 season/race stretch goals.
5. Progression milestones (one track per relevant sport — skip disciplines this race doesn't involve).
6. A race-morning readiness checklist.
7. A race-morning timeline (wake time through start, with the actual start highlighted) and a per-segment race strategy — these two will be shown on the Race Day page for this specific race.`,
    }],
  })

  const parsed = response.parsed_output
  if (!parsed) throw new Error('Claude did not return a valid season plan')
  return parsed
}

export async function saveSeasonPlan(raceId: string, plan: SeasonPlan): Promise<void> {
  const sb = getSupabaseClient()
  await sb.from('season_plans').upsert({ race_id: raceId, plan, generated_at: new Date().toISOString() }, { onConflict: 'race_id' })
}

export async function generateAndSaveSeasonPlan(ctx: AthleteContext, race: Race): Promise<SeasonPlan> {
  const plan = await generateSeasonPlan(ctx, race)
  await saveSeasonPlan(race.id, plan)
  await updateRaceTimelineStrategy(
    race.id,
    plan.raceTimeline.map(t => [t.time, t.item, t.highlight] as [string, string, boolean?]),
    plan.raceStrategy.map(s => [s.segment, s.note] as [string, string]),
  )
  return plan
}
