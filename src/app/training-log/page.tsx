import { fetchSheetRaw } from '@/lib/sheets'
import { parseWorkoutsCSV, groupByWeekDay } from '@/lib/workoutsParser'
import type { WorkoutSet } from '@/lib/workoutsParser'
import TrainingLogClient from './TrainingLogClient'

export default async function TrainingLogPage() {
  const raw = await fetchSheetRaw('workouts').catch(() => [] as string[][])
  const workouts = parseWorkoutsCSV(raw)
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
