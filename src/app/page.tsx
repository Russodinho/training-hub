import {
  getActiveRace, getDaysToRace, getGarminActivitiesForWeeks, getMobilityStreak, garminBucket,
  getWorkoutSessionDates, easternNow, todayStr, mondayOf,
} from '@/lib/supabase'
import { getTodaySchedule, SCHEDULE } from '@/lib/schedule'
import { getAthleteContext } from '@/lib/agentContext'
import VolumeChart, { type WeekVolume, type DayVolume, type VolumeSport } from '@/components/dashboard/VolumeChart'
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

function getGreeting(now: Date): string {
  const h = now.getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

// Map JS getDay() (0=Sun) to Mon-indexed (0=Mon)
function toMonIdx(day: number) { return day === 0 ? 6 : day - 1 }

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default async function DashboardPage() {
  const [weeklyActivities, mobilityStreak, activeRaceResult, athleteContextResult, loggedLiftsResult] = await Promise.allSettled([
    getGarminActivitiesForWeeks(13),
    getMobilityStreak(),
    getActiveRace(),
    getAthleteContext(),
    getWorkoutSessionDates(mondayOf(todayStr())),
  ])

  const allActivities = weeklyActivities.status === 'fulfilled' ? weeklyActivities.value : []
  const streak = mobilityStreak.status === 'fulfilled' ? mobilityStreak.value : 0
  const activeRace = activeRaceResult.status === 'fulfilled' ? activeRaceResult.value : null
  const daysToRace = activeRace ? getDaysToRace(activeRace.race) : null
  const athleteContext = athleteContextResult.status === 'fulfilled' ? athleteContextResult.value : null
  const loggedLiftDates = loggedLiftsResult.status === 'fulfilled' ? loggedLiftsResult.value : []

  const now = easternNow()
  const today = todayStr()
  const weekStartStr = mondayOf(today)
  const todayMonIdx = toMonIdx(now.getDay())

  // Adherence (this Mon–Sun week). Planned = gym + soccer blocks in the weekly
  // schedule template (swim/bike/run aren't in that template, so this
  // undercounts a full tri week). Completed = distinct (day, sport) sessions
  // from Garmin plus lifts logged in /log; a lift both on the watch and logged
  // in /log on the same day counts once.
  const TRAINING_BUCKETS = ['swim', 'bike', 'run', 'lift', 'soccer', 'surfing', 'snowboarding', 'yoga']
  const workoutsPlanned = SCHEDULE.reduce(
    (n, day) => n + (day.blocks.some(b => b.cls === 'bl-gym') ? 1 : 0) + (day.blocks.some(b => b.cls === 'bl-soccer') ? 1 : 0),
    0,
  )
  const sessionKeys = new Set<string>()
  for (const act of allActivities) {
    if (!act.date || act.date < weekStartStr) continue
    const bucket = garminBucket(act.activity_type)
    if (TRAINING_BUCKETS.includes(bucket)) sessionKeys.add(`${act.date}|${bucket}`)
  }
  for (const d of loggedLiftDates) {
    if (d >= weekStartStr) sessionKeys.add(`${d}|lift`)
  }
  const activeDays = Array(7).fill(false) as boolean[]
  for (const key of sessionKeys) {
    const d = new Date(key.split('|')[0] + 'T00:00:00')
    activeDays[toMonIdx(d.getDay())] = true
  }
  const thisWeekCount = sessionKeys.size

  // Weekly volume: 13 Monday-start weeks ending with the current (partial) one,
  // keyed by real week-start date so ordering is chronological across months
  // and years. Every bucket incl. lift/other is aggregated; the chart chooses
  // which metric and range to show.
  const VOLUME_SPORTS: VolumeSport[] = ['swim', 'bike', 'run', 'lift', 'soccer', 'surfing', 'snowboarding', 'yoga', 'other']
  const weekMap = new Map<string, WeekVolume>()
  for (let i = 12; i >= 0; i--) {
    const d = new Date(weekStartStr + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - i * 7)
    const ws = d.toISOString().split('T')[0]
    weekMap.set(ws, {
      weekStart: ws,
      partial: ws === weekStartStr,
      sports: Object.fromEntries(
        VOLUME_SPORTS.map(s => [s, { distance: 0, minutes: 0, calories: 0, sessions: 0 }]),
      ) as WeekVolume['sports'],
    })
  }
  for (const act of allActivities) {
    if (!act.date) continue
    const week = weekMap.get(mondayOf(act.date))
    if (!week) continue
    const agg = week.sports[garminBucket(act.activity_type)]
    agg.distance += (act.distance_km ?? 0) * 0.621371
    agg.minutes += act.duration_min ?? 0
    agg.calories += act.calories ?? 0
    agg.sessions += 1
  }
  const volumeData = [...weekMap.values()]

  // Daily buckets for the chart's 7-day view: the last 14 calendar days ending
  // today (Eastern), so the older 7 can feed the "previous 7 days" comparison.
  const dayMap = new Map<string, DayVolume>()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - i)
    const ds = d.toISOString().split('T')[0]
    dayMap.set(ds, {
      date: ds,
      sports: Object.fromEntries(
        VOLUME_SPORTS.map(s => [s, { distance: 0, minutes: 0, calories: 0, sessions: 0 }]),
      ) as DayVolume['sports'],
    })
  }
  for (const act of allActivities) {
    const day = act.date ? dayMap.get(act.date) : undefined
    if (!day) continue
    const agg = day.sports[garminBucket(act.activity_type)]
    agg.distance += (act.distance_km ?? 0) * 0.621371
    agg.minutes += act.duration_min ?? 0
    agg.calories += act.calories ?? 0
    agg.sessions += 1
  }
  const dailyVolume = [...dayMap.values()]

  // Raw (date, bucket) list; the distribution chart applies its own 7d/30d/90d window.
  const distributionSessions = allActivities
    .filter(a => a.date)
    .map(a => ({ date: a.date, bucket: garminBucket(a.activity_type) }))

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
          <div className="sub">{getGreeting(now)}, Matt</div>
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
              / {workoutsPlanned} planned
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
          <div className="chart-card-title">Weekly volume</div>
          <VolumeChart data={volumeData} daily={dailyVolume} />
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Training distribution</div>
          <DistributionChart sessions={distributionSessions} today={today} />
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
