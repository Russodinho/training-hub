'use client'

import { useState } from 'react'
import type { WorkoutSet } from '@/lib/workoutsParser'

interface Props {
  byWeekDay: Record<number, Record<string, WorkoutSet[]>>
  weeks: number[]
}

const DAY_SESSION_COLOR: Record<string, string> = {
  Monday: 'var(--lift-t)',
  Tuesday: 'var(--run-t)',
  Thursday: 'var(--swim-t)',
  Friday: 'var(--bike-t)',
  Saturday: 'var(--lift-t)',
  Sunday: 'var(--race-t)',
  Wednesday: 'var(--muted)',
}

function rpeColor(rpe: string | null): string {
  if (!rpe) return 'var(--muted)'
  const n = parseFloat(rpe)
  if (n >= 9) return 'var(--race-t)'
  if (n >= 8) return 'var(--lift-t)'
  if (n >= 7) return 'var(--bike-t)'
  return 'var(--muted)'
}

function ExerciseRow({ ex }: { ex: WorkoutSet }) {
  const [open, setOpen] = useState(false)
  const hasDetails = ex.notes || ex.reps_hit || ex.target_reps

  return (
    <div style={{
      borderBottom: '1px solid var(--border-soft)',
      paddingBottom: 6, marginBottom: 6,
    }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: 8, alignItems: 'center',
          cursor: hasDetails ? 'pointer' : 'default',
        }}
        onClick={() => hasDetails && setOpen(o => !o)}
      >
        <div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{ex.exercise}</span>
          {ex.section && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)', marginLeft: 6, textTransform: 'uppercase' }}>
              {ex.section}
            </span>
          )}
        </div>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
          {ex.working_sets ? `${ex.working_sets}×` : ''}{ex.reps_hit || ex.target_reps || ''}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: 'var(--lift-t)', minWidth: 56, textAlign: 'right' }}>
          {ex.load ? `${ex.load} lbs` : '—'}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: rpeColor(ex.rpe), minWidth: 38, textAlign: 'right' }}>
          {ex.rpe ? `RPE ${ex.rpe}` : ''}
        </span>
      </div>
      {open && hasDetails && (
        <div style={{ marginTop: 5, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
          {ex.reps_hit && <div>Reps hit: {ex.reps_hit}</div>}
          {ex.target_reps && <div>Target: {ex.target_reps}</div>}
          {ex.notes && <div style={{ marginTop: 3, color: 'var(--text)', opacity: 0.7 }}>{ex.notes}</div>}
        </div>
      )}
    </div>
  )
}

function DayCard({ day, exercises }: { day: string; exercises: WorkoutSet[] }) {
  const session = exercises[0]?.session || day
  const totalLoad = exercises.reduce((s, e) => s + (e.load ?? 0), 0)
  const avgRpe = (() => {
    const vals = exercises.map(e => parseFloat(e.rpe ?? '')).filter(n => !isNaN(n))
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
  })()

  return (
    <div className="tracker-card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600 }}>{day}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: DAY_SESSION_COLOR[day] ?? 'var(--muted)', marginLeft: 8 }}>
            {session}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {totalLoad > 0 && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textAlign: 'right' }}>
              <span style={{ color: 'var(--lift-t)', fontWeight: 600 }}>{totalLoad.toLocaleString()}</span> total lbs
            </div>
          )}
          {avgRpe && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textAlign: 'right' }}>
              <span style={{ color: rpeColor(avgRpe), fontWeight: 600 }}>RPE {avgRpe}</span> avg
            </div>
          )}
        </div>
      </div>
      {exercises.map((ex, i) => <ExerciseRow key={i} ex={ex} />)}
    </div>
  )
}

export default function SessionBrowser({ byWeekDay, weeks }: Props) {
  const [activeWeek, setActiveWeek] = useState(weeks[weeks.length - 1] ?? 1)

  const TAB: React.CSSProperties = {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    padding: '5px 12px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    cursor: 'pointer',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="section-hdr" style={{ margin: 0 }}>
          <span className="ptitle">Session log</span>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {weeks.map(wk => (
            <button
              key={wk}
              onClick={() => setActiveWeek(wk)}
              style={{
                ...TAB,
                background: activeWeek === wk ? 'var(--text)' : 'transparent',
                color: activeWeek === wk ? 'var(--bg)' : 'var(--muted)',
              }}
            >
              Wk {wk}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(byWeekDay[activeWeek] ?? {}).map(([day, exercises]) => (
        <DayCard key={day} day={day} exercises={exercises} />
      ))}

      {!byWeekDay[activeWeek] && (
        <div className="empty-state" style={{ padding: '24px 16px' }}>
          <div className="empty-icon">📋</div>
          <div className="empty-title">No data for this week</div>
        </div>
      )}
    </div>
  )
}
