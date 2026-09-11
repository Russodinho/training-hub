import { NextRequest, NextResponse } from 'next/server'
import { getAgentAnalysis } from '@/lib/agentAnalysis'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
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
