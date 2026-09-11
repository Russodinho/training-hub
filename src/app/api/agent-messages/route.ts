import { NextResponse } from 'next/server'
import { todayStr, getMessagesForDate, getMessageHistory } from '@/lib/agentStore'

export const dynamic = 'force-dynamic'

// Read-only — never triggers any coach to run. Used by /agent on page
// load to show whatever's already been generated today (without needing
// a click) plus previous days' output grouped separately below it.
export async function GET() {
  const date = todayStr()
  const [today, history] = await Promise.all([
    getMessagesForDate(date),
    getMessageHistory(date),
  ])
  return NextResponse.json({ date, today, history })
}
