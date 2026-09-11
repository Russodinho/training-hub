'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CoachingAnalysis } from '@/lib/agentAnalysis'

export default function AgentPage() {
  const [data, setData] = useState<CoachingAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback((forceRefresh = false) => {
    setLoading(true)
    setError(null)
    fetch(forceRefresh ? '/api/agent/analyze?refresh=1' : '/api/agent/analyze')
      .then(async res => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Analysis failed')
        return json as CoachingAnalysis
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(false) }, [load])

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h1>Training Agent</h1>
          <div className="sub">Claude drafts, GPT-4 critiques, Claude refines — once per day, from your last 7 days of workouts and recovery</div>
        </div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="chart-card-title" style={{ marginBottom: 0 }}>Today&apos;s coaching call</div>
          <button
            onClick={() => load(true)}
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
            Running the analysis → critique → refine loop…
          </div>
        )}

        {error && (
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--race-t)' }}>
            {error}
          </div>
        )}

        {data && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 18, fontWeight: 700 }}>
                {data.final_recommendation}
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                  {data.confidence}%
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
                  confidence
                </div>
              </div>
            </div>

            <div style={{
              padding: '14px 16px', borderRadius: 8, marginBottom: 16,
              background: 'var(--accent-bg)', border: '1px solid var(--accent)',
            }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Today&apos;s action
              </div>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 14, fontWeight: 600 }}>
                {data.today_action}
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Debate summary
              </div>
              <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                {data.debate_summary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
