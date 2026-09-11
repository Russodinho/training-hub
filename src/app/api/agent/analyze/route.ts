import { NextRequest, NextResponse } from 'next/server'
import { getAgentAnalysis, peekAgentCache } from '@/lib/agentAnalysis'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const peek = req.nextUrl.searchParams.get('peek') === '1'

  // Peek is a plain cache read — safe to call on every page load, since it
  // never runs the Claude/GPT-4 loop. Used to show today's result (if any)
  // without spending anything just from viewing the page.
  if (peek) {
    try {
      const data = await peekAgentCache()
      return NextResponse.json({ data })
    } catch (err) {
      console.error('agent peek failed', err)
      return NextResponse.json({ data: null })
    }
  }

  const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1'
  try {
    const analysis = await getAgentAnalysis(forceRefresh)
    return NextResponse.json(analysis)
  } catch (err) {
    console.error('agent analyze failed', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
