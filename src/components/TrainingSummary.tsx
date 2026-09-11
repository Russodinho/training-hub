'use client'

import type { AthleteContext } from '@/lib/agentContext'

interface Props {
  ctx: AthleteContext
  compact?: boolean
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

interface Stat { label: string; value: string }

function buildStats(ctx: AthleteContext): Stat[] {
  const { recovery, garmin, nutrition, bodyComp, week } = ctx
  const stats: Stat[] = []
  if (recovery.sleepScore != null) stats.push({ label: 'Sleep score', value: `${recovery.sleepScore}` })
  if (garmin.bodyBattery != null) stats.push({ label: 'Body Battery', value: `${garmin.bodyBattery}` })
  if (garmin.restingHR != null) stats.push({ label: 'RHR', value: `${garmin.restingHR} bpm` })
  if (nutrition.todayCalories != null) {
    stats.push({ label: 'Kcal today', value: `${nutrition.todayCalories} / ${nutrition.todayTargetCalories}` })
  }
  if (bodyComp.currentWeight != null) stats.push({ label: 'Weight', value: `${bodyComp.currentWeight} lbs` })
  stats.push({ label: 'Week', value: `${week.workoutsCompleted}/${week.workoutsPlanned} sessions` })
  return stats
}

export function TrainingSummary({ ctx, compact }: Props) {
  const { today, races, season } = ctx
  const nextRace = races.next
  const stats = buildStats(ctx)

  const todayLabel = today.isRestDay
    ? 'Rest day'
    : today.workouts.map(w => w.name).join(' + ') || 'Rest day'

  const raceBadge = nextRace && season.daysToNextRace != null ? (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <span style={{ fontSize: compact ? 20 : 28, fontWeight: 700, color: 'var(--accent)' }}>{season.daysToNextRace}</span>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>days to</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{nextRace.name}</span>
    </div>
  ) : null

  if (compact) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 14, fontWeight: 600 }}>{todayLabel}</div>
          {raceBadge}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {stats.slice(0, 3).map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600 }}>{s.value}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Good {getTimeOfDay()}, {ctx.athlete.name}</h2>
          <p style={{ margin: '4px 0 0', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
            {ctx.athlete.todayDow} · {todayLabel}
          </p>
          <p style={{ margin: '2px 0 0', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {season.currentPhase} phase · {season.soccerSeasonActive ? 'Soccer season active' : 'Off-season'}
          </p>
        </div>
        {raceBadge}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginBottom: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            textAlign: 'center', padding: '10px 4px',
            background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-soft)',
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {races.previous.length > 0 && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
          Last race: {races.previous[0].name}{races.previous[0].result ? ` · ${races.previous[0].result}` : ' · no result recorded'}
        </div>
      )}
    </div>
  )
}
