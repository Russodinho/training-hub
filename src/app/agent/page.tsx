'use client'

import { useState, useEffect, useRef } from 'react'
import { TrainingSummary } from '@/components/TrainingSummary'
import type { AthleteContext } from '@/lib/agentContext'
import { AGENT_LIST } from '@/lib/agentPrompts'
import type { AgentId } from '@/lib/agentPrompts'

type AgentStatus = 'idle' | 'loading' | 'done' | 'error' | 'stopped'

interface DayMessages {
  date: string
  messages: Record<string, string>
}

const DELAY_MS = 30000 // gap between agents — rate-limit protection across 12 sequential *real* calls

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function AgentPage() {
  const [ctx, setCtx] = useState<AthleteContext | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({})
  const [history, setHistory] = useState<DayMessages[]>([])
  const [checked, setChecked] = useState(false)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentAgent, setCurrentAgent] = useState<AgentId | null>(null)
  const stoppedRef = useRef(false)

  useEffect(() => {
    fetch('/api/athlete-context').then(r => r.json()).then(setCtx)

    // Peek only — never triggers a coach to run, just shows whatever's
    // already been generated today (once-per-calendar-day, enforced
    // server-side) plus previous days' output below it.
    fetch('/api/agent-messages').then(r => r.json()).then(data => {
      setMessages(data.today ?? {})
      setStatuses(s => {
        const next = { ...s }
        for (const id of Object.keys(data.today ?? {})) next[id] = 'done'
        return next
      })
      setHistory(data.history ?? [])
      setChecked(true)
    })
  }, [])

  async function runAll() {
    stoppedRef.current = false
    setRunning(true)

    const toRun = AGENT_LIST.filter(a => statuses[a.id] !== 'done')
    toRun.forEach(a => setStatuses(s => ({ ...s, [a.id]: 'idle' })))

    for (let i = 0; i < toRun.length; i++) {
      if (stoppedRef.current) {
        toRun.slice(i).forEach(a => setStatuses(s => ({ ...s, [a.id]: 'stopped' })))
        break
      }

      const agent = toRun[i]
      setCurrentAgent(agent.id)
      setStatuses(s => ({ ...s, [agent.id]: 'loading' }))

      let wasCached = false
      try {
        const res = await fetch('/api/agent-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: agent.id }),
        })
        const data = await res.json()

        if (!res.ok) {
          setStatuses(s => ({ ...s, [agent.id]: 'error' }))
          setMessages(m => ({ ...m, [agent.id]: data.error ?? 'Failed to generate message' }))
          if (data.retryable) {
            stoppedRef.current = true
            toRun.slice(i + 1).forEach(a => setStatuses(s => ({ ...s, [a.id]: 'stopped' })))
            break
          }
        } else {
          wasCached = !!data.cached
          setMessages(m => ({ ...m, [agent.id]: data.message }))
          setStatuses(s => ({ ...s, [agent.id]: 'done' }))
        }
      } catch {
        setStatuses(s => ({ ...s, [agent.id]: 'error' }))
        setMessages(m => ({ ...m, [agent.id]: 'Request failed — check your connection' }))
        stoppedRef.current = true
        toRun.slice(i + 1).forEach(a => setStatuses(s => ({ ...s, [a.id]: 'stopped' })))
        break
      }

      // No real API call happened (already cached for today) — no reason
      // to rate-limit-gap before the next one.
      const isLast = i === toRun.length - 1
      if (!isLast && !stoppedRef.current && !wasCached) {
        let remaining = DELAY_MS / 1000
        setCountdown(remaining)
        await new Promise<void>(resolve => {
          const interval = setInterval(() => {
            remaining--
            setCountdown(remaining)
            if (remaining <= 0 || stoppedRef.current) {
              clearInterval(interval)
              setCountdown(null)
              resolve()
            }
          }, 1000)
        })
      }
    }

    setCurrentAgent(null)
    setCountdown(null)
    setRunning(false)
  }

  function stop() {
    stoppedRef.current = true
  }

  const failed = AGENT_LIST.filter(a => statuses[a.id] === 'error')
  const done = AGENT_LIST.filter(a => statuses[a.id] === 'done')
  const allDoneToday = done.length === AGENT_LIST.length
  const sections = [...new Set(AGENT_LIST.map(a => a.section))]
  const currentAgentInfo = currentAgent ? AGENT_LIST.find(a => a.id === currentAgent) : null

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h1>Training Agent</h1>
          <div className="sub">12 coaches, each fed the same live data — Claude drafts, GPT-4 critiques, Claude refines. Once per day, per coach.</div>
        </div>
      </div>

      {ctx && <TrainingSummary ctx={ctx} />}

      {/* Run controls */}
      <div className="chart-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          className="hub-btn"
          onClick={runAll}
          disabled={running || !ctx || !checked || (allDoneToday && failed.length === 0)}
        >
          {running ? '⏳ Running…' : failed.length > 0 ? `↺ Retry ${failed.length} failed` : allDoneToday ? '✓ Checked in today' : '▶ Run daily check-in'}
        </button>
        {running && <button className="hub-btn-ghost" onClick={stop}>■ Stop</button>}
        {countdown != null && (
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
            Next coach in {countdown}s…
          </span>
        )}
        {running && currentAgentInfo && (
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--accent)' }}>
            {currentAgentInfo.emoji} {currentAgentInfo.name}…
          </span>
        )}
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>
          {done.length}/{AGENT_LIST.length} done today
        </span>
      </div>

      {allDoneToday && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
          All coaches have already checked in today — come back tomorrow for a new round.
        </div>
      )}

      {/* Today's agent cards by section */}
      {sections.map(section => (
        <div key={section} style={{ marginBottom: 24 }}>
          <div className="section-hdr"><span className="ptitle">{section}</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {AGENT_LIST.filter(a => a.section === section).map(agent => {
              const status = statuses[agent.id] ?? 'idle'
              return (
                <div key={agent.id} className="surface-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{agent.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{agent.name}</span>
                    <span style={{ fontSize: 13 }}>
                      {status === 'loading' && '⟳'}
                      {status === 'done' && '✓'}
                      {status === 'error' && '✗'}
                      {status === 'stopped' && '—'}
                    </span>
                  </div>
                  {messages[agent.id] ? (
                    <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>{messages[agent.id]}</p>
                  ) : status === 'loading' ? (
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Analyzing your training data…</p>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--faint)', margin: 0 }}>Waiting to run</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Previous days — separate grouping below today's results */}
      {history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="section-hdr"><span className="ptitle">Previous days</span></div>
          {history.map(day => (
            <div key={day.date} className="surface-card" style={{ marginBottom: 14 }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)',
                marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {formatDate(day.date)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {AGENT_LIST.filter(a => day.messages[a.id]).map(agent => (
                  <div key={agent.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13 }}>{agent.emoji}</span>
                      <span style={{ fontWeight: 600, fontSize: 12 }}>{agent.name}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{day.messages[agent.id]}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
