import { getActiveRace, getDaysToRace, RACES, mobRequiredIds } from '@/lib/data'
import { getRecentActivities, getActivitiesForWeeks, getNutritionActuals, getMobilityStreak } from '@/lib/supabase'
import { getTodaySchedule } from '@/lib/schedule'
import StatCard from '@/components/dashboard/StatCard'
import BodyCompWidget from '@/components/dashboard/BodyCompWidget'
import VolumeChart from '@/components/dashboard/VolumeChart'
import NutritionActualsPanel from '@/components/dashboard/NutritionActualsPanel'
import MacroAccuracyPanel from '@/components/dashboard/MacroAccuracyPanel'
import DistributionChart from '@/components/dashboard/DistributionChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import QuickStatus from '@/components/dashboard/QuickStatus'
import CollapsibleSchedule from '@/components/dashboard/CollapsibleSchedule'

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
    mobilityStreak,
  ] = await Promise.allSettled([
    getRecentActivities(10),
    getActivitiesForWeeks(13),
    getNutritionActuals(90),
    getMobilityStreak(),
  ])

  const activities = recentActivities.status === 'fulfilled' ? recentActivities.value : []
  const allActivities = weeklyActivities.status === 'fulfilled' ? weeklyActivities.value : []
  const nutrition = nutritionActuals.status === 'fulfilled' ? nutritionActuals.value : []
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

  // Nutrition accuracy
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

  // Today's schedule
  const todaySchedule = getTodaySchedule()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = dayNames[now.getDay()]

  // Mobility
  const required = mobRequiredIds(now)
  const mobilityTodayDone = 0 // server default; QuickStatus handles display

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

      {/* ── STAT STRIP ── */}
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

      {/* ── TODAY'S SCHEDULE ── */}
      {todaySchedule && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-hdr">
            <span className="ptitle">Today · {todayName}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>{todaySchedule.tag}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {todaySchedule.blocks
              .filter(b => b.cls !== 'bl-work' && b.cls !== 'bl-sleep')
              .map((block, i) => (
                <div key={i} className={`block ${block.cls}`} style={{ flex: '0 0 auto', minWidth: 0 }}>
                  <div className="block-time">{block.time}</div>
                  <div className="block-name">{block.name}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── WIDGETS ROW: Mobility + Recovery ── */}
      <div className="chart-row" style={{ marginBottom: 16 }}>
        {/* Mobility widget */}
        <div className="surface-card" style={{ flex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Mobility tonight
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 500 }}>
                {mobilityTodayDone}/{required.length}
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>exercises</span>
            </div>
            {streak > 0 && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
                🔥 {streak}d streak
              </span>
            )}
          </div>
          <a href="/mobility" style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text)', textDecoration: 'none', padding: '6px 12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)', textAlign: 'center' }}>
            Open mobility checklist →
          </a>
        </div>

        {/* Recovery placeholder */}
        <div className="surface-card" style={{ flex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Recovery
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 28 }}>🫀</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>Connect Google Health to enable</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                HRV · resting HR · sleep score · readiness
              </div>
            </div>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', fontStyle: 'italic' }}>
            Coming soon
          </div>
        </div>

        {/* Wind-down tonight */}
        <div className="surface-card" style={{ flex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Wind-down tonight
          </div>
          <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>
            5 passive stretches · ~10 min<br />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Legs up wall · twist · child&apos;s pose · 90/90 · neck</span>
          </div>
          <a href="/wind-down" style={{ display: 'block', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text)', textDecoration: 'none', padding: '6px 12px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)', textAlign: 'center' }}>
            Start wind-down →
          </a>
        </div>
      </div>

      {/* ── ROW 2: Volume + Distribution ── */}
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-card-title">Weekly volume (swim / bike / run)</div>
          <VolumeChart data={volumeData} />
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Training distribution</div>
          <DistributionChart data={distributionData} />
        </div>
      </div>

      {/* ── ROW 3: Body comp ── */}
      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="chart-card-title">Weight & body comp</div>
        <BodyCompWidget />
      </div>

      {/* ── ROW 4: Nutrition actuals ── */}
      <div className="chart-card" style={{ marginBottom: 16 }}>
        <NutritionActualsPanel />
      </div>

      {/* ── ROW 5: Macro accuracy ── */}
      <div className="chart-card" style={{ marginBottom: 16 }}>
        <MacroAccuracyPanel />
      </div>

      {/* ── ROW 6: Activity feed + Quick status ── */}
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

      {/* ── FULL SCHEDULE (collapsible) ── */}
      <CollapsibleSchedule />
    </div>
  )
}
