import { getActiveRace, getDaysToRace, mobRequiredIds } from '@/lib/data'
import { getActivitiesForWeeks, getMobilityStreak } from '@/lib/supabase'
import { getTodaySchedule } from '@/lib/schedule'
import VolumeChart from '@/components/dashboard/VolumeChart'
import NutritionActualsPanel from '@/components/dashboard/NutritionActualsPanel'
import MacroAccuracyPanel from '@/components/dashboard/MacroAccuracyPanel'
import DistributionChart from '@/components/dashboard/DistributionChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import BodyCompWidget from '@/components/dashboard/BodyCompWidget'
import RaceCountdown from '@/components/dashboard/RaceCountdown'
import RecoveryCard from '@/components/dashboard/RecoveryCard'

function getGreeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function getWeekLabel(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// Map JS getDay() (0=Sun) to Mon-indexed (0=Mon)
function toMonIdx(day: number) { return day === 0 ? 6 : day - 1 }

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default async function DashboardPage() {
  const activeRace = getActiveRace()
  const daysToRace = activeRace ? getDaysToRace(activeRace.race) : null

  const [weeklyActivities, mobilityStreak] = await Promise.allSettled([
    getActivitiesForWeeks(13),
    getMobilityStreak(),
  ])

  const allActivities = weeklyActivities.status === 'fulfilled' ? weeklyActivities.value : []
  const streak = mobilityStreak.status === 'fulfilled' ? mobilityStreak.value : 0

  // Weekly progress dots (Mon-indexed)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const activeDays = Array(7).fill(false) as boolean[]
  for (const act of allActivities) {
    if (!act.start_date) continue
    const d = new Date(act.start_date)
    if (d >= weekStart) activeDays[toMonIdx(d.getDay())] = true
  }
  const thisWeekCount = activeDays.filter(Boolean).length
  const todayMonIdx = toMonIdx(now.getDay())

  // Volume chart data
  const weekBuckets: Record<string, { swim: number; bike: number; run: number }> = {}
  for (const act of allActivities) {
    if (!act.start_date) continue
    const wk = getWeekLabel(new Date(act.start_date))
    if (!weekBuckets[wk]) weekBuckets[wk] = { swim: 0, bike: 0, run: 0 }
    const mi = (act.distance ?? 0) / 1609.34
    if (act.activity_type === 'swim') weekBuckets[wk].swim += mi
    else if (act.activity_type === 'bike') weekBuckets[wk].bike += mi
    else if (act.activity_type === 'run') weekBuckets[wk].run += mi
  }
  const volumeData = Object.entries(weekBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, v]) => ({
      week,
      swim: Math.round(v.swim * 10) / 10,
      bike: Math.round(v.bike * 10) / 10,
      run: Math.round(v.run * 10) / 10,
    }))

  const typeCounts = allActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] || 0) + 1; return acc
  }, {})
  const distributionData = [
    { name: 'Swim', value: typeCounts.swim || 0, color: 'var(--swim-t)' },
    { name: 'Bike', value: typeCounts.bike || 0, color: 'var(--bike-t)' },
    { name: 'Run', value: typeCounts.run || 0, color: 'var(--run-t)' },
    { name: 'Lift', value: typeCounts.lift || 0, color: 'var(--lift-t)' },
  ].filter(d => d.value > 0)

  const recentActivities = allActivities.slice(0, 8)

  // Today's schedule
  const todaySchedule = getTodaySchedule()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = dayNames[now.getDay()]
  const required = mobRequiredIds(now)

  // Training week
  const planStart = new Date('2026-04-10')
  const weeksSince = Math.max(1, Math.ceil((now.getTime() - planStart.getTime()) / (7 * 86400000)))
  const currentWeek = Math.min(weeksSince, 7)
  const currentPhase = currentWeek <= 2 ? 'Re-entry' : currentWeek <= 4 ? 'Build' : currentWeek <= 6 ? 'Sharpening' : 'Taper'

  const race = activeRace?.race

  const cardStyle: React.CSSProperties = {
    background: 'var(--s2)',
    border: '0.5px solid var(--border)',
    borderRadius: 14,
    padding: '22px 24px',
  }

  return (
    <div style={{ padding: '32px 28px 64px', maxWidth: 1160, margin: '0 auto' }}>

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Figtree, sans-serif', fontSize: 26, fontWeight: 700,
          color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
          {getGreeting()}, Matt
        </h1>
        <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: 14, color: 'var(--muted)',
          marginTop: 4 }}>
          Consistent training builds extraordinary days.
        </p>
      </div>

      {/* ── Main two-column area ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 24 }}
        className="dash-main-grid">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Race hero card */}
          <div style={{ ...cardStyle }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--strength)',
              marginBottom: 8 }}>
              {race ? 'Next race' : '2026 season'}
            </div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 22, fontWeight: 700,
              color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {race ? race.name : 'Season complete'}
            </div>
            {race && (
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 13, color: 'var(--muted)',
                marginTop: 4 }}>
                {race.dateLabel} · {race.location.split('·')[0].trim()}
              </div>
            )}
            {race && daysToRace !== null && daysToRace >= 0 && (
              <RaceCountdown targetDate={race.date} />
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="/log" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'Figtree, sans-serif', fontSize: 13, fontWeight: 600,
                background: 'var(--strength)', color: '#0d0f11',
                borderRadius: 8, padding: '9px 18px', textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}>
                ▶ Start Workout
              </a>
              {race && (
                <a href="/race-day" style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontFamily: 'Figtree, sans-serif', fontSize: 13, fontWeight: 500,
                  background: 'var(--s3)', color: 'var(--muted)',
                  borderRadius: 8, padding: '9px 18px', textDecoration: 'none',
                }}>
                  Race plan
                </a>
              )}
            </div>
          </div>

          {/* Today's Timeline */}
          {todaySchedule && (
            <div style={{ ...cardStyle }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16 }}>
                <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: 15, fontWeight: 600,
                  color: 'var(--text)' }}>
                  Today's Timeline
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                  color: 'var(--muted)' }}>
                  {todayName} · {todaySchedule.tag}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {todaySchedule.blocks
                  .filter(b => ['bl-gym','bl-swim','bl-bike','bl-run','bl-brick','bl-mob','bl-wind','bl-soccer'].includes(b.cls))
                  .map((block, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '7px 10px', borderRadius: 7,
                    }} className={`timeline-row ${block.cls}`}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                        color: 'var(--muted)', minWidth: 52, flexShrink: 0 }}>
                        {block.time}
                      </div>
                      <div style={{ flex: 1, fontFamily: 'Figtree, sans-serif', fontSize: 13,
                        fontWeight: 500 }}>
                        {block.name}
                      </div>
                    </div>
                  ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <a href="/mobility" style={{
                  fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--muted)',
                  textDecoration: 'none', padding: '6px 14px', background: 'var(--s3)',
                  borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Open mobility
                </a>
                <a href="/sleep" style={{
                  fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--muted)',
                  textDecoration: 'none', padding: '6px 14px', background: 'var(--s3)',
                  borderRadius: 7,
                }}>
                  Log sleep
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RecoveryCard />

          {/* Weekly progress */}
          <div style={{ ...cardStyle }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)',
              marginBottom: 12 }}>
              Weekly Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22,
                fontWeight: 700, color: 'var(--text)' }}>
                {thisWeekCount}
              </span>
              <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: 13,
                color: 'var(--muted)' }}>
                / 5 workouts
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
              {DAY_LETTERS.map((ltr, i) => {
                const active = activeDays[i]
                const isToday = i === todayMonIdx
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 6 }}>
                    <div style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                      color: isToday ? 'var(--strength)' : 'var(--dim)',
                      letterSpacing: '0.06em',
                    }}>
                      {ltr}
                    </div>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: active ? 'var(--strength)' : 'var(--s3)',
                      border: isToday && !active ? '1.5px solid var(--strength)' : 'none',
                      boxSizing: 'border-box',
                    }} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: 'var(--s2)', border: '0.5px solid var(--border)',
              borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: 6 }}>Training week</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20,
                fontWeight: 700, color: 'var(--text)' }}>Wk {currentWeek}</div>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11,
                color: 'var(--muted)', marginTop: 2 }}>{currentPhase}</div>
            </div>
            <div style={{ background: 'var(--s2)', border: '0.5px solid var(--border)',
              borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: 6 }}>Mobility</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20,
                fontWeight: 700, color: streak > 0 ? 'var(--strength)' : 'var(--text)' }}>
                {streak > 0 ? `${streak}d` : '—'}
              </div>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11,
                color: 'var(--muted)', marginTop: 2 }}>streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="chart-row" style={{ marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-card-title">Weekly volume (swim / bike / run)</div>
          <VolumeChart data={volumeData} />
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Training distribution</div>
          <DistributionChart data={distributionData} />
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="chart-card-title">Weight &amp; body comp</div>
        <BodyCompWidget />
      </div>

      <div className="chart-card" style={{ marginBottom: 16 }}>
        <NutritionActualsPanel />
      </div>

      <div className="chart-card" style={{ marginBottom: 16 }}>
        <MacroAccuracyPanel />
      </div>

      <div className="chart-card">
        <div className="chart-card-title">Recent activities</div>
        <ActivityFeed activities={recentActivities} />
      </div>
    </div>
  )
}
