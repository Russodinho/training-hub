import { fetchSheetRaw } from '@/lib/sheets'
import { parseWorkoutsCSV, groupByWeekDay } from '@/lib/workoutsParser'
import type { WorkoutSet } from '@/lib/workoutsParser'
import TrainingLogClient from './TrainingLogClient'

export default async function TrainingLogPage() {
  const raw = await fetchSheetRaw('workouts').catch(() => [] as string[][])
  const rawWorkouts = parseWorkoutsCSV(raw)

  // The sheet occasionally has duplicate rows for the same set (seen in
  // weeks 8, 16-19), which renders each exercise twice. Dedupe on the
  // fields that identify a distinct logged set.
  const seen = new Set<string>()
  const workouts = rawWorkouts.filter((w) => {
    const key = [w.week, w.day, w.exercise, w.working_sets, w.reps_hit, w.load, w.rpe].join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const byWeekDay = groupByWeekDay(workouts)
  const weeks = Object.keys(byWeekDay).map(Number).sort((a, b) => a - b)
  const totalSets = workouts.length
  const sessions = [...new Set(workouts.map((w: WorkoutSet) => `${w.week}-${w.day}`))].length
  const latestWeek = weeks[weeks.length - 1] ?? 0

  return (
    <TrainingLogClient
      workouts={workouts}
      byWeekDay={byWeekDay}
      weeks={weeks}
      totalSets={totalSets}
      sessions={sessions}
      latestWeek={latestWeek}
    />
  )
}
