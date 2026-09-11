// Shared live-data context for the coaching agent system (src/app/agent).
// Every coach's system prompt is built from ONE call to getAthleteContext()
// per page load / per check-in run — never per-agent, and never hardcoded.
// See .agents/HANDOFF.md (2026-09-11, "Rebuilt coaching agent system") for
// the field-by-field mapping to real tables and the honest gaps (some
// fields are structurally untracked right now and stay null/false).

import { NUTRITION_TARGETS, NUTRITION_BASELINE } from './data'
import { getTodaySchedule, SCHEDULE } from './schedule'
import {
  getSupabaseClient, getRaces, getActiveRace, getDaysToRace, getRaceResult,
  garminBucket, type Race,
} from './supabase'

export interface Workout {
  name: string
  time: string | null
}

export interface Activity {
  name: string | null
  date: string
  activityType: string
  durationMin: number | null
  distanceKm: number | null
}

export interface RaceSummary {
  id: string
  name: string
  date: string
  location: string
  sport: Race['sport']
  distances: string
  result: string | null
}

export interface AthleteContext {
  athlete: {
    name: string
    location: string
    todayDow: string
    todayDate: string
    currentTime: string
  }
  today: {
    workouts: Workout[]
    isRestDay: boolean
    hasSoccer: boolean
    hasGym: boolean
    gymSession: string | null
    hasSwim: boolean
    hasRun: boolean
    hasBike: boolean
    hasBrick: boolean
    notes: string | null
  }
  week: {
    workoutsCompleted: number
    workoutsPlanned: number
    swimSessions: number
    bikeSessions: number
    runSessions: number
    gymSessions: number
    soccerGames: number
    totalHours: number | null
  }
  races: {
    next: RaceSummary | null
    previous: RaceSummary[]
    upcoming: RaceSummary[]
  }
  garmin: {
    lastActivity: Activity | null
    restingHR: number | null
    hrv: number | null // always null today — no device reports it yet; kept for when the new one does
    bodyBattery: number | null
    trainingReadiness: number | null // not a tracked metric in garmin_daily_stats — always null
    recentActivities: Activity[]
  }
  nutrition: {
    todayCalories: number | null
    todayProtein: number | null
    todayCarbs: number | null
    todayFat: number | null
    todayTargetCalories: number
    todayTargetProtein: number
    todayTargetCarbs: number
    todayTargetFat: number
    weeklyAvgCalories: number | null
    weeklyAvgProtein: number | null
    adherenceScore: number | null // % of last 7 days within 10% of target calories
  }
  bodyComp: {
    currentWeight: number | null
    targetWeight: number
    targetBodyFat: number
    currentBodyFat: number | null
    weeklyWeightTrend: number | null
  }
  recovery: {
    sleepLastNight: number | null // hours — not tracked (Garmin sync only pulls a 0-100 score); always null
    sleepScore: number | null
    recoveryScore: number | null // proxied from sleepScore — no dedicated recovery metric exists
    muscleSoreness: string | null // not tracked anywhere — always null
    ankleStatus: string | null
  }
  season: {
    currentPhase: string
    soccerSeasonActive: boolean
    weeksToNextRace: number | null
    daysToNextRace: number | null
  }
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function weekBounds(now: Date): { start: string; end: string } {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
}

function raceToSummary(race: Race, result: string | null): RaceSummary {
  const distances = race.sport === 'tri'
    ? `${race.distances.swim} swim / ${race.distances.bike} bike / ${race.distances.run} run`
    : race.distances[race.sport === 'swim' ? 'swim' : race.sport === 'bike' ? 'bike' : 'run']
  return {
    id: race.id, name: race.name, date: race.date, location: race.location,
    sport: race.sport, distances, result,
  }
}

async function fetchToday() {
  const schedule = getTodaySchedule()
  const gymBlock = schedule?.blocks.find(b => b.cls === 'bl-gym')
  const hasSoccer = !!schedule?.blocks.find(b => b.cls === 'bl-soccer')
  const gymSession = gymBlock ? gymBlock.name.replace(/^Gym\s*·\s*/, '') : null

  const workouts: Workout[] = []
  if (gymBlock) workouts.push({ name: `Gym · ${gymSession}`, time: gymBlock.time })
  if (hasSoccer) {
    const soccerBlock = schedule?.blocks.find(b => b.cls === 'bl-soccer')
    workouts.push({ name: 'Soccer', time: soccerBlock?.time ?? null })
  }

  return {
    workouts,
    isRestDay: !gymBlock && !hasSoccer,
    hasSoccer,
    hasGym: !!gymBlock,
    gymSession,
    // Swim/bike/run/brick days aren't tracked as structured data anywhere in
    // this app yet (schedule.ts only encodes gym + soccer blocks) — honest
    // false rather than a guessed day-of-week mapping.
    hasSwim: false,
    hasRun: false,
    hasBike: false,
    hasBrick: false,
    notes: schedule?.tag ?? null,
  }
}

async function fetchWeek() {
  const now = new Date()
  const { start, end } = weekBounds(now)
  const todayStr = now.toISOString().split('T')[0]
  const sb = getSupabaseClient()

  const [{ data: sessions }, { data: activities }] = await Promise.all([
    sb.from('workout_sessions').select('id, date').gte('date', start).lte('date', todayStr),
    sb.from('garmin_activities').select('activity_type, name, duration_min').gte('date', start).lte('date', end),
  ])

  const gymSessions = sessions?.length ?? 0
  let swimSessions = 0, bikeSessions = 0, runSessions = 0, soccerGames = 0, totalMin = 0
  for (const a of activities ?? []) {
    const bucket = garminBucket(a.activity_type)
    if (bucket === 'swim') swimSessions++
    else if (bucket === 'bike') bikeSessions++
    else if (bucket === 'run') runSessions++
    else if ((a.name ?? '').toLowerCase().includes('soccer')) soccerGames++
    totalMin += a.duration_min ?? 0
  }

  // Planned sessions this week, derived from the real weekly schedule
  // template (gym + soccer blocks) — swim/bike/run aren't in that template
  // (see fetchToday's comment), so "planned" undercounts a full tri week.
  const workoutsPlanned = SCHEDULE.reduce((n, day) => {
    return n + (day.blocks.some(b => b.cls === 'bl-gym') ? 1 : 0) + (day.blocks.some(b => b.cls === 'bl-soccer') ? 1 : 0)
  }, 0)

  return {
    workoutsCompleted: gymSessions + swimSessions + bikeSessions + runSessions + soccerGames,
    workoutsPlanned,
    swimSessions, bikeSessions, runSessions, gymSessions, soccerGames,
    totalHours: totalMin > 0 ? Math.round((totalMin / 60) * 10) / 10 : null,
  }
}

async function fetchRaces() {
  const [allRaces, active] = await Promise.all([getRaces(), getActiveRace()])
  const today = new Date().toISOString().split('T')[0]

  const upcomingRaces = allRaces.filter(r => r.status !== 'archived' && r.date >= today)
  const pastRaces = allRaces
    .filter(r => r.status === 'archived' || r.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const previous = await Promise.all(pastRaces.map(async r => {
    const res = await getRaceResult(r.id)
    return raceToSummary(r, res?.total ?? null)
  }))

  return {
    next: active ? raceToSummary(active.race, null) : null,
    previous,
    upcoming: upcomingRaces.map(r => raceToSummary(r, null)),
  }
}

async function fetchGarmin() {
  const sb = getSupabaseClient()
  const [{ data: stats }, { data: recent }] = await Promise.all([
    sb.from('garmin_daily_stats').select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
    sb.from('garmin_activities').select('name, date, activity_type, duration_min, distance_km').order('date', { ascending: false }).limit(5),
  ])

  const recentActivities: Activity[] = (recent ?? []).map(a => ({
    name: a.name, date: a.date, activityType: a.activity_type,
    durationMin: a.duration_min, distanceKm: a.distance_km,
  }))

  return {
    lastActivity: recentActivities[0] ?? null,
    restingHR: stats?.resting_hr ?? null,
    hrv: null,
    bodyBattery: stats?.body_battery_max ?? null,
    trainingReadiness: null,
    recentActivities,
  }
}

async function fetchNutrition() {
  const sb = getSupabaseClient()
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const since = new Date(now); since.setDate(since.getDate() - 7)

  const [{ data: todayRow }, { data: weekRows }] = await Promise.all([
    sb.from('nutrition_actuals').select('calories, protein, carbs, fat').eq('date', todayStr).maybeSingle(),
    sb.from('nutrition_actuals').select('date, calories, protein').gte('date', since.toISOString().split('T')[0]),
  ])

  const dayName = DAY_NAMES[now.getDay()]
  const target = NUTRITION_TARGETS.find(t => t.day === dayName) ?? {
    calories: NUTRITION_BASELINE.calories, protein: NUTRITION_BASELINE.protein,
    carbs: NUTRITION_BASELINE.carbs, fat: NUTRITION_BASELINE.fat,
  }

  const rows = weekRows ?? []
  const cals = rows.map(r => r.calories).filter((c): c is number => c != null)
  const prots = rows.map(r => r.protein).filter((p): p is number => p != null)
  const weeklyAvgCalories = cals.length ? Math.round(cals.reduce((a, b) => a + b, 0) / cals.length) : null
  const weeklyAvgProtein = prots.length ? Math.round(prots.reduce((a, b) => a + b, 0) / prots.length) : null

  const withinTarget = cals.filter(c => Math.abs(c - target.calories) / target.calories <= 0.1).length
  const adherenceScore = cals.length ? Math.round((withinTarget / cals.length) * 100) : null

  return {
    todayCalories: todayRow?.calories ?? null,
    todayProtein: todayRow?.protein ?? null,
    todayCarbs: todayRow?.carbs ?? null,
    todayFat: todayRow?.fat ?? null,
    todayTargetCalories: target.calories,
    todayTargetProtein: target.protein,
    todayTargetCarbs: target.carbs,
    todayTargetFat: target.fat,
    weeklyAvgCalories,
    weeklyAvgProtein,
    adherenceScore,
  }
}

// Static configured goals, not measurements — same category as
// NUTRITION_BASELINE's existing goalBf constant, just not yet exported
// there. 185 is the midpoint of the 183-186 lb target range.
const TARGET_WEIGHT_LBS = 185
const TARGET_BODY_FAT_PCT = 15

async function fetchBodyComp() {
  const sb = getSupabaseClient()
  const since = new Date(); since.setDate(since.getDate() - 14)
  const { data } = await sb
    .from('biometrics')
    .select('date, weight_lbs, body_fat_pct')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const rows = data ?? []
  const latest = rows[0] ?? null
  const weekAgo = rows.find(r => {
    const days = Math.round((new Date(latest?.date ?? Date.now()).getTime() - new Date(r.date).getTime()) / 86400000)
    return days >= 6
  })

  const weeklyWeightTrend = latest?.weight_lbs != null && weekAgo?.weight_lbs != null
    ? Math.round((latest.weight_lbs - weekAgo.weight_lbs) * 10) / 10
    : null

  return {
    currentWeight: latest?.weight_lbs ?? null,
    targetWeight: TARGET_WEIGHT_LBS,
    targetBodyFat: TARGET_BODY_FAT_PCT,
    currentBodyFat: latest?.body_fat_pct ?? null,
    weeklyWeightTrend,
  }
}

async function fetchRecovery() {
  const sb = getSupabaseClient()
  const [{ data: stats }, { data: injuryRows }] = await Promise.all([
    sb.from('garmin_daily_stats').select('sleep_score').order('date', { ascending: false }).limit(1).maybeSingle(),
    sb.from('injuries').select('name, status, pain, archived'),
  ])

  const ankleRow = (injuryRows ?? []).find(r => !r.archived && r.name.toLowerCase().includes('ankle'))

  return {
    sleepLastNight: null,
    sleepScore: stats?.sleep_score ?? null,
    recoveryScore: stats?.sleep_score ?? null,
    muscleSoreness: null,
    ankleStatus: ankleRow ? `${ankleRow.status}${ankleRow.pain ? ` (pain: ${ankleRow.pain})` : ''}` : null,
  }
}

function derivePhase(daysToRace: number | null): string {
  if (daysToRace === null) return 'off-season'
  if (daysToRace <= 7) return 'taper'
  if (daysToRace <= 21) return 'sharpening'
  if (daysToRace <= 49) return 'build'
  return 'base'
}

function isSoccerSeason(date: Date): boolean {
  const month = date.getMonth() + 1
  return (month >= 9 && month <= 11) || (month >= 3 && month <= 6)
}

export async function getAthleteContext(): Promise<AthleteContext> {
  const [today, week, races, garmin, nutrition, bodyComp, recovery] = await Promise.all([
    fetchToday(),
    fetchWeek(),
    fetchRaces(),
    fetchGarmin(),
    fetchNutrition(),
    fetchBodyComp(),
    fetchRecovery(),
  ])

  const now = new Date()
  const daysToNextRace = races.next
    ? Math.ceil((new Date(races.next.date).getTime() - now.getTime()) / 86400000)
    : null

  return {
    athlete: {
      name: 'Matt',
      location: 'Lansdale, PA',
      todayDow: now.toLocaleDateString('en-US', { weekday: 'long' }),
      todayDate: now.toISOString().split('T')[0],
      currentTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
    today,
    week,
    races,
    garmin,
    nutrition,
    bodyComp,
    recovery,
    season: {
      currentPhase: derivePhase(daysToNextRace),
      soccerSeasonActive: isSoccerSeason(now),
      weeksToNextRace: daysToNextRace != null ? Math.floor(daysToNextRace / 7) : null,
      daysToNextRace,
    },
  }
}

// Re-exported so callers don't need to also import getDaysToRace from
// lib/supabase just to format a race countdown elsewhere.
export { getDaysToRace }
