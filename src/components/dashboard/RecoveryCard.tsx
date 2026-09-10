'use client'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface DailyStat {
  sleep_score: number | null
  body_battery_max: number | null
  resting_hr: number | null
  stress_avg: number | null
}

function Ring({ value, color }: { value: number; color: string }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  return (
    <svg width="108" height="108" viewBox="0 0 108 108" style={{ display: 'block' }}>
      <circle cx="54" cy="54" r={r} fill="none" stroke="var(--s3)" strokeWidth="7" />
      <circle
        cx="54" cy="54" r={r} fill="none"
        stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${offset}`}
        transform="rotate(-90 54 54)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="54" y="49" textAnchor="middle" dominantBaseline="middle"
        fill="var(--text)" fontFamily="'IBM Plex Mono', monospace"
        fontSize="22" fontWeight="700">{value}</text>
      <text x="54" y="67" textAnchor="middle" dominantBaseline="middle"
        fill="var(--muted)" fontFamily="'IBM Plex Mono', monospace" fontSize="9">/ 100</text>
    </svg>
  )
}

export default function RecoveryCard() {
  const [stat, setStat] = useState<DailyStat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabaseClient()
      .from('garmin_daily_stats')
      .select('sleep_score,body_battery_max,resting_hr,stress_avg')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setStat(data as DailyStat)
        setLoading(false)
      })
  }, [])

  const score = stat?.sleep_score ?? stat?.body_battery_max ?? null
  const color = score === null ? 'var(--muted)'
    : score >= 75 ? 'var(--strength)'
    : score >= 50 ? 'var(--amber)'
    : 'var(--run)'
  const label = score === null ? '—' : score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Low'

  return (
    <div style={{
      background: 'var(--s2)',
      border: '0.5px solid var(--border)',
      borderRadius: 14,
      padding: '20px',
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--dim)',
        marginBottom: 16,
      }}>Recovery</div>

      {loading ? (
        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--dim)' }}>
          Loading…
        </div>
      ) : score !== null ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Ring value={score} color={color} />
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color }}>
              {label}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            {stat?.resting_hr && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                  {stat.resting_hr}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  RHR
                </div>
              </div>
            )}
            {stat?.stress_avg && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                  {stat.stress_avg}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Stress
                </div>
              </div>
            )}
            {stat?.body_battery_max && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                  {stat.body_battery_max}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Battery
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
            No Garmin data yet
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--dim)', marginTop: 4 }}>
            Run garmin_sync.py to sync
          </div>
        </div>
      )}

      <a href="/recovery" style={{
        display: 'block',
        textAlign: 'center',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: 'var(--muted)',
        textDecoration: 'none',
        marginTop: 16,
        padding: '7px',
        background: 'var(--s3)',
        borderRadius: 7,
        transition: 'color 0.15s',
      }}>
        View full recovery →
      </a>
    </div>
  )
}
