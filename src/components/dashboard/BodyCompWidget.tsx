'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

interface BiometricRow {
  date: string
  weight_lbs: number | null
  body_fat_pct: number | null
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function BodyCompWidget() {
  const [data, setData] = useState<BiometricRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const since = new Date()
    since.setDate(since.getDate() - 90)
    getSupabase()
      .from('biometrics')
      .select('date, weight_lbs, body_fat_pct')
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .then(({ data: rows }) => {
        setData(rows || [])
        setLoading(false)
      })
  }, [])

  const filtered = data.filter(d => d.weight_lbs !== null)

  if (!loading && filtered.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">⚖️</div>
        <div className="empty-title">No biometric data yet</div>
        <div>Upload Cronometer biometrics CSV in the <a href="/progress" className="empty-cta" style={{ display: 'inline' }}>Progress page</a>.</div>
      </div>
    )
  }

  const weights = filtered.map(d => d.weight_lbs as number)
  const wMin = weights.length ? Math.floor(Math.min(...weights)) - 2 : 180
  const wMax = weights.length ? Math.ceil(Math.max(...weights)) + 2 : 220

  const hasBf = filtered.some(d => d.body_fat_pct !== null)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={filtered} margin={{ top: 4, right: hasBf ? 0 : 8, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false} axisLine={false}
          tickFormatter={d => { const p = d.split('-'); return `${p[1]}/${p[2]}` }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="w"
          domain={[wMin, wMax]}
          tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
          tickLine={false} axisLine={false} width={36}
        />
        {hasBf && (
          <YAxis
            yAxisId="bf"
            orientation="right"
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
            tickLine={false} axisLine={false} width={32}
            tickFormatter={v => `${v}%`}
          />
        )}
        <Tooltip
          contentStyle={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, fontFamily: 'IBM Plex Mono', fontSize: 11,
          }}
          formatter={(v: number, name: string) =>
            name === 'Weight (lbs)' ? [`${v} lbs`, name] : [`${v}%`, name]
          }
        />
        <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--muted)' }} />
        <Line
          yAxisId="w" type="monotone" dataKey="weight_lbs" name="Weight (lbs)"
          stroke="var(--run-t)" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
        />
        {hasBf && (
          <Line
            yAxisId="bf" type="monotone" dataKey="body_fat_pct" name="Body Fat %"
            stroke="var(--bike-t)" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
