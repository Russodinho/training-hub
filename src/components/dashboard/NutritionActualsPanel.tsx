'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

type DayRange = 30 | 60 | 90

interface NutritionRow {
  date: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const SELECTOR_BTN: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  padding: '3px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  cursor: 'pointer',
}

export default function NutritionActualsPanel() {
  const [days, setDays] = useState<DayRange>(30)
  const [data, setData] = useState<NutritionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const since = new Date()
    since.setDate(since.getDate() - days)
    setLoading(true)
    getSupabase()
      .from('nutrition_actuals')
      .select('date, calories, protein, carbs, fat')
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .then(({ data: rows }) => {
        setData(rows || [])
        setLoading(false)
      })
  }, [days])

  const valid = data.filter(d => d.calories !== null)

  const avg = (key: keyof NutritionRow): number | null => {
    const vals = data.filter(d => d[key] !== null).map(d => d[key] as number)
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
  }

  const macroStats = [
    { label: 'Calories', key: 'calories' as const, unit: 'kcal/day', color: 'var(--run-t)' },
    { label: 'Protein', key: 'protein' as const, unit: 'g/day', color: 'var(--swim-t)' },
    { label: 'Carbs', key: 'carbs' as const, unit: 'g/day', color: 'var(--bike-t)' },
    { label: 'Fat', key: 'fat' as const, unit: 'g/day', color: 'var(--lift-t)' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="chart-card-title" style={{ marginBottom: 0 }}>Nutrition actuals — avg per day</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {([30, 60, 90] as DayRange[]).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                ...SELECTOR_BTN,
                background: days === d ? 'var(--text)' : 'transparent',
                color: days === d ? 'var(--bg)' : 'var(--muted)',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Avg stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
        {macroStats.map(m => (
          <div key={m.key} style={{
            textAlign: 'center',
            padding: '10px 4px',
            background: 'var(--bg)',
            borderRadius: 8,
            border: '1px solid var(--border-soft)',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 20,
              fontWeight: 600,
              color: m.color,
            }}>
              {loading ? '…' : (avg(m.key) ?? '—')}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)', marginTop: 3 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)' }}>
              {m.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {!loading && valid.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-icon">🥗</div>
          <div className="empty-title">No data in this range</div>
          <div>Upload your Cronometer daily summary CSV on the <a href="/nutrition" className="empty-cta" style={{ display: 'inline' }}>Nutrition page</a>.</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={valid} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
              tickLine={false} axisLine={false}
              tickFormatter={d => { const p = d.split('-'); return `${p[1]}/${p[2]}` }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="cal"
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
              tickLine={false} axisLine={false} width={40}
              tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
            />
            <YAxis
              yAxisId="g" orientation="right"
              tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
              tickLine={false} axisLine={false} width={28}
              tickFormatter={v => `${v}g`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, fontFamily: 'IBM Plex Mono', fontSize: 11,
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--muted)' }} />
            <Line yAxisId="cal" type="monotone" dataKey="calories" name="Calories" stroke="var(--run-t)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Line yAxisId="g" type="monotone" dataKey="protein" name="Protein (g)" stroke="var(--swim-t)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Line yAxisId="g" type="monotone" dataKey="carbs" name="Carbs (g)" stroke="var(--bike-t)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            <Line yAxisId="g" type="monotone" dataKey="fat" name="Fat (g)" stroke="var(--lift-t)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
