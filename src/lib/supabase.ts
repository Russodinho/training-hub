import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — never initialised at module load time so Next.js build
// doesn't crash when env vars aren't present during static analysis.
let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _supabase
}

// Server-side client with service role (only use in API routes / server components)
export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ── Types ──

export interface MobilityLog {
  id: string
  date: string
  items: string[]
  completed_at: string | null
  created_at: string
}

export interface RaceResult {
  id: string
  race_id: string
  swim: string | null
  t1: string | null
  bike: string | null
  t2: string | null
  run: string | null
  total: string | null
  notes: string | null
  created_at: string
}

export interface NutritionActual {
  id: string
  date: string
  calories: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
  fiber: number | null
  raw_data: Record<string, unknown> | null
}

export interface StravaActivity {
  id: string
  strava_id: number
  activity_type: string
  name: string | null
  distance: number | null
  moving_time: number | null
  elapsed_time: number | null
  start_date: string | null
  average_speed: number | null
  max_speed: number | null
  average_heartrate: number | null
  total_elevation_gain: number | null
  raw_data: Record<string, unknown> | null
}

export interface StravaToken {
  id: string
  access_token: string
  refresh_token: string
  expires_at: number
  athlete_id: number | null
  updated_at: string
}

// ── Mobility helpers ──

export async function getMobilityLog(date: string): Promise<MobilityLog | null> {
  const { data } = await getSupabase()
    .from('mobility_log')
    .select('*')
    .eq('date', date)
    .single()
  return data
}

export async function upsertMobilityLog(date: string, items: string[]): Promise<void> {
  const isComplete = items.length >= 9
  await getSupabase().from('mobility_log').upsert({
    date,
    items,
    completed_at: isComplete ? new Date().toISOString() : null,
  }, { onConflict: 'date' })
}

export async function getMobilityStreak(): Promise<number> {
  const { data } = await getSupabase()
    .from('mobility_log')
    .select('date, items')
    .order('date', { ascending: false })
    .limit(90)
  if (!data) return 0

  let streak = 0
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(today)

  for (const entry of data) {
    const entryDate = new Date(entry.date)
    entryDate.setHours(0, 0, 0, 0)
    const diff = Math.round((d.getTime() - entryDate.getTime()) / 86400000)
    if (diff > 1) break
    if (diff === 0 || diff === 1) {
      const items: string[] = entry.items || []
      // Yoga night check (Wed=3, Sat=6)
      const dow = entryDate.getDay()
      const required = (dow === 3 || dow === 6) ? 2 : 9
      if (items.length >= required) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        if (diff === 0) { d.setDate(d.getDate() - 1); continue }
        break
      }
    }
  }
  return streak
}

// ── Race results helpers ──

export async function getRaceResult(raceId: string): Promise<RaceResult | null> {
  const { data } = await getSupabase()
    .from('race_results')
    .select('*')
    .eq('race_id', raceId)
    .single()
  return data
}

export async function upsertRaceResult(result: Omit<RaceResult, 'id' | 'created_at'>): Promise<void> {
  await getSupabase().from('race_results').upsert(result, { onConflict: 'race_id' })
}

// ── Strava helpers ──

export async function getStravaToken(): Promise<StravaToken | null> {
  const { data } = await getSupabase()
    .from('strava_tokens')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getRecentActivities(limit = 10): Promise<StravaActivity[]> {
  const { data } = await getSupabase()
    .from('strava_activities')
    .select('*')
    .order('start_date', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getActivitiesForWeeks(weeksBack = 8): Promise<StravaActivity[]> {
  const since = new Date()
  since.setDate(since.getDate() - weeksBack * 7)
  const { data } = await getSupabase()
    .from('strava_activities')
    .select('*')
    .gte('start_date', since.toISOString())
    .order('start_date', { ascending: true })
  return data || []
}

// ── Nutrition helpers ──

export async function getNutritionActuals(days = 30): Promise<NutritionActual[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data } = await getSupabase()
    .from('nutrition_actuals')
    .select('*')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })
  return data || []
}

// ── Migrate localStorage to Supabase (call once on first load) ──

export async function migrateLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return
  const migrated = localStorage.getItem('supabase_migrated')
  if (migrated) return

  // Migrate mobility log
  const mobLog = JSON.parse(localStorage.getItem('mobility_log') || '{}')
  for (const [date, val] of Object.entries(mobLog as Record<string, { items: string[] }>)) {
    await getSupabase().from('mobility_log').upsert({ date, items: val.items || [] }, { onConflict: 'date' })
  }

  // Migrate race results
  const raceRes = JSON.parse(localStorage.getItem('race_results') || '{}')
  for (const [race_id, val] of Object.entries(raceRes as Record<string, Record<string, string>>)) {
    await getSupabase().from('race_results').upsert({ race_id, ...val }, { onConflict: 'race_id' })
  }

  localStorage.setItem('supabase_migrated', '1')
}
