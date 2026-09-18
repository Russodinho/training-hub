'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'

export type VolumeSport =
  | 'swim' | 'bike' | 'run' | 'lift' | 'soccer' | 'surfing' | 'snowboarding' | 'yoga' | 'other'

export interface SportAgg { distance: number; minutes: number; calories: number; sessions: number }

export interface WeekVolume {
  weekStart: string // Monday, YYYY-MM-DD
  partial: boolean  // current week, still in progress
  sports: Record<VolumeSport, SportAgg>
}

// One calendar day, for the 7-day view.
export interface DayVolume {
  date: string // YYYY-MM-DD
  sports: Record<VolumeSport, SportAgg>
}

type Range = 7 | 30 | 60 | 90

type Metric = 'time' | 'distance' | 'calories' | 'sessions'

const SPORTS: { key: VolumeSport; name: string; color: string }[] = [
  { key: 'swim', name: 'Swim', color: 'var(--swim-t)' },
  { key: 'bike', name: 'Bike', color: 'var(--bike-t)' },
  { key: 'run', name: 'Run', color: 'var(--run-t)' },
  { key: 'lift', name: 'Lift', color: 'var(--lift-t)' },
  { key: 'soccer', name: 'Soccer', color: 'var(--soccer-t)' },
  { key: 'surfing', name: 'Surfing', color: 'var(--surfing-t)' },
  { key: 'snowboarding', name: 'Snowboarding', color: 'var(--snowboarding-t)' },
  { key: 'yoga', name: 'Yoga', color: 'var(--yoga-t)' },
  { key: 'other', name: 'Other', color: 'var(--muted)' },
]

// Distance is only meaningful for sports that are actually measured by it.
const DISTANCE_SPORTS: VolumeSport[] = ['swim', 'bike', 'run']

const METRICS: { key: Metric; label: string }[] = [
  { key: 'time', label: 'Time' },
  { key: 'distance', label: 'Distance' },
  { key: 'calories', label: 'Calories' },
  { key: 'sessions', label: 'Sessions' },
]

const RANGES: { key: Range; label: string }[] = [
  { key: 7, label: '7D' },
  { key: 30, label: '30D' },
  { key: 60, label: '60D' },
  { key: 90, label: '90D' },
]

// Last day (YYYY-MM-DD) of the Monday-start week beginning on `weekStart`.
function weekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 6)
  return d.toISOString().split('T')[0]
}

// First day of a window of `days` calendar days ending on `today`.
function windowStart(today: string, days: number): string {
  const d = new Date(today + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - (days - 1))
  return d.toISOString().split('T')[0]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dayLabel(date: string): string {
  const d = new Date(date + 'T00:00:00Z')
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCMonth() + 1}/${d.getUTCDate()}`
}

function metricValue(a: SportAgg, metric: Metric): number {
  switch (metric) {
    case 'time': return a.minutes / 60
    case 'distance': return a.distance
    case 'calories': return a.calories
    case 'sessions': return a.sessions
  }
}

function fmtValue(v: number, metric: Metric): string {
  switch (metric) {
    case 'time': {
      const totalMin = Math.round(v * 60)
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      return h > 0 ? `${h}h ${m}m` : `${m}m`
    }
    case 'distance': return `${(Math.round(v * 10) / 10).toFixed(1)} mi`
    case 'calories': return `${Math.round(v).toLocaleString()} cal`
    case 'sessions': return `${Math.round(v)} ${Math.round(v) === 1 ? 'session' : 'sessions'}`
  }
}

function fmtAxis(v: number, metric: Metric): string {
  switch (metric) {
    case 'time': return `${v}h`
    case 'distance': return `${v}mi`
    case 'calories': return v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`
    case 'sessions': return `${v}`
  }
}

function weekLabel(weekStart: string, partial: boolean): string {
  const [, m, d] = weekStart.split('-').map(Number)
  return `${m}/${d}${partial ? '*' : ''}`
}

interface Row extends Record<string, number | string | boolean> {
  label: string
}

function VolumeTooltip({ active, payload, label, metric }: {
  active?: boolean
  payload?: { dataKey: string; name: string; color: string; value: number }[]
  label?: string
  metric: Metric
}) {
  if (!active || !payload) return null
  const rows = payload.filter(p => p.value > 0)
  if (rows.length === 0) return null
  const total = rows.reduce((s, p) => s + p.value, 0)

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '8px 10px', fontFamily: 'IBM Plex Mono', fontSize: 11,
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      {rows.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: 'var(--text)' }}>{fmtValue(p.value, metric)}</span>
        </div>
      ))}
      {rows.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 4,
          paddingTop: 4, borderTop: '1px solid var(--border-soft)' }}>
          <span style={{ color: 'var(--muted)' }}>Total</span>
          <span style={{ color: 'var(--text)' }}>{fmtValue(total, metric)}</span>
        </div>
      )}
    </div>
  )
}

// Functional-only control styling; visual polish is left to the design pass.
function toggleStyle(active: boolean): React.CSSProperties {
  return {
    minHeight: 32, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'Figtree, sans-serif', fontSize: 12, fontWeight: 600,
    border: '1px solid var(--border)',
    background: active ? 'var(--s3)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--muted)',
  }
}

export default function VolumeChart({ data, daily, today }: { data: WeekVolume[]; daily: DayVolume[]; today: string }) {
  const [metric, setMetric] = useState<Metric>('time')
  const [range, setRange] = useState<Range>(7)

  const sportsForMetric = metric === 'distance'
    ? SPORTS.filter(s => DISTANCE_SPORTS.includes(s.key))
    : SPORTS

  // Both views reduce to the same shape: a labelled bucket of per-sport aggregates.
  // 7D = the last 7 calendar days as daily bars (daily has 14, the older 7 feed
  // the comparison). 30D/60D/90D = weekly bars for every Monday-week that touches
  // the last N days, so the oldest bar can include a few days before the window.
  const isDaily = range === 7
  const start = windowStart(today, range)
  const buckets: { label: string; sports: Record<VolumeSport, SportAgg> }[] = isDaily
    ? daily.slice(-7).map(d => ({ label: dayLabel(d.date), sports: d.sports }))
    : data
        .filter(w => weekEnd(w.weekStart) >= start)
        .map(w => ({ label: `Week of ${weekLabel(w.weekStart, w.partial)}`, sports: w.sports }))

  const rows: Row[] = buckets.map(b => {
    const row: Row = { label: b.label }
    for (const s of sportsForMetric) {
      row[s.key] = Math.round(metricValue(b.sports[s.key], metric) * 100) / 100
    }
    return row
  })

  // Only sports with something to show in this range/metric get a bar + legend entry.
  const activeSports = sportsForMetric.filter(s => rows.some(r => (r[s.key] as number) > 0))

  const sumOf = (sports: Record<VolumeSport, SportAgg> | undefined) =>
    sports ? sportsForMetric.reduce((sum, s) => sum + metricValue(sports[s.key], metric), 0) : 0
  const sumDays = (days: DayVolume[]) => days.reduce((t, d) => t + sumOf(d.sports), 0)
  const thisWeek = data[data.length - 1]
  const lastWeek = data[data.length - 2]
  const currentTotal = isDaily ? sumDays(daily.slice(-7)) : sumOf(thisWeek?.sports)
  const previousTotal = isDaily ? sumDays(daily.slice(-14, -7)) : sumOf(lastWeek?.sports)
  const currentLabel = isDaily ? 'Last 7 days' : `This week${thisWeek?.partial ? ' so far' : ''}`
  const previousLabel = isDaily ? 'Previous 7 days' : 'Last week'

  const controls = (
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
      <div role="group" aria-label="Volume metric" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {METRICS.map(m => (
          <button key={m.key} type="button" aria-pressed={metric === m.key}
            style={toggleStyle(metric === m.key)} onClick={() => setMetric(m.key)}>
            {m.label}
          </button>
        ))}
      </div>
      <div role="group" aria-label="Weeks shown" style={{ display: 'flex', gap: 4 }}>
        {RANGES.map(r => (
          <button key={r.key} type="button" aria-pressed={range === r.key}
            style={toggleStyle(range === r.key)} onClick={() => setRange(r.key)}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )

  if (activeSports.length === 0) {
    return (
      <div>
        {controls}
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <div className="empty-icon">📊</div>
          <div className="empty-title">
            {metric === 'distance' ? 'No swim, bike or run distance in this range' : 'No activity in this range'}
          </div>
          <div>Use “Sync Garmin now” at the top of the page to pull the latest activities.</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {controls}
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
        {currentLabel}: <span style={{ color: 'var(--text)' }}>{fmtValue(currentTotal, metric)}</span>
        {' · '}{previousLabel}: <span style={{ color: 'var(--text)' }}>{fmtValue(previousTotal, metric)}</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={metric === 'time' || metric === 'distance'}
            tickFormatter={v => fmtAxis(v, metric)}
          />
          <Tooltip content={<VolumeTooltip metric={metric} />} />
          <Legend
            wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--muted)' }}
            iconType="square"
          />
          {activeSports.map(({ key, name, color }) => (
            <Bar key={key} dataKey={key} name={name} fill={color} stackId="volume" maxBarSize={32} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--faint)', marginTop: 4 }}>
        {isDaily
          ? 'Last 7 days, ending today.'
          : `Weekly totals for the weeks in the last ${range} days. Weeks start Monday; * = current week, still in progress.`}
      </div>
    </div>
  )
}
