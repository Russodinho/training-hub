import { getActiveRace, getDaysToRace, RACES, mobRequiredIds } from '@/lib/data'
import { getRecentActivities, getActivitiesForWeeks, getNutritionActuals, getMobilityStreak, getMobilityLog } from '@/lib/supabase'
import { fetchSheet, parseProgressSheet } from '@/lib/sheets'
import StatCard from '@/components/dashboard/StatCard'
import WeightChart from '@/components/dashboard/WeightChart'
import VolumeChart from '@/components/dashboard/VolumeChart'
import NutritionChart from '@/components/dashboard/NutritionChart'
import DistributionChart from '@/components/dashboard/DistributionChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import QuickStatus from '@/components/dashboard/QuickStatus'

function getWeekLabel(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default async function DashboardPage() {
  const activeRace = getActiveRace()
  const daysToRace = activeRace ? getDaysToRace(activeRace.race) : null

  // Parallel data fetches
  const [
    recentActivities,
    weeklyActivities,
    nutritionActuals,
    progressRows,
    mobilityStreak,
  ] = await Promise.allSettled([
    getRecentActivities(10),
    getActivitiesForWeeks(8),
    getNutritionActuals(30),
    fetchSheet('progress'),
    getMobilityStreak(),
  ])

  const activities = recentActivities.status === 'fulfilled' ? recentActivities.value : []
  const allActivities = weeklyActivities.status === 'fulfilled' ? weeklyActivities.value : []
  const nutrition = nutritionActuals.status === 'fulfilled' ? nutritionActuals.value : []
  const progressData = progressRows.status === 'fulfilled' ? parseProgressSheet(progressRows.value) : []
  const streak = mobilityStreak.status === 'fulfilled' ? mobilityStreak.value : 0

  // Compute stats
  const now = new Date()
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0)
  const thisWeekActivities = allActivities.filter(a => a.start_date && new Date(a.start_date) >= weekStart)
  const weeklyLoad = thisWeekActivities.length

  // Current training week (from Apr 10 plan start)
  const planStart = new Date('2026-04-10')
  const weeksSinceStart = Math.max(1, Math.ceil((now.getTime() - planStart.getTime()) / (7 * 86400000)))
  const currentWeek = Math.min(weeksSinceStart, 7)
  const currentPhase = currentWeek <= 2 ? 'Re-entry' : currentWeek <= 4 ? 'Build' : currentWeek <= 6 ? 'Sharpening' : 'Taper'

  // Nutrition accuracy (% days hitting ≥1800 kcal)
  const nutAccuracy = nutrition.length > 0
    ? Math.round((nutrition.filter(n => n.calories && n.calories >= 1800).length / nutrition.length) * 100)
    : null

  // Weekly volume by type
  const weekBuckets: Record<string, { swim: number; bike: number; run: number }> = {}
  for (const act of allActivities) {
    if (!act.start_date) continue
    const wk = getWeekLabel(new Date(act.start_date))
    if (!weekBuckets[wk]) weekBuckets[wk] = { swim: 0, bike: 0, run: 0 }
    const miDist = (act.distance ?? 0) / 1609.34
    if (act.activity_type === 'swim') weekBuckets[wk].swim += miDist
    else if (act.activity_type === 'bike') weekBuckets[wk].bike += miDist
    else if (act.activity_type === 'run') weekBuckets[wk].run += miDist
  }
  const volumeData = Object.entries(weekBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, v]) => ({
      week,
      swim: Math.round(v.swim * 10) / 10,
      bike: Math.round(v.bike * 10) / 10,
      run: Math.round(v.run * 10) / 10,
    }))

  // Distribution by activity type
  const typeCounts = allActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] || 0) + 1
    return acc
  }, {})
  const distributionData = [
    { name: 'Swim', value: typeCounts.swim || 0, color: 'var(--swim-t)' },
    { name: 'Bike', value: typeCounts.bike || 0, color: 'var(--bike-t)' },
    { name: 'Run', value: typeCounts.run || 0, color: 'var(--run-t)' },
    { name: 'Lift', value: typeCounts.lift || 0, color: 'var(--lift-t)' },
  ].filter(d => d.value > 0)

  // Nutrition for chart
  const nutritionChartData = nutrition.map(n => ({
    date: n.date,
    calories: n.calories,
    protein: n.protein,
  }))

  // Weight for chart
  const weightChartData = progressData.map(p => ({
    date: p.date,
    weight: p.weight,
  }))

  // Mobility today
  const todayKey = now.toISOString().split('T')[0]
  const required = mobRequiredIds(now)
  const mobilityTodayDone = 0 // Will be updated client-side; server shows 0

  return (
    <div className="hub-page">
      {/* ── HERO ── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-overlay" />
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-race">
            {activeRace ? 'Next race' : '2026 Season'}
          </div>
          <div className="dashboard-hero-title">
            {activeRace ? activeRace.race.name : 'Season Complete'}
          </div>
          <div className="dashboard-hero-sub">
            {activeRace
              ? `${activeRace.race.dateLabel} · ${activeRace.race.location}`
              : 'All 6 races complete · great season'}
          </div>
        </div>
        {daysToRace !== null && daysToRace >= 0 && (
          <div className="dashboard-hero-days">
            <div className="dashboard-hero-days-num">{daysToRace}</div>
            <div className="dashboard-hero-days-lbl">days out</div>
          </div>
        )}
      </div>

      {/* ── ROW 1: STAT STRIP ── */}
      <div className="stat-strip" style={{ marginBottom: 16 }}>
        <StatCard
          value={daysToRace !== null && daysToRace >= 0 ? daysToRace : '—'}
          label="Days to race"
          sub={activeRace?.race.name.split(' ').slice(0, 2).join(' ')}
        />
        <StatCard
          value={`Wk ${currentWeek}`}
          label="Training week"
          sub={currentPhase}
        />
        <StatCard
          value={streak > 0 ? `${streak}d 🔥` : '—'}
          label="Mobility streak"
          sub="consecutive nights"
        />
        <StatCard
          value={weeklyLoad}
          label="Sessions this week"
          sub="from Strava"
        />
        <StatCard
          value={nutAccuracy !== null ? `${nutAccuracy}%` : '—'}
          label="Nutrition accuracy"
          sub="days hitting targets"
        />
      </div>

      {/* ── ROW 2: CHARTS ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-card-title">Weight trend</div>
          <WeightChart data={weightChartData} />
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Weekly volume (swim / bike / run)</div>
          <VolumeChart data={volumeData} />
        </div>
      </div>

      {/* ── ROW 3: CHARTS ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-card-title">Nutrition — calories & protein</div>
          <NutritionChart data={nutritionChartData} />
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Training distribution</div>
          <DistributionChart data={distributionData} />
        </div>
      </div>

      {/* ── ROW 4: ACTIVITY FEED + QUICK STATUS ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-card-title">Recent activities</div>
          <ActivityFeed activities={activities} />
        </div>
        <div>
          <QuickStatus
            mobilityStreak={streak}
            mobilityToday={{ done: mobilityTodayDone, total: required.length }}
          />
        </div>
      </div>
    </div>
  )
}
