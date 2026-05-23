import { NextResponse } from 'next/server'
import { syncStravaActivities } from '@/lib/strava'

export async function POST() {
  const result = await syncStravaActivities()
  return NextResponse.json(result)
}

export async function GET() {
  const result = await syncStravaActivities()
  return NextResponse.json(result)
}
