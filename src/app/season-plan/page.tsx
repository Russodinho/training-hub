'use client'

import { useState, useEffect } from 'react'
import type { RaceSummary } from '@/lib/agentContext'
import type { SeasonPlan } from '@/lib/seasonPlan'

type Tab = 'plan' | 'goals'

interface PeekResponse {
  race: RaceSummary | null
  plan: SeasonPlan | null
  daysOut: number | null
}

export default function SeasonPlanPage() {
  const [tab, setTab] = useState<Tab>('plan')
  const [data, setData] = useState<PeekResponse | null>(null)
  const [checked, setChecked] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/season-plan').then(r => r.json()).then(d => { setData(d); setChecked(true) })
  }, [])

  const generate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/season-plan/generate', { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Generation failed')
      setData(d)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const race = data?.race ?? null
  const plan = data?.plan ?? null
  const daysOut = data?.daysOut ?? null

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Season Plan</h2>
          <div className="sub">Training plan · stretch goals — built by the tri coaches for your next race</div>
        </div>
        <div className="page-header-right">
          {!checked ? '' : race && daysOut !== null && daysOut >= 0 ? (
            <>{race.name.split(' ')[0]} in<br /><strong style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20 }}>{daysOut}</strong> days</>
          ) : race ? race.name : 'No race scheduled'}
        </div>
      </div>

      {/* Tab bar */}
      <div className="mh-tab-bar">
        {(['plan', 'goals'] as Tab[]).map(t => (
          <button key={t} className={`mh-tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'plan' ? 'Tri Plan' : 'Stretch Goals'}
          </button>
        ))}
      </div>

      {!checked && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)', padding: '20px 0' }}>Checking…</div>
      )}

      {checked && !race && (
        <div className="empty-state">
          <div className="empty-title">No upcoming race</div>
          <div>Add one on the <a href="/race-calendar" className="empty-cta" style={{ display: 'inline' }}>Race Calendar</a> to get a plan built around it.</div>
        </div>
      )}

      {checked && race && !plan && (
        <div className="chart-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontFamily: 'Figtree, sans-serif', fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
            No training plan generated yet for <strong>{race.name}</strong> ({race.sport}, {race.distances}).
          </div>
          <button className="hub-btn" onClick={generate} disabled={generating}>
            {generating ? '⏳ Building your plan… (can take a minute)' : '▶ Generate training plan'}
          </button>
          {error && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--race-t)', marginTop: 12 }}>{error}</div>}
        </div>
      )}

      {race && plan && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="hub-btn-ghost" onClick={generate} disabled={generating} style={{ fontSize: 11 }}>
              {generating ? 'Regenerating…' : '↺ Regenerate plan'}
            </button>
          </div>
          {error && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--race-t)', marginBottom: 12 }}>{error}</div>}

          {/* ── TRI PLAN TAB ── */}
          {tab === 'plan' && (
            <>
              <div className="note" style={{ marginBottom: 20 }}>
                <strong>Plan philosophy:</strong> {plan.philosophy}
              </div>

              {plan.phases.map((phase, pi) => (
                <div key={pi} className="plan-phase">
                  <div className="plan-phase-header">
                    <span className="plan-phase-title">{phase.title}</span>
                    <span className="plan-phase-dates">{phase.dateRange}</span>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    {phase.notes.map((note, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                        <span>·</span><span>{note}</span>
                      </div>
                    ))}
                  </div>
                  <div className="plan-wk-grid">
                    {phase.weeks.map((wk, wi) => (
                      <div key={wi} className="plan-wk">
                        <div className="plan-wk-label">{wk.label} · {wk.dateRange}</div>
                        {wk.rows.map((row, ri) => (
                          <div key={ri} className="plan-row">
                            <span className="plan-sport">{row.sport}</span>
                            <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{row.detail}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 24 }}>
                <div className="section-hdr"><span className="ptitle">Key race-day targets</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                  {plan.raceDayTargets.map((item, i) => (
                    <div key={i} className="surface-card">
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{item.segment}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{item.target}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STRETCH GOALS TAB ── */}
          {tab === 'goals' && (
            <>
              {plan.progressions.map((prog, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <div className="section-hdr"><span className="ptitle">{prog.sport} progression</span></div>
                  <div className="surface-card">
                    {prog.milestones.map((row, mi) => (
                      <div key={mi} className="stretch-item">
                        <span className="stretch-date">{row.date}</span>
                        <span className="tag tg-swim">{row.target}</span>
                        <span style={{ fontSize: 13, flex: 1 }}>{row.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginBottom: 24 }}>
                <div className="section-hdr"><span className="ptitle">Season big goals</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {plan.stretchGoals.map((goal, i) => (
                    <div key={i} className="surface-card">
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{goal.icon}</div>
                      <div style={{ fontWeight: 500, marginBottom: 6 }}>{goal.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{goal.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-hdr"><span className="ptitle">Race-morning readiness checklist</span></div>
                <div className="surface-card">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4px 24px' }}>
                    {plan.readinessChecklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 13, borderBottom: '1px solid var(--border-soft)' }}>
                        <span style={{ color: 'var(--swim-t)' }}>○</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
