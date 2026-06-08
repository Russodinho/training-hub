'use client'

import { useState, useEffect } from 'react'
import { RACES, getDaysToRace } from '@/lib/data'
import type { Race } from '@/lib/data'

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  sprint: { label: 'Sprint', cls: 'tag-sprint' },
  olympic: { label: 'Olympic', cls: 'tag-olympic' },
  decide: { label: 'Decide', cls: 'tag-decide' },
}

const EMPTY_FORM = {
  name: '', date: '', location: '',
  swim: '', bike: '', run: '',
  type: 'sprint' as Race['type'],
  notes: '',
}

function computeActiveRace(allRaces: Race[]) {
  const now = new Date()
  const sorted = [...allRaces].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  for (const r of sorted) {
    const lagEnd = new Date(new Date(r.date).getTime() + 5 * 86400000)
    if (now < lagEnd) return r
  }
  return null
}

export default function RaceCalendarPage() {
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [customRaces, setCustomRaces] = useState<Race[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    const h = localStorage.getItem('hidden_races')
    if (h) setHiddenIds(JSON.parse(h))
    const c = localStorage.getItem('custom_races')
    if (c) setCustomRaces(JSON.parse(c))
  }, [])

  const allRaces = [
    ...RACES.filter(r => !hiddenIds.includes(r.id)),
    ...customRaces,
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const activeRace = computeActiveRace(allRaces)

  const removeRace = (id: string, isBuiltin: boolean) => {
    if (isBuiltin) {
      const next = [...hiddenIds, id]
      setHiddenIds(next)
      localStorage.setItem('hidden_races', JSON.stringify(next))
    } else {
      const next = customRaces.filter(r => r.id !== id)
      setCustomRaces(next)
      localStorage.setItem('custom_races', JSON.stringify(next))
    }
  }

  const addRace = () => {
    if (!form.name || !form.date) return
    const d = new Date(form.date + 'T07:00:00')
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const race: Race = {
      id: `custom-${Date.now()}`,
      name: form.name,
      date: form.date + 'T07:00:00',
      dateLabel: `${label} · 7:00 AM`,
      location: form.location || '—',
      headerRight: form.notes || '',
      distances: {
        swim: form.swim || '—',
        bike: form.bike || '—',
        run: form.run || '—',
      },
      type: form.type,
      timeline: [],
      strategy: [],
    }
    const next = [...customRaces, race]
    setCustomRaces(next)
    localStorage.setItem('custom_races', JSON.stringify(next))
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const totalRaces = allRaces.length
  const pastRaces = allRaces.filter(r => getDaysToRace(r) < -5).length

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Race Calendar</h2>
          <div className="sub">2026 Triathlon Season · {totalRaces} races</div>
        </div>
        <div className="page-header-right">
          {activeRace ? (
            <>
              Next: {activeRace.name}<br />
              {getDaysToRace(activeRace)} days out
            </>
          ) : 'Season complete'}
        </div>
      </div>

      {/* Legend + add button */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <div className="legend" style={{ margin: 0, flex: 1 }}>
          <div className="leg"><div className="ldot" style={{ background: 'var(--sprint-bg)', border: '1px solid var(--sprint-t)' }} /><span>Sprint</span></div>
          <div className="leg"><div className="ldot" style={{ background: 'var(--olympic-bg)', border: '1px solid var(--olympic-t)' }} /><span>Olympic</span></div>
          <div className="leg"><div className="ldot" style={{ background: 'var(--decide-bg)', border: '1px solid var(--decide-t)' }} /><span>Decide (may skip)</span></div>
          <div className="leg"><div className="ldot" style={{ background: 'var(--target-bg)', border: '1px solid var(--target-t)' }} /><span>Target / A race</span></div>
        </div>
        <button
          className="hub-btn"
          onClick={() => setShowForm(f => !f)}
          style={{ flexShrink: 0 }}
        >
          {showForm ? '✕ Cancel' : '+ Add race'}
        </button>
      </div>

      {/* Add race form */}
      {showForm && (
        <div className="surface-card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Add race
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 10 }}>
            {[
              { label: 'Race name *', key: 'name', placeholder: 'e.g. Atlantic City Tri' },
              { label: 'Date *', key: 'date', type: 'date' },
              { label: 'Location', key: 'location', placeholder: 'City, State' },
              { label: 'Swim distance', key: 'swim', placeholder: '750m' },
              { label: 'Bike distance', key: 'bike', placeholder: '12.4 mi' },
              { label: 'Run distance', key: 'run', placeholder: '5K' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={(form as Record<string, string>)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Race type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Race['type'] }))}>
                <option value="sprint">Sprint</option>
                <option value="olympic">Olympic</option>
                <option value="decide">Decide (may skip)</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Notes / wave info</label>
            <input
              type="text"
              placeholder="e.g. Wave 7:30am · Blue caps · Men 30-39"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <button className="hub-btn" onClick={addRace}>Add Race</button>
        </div>
      )}

      {allRaces.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏁</div>
          <div className="empty-title">No races on calendar</div>
          <div>Click "+ Add race" to add your first race.</div>
        </div>
      )}

      <div className="race-grid">
        {allRaces.map(race => {
          const daysOut = getDaysToRace(race)
          const isPast = daysOut < -5
          const isActive = activeRace?.id === race.id
          const typeInfo = TYPE_LABELS[race.type] || TYPE_LABELS.sprint
          const isBuiltin = RACES.some(r => r.id === race.id)

          return (
            <div key={race.id} className="race-card" style={{
              opacity: isPast ? 0.5 : 1,
              borderColor: isActive ? 'var(--text)' : 'var(--border)',
              position: 'relative',
            }}>
              {/* Remove button */}
              <button
                onClick={() => removeRace(race.id, isBuiltin)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--faint)', fontSize: 13, padding: 2, lineHeight: 1,
                }}
                title="Remove race"
              >✕</button>

              <div className="race-card-header" style={{ paddingRight: 20 }}>
                <div>
                  <div className="race-name">{race.name}</div>
                  <div className="race-date">{race.dateLabel}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={`tag ${typeInfo.cls}`}>{typeInfo.label}</span>
                  {isActive && <span className="tag" style={{ background: 'var(--text)', color: 'var(--bg)' }}>Next</span>}
                  {isPast && <span className="tag tg-rest">Done</span>}
                </div>
              </div>

              <div className="race-location">{race.location}</div>

              {/* Course bar */}
              <div className="course-bar" style={{ marginBottom: 10 }}>
                <div className="course-seg cs-swim">{race.distances.swim}</div>
                <div className="course-seg cs-t1">T1</div>
                <div className="course-seg cs-bike">{race.distances.bike}</div>
                <div className="course-seg cs-t2">T2</div>
                <div className="course-seg cs-run">{race.distances.run}</div>
              </div>

              {!isPast && daysOut >= 0 && (
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
                  {daysOut === 0 ? 'Race day!' : `${daysOut} days out`}
                </div>
              )}

              {race.headerRight && (
                <div className="note" style={{ marginTop: 8, fontSize: 12, whiteSpace: 'pre-line' }}>
                  {race.headerRight}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Removed races — restore option */}
      {hiddenIds.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button
            className="hub-btn-ghost"
            onClick={() => {
              setHiddenIds([])
              localStorage.removeItem('hidden_races')
            }}
            style={{ fontSize: 11 }}
          >
            Restore {hiddenIds.length} hidden race{hiddenIds.length > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Open water checklist */}
      <div style={{ marginTop: 32 }}>
        <div className="section-hdr">
          <span className="ptitle">Open Water Safety Checklist</span>
        </div>
        <div className="surface-card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4px 24px' }}>
            {[
              'Practice sighting before open water races (every 6–8 strokes)',
              'Start wide to avoid washing machine effect',
              'Know the course: buoy colors, turn directions',
              'Wetsuit if water < 78°F (check race rules)',
              'Bodyglide neck, wrists, ankles before wetsuit',
              'Stay calm if bumped — find space and re-settle',
              'Have a race-day mantra: Calm, Sight, Rhythm',
              'Know the cut-off times (especially Steelman)',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 13, borderBottom: '1px solid var(--border-soft)' }}>
                <span style={{ color: 'var(--lift-t)' }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
