'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'

interface WeekVolume {
  week: string
  swim: number
  bike: number
  run: number
  soccer: number
  surfing: number
  snowboarding: number
  yoga: number
}

interface VolumeChartProps {
  data: WeekVolume[]
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
        <Tooltip
          contentStyle={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, fontFamily: 'IBM Plex Mono', fontSize: 11,
          }}
          formatter={(v: number, name: string) => [`${v.toFixed(1)} mi`, name]}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--muted)' }}
          iconType="square"
        />
        <Bar dataKey="swim" name="Swim" fill="var(--swim-t)" radius={[2, 2, 0, 0]} maxBarSize={32} />
        <Bar dataKey="bike" name="Bike" fill="var(--bike-t)" radius={[2, 2, 0, 0]} maxBarSize={32} />
        <Bar dataKey="run" name="Run" fill="var(--run-t)" radius={[2, 2, 0, 0]} maxBarSize={32} />
        <Bar dataKey="soccer" name="Soccer" fill="var(--soccer-t)" radius={[2, 2, 0, 0]} maxBarSize={32} />
        <Bar dataKey="surfing" name="Surfing" fill="var(--danger)" radius={[2, 2, 0, 0]} maxBarSize={32} />
        <Bar dataKey="snowboarding" name="Snowboarding" fill="var(--violet)" radius={[2, 2, 0, 0]} maxBarSize={32} />
        <Bar dataKey="yoga" name="Yoga" fill="var(--mobility)" radius={[2, 2, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
