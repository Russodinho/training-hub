import { getActiveRace, getDaysToRace, getGarminActivitiesForWeeks, getMobilityStreak, garminBucket } from '@/lib/supabase'
import { getTodaySchedule } from '@/lib/schedule'
import { getAthleteContext } from '@/lib/agentContext'
import VolumeChart from '@/components/dashboard/VolumeChart'
import NutritionActualsPanel from '@/components/dashboard/NutritionActualsPanel'
import MacroAccuracyPanel from '@/components/dashboard/MacroAccuracyPanel'
import DistributionChart from '@/components/dashboard/DistributionChart'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import BodyCompWidget from '@/components/dashboard/BodyCompWidget'
import RaceCountdown from '@/components/dashboard/RaceCountdown'
import RecoveryCard from '@/components/dashboard/RecoveryCard'
import ActivityIcon, { iconForBlockClass } from '@/components/dashboard/ActivityIcon'
import { TrainingSummary } from '@/components/TrainingSummary'
import GarminSyncButton from '@/components/dashboard/GarminSyncButton'

// Dashboard is date- and user-data-dependent (today's workout, recovery,
// greeting) — without this it can be statically cached at build/deploy
// time and "today" freezes on whatever day it was last deployed.
export const dynamic = 'force-dynamic'

const WORKOUT_CLASSES = ['bl-gym', 'bl-swim', 'bl-bike', 'bl-run', 'bl-brick', 'bl-soccer']
const TIMELINE_CLASSES = [...WORKOUT_CLASSES, 'bl-mob', 'bl-wind']

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
  const [weeklyActivities, mobilityStreak, activeRaceResult, athleteContextResult] = await Promise.allSettled([
    getGarminActivitiesForWeeks(13),
    getMobilityStreak(),
    getActiveRace(),
    getAthleteContext(),
  ])

  const allActivities = weeklyActivities.status === 'fulfilled' ? weeklyActivities.value : []
  const streak = mobilityStreak.status === 'fulfilled' ? mobilityStreak.value : 0
  const activeRace = activeRaceResult.status === 'fulfilled' ? activeRaceResult.value : null
  const daysToRace = activeRace ? getDaysToRace(activeRace.race) : null
  const athleteContext = athleteContextResult.status === 'fulfilled' ? athleteContextResult.value : null

  // Weekly progress dots (Mon-indexed)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const activeDays = Array(7).fill(false) as boolean[]
  for (const act of allActivities) {
    if (!act.date) continue
    const d = new Date(act.date + 'T00:00:00')
    if (d >= weekStart) activeDays[toMonIdx(d.getDay())] = true
  }
  const thisWeekCount = activeDays.filter(Boolean).length
  const todayMonIdx = toMonIdx(now.getDay())

  // Volume chart data
  const weekBuckets: Record<string, { swim: number; bike: number; run: number }> = {}
  for (const act of allActivities) {
    if (!act.date) continue
    const wk = getWeekLabel(new Date(act.date + 'T00:00:00'))
    if (!weekBuckets[wk]) weekBuckets[wk] = { swim: 0, bike: 0, run: 0 }
    const mi = (act.distance_km ?? 0) * 0.621371
    const bucket = garminBucket(act.activity_type)
    if (bucket === 'swim') weekBuckets[wk].swim += mi
    else if (bucket === 'bike') weekBuckets[wk].bike += mi
    else if (bucket === 'run') weekBuckets[wk].run += mi
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
    const bucket = garminBucket(a.activity_type)
    acc[bucket] = (acc[bucket] || 0) + 1; return acc
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
  const timelineBlocks = todaySchedule?.blocks.filter(b => TIMELINE_CLASSES.includes(b.cls)) ?? []
  const primaryBlock = timelineBlocks.find(b => WORKOUT_CLASSES.includes(b.cls)) ?? null

  // Training week (the 7-week block starting 2026-04-10 — once it's over, show
  // "Off-season" instead of freezing on "Wk 7 · Taper" forever)
  const planStart = new Date('2026-04-10')
  const weeksSince = Math.max(1, Math.ceil((now.getTime() - planStart.getTime()) / (7 * 86400000)))
  const isOffSeason = weeksSince > 7
  const currentWeek = Math.min(weeksSince, 7)
  const currentPhase = isOffSeason ? 'Off-season'
    : currentWeek <= 2 ? 'Re-entry' : currentWeek <= 4 ? 'Build' : currentWeek <= 6 ? 'Sharpening' : 'Taper'

  const race = activeRace?.race

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <div className="sub">{getGreeting()}, Matt</div>
        </div>
        <GarminSyncButton />
      </div>

      {/* ── Row 1: race + today's workout, equal columns ── */}
      <div className="dash-2col">
        <div
          className="dash-race-card"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(9,19,25,0.25), rgba(9,19,25,0.9)), url(/training-hub-design/race-landscape.png)' }}
        >
          <div className="dash-race-eyebrow">{race ? 'Next race' : '2026 season'}</div>
          <div className="dash-race-name">{race ? race.name : 'Season complete'}</div>
          {race ? (
            <div className="dash-race-sub">{race.dateLabel} · {race.location.split('·')[0].trim()}</div>
          ) : (
            <div className="dash-race-sub">No upcoming race on the calendar</div>
          )}
          {race && daysToRace !== null && daysToRace >= 0 && (
            <RaceCountdown targetDate={race.date} />
          )}
          <a href={race ? '/race-day' : '/race-calendar'} className="dash-race-link">
            {race ? 'Race plan →' : 'View calendar →'}
          </a>
        </div>

        <div className="dash-workout-col">
          <div className="dash-col-heading">Today&apos;s Workout</div>
          {primaryBlock ? (
            <a href="/log" className={`dash-workout-row ${primaryBlock.cls}`}>
              <span className="dash-icon-tile"><ActivityIcon kind={iconForBlockClass(primaryBlock.cls)} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div className="dash-workout-name">{primaryBlock.name}</div>
                <div className="dash-workout-sub">{primaryBlock.time}</div>
              </span>
              <span className="dash-chevron">›</span>
            </a>
          ) : (
            <div className="dash-workout-row rest">
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>No workout scheduled today</span>
            </div>
          )}
          <a href="/log" className="dash-start-btn">▶ Start Workout</a>
        </div>
      </div>

      {/* ── Row 2: today's timeline + recovery ── */}
      <div className="dash-2col">
        {todaySchedule && (
          <div className="card">
            <div className="card-title">
              <span>Today&apos;s Timeline</span>
              <span style={{ fontWeight: 400, color: 'var(--faint)', fontSize: 12 }}>{todayName} · {todaySchedule.tag}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {timelineBlocks.map((block, i) => (
                <div key={i} className={`dash-timeline-row ${block.cls}`}>
                  <span className="dash-icon-tile small"><ActivityIcon kind={iconForBlockClass(block.cls)} size={16} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div className="dash-workout-name" style={{ fontSize: 13 }}>{block.name}</div>
                    <div className="dash-workout-sub">{block.time}</div>
                  </span>
                </div>
              ))}
              {timelineBlocks.length === 0 && (
                <div style={{ color: 'var(--faint)', fontSize: 12, padding: '8px 0' }}>Nothing scheduled today.</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <a href="/mobility" style={{
                fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--muted)',
                textDecoration: 'none', padding: '6px 14px', background: 'var(--s3)',
                borderRadius: 7,
              }}>
                Open mobility
              </a>
              <a href="/wind-down" style={{
                fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--muted)',
                textDecoration: 'none', padding: '6px 14px', background: 'var(--s3)',
                borderRadius: 7,
              }}>
                Wind-down
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
        <RecoveryCard />
      </div>

      {/* ── Weekly progress + quick stats ── */}
      <div className="dash-2col">
        <div className="card">
          <div className="card-title"><span>Weekly Progress</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
            <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: 22,
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
                    fontFamily: 'Figtree, sans-serif', fontSize: 11, fontWeight: 500,
                    color: isToday ? 'var(--accent)' : 'var(--dim)',
                  }}>
                    {ltr}
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: active ? 'var(--accent)' : 'var(--s3)',
                    border: isToday && !active ? '1.5px solid var(--accent)' : 'none',
                    boxSizing: 'border-box',
                  }} />
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="card">
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11, fontWeight: 500,
              color: 'var(--muted)',
              marginBottom: 6 }}>Training week</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 20,
              fontWeight: 700, color: 'var(--text)' }}>{isOffSeason ? '—' : `Wk ${currentWeek}`}</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11,
              color: 'var(--muted)', marginTop: 2 }}>{currentPhase}</div>
          </div>
          <div className="card">
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11, fontWeight: 500,
              color: 'var(--muted)',
              marginBottom: 6 }}>Mobility</div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 20,
              fontWeight: 700, color: streak > 0 ? 'var(--mobility)' : 'var(--text)' }}>
              {streak > 0 ? `${streak}d` : '—'}
            </div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11,
              color: 'var(--muted)', marginTop: 2 }}>streak</div>
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="chart-card-title" style={{ marginBottom: 0 }}>Training snapshot</div>
          <a href="/agent" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>
            Full coaching report →
          </a>
        </div>
        {athleteContext ? (
          <TrainingSummary ctx={athleteContext} compact />
        ) : (
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>Unable to load right now.</div>
        )}
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
