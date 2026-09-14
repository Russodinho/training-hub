'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'

interface WeekVolume {
  week: string
  [key: string]: number | string
}

interface VolumeChartProps {
  data: WeekVolume[]
}

const SPORT_BARS = [
  { key: 'swim', name: 'Swim', color: 'var(--swim-t)' },
  { key: 'bike', name: 'Bike', color: 'var(--bike-t)' },
  { key: 'run', name: 'Run', color: 'var(--run-t)' },
  { key: 'soccer', name: 'Soccer', color: 'var(--soccer-t)' },
  { key: 'surfing', name: 'Surfing', color: 'var(--surfing-t)' },
  { key: 'snowboarding', name: 'Snowboarding', color: 'var(--snowboarding-t)' },
  { key: 'yoga', name: 'Yoga', color: 'var(--yoga-t)' },
] as const

function fmtDuration(min: number): string {
  if (!min) return '0m'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function VolumeTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { dataKey: string; name: string; color: string; payload: Record<string, number | string> }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  const rows = payload.filter(p => (p.payload[`${p.dataKey}Duration`] as number) > 0)
  if (rows.length === 0) return null

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '8px 10px', fontFamily: 'IBM Plex Mono', fontSize: 11,
    }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      {rows.map(p => {
        const duration = p.payload[`${p.dataKey}Duration`] as number
        const calories = p.payload[`${p.dataKey}Calories`] as number
        return (
          <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ color: p.color }}>{p.name}</span>
            <span style={{ color: 'var(--text)' }}>{fmtDuration(duration)} · {calories} cal</span>
          </div>
        )
      })}
    </div>
  )
}

export default function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">📊</div>
        <div className="empty-title">No activity data yet</div>
        <div>Run <code>garmin_sync.py --all</code> to see your weekly volume.</div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
          width={32}
          tickFormatter={v => `${v}mi`}
        />
        <Tooltip content={<VolumeTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--muted)' }}
          iconType="square"
        />
        {SPORT_BARS.map(({ key, name, color }) => (
          <Bar key={key} dataKey={key} name={name} fill={color} radius={[2, 2, 0, 0]} maxBarSize={32} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
