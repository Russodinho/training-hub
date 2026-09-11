import { groupByWeekDay } from '@/lib/workoutsParser'
import type { WorkoutSet } from '@/lib/workoutsParser'
import { getLoggedWorkoutSets } from '@/lib/supabase'
import TrainingLogClient from './TrainingLogClient'

// Lifts data now comes from this app's own workout_sessions/workout_sets
// (populated by the /log page) instead of the Google Sheet that used to
// back this tab.
export default async function TrainingLogPage() {
  const workouts = await getLoggedWorkoutSets()
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
