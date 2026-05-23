'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { NUTRITION_TARGETS } from '@/lib/data'

type DayRange = 30 | 60 | 90

interface NutritionRow {
  date: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

interface MacroStat {
  avgActual: number
  avgTarget: number
  pct: number
  daysHit: number
  total: number
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function targetForDate(dateStr: string) {
  const dayName = DAY_NAMES[new Date(dateStr + 'T12:00:00').getDay()]
  return NUTRITION_TARGETS.find(t => t.day === dayName) ?? { calories: 2299, protein: 185, carbs: 224, fat: 77 }
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const SELECTOR_BTN: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  padding: '3px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  cursor: 'pointer',
}

export default function MacroAccuracyPanel() {
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

  const macros: { key: keyof NutritionRow; label: string; tKey: 'calories' | 'protein' | 'carbs' | 'fat'; color: string; unit: string }[] = [
    { key: 'calories', label: 'Calories', tKey: 'calories', color: 'var(--run-t)', unit: 'kcal' },
    { key: 'protein', label: 'Protein', tKey: 'protein', color: 'var(--swim-t)', unit: 'g' },
    { key: 'carbs', label: 'Carbs', tKey: 'carbs', color: 'var(--bike-t)', unit: 'g' },
    { key: 'fat', label: 'Fat', tKey: 'fat', color: 'var(--lift-t)', unit: 'g' },
  ]

  const stats: MacroStat[] = macros.map(m => {
    const relevant = data.filter(d => d[m.key] !== null)
    if (!relevant.length) return { avgActual: 0, avgTarget: 0, pct: 0, daysHit: 0, total: 0 }

    let sumActual = 0, sumTarget = 0, daysHit = 0
    for (const row of relevant) {
      const actual = row[m.key] as number
      const target = targetForDate(row.date)[m.tKey]
      sumActual += actual
      sumTarget += target
      if (actual >= target * 0.9) daysHit++
    }

    return {
      avgActual: Math.round(sumActual / relevant.length),
      avgTarget: Math.round(sumTarget / relevant.length),
      pct: Math.min(Math.round((sumActual / sumTarget) * 100), 150),
      daysHit,
      total: relevant.length,
    }
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="chart-card-title" style={{ marginBottom: 0 }}>Macro target accuracy</div>
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

      {loading ? (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--muted)', padding: '20px 0' }}>Loading…</div>
      ) : data.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-icon">🎯</div>
          <div className="empty-title">No data in this range</div>
          <div>Upload Cronometer CSV on the <a href="/nutrition" className="empty-cta" style={{ display: 'inline' }}>Nutrition page</a>.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {macros.map((m, i) => {
            const s = stats[i]
            const pctDisplay = Math.min(s.pct, 100)
            const overTarget = s.pct > 100
            return (
              <div key={m.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500 }}>{m.label}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
                    {s.avgActual} / {s.avgTarget} {m.unit} avg
                  </span>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: overTarget ? 'var(--lift-t)' : m.color,
                    minWidth: 46,
                    textAlign: 'right',
                  }}>
                    {s.pct}%
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--border-soft)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: `${pctDisplay}%`,
                    background: overTarget ? 'var(--lift-t)' : m.color,
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                  {s.daysHit} / {s.total} days ≥ 90% of target
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
