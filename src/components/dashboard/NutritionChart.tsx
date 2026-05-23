'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

interface NutritionDataPoint {
  date: string
  calories: number | null
  protein: number | null
}

interface NutritionChartProps {
  data: NutritionDataPoint[]
  calorieTarget?: number
  proteinTarget?: number
}

export default function NutritionChart({ data, calorieTarget = 2450, proteinTarget = 188 }: NutritionChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">🥗</div>
        <div className="empty-title">No nutrition data yet</div>
        <div>Upload your Cronometer CSV on the Nutrition page.</div>
        <a href="/nutrition" className="empty-cta">Go to Nutrition</a>
      </div>
    )
  }

  const filtered = data.filter(d => d.calories !== null)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={filtered} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
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
          yAxisId="cal"
          tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
        />
        <YAxis
          yAxisId="pro"
          orientation="right"
          tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false}
          axisLine={false}
          width={32}
          tickFormatter={v => `${v}g`}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, fontFamily: 'DM Mono', fontSize: 11,
          }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--muted)' }}
        />
        <Line
          yAxisId="cal" type="monotone" dataKey="calories" name="Calories"
          stroke="var(--run-t)" strokeWidth={2} dot={false}
          activeDot={{ r: 3 }}
        />
        <Line
          yAxisId="pro" type="monotone" dataKey="protein" name="Protein (g)"
          stroke="var(--swim-t)" strokeWidth={2} dot={false}
          activeDot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
