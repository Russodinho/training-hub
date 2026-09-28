import { getSupabaseClient } from './supabase'

// The lift program: which workout days exist, what weekday each is on, and
// the exercises in each. Stored in Supabase (`workout_days` + `exercises`,
// see supabase/migrations/0010_workout_program.sql) and edited on
// Settings -> Program. A day's `id` is what workout_sessions.type stores, so
// renaming a day keeps its history attached.

export interface ProgramExercise {
  id?: string
  name: string
  sets: number
  reps: string
  rpe: string
  rest: number | null
  notes: string | null
}

export interface ProgramDay {
  id: string
  name: string
  subtitle: string | null
  weekday: number | null // 0=Sun .. 6=Sat, null = unscheduled
  sortOrder: number
  exercises: ProgramExercise[]
}

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Labels for session types that are no longer in the program, so old
// history still reads sensibly.
const LEGACY_LABELS: Record<string, string> = {
  upper_a: 'Upper A (Push + Delts)',
  lower_a: 'Lower A (Quad Dominant)',
  upper_b: 'Upper B (Pull + Delts)',
  lower_b: 'Lower B (Glute Dominant)',
}

export function sessionLabel(type: string, days: ProgramDay[]): string {
  const day = days.find(d => d.id === type)
  if (day) return day.subtitle ? `${day.name} (${day.subtitle.split(' · ')[0]})` : day.name
  return LEGACY_LABELS[type] ?? type
}

const ex = (name: string, sets: number, reps: string, rpe: string, rest: number | null, notes: string | null = null): ProgramExercise =>
  ({ name, sets, reps, rpe, rest, notes })

// Built-in copy of the program the migration seeds, used only when the
// workout_days table doesn't exist yet or is empty, so /log always has
// something to show.
export const DEFAULT_PROGRAM: ProgramDay[] = [
  {
    id: 'upper_a', name: 'Upper A', subtitle: 'Push-dominant · ~30-35 min', weekday: 1, sortOrder: 10,
    exercises: [
      ex('Incline DB or BB Press', 3, '6-8', '8, 8, 9-10', 90, 'Final set to near/true failure'),
      ex('Standing DB OHP', 2, '8-10', '8', 60),
      ex('Chest Supported Row', 2, '8-10', '8', 60),
      ex('Face Pulls', 2, '15', '8', 45),
      ex('Single Arm Preacher Curl', 2, '10-12/side', '8', 45),
    ],
  },
  {
    id: 'kb_circuit', name: 'KB Circuit', subtitle: 'After swim · ~15-18 min', weekday: 2, sortOrder: 20,
    exercises: [
      ex('KB Halos', 3, '8-10 each direction', '', null, '2-3 rounds'),
      ex('KB Swings', 10, '15-20', '', null, '10 min EMOM, one set at the top of each minute'),
      ex('Around the Worlds', 3, '8-10 each direction', '', null, '2-3 rounds'),
    ],
  },
  {
    id: 'upper_b', name: 'Upper B', subtitle: 'Pull-dominant · ~35-40 min', weekday: 4, sortOrder: 30,
    exercises: [
      ex('Lat Pulldown or Pull-Up', 3, '6-8', '8, 8, 9-10', 60, 'Final set to near/true failure'),
      ex('Machine Low Row (single arm)', 2, '10-12/side', '8', 60),
      ex('Flat DB Press', 2, '8-10', '8', 60),
      ex('Cable Crunch', 3, '12-15', '8-9', 45),
      ex('Reverse Crunch', 3, '12-15', '8-9', 45),
    ],
  },
  {
    id: 'legs', name: 'Legs', subtitle: 'Combined · ~30 min', weekday: 5, sortOrder: 40,
    exercises: [
      ex('Zercher Squat', 3, '4-6', '8, 8, 9', 90, 'Final set: heaviest load with a clean upright position held. Use a barbell pad.'),
      ex('Romanian Deadlift', 2, '6-8', '8', 90),
      ex('Belted Hip Thrust', 2, '8-10', '8-9', 60),
      ex('Hip Abduction', 2, '15', '7-8', 45, 'Kept for the left hip stability issue'),
    ],
  },
]

interface DayRow { id: string; name: string; subtitle: string | null; weekday: number | null; sort_order: number }
interface ExerciseRow {
  id: string; name: string; category: string; default_sets: number | null; default_reps: string | null
  default_rpe: string | null; rest_seconds: number | null; notes?: string | null; is_active: boolean; sort_order: number
}

export interface ProgramResult {
  days: ProgramDay[]
  // false = the workout_days table is missing or empty and DEFAULT_PROGRAM
  // is being shown instead; edits can't be saved until the migration runs.
  fromDb: boolean
}

export async function getProgram(): Promise<ProgramResult> {
  const sb = getSupabaseClient()
  const { data: dayRows, error } = await sb.from('workout_days').select('*').order('sort_order').order('name')
  if (error || !dayRows || dayRows.length === 0) return { days: DEFAULT_PROGRAM, fromDb: false }

  const ids = (dayRows as DayRow[]).map(d => d.id)
  const { data: exRows } = await sb.from('exercises').select('*').in('category', ids)
    .eq('is_active', true).order('sort_order').order('name')

  const days = (dayRows as DayRow[]).map(d => ({
    id: d.id, name: d.name, subtitle: d.subtitle, weekday: d.weekday, sortOrder: d.sort_order,
    exercises: ((exRows ?? []) as ExerciseRow[]).filter(e => e.category === d.id).map(e => ({
      id: e.id,
      name: e.name,
      sets: e.default_sets ?? 3,
      reps: e.default_reps ?? '',
      rpe: e.default_rpe ?? '',
      rest: e.rest_seconds,
      notes: e.notes ?? null,
    })),
  }))
  return { days, fromDb: true }
}

// Like getProgram but never throws, for server pages where the program is
// secondary (dashboard, coach context).
export async function getProgramDays(): Promise<ProgramDay[]> {
  try { return (await getProgram()).days } catch { return DEFAULT_PROGRAM }
}

export function dayForWeekday(days: ProgramDay[], weekday: number): ProgramDay | undefined {
  return days.find(d => d.weekday === weekday)
}

// Stable id for a new day: slug of its name plus a short random suffix so
// two days can share a name and a later rename never collides.
export function newDayId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 24) || 'day'
  return `${slug}_${Math.random().toString(36).slice(2, 6)}`
}
