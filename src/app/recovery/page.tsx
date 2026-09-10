'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface DailyStat {
  date: string
  sleep_score: number | null
  body_battery_min: number | null
  body_battery_max: number | null
  resting_hr: number | null
  stress_avg: number | null
}

type Range = 7 | 14 | 30

function scoreColor(val: number, low: number, mid: number): string {
  if (val >= mid) return 'var(--mobility)'
  if (val >= low) return 'var(--amber)'
  return 'var(--danger)'
}

function hrColor(rhr: number): string {
  if (rhr <= 50) return 'var(--mobility)'
  if (rhr <= 60) return 'var(--amber)'
  return 'var(--danger)'
}

function stressColor(stress: number): string {
  if (stress <= 25) return 'var(--mobility)'
  if (stress <= 50) return 'var(--amber)'
  return 'var(--danger)'
}

function avg(arr: (number | null)[]): number | null {
  const vals = arr.filter((v): v is number => v !== null)
  if (!vals.length) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function StatCard({ label, value, unit, color }: { label: string; value: number | null; unit?: string; color?: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--muted)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 30, fontWeight: 700, color: color ?? 'var(--text)', lineHeight: 1 }}>
        {value !== null ? value : '—'}
        {value !== null && unit && <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 4, fontWeight: 400 }}>{unit}</span>}
      </div>
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ flex: 1, height: 4, background: 'var(--s3)', borderRadius: 2, overflow: 'hidden', minWidth: 32 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
    </div>
  )
}

function DayRow({ stat }: { stat: DailyStat }) {
  const date = new Date(stat.date + 'T00:00:00')
  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="recovery-day-row">
      <div className="rd-cell rd-date" style={{ color: 'var(--muted)' }}>{dayLabel}</div>

      <div className="rd-cell rd-sleep">
        <span className="rd-mobile-label">Sleep score</span>
        <span style={{ color: stat.sleep_score ? scoreColor(stat.sleep_score, 50, 70) : 'var(--dim)', minWidth: 28, textAlign: 'right' }}>
          {stat.sleep_score ?? '—'}
        </span>
        {stat.sleep_score && <MiniBar value={stat.sleep_score} max={100} color={scoreColor(stat.sleep_score, 50, 70)} />}
      </div>

      <div className="rd-cell rd-battery">
        <span className="rd-mobile-label">Body battery</span>
        <span style={{ color: stat.body_battery_max ? scoreColor(stat.body_battery_max, 30, 60) : 'var(--dim)', minWidth: 50, textAlign: 'right' }}>
          {stat.body_battery_min !== null && stat.body_battery_max !== null
            ? `${stat.body_battery_min}–${stat.body_battery_max}`
            : '—'}
        </span>
        {stat.body_battery_max && <MiniBar value={stat.body_battery_max} max={100} color={scoreColor(stat.body_battery_max, 30, 60)} />}
      </div>

      <div className="rd-cell rd-hr" style={{ color: stat.resting_hr ? hrColor(stat.resting_hr) : 'var(--dim)' }}>
        <span className="rd-mobile-label">Resting HR</span>
        {stat.resting_hr ? `${stat.resting_hr} bpm` : '—'}
      </div>

      <div className="rd-cell rd-stress" style={{ color: stat.stress_avg ? stressColor(stat.stress_avg) : 'var(--dim)' }}>
        <span className="rd-mobile-label">Stress</span>
        {stat.stress_avg ?? '—'}
      </div>
    </div>
  )
}

export default function RecoveryPage() {
  const [stats, setStats] = useState<DailyStat[]>([])
  const [range, setRange] = useState<Range>(14)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = getSupabaseClient()
      const since = new Date()
      since.setDate(since.getDate() - range)
      const { data } = await supabase
        .from('garmin_daily_stats')
        .select('date,sleep_score,body_battery_min,body_battery_max,resting_hr,stress_avg')
        .gte('date', since.toISOString().slice(0, 10))
        .order('date', { ascending: false })
      setStats((data as DailyStat[]) ?? [])
      setLoading(false)
    }
    load()
  }, [range])

  const avgSleep = avg(stats.map(s => s.sleep_score))
  const avgBatteryMax = avg(stats.map(s => s.body_battery_max))
  const avgRhr = avg(stats.map(s => s.resting_hr))
  const avgStress = avg(stats.map(s => s.stress_avg))

  const pillStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Figtree', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: 20,
    border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: active ? 'var(--accent-bg)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
    cursor: 'pointer',
  })

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Recovery</h2>
          <div className="sub">Garmin sleep &amp; stress metrics</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {([7, 14, 30] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} style={pillStyle(range === r)}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards — 2 × 2 at both desktop and mobile */}
      <div className="recovery-summary-grid">
        <StatCard
          label="Avg Sleep Score"
          value={avgSleep}
          color={avgSleep ? scoreColor(avgSleep, 50, 70) : undefined}
        />
        <StatCard
          label="Avg Body Battery"
          value={avgBatteryMax}
          unit="max"
          color={avgBatteryMax ? scoreColor(avgBatteryMax, 30, 60) : undefined}
        />
        <StatCard
          label="Avg Resting HR"
          value={avgRhr}
          unit="bpm"
          color={avgRhr ? hrColor(avgRhr) : undefined}
        />
        <StatCard
          label="Avg Stress"
          value={avgStress}
          color={avgStress ? stressColor(avgStress) : undefined}
        />
      </div>

      {/* Day-by-day table */}
      <div className="card" style={{ padding: '0 20px' }}>
        <div className="recovery-day-header">
          <div>Date</div>
          <div>Sleep Score</div>
          <div>Body Battery</div>
          <div style={{ textAlign: 'right' }}>Resting HR</div>
          <div style={{ textAlign: 'right' }}>Stress</div>
        </div>

        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: "'Figtree', sans-serif", fontSize: 13, color: 'var(--dim)' }}>
            Loading…
          </div>
        )}

        {!loading && stats.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>
              No recovery data yet
            </div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--dim)' }}>
              Run <code style={{ background: 'var(--s3)', padding: '2px 6px', borderRadius: 4 }}>garmin_sync.py --all</code> to sync Garmin data
            </div>
          </div>
        )}

        {!loading && stats.map(stat => (
          <DayRow key={stat.date} stat={stat} />
        ))}
      </div>
    </div>
  )
}
