'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DistributionChartProps {
  data: { name: string; value: number; color: string }[]
}

export default function DistributionChart({ data }: DistributionChartProps) {
  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">🥧</div>
        <div className="empty-title">No activity data yet</div>
        <div>Connect Strava to see your training distribution.</div>
      </div>
    )
  }

  return (
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
          formatter={(v: number) => [`${v} sessions`, '']}
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
  )
}
