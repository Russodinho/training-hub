// Parses the Fitness Routine - Workouts sheet
// CSV format: hierarchical, header: false
// Col 0: "Week N" or Day name (when col 2 = "EXERCISE")
// Col 1: Session type or section (Core / Finisher)
// Col 2: Exercise name
// Col 3: Warm-up sets | Col 4: Warmup % | Col 5: Warmup reps | Col 6: Warmup rest
// Col 7: Working sets  | Col 8: Target reps | Col 9: Reps hit
// Col 10: Load (lbs)  | Col 11: RPE | Col 12: Rest | Col 13: Notes

export interface WorkoutSet {
  week: number
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

const NON_EXERCISES = ['soccer', 'hot yoga', 'yoga', 'exercise', 'romanian deadlifts']

export function parseWorkoutsCSV(rows: string[][]): WorkoutSet[] {
  const results: WorkoutSet[] = []
  let currentDay = ''
  let currentWeek = 0
  let currentSession = ''
  let currentSection = ''

  for (const row of rows) {
    const c0 = (row[0] ?? '').trim()
    const c1 = (row[1] ?? '').trim()
    const c2 = (row[2] ?? '').trim()

    // Day header row
    if (c2 === 'EXERCISE') {
      currentDay = c0
      currentSession = ''
      currentSection = ''
      continue
    }

    if (!c2 && !c0 && !c1) continue

    // Update week
    if (c0.toLowerCase().startsWith('week')) {
      const m = c0.match(/\d+/)
      if (m) currentWeek = parseInt(m[0])
    }

    // Update session / section
    if (c1) {
      if (c1 === 'Core' || c1 === 'Finisher') {
        currentSection = c1
      } else if (!c1.startsWith('`')) {
        currentSession = c1
        currentSection = ''
      }
    }

    if (!c2) continue
    if (currentWeek === 0 || !currentDay) continue

    // Skip non-exercise rows (row labels / warm-up-only headers)
    const c2l = c2.toLowerCase()
    if (NON_EXERCISES.some(s => c2l === s)) continue
    // Skip row if it says "Day Skipped" in notes and has no load
    const notes = (row[13] ?? '').trim()
    const loadStr = (row[10] ?? '').trim()
    const load = loadStr ? (parseFloat(loadStr) || null) : null

    // Skip warm-up-only entries (no working sets and no load)
    const workingSets = parseInt(row[7] ?? '') || null
    const targetReps = (row[8] ?? '').trim() || null
    const repsHit = (row[9] ?? '').trim() || null
    if (!workingSets && !load && !repsHit) continue

    results.push({
      week: currentWeek,
      day: currentDay,
      session: currentSession,
      section: currentSection,
      exercise: c2,
      working_sets: workingSets,
      target_reps: targetReps,
      reps_hit: repsHit,
      load,
      rpe: (row[11] ?? '').trim() || null,
      notes: notes || null,
    })
  }

  return results
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

// Load progression per exercise across weeks (max load per week)
export interface LiftPoint {
  week: number
  load: number
  reps_hit: string | null
  rpe: string | null
  notes: string | null
}

export function liftProgression(workouts: WorkoutSet[], exerciseName: string): LiftPoint[] {
  const norm = normEx(exerciseName)
  const byWeek: Record<number, LiftPoint> = {}
  for (const w of workouts) {
    if (normEx(w.exercise) !== norm || !w.load) continue
    if (!byWeek[w.week] || w.load > byWeek[w.week].load) {
      byWeek[w.week] = { week: w.week, load: w.load, reps_hit: w.reps_hit, rpe: w.rpe, notes: w.notes }
    }
  }
  return Object.values(byWeek).sort((a, b) => a.week - b.week)
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
