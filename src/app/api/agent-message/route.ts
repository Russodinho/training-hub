import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAthleteContext } from '@/lib/agentContext'
import { buildSystemPrompt, DAILY_CHECKIN_QUESTION, AGENT_CONFIGS } from '@/lib/agentPrompts'
import type { AgentId } from '@/lib/agentPrompts'
import { runCoachMessage } from '@/lib/coachingLoop'
import { todayStr, getCachedMessage, saveMessage } from '@/lib/agentStore'

export const dynamic = 'force-dynamic'

// Takes only { agentId } — the client never sends athlete data. This route
// re-fetches getAthleteContext() itself, so private data (nutrition,
// recovery, body comp, Garmin) never round-trips through the browser at
// all, not even as a pass-through.
//
// Once per calendar day, not once per 24h: checks agent_messages for
// today's date (Eastern time, see agentStore.todayStr) before doing any
// work. If found, returns it instantly with no Claude/OpenAI calls at
// all — this is the actual enforcement, not just a UI convenience.
export async function POST(req: NextRequest) {
  const { agentId } = (await req.json()) as { agentId: AgentId }
  if (!agentId || !AGENT_CONFIGS[agentId]) {
    return NextResponse.json({ error: 'Unknown agentId' }, { status: 400 })
  }

  const date = todayStr()

  const cached = await getCachedMessage(agentId, date)
  if (cached) {
    return NextResponse.json({ message: cached, cached: true })
  }

  try {
    const ctx = await getAthleteContext()
    const systemPrompt = buildSystemPrompt(agentId, ctx)
    const message = await runCoachMessage(systemPrompt, DAILY_CHECKIN_QUESTION)
    await saveMessage(agentId, date, message)
    return NextResponse.json({ message, cached: false })
  } catch (err) {
    console.error(`agent-message failed for ${agentId}`, err)
    const status = err instanceof Anthropic.APIError && typeof err.status === 'number' ? err.status : 500
    const message = err instanceof Error ? err.message : 'Failed to generate message'
    return NextResponse.json({ error: message, retryable: status === 429 || status === 529 }, { status })
  }
}
