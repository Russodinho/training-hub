import { fetchSheetRaw } from '@/lib/sheets'
import { parseWorkoutsCSV, groupByWeekDay } from '@/lib/workoutsParser'
import type { WorkoutSet } from '@/lib/workoutsParser'
import LiftProgressChart from '@/components/dashboard/LiftProgressChart'
import SessionBrowser from '@/components/workouts/SessionBrowser'

export default async function WorkoutsPage() {
  const raw = await fetchSheetRaw('workouts').catch(() => [] as string[][])
  const workouts = parseWorkoutsCSV(raw)
  const byWeekDay = groupByWeekDay(workouts)
  const weeks = Object.keys(byWeekDay).map(Number).sort((a, b) => a - b)

  // Latest week stats
  const latestWeek = weeks[weeks.length - 1] ?? 0
  const totalExercises = workouts.length
  const sessions = [...new Set(workouts.map(w => `${w.week}-${w.day}`))].length

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Workout Log</h2>
          <div className="sub">8 weeks · Upper/Lower split · live from Google Sheets</div>
        </div>
        <div className="page-header-right">
          {sessions} sessions · {totalExercises} sets logged<br />
          Week {latestWeek} most recent
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏋️</div>
          <div className="empty-title">No workout data found</div>
          <div>Check that NEXT_PUBLIC_SHEET_URL_WORKOUTS is set and the sheet is published to web.</div>
        </div>
      ) : (
        <>
          {/* Lift progress chart */}
          <div className="chart-card" style={{ marginBottom: 16 }}>
            <LiftProgressChart workouts={workouts} />
          </div>

          {/* Session browser */}
          <SessionBrowser byWeekDay={byWeekDay} weeks={weeks} />
        </>
      )}
    </div>
  )
}
