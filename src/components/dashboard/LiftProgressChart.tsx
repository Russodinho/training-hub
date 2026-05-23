'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import type { WorkoutSet } from '@/lib/workoutsParser'
import { liftProgression, uniqueExercises } from '@/lib/workoutsParser'

interface Props {
  workouts: WorkoutSet[]
}

const SELECTOR: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  padding: '5px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  cursor: 'pointer',
  minWidth: 240,
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { week: number; load: number; reps_hit: string | null; rpe: string | null; notes: string | null } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'DM Mono', fontSize: 11,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Week {d.week}</div>
      <div style={{ color: 'var(--lift-t)', fontSize: 14, fontWeight: 700 }}>{d.load} lbs</div>
      {d.reps_hit && <div style={{ color: 'var(--muted)', marginTop: 3 }}>Reps: {d.reps_hit}</div>}
      {d.rpe && <div style={{ color: 'var(--muted)' }}>RPE: {d.rpe}</div>}
      {d.notes && (
        <div style={{ color: 'var(--muted)', marginTop: 4, maxWidth: 220, fontSize: 10, lineHeight: 1.4 }}>
          {d.notes.slice(0, 120)}{d.notes.length > 120 ? '…' : ''}
        </div>
      )}
    </div>
  )
}

export default function LiftProgressChart({ workouts }: Props) {
  const exercises = useMemo(() => uniqueExercises(workouts), [workouts])
  const [selected, setSelected] = useState(exercises[0] ?? '')

  const data = useMemo(() => liftProgression(workouts, selected), [workouts, selected])

  const loads = data.map(d => d.load)
  const yMin = loads.length ? Math.floor(Math.min(...loads) * 0.95) : 0
  const yMax = loads.length ? Math.ceil(Math.max(...loads) * 1.05) : 100

  // Change from first to last recorded entry
  const change = data.length >= 2 ? data[data.length - 1].load - data[0].load : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div className="chart-card-title" style={{ marginBottom: 0 }}>Lift progress</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {change !== null && (
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: change > 0 ? 'var(--lift-t)' : change < 0 ? 'var(--race-t)' : 'var(--muted)',
              fontWeight: 600,
            }}>
              {change > 0 ? '▲' : change < 0 ? '▼' : '='} {change > 0 ? '+' : ''}{change} lbs over {data.length} wks
            </span>
          )}
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={SELECTOR}
          >
            {exercises.map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px 16px' }}>
          <div className="empty-icon">🏋️</div>
          <div className="empty-title">No load data for this exercise</div>
          <div>Try another exercise from the dropdown.</div>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Starting', value: data[0] ? `${data[0].load} lbs` : '—', sub: `Week ${data[0]?.week}` },
              { label: 'Latest', value: data[data.length - 1] ? `${data[data.length - 1].load} lbs` : '—', sub: `Week ${data[data.length - 1]?.week}` },
              { label: 'Peak', value: `${Math.max(...loads)} lbs`, sub: `Wk ${data.find(d => d.load === Math.max(...loads))?.week}` },
              { label: 'Gain', value: change !== null ? `${change > 0 ? '+' : ''}${change} lbs` : '—', sub: 'total', color: change && change > 0 ? 'var(--lift-t)' : change && change < 0 ? 'var(--race-t)' : undefined },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '8px 4px',
                background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-soft)',
              }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 600, color: s.color ?? 'var(--lift-t)' }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: 'var(--muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: 'var(--muted)' }}
                tickLine={false} axisLine={false}
                tickFormatter={v => `Wk ${v}`}
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: 'var(--muted)' }}
                tickLine={false} axisLine={false} width={40}
                tickFormatter={v => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="load" name="Load (lbs)"
                stroke="var(--lift-t)" strokeWidth={2.5}
                dot={{ fill: 'var(--lift-t)', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: 'var(--lift-t)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}
