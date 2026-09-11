'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AgentAnalysis } from '@/lib/agentAnalysis'

export default function AgentRecap() {
  const [data, setData] = useState<AgentAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/agent/analyze')
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Analysis failed')
        return json as AgentAnalysis
      })
      .then(json => { if (alive) setData(json) })
      .catch((err: Error) => { if (alive) setError(err.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="chart-card-title" style={{ marginBottom: 0 }}>AI training recap</div>
        <Link href="/agent" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', textDecoration: 'none' }}>
          Full report →
        </Link>
      </div>

      {loading && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
          Analyzing the last 7 days…
        </div>
      )}

      {error && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--race-t)' }}>
          {error}
        </div>
      )}

      {data && (
        <div>
          <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            {data.overall_status}
          </div>
          {data.key_insights.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--muted)' }}>
              {data.key_insights.slice(0, 3).map((insight, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{insight}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
