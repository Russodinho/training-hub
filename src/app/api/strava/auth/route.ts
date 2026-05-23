import { NextResponse } from 'next/server'
import { getStravaAuthUrl } from '@/lib/strava'

export function GET() {
  const url = getStravaAuthUrl()
  return NextResponse.redirect(url)
}
