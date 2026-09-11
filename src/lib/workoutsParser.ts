// WorkoutSet used to be parsed from a hierarchical Google Sheets CSV export;
// that integration was retired in favor of this app's own Supabase-backed
// logging (see lib/supabase.ts's getLoggedWorkoutSets). The shape is kept
// as the common interface between that source and the lift-progression
// chart / session browser below.

export interface WorkoutSet {
  week: number
  date: string // ISO yyyy-mm-dd — the actual session date
  day: string
  session: string
  section: string   // '' | 'Core' | 'Finisher'
  exercise: string
  working_sets: number | null
  target_reps: string | null
  reps_hit: string | null
  load: number | null
  rpe: string | null
  notes: string | null
}

// ── Key lifts (shown in chart by default) ──────────────────────────────────

export const KEY_LIFTS = [
  'Hack squat (quad)',
  'Romanian Deadlift',
  'Incline DB or BB Press',
  'Pull-Ups / Lat Pulldown',
  'Belted Hip Thrust',
  'leg press',
  'Flat DB or Machine Press',
  'Standing Dumbbell Overhead Press',
]

// Normalise exercise name for grouping (case-insensitive, extra-space collapse)
export function normEx(name: string) {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

// All unique exercise names that appear in the data
export function uniqueExercises(workouts: WorkoutSet[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of workouts) {
    const k = normEx(w.exercise)
    if (!seen.has(k) && w.load) { seen.add(k); out.push(w.exercise) }
  }
  // Sort: key lifts first, then alpha
  return out.sort((a, b) => {
    const ai = KEY_LIFTS.findIndex(k => normEx(k) === normEx(a))
    const bi = KEY_LIFTS.findIndex(k => normEx(k) === normEx(b))
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return a.localeCompare(b)
  })
}

// Load progression per exercise across time (max load per date logged)
export interface LiftPoint {
  date: string
  week: number
  load: number
  reps_hit: string | null
  rpe: string | null
  notes: string | null
}

export function liftProgression(workouts: WorkoutSet[], exerciseName: string): LiftPoint[] {
  const norm = normEx(exerciseName)
  const byDate: Record<string, LiftPoint> = {}
  for (const w of workouts) {
    if (normEx(w.exercise) !== norm || !w.load) continue
    if (!byDate[w.date] || w.load > byDate[w.date].load) {
      byDate[w.date] = { date: w.date, week: w.week, load: w.load, reps_hit: w.reps_hit, rpe: w.rpe, notes: w.notes }
    }
  }
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
}

// Group workouts by week → day for the session browser
export function groupByWeekDay(workouts: WorkoutSet[]): Record<number, Record<string, WorkoutSet[]>> {
  const out: Record<number, Record<string, WorkoutSet[]>> = {}
  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (const w of workouts) {
    if (!out[w.week]) out[w.week] = {}
    if (!out[w.week][w.day]) out[w.week][w.day] = []
    out[w.week][w.day].push(w)
  }
  // Sort days within each week
  for (const week of Object.keys(out)) {
    const sorted: Record<string, WorkoutSet[]> = {}
    for (const day of dayOrder) {
      if (out[Number(week)][day]) sorted[day] = out[Number(week)][day]
    }
    out[Number(week)] = sorted
  }
  return out
}
