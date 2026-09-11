import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAthleteContext } from '@/lib/agentContext'
import { getActiveRace } from '@/lib/supabase'
import { generateAndSaveSeasonPlan } from '@/lib/seasonPlan'

export const dynamic = 'force-dynamic'

// Explicit action only — never called automatically. Generates (or
// regenerates, overwriting any existing cached plan) for whatever race is
// currently next, and pushes the race-day timeline/strategy onto that
// race so Race Day picks it up too.
export async function POST() {
  try {
    const [ctx, active] = await Promise.all([getAthleteContext(), getActiveRace()])
    if (!active) return NextResponse.json({ error: 'No upcoming race to plan for' }, { status: 400 })

    const plan = await generateAndSaveSeasonPlan(ctx, active.race)
    return NextResponse.json({ race: ctx.races.next, plan, daysOut: ctx.season.daysToNextRace })
  } catch (err) {
    console.error('season-plan generate failed', err)
    const status = err instanceof Anthropic.APIError && typeof err.status === 'number' ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to generate season plan'
    return NextResponse.json({ error: message }, { status })
  }
}
