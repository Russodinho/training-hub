'use client'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface DailyStat {
  sleep_score: number | null
  body_battery_max: number | null
  resting_hr: number | null
  stress_avg: number | null
}

function Ring({ value }: { value: number }) {
  const r = 70
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  return (
    <svg width="168" height="168" viewBox="0 0 168 168" style={{ display: 'block' }}>
      <circle cx="84" cy="84" r={r} fill="none" stroke="var(--s3)" strokeWidth="9" />
      <circle
        cx="84" cy="84" r={r} fill="none"
        stroke="var(--strength)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${offset}`}
        transform="rotate(-90 84 84)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="84" y="80" textAnchor="middle" dominantBaseline="middle"
        fill="var(--text)" fontFamily="Figtree, sans-serif"
        fontSize="34" fontWeight="700">{value}</text>
      <text x="84" y="106" textAnchor="middle" dominantBaseline="middle"
        fill="var(--muted)" fontFamily="Figtree, sans-serif" fontSize="12">Recovery</text>
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
  const labelColor = score === null ? 'var(--muted)'
    : score >= 75 ? 'var(--mobility)'
    : score >= 50 ? 'var(--amber)'
    : 'var(--danger)'
  const label = score === null ? '—' : score >= 75 ? 'Good recovery' : score >= 50 ? 'Fair recovery' : 'Low recovery'

  return (
    <div className="card recovery-card">
      <div className="card-title"><span>Recovery</span></div>

      {loading ? (
        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--dim)' }}>
          Loading…
        </div>
      ) : score !== null ? (
        <>
          {/* Desktop: purple ring */}
          <div className="recovery-ring-view">
            <Ring value={score} />
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 13, fontWeight: 600, color: labelColor, marginTop: 4 }}>
              {label}
            </div>
          </div>

          {/* Mobile: compact purple card, no ring */}
          <div className="recovery-compact-view">
            <span className="recovery-compact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10z" />
              </svg>
            </span>
            <div>
              <div className="recovery-compact-label">Recovery</div>
              <div className="recovery-compact-value">{score} · {label}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            {stat?.resting_hr && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                  {stat.resting_hr}
                </div>
                <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11, color: 'var(--muted)' }}>
                  RHR
                </div>
              </div>
            )}
            {stat?.stress_avg && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                  {stat.stress_avg}
                </div>
                <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11, color: 'var(--muted)' }}>
                  Stress
                </div>
              </div>
            )}
            {stat?.body_battery_max && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                  {stat.body_battery_max}
                </div>
                <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11, color: 'var(--muted)' }}>
                  Battery
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 12, color: 'var(--muted)' }}>
            No Garmin data yet
          </div>
          <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>
            Run garmin_sync.py to sync
          </div>
        </div>
      )}

      <a href="/recovery" style={{
        display: 'block',
        textAlign: 'center',
        fontFamily: 'Figtree, sans-serif',
        fontSize: 12,
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
