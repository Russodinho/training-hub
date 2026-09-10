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
  if (val >= mid) return 'var(--strength)'
  if (val >= low) return '#f59e0b'
  return '#ef4444'
}

function hrColor(rhr: number): string {
  if (rhr <= 50) return 'var(--strength)'
  if (rhr <= 60) return '#f59e0b'
  return '#ef4444'
}

function stressColor(stress: number): string {
  if (stress <= 25) return 'var(--strength)'
  if (stress <= 50) return '#f59e0b'
  return '#ef4444'
}

function avg(arr: (number | null)[]): number | null {
  const vals = arr.filter((v): v is number => v !== null)
  if (!vals.length) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function StatCard({ label, value, unit, color }: { label: string; value: number | null; unit?: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--s2)',
      border: '0.5px solid var(--border)',
      borderRadius: 10,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 32, fontWeight: 600, color: color ?? 'var(--text)', lineHeight: 1 }}>
        {value !== null ? value : '—'}
        {value !== null && unit && <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ flex: 1, height: 4, background: 'var(--s3)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
    </div>
  )
}

function DayRow({ stat }: { stat: DailyStat }) {
  const date = new Date(stat.date + 'T00:00:00')
  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '110px 1fr 1fr 1fr 1fr',
      alignItems: 'center',
      gap: 12,
      padding: '10px 0',
      borderBottom: '0.5px solid var(--border)',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11,
    }}>
      <div style={{ color: 'var(--muted)' }}>{dayLabel}</div>

      {/* Sleep score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: stat.sleep_score ? scoreColor(stat.sleep_score, 50, 70) : 'var(--dim)', minWidth: 28, textAlign: 'right' }}>
          {stat.sleep_score ?? '—'}
        </span>
        {stat.sleep_score && <MiniBar value={stat.sleep_score} max={100} color={scoreColor(stat.sleep_score, 50, 70)} />}
      </div>

      {/* Body battery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: stat.body_battery_max ? scoreColor(stat.body_battery_max, 30, 60) : 'var(--dim)', minWidth: 50, textAlign: 'right' }}>
          {stat.body_battery_min !== null && stat.body_battery_max !== null
            ? `${stat.body_battery_min}–${stat.body_battery_max}`
            : '—'}
        </span>
        {stat.body_battery_max && <MiniBar value={stat.body_battery_max} max={100} color={scoreColor(stat.body_battery_max, 30, 60)} />}
      </div>

      {/* RHR */}
      <div style={{ color: stat.resting_hr ? hrColor(stat.resting_hr) : 'var(--dim)', textAlign: 'right' }}>
        {stat.resting_hr ? `${stat.resting_hr} bpm` : '—'}
      </div>

      {/* Stress */}
      <div style={{ color: stat.stress_avg ? stressColor(stat.stress_avg) : 'var(--dim)', textAlign: 'right' }}>
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

  const pillStyle = (active: boolean) => ({
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    padding: '5px 14px',
    borderRadius: 20,
    border: active ? '0.5px solid var(--strength)' : '0.5px solid var(--border)',
    background: active ? 'rgba(0,212,170,0.1)' : 'transparent',
    color: active ? 'var(--strength)' : 'var(--muted)',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  })

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Recovery
          </h1>
          <p style={{ fontFamily: 'Figtree, sans-serif', fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            Garmin sleep & stress metrics
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {([7, 14, 30] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)} style={pillStyle(range === r)}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
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
      <div style={{ background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '0 20px' }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '110px 1fr 1fr 1fr 1fr',
          gap: 12,
          padding: '12px 0',
          borderBottom: '0.5px solid var(--border)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          color: 'var(--dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          <div>Date</div>
          <div>Sleep Score</div>
          <div>Body Battery</div>
          <div style={{ textAlign: 'right' }}>Resting HR</div>
          <div style={{ textAlign: 'right' }}>Stress</div>
        </div>

        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--dim)' }}>
            Loading…
          </div>
        )}

        {!loading && stats.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
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
    </main>
  )
}
