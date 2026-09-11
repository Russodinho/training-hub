import { NextResponse } from 'next/server'
import { getAgentAnalysis } from '@/lib/agentAnalysis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const analysis = await getAgentAnalysis()
    return NextResponse.json(analysis)
  } catch (err) {
    console.error('agent analyze failed', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
