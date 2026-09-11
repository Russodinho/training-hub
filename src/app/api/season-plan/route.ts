import { NextResponse } from 'next/server'
import { getAthleteContext } from '@/lib/agentContext'
import { getSeasonPlan } from '@/lib/seasonPlan'

export const dynamic = 'force-dynamic'

// Read-only — never generates. Resolves the current next race and returns
// its cached plan (or null if none has been generated yet).
export async function GET() {
  try {
    const ctx = await getAthleteContext()
    const race = ctx.races.next
    if (!race) return NextResponse.json({ race: null, plan: null, daysOut: null })

    const plan = await getSeasonPlan(race.id)
    return NextResponse.json({ race, plan, daysOut: ctx.season.daysToNextRace })
  } catch (err) {
    console.error('season-plan peek failed', err)
    const message = err instanceof Error ? err.message : 'Failed to load season plan'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
