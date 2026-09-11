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

// For use in 'use client' components — called inside useEffect/handlers, never at module load
export const getSupabaseClient = getSupabase

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

export interface GarminActivity {
  id: string
  date: string
  activity_type: string
  name: string | null
  duration_min: number | null
  distance_km: number | null
  avg_hr: number | null
  max_hr: number | null
  calories: number | null
  avg_pace: string | null
}

// Collapse garmin_sync.py's sport types into the swim/bike/run/lift buckets
// the dashboard's volume + distribution charts are built around.
const GARMIN_BUCKET: Record<string, 'swim' | 'bike' | 'run' | 'lift'> = {
  swimming: 'swim',
  cycling: 'bike',
  running: 'run',
  strength: 'lift',
}
export function garminBucket(activityType: string): 'swim' | 'bike' | 'run' | 'lift' | 'other' {
  return GARMIN_BUCKET[activityType] ?? 'other'
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

// ── Races (Supabase-backed — replaces the old hardcoded RACES array +
// localStorage from src/lib/data.ts; see 0007_races.sql for why) ──

export interface Race {
  id: string
  name: string
  date: string
  dateLabel: string
  location: string
  headerRight: string
  distances: { swim: string; bike: string; run: string }
  sport: 'tri' | 'run' | 'bike' | 'swim'
  type: 'sprint' | 'olympic' | 'decide' | 'target' | null
  timeline: [string, string, boolean?][]
  strategy: [string, string][]
  status: 'upcoming' | 'archived'
}

interface RaceRow {
  id: string
  name: string
  date: string
  location: string | null
  sport: string
  tier: string | null
  distance_swim: string | null
  distance_bike: string | null
  distance_run: string | null
  notes: string | null
  timeline: unknown
  strategy: unknown
  status: string
}

export const RACE_LAG_DAYS = 5

function formatRaceDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${time}`
}

function mapRace(row: RaceRow): Race {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    dateLabel: formatRaceDateLabel(row.date),
    location: row.location ?? '—',
    headerRight: row.notes ?? '',
    distances: {
      swim: row.distance_swim ?? '—',
      bike: row.distance_bike ?? '—',
      run: row.distance_run ?? '—',
    },
    sport: (row.sport as Race['sport']) ?? 'tri',
    type: (row.tier as Race['type']) ?? null,
    timeline: (row.timeline as Race['timeline']) ?? [],
    strategy: (row.strategy as Race['strategy']) ?? [],
    status: (row.status as Race['status']) ?? 'upcoming',
  }
}

export async function getRaces(): Promise<Race[]> {
  const { data } = await getSupabase().from('races').select('*').order('date', { ascending: true })
  return ((data ?? []) as RaceRow[]).map(mapRace)
}

export async function getActiveRace(): Promise<{ race: Race; isPast: boolean } | null> {
  const races = (await getRaces()).filter(r => r.status !== 'archived')
  const now = new Date()
  for (const race of races) {
    const rd = new Date(race.date)
    const lagEnd = new Date(rd.getTime() + RACE_LAG_DAYS * 86400000)
    if (now < lagEnd) return { race, isPast: now >= rd }
  }
  return null
}

export function getDaysToRace(race: Race): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const rd = new Date(race.date); rd.setHours(0, 0, 0, 0)
  return Math.round((rd.getTime() - today.getTime()) / 86400000)
}

export async function addRace(input: {
  name: string
  date: string
  location?: string
  sport: Race['sport']
  tier?: Race['type']
  distanceSwim?: string
  distanceBike?: string
  distanceRun?: string
  notes?: string
}): Promise<void> {
  await getSupabase().from('races').insert({
    id: `custom-${Date.now()}`,
    name: input.name,
    date: input.date,
    location: input.location || null,
    sport: input.sport,
    tier: input.tier || null,
    distance_swim: input.distanceSwim || null,
    distance_bike: input.distanceBike || null,
    distance_run: input.distanceRun || null,
    notes: input.notes || null,
    timeline: [],
    strategy: [],
    status: 'upcoming',
  })
}

export async function setRaceStatus(id: string, status: Race['status']): Promise<void> {
  await getSupabase().from('races').update({ status }).eq('id', id)
}

export async function deleteRace(id: string): Promise<void> {
  await getSupabase().from('races').delete().eq('id', id)
}

// ── Garmin activity helpers (synced via garmin_sync.py → garmin_activities) ──

export async function getRecentGarminActivities(limit = 10): Promise<GarminActivity[]> {
  const { data } = await getSupabase()
    .from('garmin_activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getGarminActivitiesForWeeks(weeksBack = 8): Promise<GarminActivity[]> {
  const since = new Date()
  since.setDate(since.getDate() - weeksBack * 7)
  const { data } = await getSupabase()
    .from('garmin_activities')
    .select('*')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })
  return data || []
}

// ── Logged workout sets (from /log's own workout_sessions/workout_sets) ──
// Adapts them into the same WorkoutSet shape the Google-Sheet-backed
// training-log Lifts tab used to consume, so that tab can read from this
// app's own data instead of an external spreadsheet.

const SESSION_LABEL: Record<string, string> = {
  upper_a: 'Upper A (Push + Delts)',
  lower_a: 'Lower A (Quad Dominant)',
  upper_b: 'Upper B (Pull + Delts)',
  lower_b: 'Lower B (Glute Dominant)',
}

function isoWeekNumber(dateStr: string): number {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

export async function getLoggedWorkoutSets(): Promise<import('./workoutsParser').WorkoutSet[]> {
  const sb = getSupabase()
  const { data: sessions } = await sb.from('workout_sessions')
    .select('id, date, type, notes')
    .order('date', { ascending: true })
  if (!sessions || sessions.length === 0) return []

  const ids = sessions.map((s: { id: string }) => s.id)
  const { data: sets } = await sb.from('workout_sets')
    .select('session_id, exercise_name, weight, reps, rpe')
    .in('session_id', ids)

  const setsBySession: Record<string, { exercise_name: string; weight: number | null; reps: number | null; rpe: number | null }[]> = {}
  for (const s of sets || []) {
    const key = (s as { session_id: string }).session_id
    if (!setsBySession[key]) setsBySession[key] = []
    setsBySession[key].push(s)
  }

  const out: import('./workoutsParser').WorkoutSet[] = []
  for (const session of sessions) {
    const day = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    const week = isoWeekNumber(session.date)
    for (const s of setsBySession[session.id] || []) {
      out.push({
        week,
        date: session.date,
        day,
        session: SESSION_LABEL[session.type] ?? session.type,
        section: '',
        exercise: s.exercise_name,
        working_sets: null,
        target_reps: null,
        reps_hit: s.reps != null ? String(s.reps) : null,
        load: s.weight,
        rpe: s.rpe != null ? String(s.rpe) : null,
        notes: session.notes ?? null,
      })
    }
  }
  return out
}

// ── Biometrics helpers ──

export interface BiometricEntry {
  id: string
  date: string
  weight_lbs: number | null
  body_fat_pct: number | null
  lean_mass_lbs: number | null
  fat_mass_lbs: number | null
  created_at: string
}

export async function getBiometrics(days = 90): Promise<BiometricEntry[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data } = await getSupabase()
    .from('biometrics')
    .select('*')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })
  return data || []
}

// ── Nutrition helpers ──

export async function getNutritionActuals(days = 90): Promise<NutritionActual[]> {
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

  // Migrate manual tri-session logs (Progress / Training Log pages, pre-Supabase)
  type LooseEntry = { date: string } & Record<string, string>
  const triKindMap: [string, 'swim' | 'bike' | 'run' | 'brick'][] = [
    ['track_swim', 'swim'], ['track_bike', 'bike'], ['track_run', 'run'], ['track_bricks', 'brick'],
  ]
  for (const [storageKey, kind] of triKindMap) {
    const entries: LooseEntry[] = JSON.parse(localStorage.getItem(storageKey) || '[]')
    for (const entry of entries) {
      const { date, ...rest } = entry
      if (!date) continue
      await getSupabase().from('tri_log_entries').insert({ kind, date, data: rest })
    }
  }

  const weightEntries: LooseEntry[] = JSON.parse(localStorage.getItem('track_weight') || '[]')
  for (const entry of weightEntries) {
    if (!entry.date || !entry.weight) continue
    await getSupabase().from('manual_weight_log').insert({
      date: entry.date,
      weight: parseFloat(entry.weight),
      bf: entry.bf ? parseFloat(entry.bf) : null,
      notes: entry.notes || null,
    })
  }

  // Migrate injuries (custom injuries, archived injuries, and recovery-log updates)
  interface LegacyInjury {
    key: string; name: string; status: string; pain: string; since: string
    location: string; aggravated: string; notAffected: string; treatment: string
    notes: string; symptoms: string; isBuiltin?: boolean
  }
  interface LegacyArchivedInjury extends LegacyInjury {
    archivedAt: string; finalStatus: string
    injuryUpdates: { date: string; status: string; pain: string; note: string }[]
  }
  const legacyUpdates: Record<string, { date: string; status: string; pain: string; note: string }[]> =
    JSON.parse(localStorage.getItem('injury_updates') || '{}')
  for (const [key, list] of Object.entries(legacyUpdates)) {
    for (const u of list) {
      await getSupabase().from('injury_updates').insert({ injury_key: key, date: u.date, status: u.status, pain: u.pain || null, note: u.note || null })
    }
  }
  const legacyNewInjuries: LegacyInjury[] = JSON.parse(localStorage.getItem('new_injuries') || '[]')
  for (const inj of legacyNewInjuries) {
    await getSupabase().from('injuries').upsert({
      key: inj.key, name: inj.name, status: inj.status, pain: inj.pain || null, since: inj.since || null,
      location: inj.location || null, aggravated: inj.aggravated || null, not_affected: inj.notAffected || null,
      treatment: inj.treatment || null, notes: inj.notes || null, symptoms: inj.symptoms || null,
      is_builtin: false, archived: false,
    }, { onConflict: 'key' })
  }
  const legacyArchived: LegacyArchivedInjury[] = JSON.parse(localStorage.getItem('archived_injuries') || '[]')
  for (const a of legacyArchived) {
    await getSupabase().from('injuries').upsert({
      key: a.key, name: a.name, status: a.status, pain: a.pain || null, since: a.since || null,
      location: a.location || null, aggravated: a.aggravated || null, not_affected: a.notAffected || null,
      treatment: a.treatment || null, notes: a.notes || null, symptoms: a.symptoms || null,
      is_builtin: !!a.isBuiltin, archived: true, archived_at: a.archivedAt || null, final_status: a.finalStatus || a.status,
    }, { onConflict: 'key' })
    for (const u of a.injuryUpdates || []) {
      await getSupabase().from('injury_updates').insert({ injury_key: a.key, date: u.date, status: u.status, pain: u.pain || null, note: u.note || null })
    }
  }

  localStorage.setItem('supabase_migrated', '1')
}
