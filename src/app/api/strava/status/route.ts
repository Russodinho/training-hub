import { NextResponse } from 'next/server'
import { getStravaToken } from '@/lib/supabase'

export async function GET() {
  const token = await getStravaToken()
  return NextResponse.json({
    connected: !!token,
    athleteId: token?.athlete_id ?? null,
    expiresAt: token?.expires_at ?? null,
  })
}
