'use client'

import { useState, useEffect, useRef } from 'react'
import { TrainingSummary } from '@/components/TrainingSummary'
import type { AthleteContext } from '@/lib/agentContext'
import { AGENT_LIST } from '@/lib/agentPrompts'
import type { AgentId } from '@/lib/agentPrompts'

type AgentStatus = 'idle' | 'loading' | 'done' | 'error' | 'stopped'

const DELAY_MS = 30000 // gap between agents — rate-limit protection across 12 sequential calls

export default function AgentPage() {
  const [ctx, setCtx] = useState<AthleteContext | null>(null)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({})
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentAgent, setCurrentAgent] = useState<AgentId | null>(null)
  const stoppedRef = useRef(false)

  useEffect(() => {
    fetch('/api/athlete-context').then(r => r.json()).then(setCtx)
  }, [])

  async function runAll() {
    stoppedRef.current = false
    setRunning(true)
    setMessages({})

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

      const isLast = i === toRun.length - 1
      if (!isLast && !stoppedRef.current) {
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
  const sections = [...new Set(AGENT_LIST.map(a => a.section))]
  const currentAgentInfo = currentAgent ? AGENT_LIST.find(a => a.id === currentAgent) : null

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h1>Training Agent</h1>
          <div className="sub">12 coaches, each fed the same live data — Claude drafts, GPT-4 critiques, Claude refines</div>
        </div>
      </div>

      {ctx && <TrainingSummary ctx={ctx} />}

      {/* Run controls */}
      <div className="chart-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          className="hub-btn"
          onClick={runAll}
          disabled={running || !ctx}
        >
          {running ? '⏳ Running…' : failed.length > 0 ? `↺ Retry ${failed.length} failed` : '▶ Run daily check-in'}
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
          {done.length}/{AGENT_LIST.length} done
        </span>
      </div>

      {/* Agent cards by section */}
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
    </div>
  )
}
