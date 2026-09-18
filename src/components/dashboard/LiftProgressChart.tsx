'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { WorkoutSet } from '@/lib/workoutsParser'
import { liftProgression, uniqueExercises } from '@/lib/workoutsParser'
import { daysAgoStr } from '@/lib/supabase'

interface Props {
  workouts: WorkoutSet[]
}

type RangeDays = 7 | 30 | 60 | 90 | 'all'
const RANGES: { label: string; value: RangeDays }[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '60d', value: 60 },
  { label: '90d', value: 90 },
  { label: 'All time', value: 'all' },
]

const SELECTOR: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  padding: '5px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  cursor: 'pointer',
  width: 'auto',
  maxWidth: '100%',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatDateFull(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { date: string; load: number; reps_hit: string | null; rpe: string | null; notes: string | null } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontFamily: 'IBM Plex Mono', fontSize: 11,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{formatDateFull(d.date)}</div>
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
  const [range, setRange] = useState<RangeDays>(7)

  const allData = useMemo(() => liftProgression(workouts, selected), [workouts, selected])

  const data = useMemo(() => {
    if (range === 'all') return allData
    const sinceStr = daysAgoStr(range - 1)
    return allData.filter(d => d.date >= sinceStr)
  }, [allData, range])

  const loads = data.map(d => d.load)
  const yMin = loads.length ? Math.floor(Math.min(...loads) * 0.95) : 0
  const yMax = loads.length ? Math.ceil(Math.max(...loads) * 1.05) : 100

  // Change from first to last recorded entry in the selected range
  const change = data.length >= 2 ? data[data.length - 1].load - data[0].load : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div className="chart-card-title" style={{ marginBottom: 0 }}>Lift progress</div>
        <div className="lift-controls" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {change !== null && (
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              color: change > 0 ? 'var(--lift-t)' : change < 0 ? 'var(--race-t)' : 'var(--muted)',
              fontWeight: 600,
            }}>
              {change > 0 ? '▲' : change < 0 ? '▼' : '='} {change > 0 ? '+' : ''}{change} lbs over {data.length} session{data.length === 1 ? '' : 's'}
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

      {/* Day-range toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => setRange(r.value)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: range === r.value ? 600 : 400,
              padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
              background: range === r.value ? 'var(--accent-bg)' : 'transparent',
              color: range === r.value ? 'var(--accent)' : 'var(--muted)',
              border: `1px solid ${range === r.value ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="empty-state" style={{ padding: '28px 16px' }}>
          <div className="empty-icon">🏋️</div>
          <div className="empty-title">No load data in this range</div>
          <div>Try a wider range or another exercise from the dropdown.</div>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="lift-quick-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Starting', value: data[0] ? `${data[0].load} lbs` : '—', sub: data[0] ? formatDate(data[0].date) : '—' },
              { label: 'Latest', value: data[data.length - 1] ? `${data[data.length - 1].load} lbs` : '—', sub: data[data.length - 1] ? formatDate(data[data.length - 1].date) : '—' },
              { label: 'Peak', value: `${Math.max(...loads)} lbs`, sub: formatDate(data.find(d => d.load === Math.max(...loads))?.date ?? data[0].date) },
              { label: 'Gain', value: change !== null ? `${change > 0 ? '+' : ''}${change} lbs` : '—', sub: 'in range', color: change && change > 0 ? 'var(--lift-t)' : change && change < 0 ? 'var(--race-t)' : undefined },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '8px 4px',
                background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-soft)',
              }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600, color: s.color ?? 'var(--lift-t)' }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
                tickLine={false} axisLine={false}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fontFamily: 'IBM Plex Mono', fontSize: 10, fill: 'var(--muted)' }}
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
