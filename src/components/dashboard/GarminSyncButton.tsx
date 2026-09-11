'use client'

import { useEffect, useRef, useState } from 'react'

type SyncState = 'idle' | 'pending' | 'running' | 'done' | 'error'

export default function GarminSyncButton() {
  const [state, setState] = useState<SyncState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const startRef = useRef<number | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
  }

  useEffect(() => cleanup, [])

  const start = async () => {
    cleanup()
    setError(null)
    setState('pending')
    setElapsed(0)
    startRef.current = Date.now()

    tickRef.current = setInterval(() => {
      if (startRef.current) setElapsed(Math.round((Date.now() - startRef.current) / 1000))
    }, 1000)

    try {
      const res = await fetch('/api/garmin/request-sync', { method: 'POST' })
      const req = await res.json()
      if (!res.ok) throw new Error(req.error ?? 'Request failed')

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/garmin/request-sync?id=${req.id}`)
          const status = await r.json()
          if (!r.ok) throw new Error(status.error ?? 'Status check failed')

          if (status.status === 'done') {
            cleanup()
            setState('done')
          } else if (status.status === 'error') {
            cleanup()
            setState('error')
            setError(status.error ?? 'Sync failed')
          } else {
            setState(status.status as SyncState) // pending | running
          }
        } catch (err) {
          cleanup()
          setState('error')
          setError(err instanceof Error ? err.message : 'Status check failed')
        }
      }, 3000)
    } catch (err) {
      cleanup()
      setState('error')
      setError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  const busy = state === 'pending' || state === 'running'
  const label =
    state === 'idle' ? 'Sync Garmin now' :
    state === 'pending' ? `Waiting for local sync… ${elapsed}s` :
    state === 'running' ? `Syncing… ${elapsed}s` :
    state === 'done' ? `Synced ✓ (${elapsed}s) — sync again` :
    'Sync failed — retry'

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <button
        onClick={start}
        disabled={busy}
        style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
          padding: '6px 12px', borderRadius: 7, whiteSpace: 'nowrap',
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: state === 'error' ? 'var(--race-t)' : 'var(--text)',
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.7 : 1,
        }}
      >
        {label}
      </button>
      {error && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--race-t)', maxWidth: 220, textAlign: 'right' }}>
          {error}
        </div>
      )}
    </div>
  )
}
