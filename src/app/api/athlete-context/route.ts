import { NextResponse } from 'next/server'
import { getAthleteContext } from '@/lib/agentContext'

export const dynamic = 'force-dynamic'

// Used by the /agent page's client-side TrainingSummary display — fine to
// return the full context here since this app has exactly one user viewing
// their own data. The coaching-message route (api/agent-message) does NOT
// use this endpoint; it fetches context server-side itself.
export async function GET() {
  try {
    const ctx = await getAthleteContext()
    return NextResponse.json(ctx)
  } catch (err) {
    console.error('athlete-context failed', err)
    const message = err instanceof Error ? err.message : 'Failed to load context'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
