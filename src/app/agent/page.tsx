'use client'

import { useEffect, useState } from 'react'
import type { CoachingAnalysis } from '@/lib/agentAnalysis'

export default function AgentPage() {
  const [data, setData] = useState<CoachingAnalysis | null>(null)
  const [checked, setChecked] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Peek only on load — never spends anything just from visiting the page.
  // Whether to actually run the analysis is entirely your call, since your
  // day (soccer nights especially) isn't always over on a fixed schedule.
  useEffect(() => {
    let alive = true
    fetch('/api/agent/analyze?peek=1')
      .then(res => res.json())
      .then(json => { if (alive) setData(json.data ?? null) })
      .catch(() => { /* falls through to the "not run yet" state */ })
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
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h1>Training Agent</h1>
          <div className="sub">Claude drafts, GPT-4 critiques, Claude refines — run it once a day, whenever your day is actually done</div>
        </div>
      </div>

      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="chart-card-title" style={{ marginBottom: 0 }}>Today&apos;s coaching call</div>
          {!checked && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
              Checking…
            </span>
          )}
          {checked && !data && (
            <button
              onClick={runAnalysis}
              disabled={running}
              style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                padding: '6px 14px', borderRadius: 7,
                border: '1px solid var(--accent)', background: 'var(--accent-bg)',
                color: 'var(--accent)', cursor: running ? 'default' : 'pointer',
                opacity: running ? 0.6 : 1,
              }}
            >
              {running ? 'Analyzing…' : 'Run today’s analysis'}
            </button>
          )}
        </div>

        {checked && !data && !running && (
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>
            No analysis has run yet today. Run it once you&apos;re done for the day (workout logged, soccer game over, etc.) — it&apos;s capped at once per day, so there&apos;s no rush and no way to accidentally re-run it.
          </div>
        )}

        {running && (
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
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)',
              marginBottom: 14,
            }}>
              Already analyzed today — check back tomorrow for a new one.
            </div>

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
