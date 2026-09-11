'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AgentAnalysis } from '@/lib/agentAnalysis'

export default function AgentPage() {
  const [data, setData] = useState<AgentAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/agent/analyze')
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Analysis failed')
        return json as AgentAnalysis
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h1>Training Agent</h1>
          <div className="sub">AI analysis of your last 7 days — workouts, loads, and recovery</div>
        </div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="chart-card-title" style={{ marginBottom: 0 }}>7-day recap</div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
              padding: '6px 14px', borderRadius: 7,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Analyzing…' : 'Refresh analysis'}
          </button>
        </div>

        {loading && !data && (
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>
            Reading the last 7 days of workouts and recovery data…
          </div>
        )}

        {error && (
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--race-t)' }}>
            {error}
          </div>
        )}

        {data && (
          <div>
            <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 18 }}>
              {data.overall_status}
            </div>

            {data.key_insights.length > 0 && (
              <>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Key insights
                </div>
                <ul style={{ margin: '0 0 20px', paddingLeft: 20, fontFamily: 'Figtree, sans-serif', fontSize: 14, lineHeight: 1.6 }}>
                  {data.key_insights.map((insight, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>{insight}</li>
                  ))}
                </ul>
              </>
            )}

            <div style={{
              padding: '14px 16px', borderRadius: 8,
              background: 'var(--accent-bg)', border: '1px solid var(--accent)',
            }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Top recommendation
              </div>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 14, fontWeight: 600 }}>
                {data.top_recommendation}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
