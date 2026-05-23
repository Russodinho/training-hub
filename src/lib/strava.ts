import { createServiceClient } from './supabase'

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!
const STRAVA_REDIRECT_URI = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI!

export function getStravaAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  })
  return `https://www.strava.com/oauth/authorize?${params}`
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`)
  return res.json()
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`)
  return res.json()
}

export async function getValidAccessToken(): Promise<string | null> {
  const supabase = createServiceClient()
  const { data: token } = await supabase
    .from('strava_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (!token) return null

  // Check if token is expired (with 5 min buffer)
  const nowSec = Math.floor(Date.now() / 1000)
  if (token.expires_at > nowSec + 300) {
    return token.access_token
  }

  // Refresh
  const refreshed = await refreshAccessToken(token.refresh_token)
  await supabase.from('strava_tokens').upsert({
    id: token.id,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: refreshed.expires_at,
    athlete_id: refreshed.athlete?.id ?? token.athlete_id,
    updated_at: new Date().toISOString(),
  })

  return refreshed.access_token
}

export function mapActivityType(stravaType: string): string {
  const map: Record<string, string> = {
    Run: 'run',
    Ride: 'bike',
    VirtualRide: 'bike',
    Swim: 'swim',
    Walk: 'other',
    Hike: 'other',
    WeightTraining: 'lift',
    Workout: 'lift',
  }
  return map[stravaType] ?? 'other'
}

export async function syncStravaActivities(): Promise<{ synced: number; skipped: number }> {
  const accessToken = await getValidAccessToken()
  if (!accessToken) return { synced: 0, skipped: 0 }

  const supabase = createServiceClient()

  // Fetch last 30 days
  const after = Math.floor((Date.now() - 30 * 86400000) / 1000)
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) throw new Error(`Strava activities fetch failed: ${res.status}`)
  const activities = await res.json()

  let synced = 0, skipped = 0

  for (const act of activities) {
    const { error } = await supabase.from('strava_activities').upsert({
      strava_id: act.id,
      activity_type: mapActivityType(act.type),
      name: act.name,
      distance: act.distance,
      moving_time: act.moving_time,
      elapsed_time: act.elapsed_time,
      start_date: act.start_date,
      average_speed: act.average_speed,
      max_speed: act.max_speed,
      average_heartrate: act.average_heartrate ?? null,
      total_elevation_gain: act.total_elevation_gain,
      raw_data: act,
    }, { onConflict: 'strava_id' })

    if (error) skipped++
    else synced++
  }

  return { synced, skipped }
}

// Format distance based on activity type
export function formatDistance(meters: number, type: string): string {
  if (type === 'swim') return `${Math.round(meters)}m`
  const miles = meters / 1609.34
  return `${miles.toFixed(1)} mi`
}

// Format moving time
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function activityTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    swim: '🏊',
    bike: '🚴',
    run: '🏃',
    lift: '🏋️',
    other: '⚡',
  }
  return icons[type] ?? '⚡'
}
