'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { CoachingAnalysis } from '@/lib/agentAnalysis'

export default function AgentRecap() {
  const [data, setData] = useState<CoachingAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/agent/analyze')
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Analysis failed')
        return json as CoachingAnalysis
      })
      .then(json => { if (alive) setData(json) })
      .catch((err: Error) => { if (alive) setError(err.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="chart-card-title" style={{ marginBottom: 0 }}>AI coaching recap</div>
        <Link href="/agent" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>
          Full report →
        </Link>
      </div>

      {loading && (
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
