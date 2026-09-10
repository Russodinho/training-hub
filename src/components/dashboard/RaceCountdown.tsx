'use client'
import { useEffect, useState } from 'react'

export default function RaceCountdown({ targetDate }: { targetDate: string }) {
  const [units, setUnits] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now())
      setUnits({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const items = [
    { val: units.d, lbl: 'DAYS' },
    { val: units.h, lbl: 'HRS' },
    { val: units.m, lbl: 'MIN' },
    { val: units.s, lbl: 'SEC' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '16px 0 20px' }}>
      {items.map(({ val, lbl }) => (
        <div key={lbl} style={{
          background: 'var(--s3)',
          borderRadius: 10,
          padding: '12px 6px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {String(val).padStart(2, '0')}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 8,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginTop: 5,
          }}>
            {lbl}
          </div>
        </div>
      ))}
    </div>
  )
}
