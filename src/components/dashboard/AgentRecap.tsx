'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { CoachingAnalysis } from '@/lib/agentAnalysis'

export default function AgentRecap() {
  const [data, setData] = useState<CoachingAnalysis | null>(null)
  const [checked, setChecked] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Peek only — never spends anything just from viewing the dashboard.
  useEffect(() => {
    let alive = true
    fetch('/api/agent/analyze?peek=1')
      .then(res => res.json())
      .then(json => { if (alive) setData(json.data ?? null) })
      .catch(() => { /* peek failures just fall through to the "not run yet" state */ })
      .finally(() => { if (alive) setChecked(true) })
    return () => { alive = false }
  }, [])

  const runAnalysis = () => {
    setRunning(true)
    setError(null)
    fetch('/api/agent/analyze')
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Analysis failed')
        return json as CoachingAnalysis
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setRunning(false))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="chart-card-title" style={{ marginBottom: 0 }}>AI coaching recap</div>
        <Link href="/agent" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>
          Full report →
        </Link>
      </div>

      {!checked && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
          Checking today&apos;s analysis…
        </div>
      )}

      {checked && !data && !running && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
            No analysis run yet today.
          </div>
          <button
            onClick={runAnalysis}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              padding: '5px 12px', borderRadius: 6, whiteSpace: 'nowrap',
              border: '1px solid var(--accent)', background: 'var(--accent-bg)',
              color: 'var(--accent)', cursor: 'pointer',
            }}
          >
            Run analysis
          </button>
        </div>
      )}

      {running && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
          Coach is reviewing the last 7 days…
        </div>
      )}

      {error && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--race-t)' }}>
          {error}
        </div>
      )}

      {data && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 14, fontWeight: 600 }}>
              {data.final_recommendation}
            </div>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600,
              color: 'var(--accent)', whiteSpace: 'nowrap',
            }}>
              {data.confidence}% conf.
            </span>
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
            Today: {data.today_action}
          </div>
        </div>
      )}
    </div>
  )
}
