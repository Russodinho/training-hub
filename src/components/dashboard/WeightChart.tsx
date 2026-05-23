'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface DataPoint {
  date: string
  weight: number | null
}

interface WeightChartProps {
  data: DataPoint[]
}

export default function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">⚖️</div>
        <div className="empty-title">No weight data yet</div>
        <div>Log weight in the Progress page or via Google Sheets.</div>
      </div>
    )
  }

  const filtered = data.filter(d => d.weight !== null)
  const weights = filtered.map(d => d.weight as number)
  const min = Math.floor(Math.min(...weights)) - 2
  const max = Math.ceil(Math.max(...weights)) + 2

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={filtered} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={d => {
            const parts = d.split('-')
            return `${parts[1]}/${parts[2]}`
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min, max]}
          tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}`}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, fontFamily: 'DM Mono', fontSize: 11,
          }}
          formatter={(v: number) => [`${v} lbs`, 'Weight']}
          labelFormatter={l => l}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="var(--run-t)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--run-t)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
