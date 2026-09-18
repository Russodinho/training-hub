'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export interface DistributionSession {
  date: string   // YYYY-MM-DD
  bucket: string // garminBucket() value
}

interface DistributionChartProps {
  sessions: DistributionSession[]
  today: string  // YYYY-MM-DD, Eastern, from the server
}

const SLICES: { bucket: string; name: string; color: string }[] = [
  { bucket: 'swim', name: 'Swim', color: 'var(--swim-t)' },
  { bucket: 'bike', name: 'Bike', color: 'var(--bike-t)' },
  { bucket: 'run', name: 'Run', color: 'var(--run-t)' },
  { bucket: 'lift', name: 'Lift', color: 'var(--lift-t)' },
  { bucket: 'soccer', name: 'Soccer', color: 'var(--soccer-t)' },
  { bucket: 'surfing', name: 'Surfing', color: 'var(--surfing-t)' },
  { bucket: 'snowboarding', name: 'Snowboarding', color: 'var(--snowboarding-t)' },
  { bucket: 'yoga', name: 'Yoga', color: 'var(--yoga-t)' },
]

type DayRange = 7 | 30 | 60 | 90
const RANGES: DayRange[] = [7, 30, 60, 90]

// Start (YYYY-MM-DD) of a window of `days` calendar days ending on `today`.
function windowStart(today: string, days: number): string {
  const d = new Date(today + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - (days - 1))
  return d.toISOString().split('T')[0]
}

const SELECTOR_BTN: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  padding: '3px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  cursor: 'pointer',
}

export default function DistributionChart({ sessions, today }: DistributionChartProps) {
  const [range, setRange] = useState<DayRange>(7)

  const start = windowStart(today, range)
  const counts: Record<string, number> = {}
  for (const s of sessions) {
    if (s.date >= start && s.date <= today) counts[s.bucket] = (counts[s.bucket] || 0) + 1
  }
  const data = SLICES
    .map(s => ({ name: s.name, value: counts[s.bucket] || 0, color: s.color }))
    .filter(d => d.value > 0)

  const controls = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, marginBottom: 10 }}>
      {RANGES.map(d => (
        <button
          key={d}
          type="button"
          aria-pressed={range === d}
          onClick={() => setRange(d)}
          style={{
            ...SELECTOR_BTN,
            background: range === d ? 'var(--text)' : 'transparent',
            color: range === d ? 'var(--bg)' : 'var(--muted)',
          }}
        >
          {d}d
        </button>
      ))}
    </div>
  )

  if (data.length === 0) {
    return (
      <div>
        {controls}
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <div className="empty-icon">🥧</div>
          <div className="empty-title">No activity in the last {range} days</div>
          <div>Try a wider range, or use “Sync Garmin now” at the top of the page.</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {controls}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="40%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, fontFamily: 'IBM Plex Mono', fontSize: 11,
            }}
            formatter={(v: number) => [`${v} ${v === 1 ? 'session' : 'sessions'}`, '']}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--muted)' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
