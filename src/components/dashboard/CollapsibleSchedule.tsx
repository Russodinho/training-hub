'use client'

import { useState } from 'react'
import { SCHEDULE } from '@/lib/schedule'

const LEGEND: [string, string][] = [
  ['bl-gym', 'Gym'],
  ['bl-mob', 'Mobility'],
  ['bl-wind', 'Wind-down'],
  ['bl-guitar', 'Guitar'],
  ['bl-soccer', 'Soccer'],
  ['bl-dog', 'Dog / hike'],
  ['bl-garden', 'Garden'],
  ['bl-commute', 'Commute'],
  ['bl-work', 'Work'],
  ['bl-free', 'Free'],
  ['bl-sleep', 'Sleep'],
]

export default function CollapsibleSchedule() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: open ? '10px 10px 0 0' : 10, padding: '12px 16px',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--text)',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14 }}>{open ? '▼' : '▶'}</span>
        <span style={{ fontWeight: 500 }}>Full Weekly Schedule</span>
        <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 'auto' }}>
          {open ? 'Collapse' : '7 days · click to expand'}
        </span>
      </button>

      {open && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '16px',
        }}>
          {/* Legend */}
          <div className="legend" style={{ marginBottom: 16 }}>
            {LEGEND.map(([cls, label]) => (
              <div key={cls} className="leg">
                <div className={`ldot ${cls}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* 7-day grid */}
          <div className="sched-grid">
            {SCHEDULE.map(day => (
              <div key={day.name} className="sched-day">
                <div className="sched-day-header">
                  <div className="sched-day-name">{day.name}</div>
                  <div className="sched-day-tag">{day.tag}</div>
                </div>
                <div className="sched-blocks">
                  {day.blocks.map((block, i) => (
                    <div key={i} className={`block ${block.cls}`}>
                      <div className="block-time">{block.time}</div>
                      <div className="block-name">{block.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="note" style={{ marginTop: 16, fontSize: 11, lineHeight: 1.8 }}>
            <strong>Mobility:</strong> Full 9-exercise routine done post-workout on gym days (Mon/Tue/Thu/Fri). Non-gym days (Wed/Sat/Sun) — ankle + calf only (exercises 08+09) in the evening.
            {' '}<strong>Wind-down:</strong> 5 passive stretches (~10 min) every night before bed. Parasympathetic only.
          </div>
        </div>
      )}
    </div>
  )
}
