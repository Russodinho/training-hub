import { NextRequest, NextResponse } from 'next/server'
import { appendToSheet } from '@/lib/sheets-server'

const SHEET_ID = process.env.GOOGLE_SHEET_ID!

const TAB_RANGES: Record<string, string> = {
  progress: 'Progress!A:E',
  bricks: 'Bricks!A:J',
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tab, values } = body as { tab: string; values: (string | number)[][] }

  if (!tab || !values || !TAB_RANGES[tab]) {
    return NextResponse.json({ error: 'Invalid tab or values' }, { status: 400 })
  }

  await appendToSheet(SHEET_ID, TAB_RANGES[tab], values)
  return NextResponse.json({ ok: true })
}
