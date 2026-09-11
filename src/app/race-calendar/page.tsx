'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRaces, getActiveRace, getDaysToRace, addRace, setRaceStatus, deleteRace, getRaceResult, todayStr } from '@/lib/supabase'
import type { Race, RaceResult } from '@/lib/supabase'

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  sprint: { label: 'Sprint', cls: 'tag-sprint' },
  olympic: { label: 'Olympic', cls: 'tag-olympic' },
  decide: { label: 'Decide', cls: 'tag-decide' },
  target: { label: 'Target', cls: 'tag-decide' },
}

const SPORT_LABELS: Record<Race['sport'], string> = {
  tri: 'Triathlon', run: 'Run', bike: 'Bike', swim: 'Swim',
}

const EMPTY_FORM = {
  name: '', date: '', location: '',
  sport: 'tri' as Race['sport'],
  distanceSwim: '', distanceBike: '', distanceRun: '', distanceSingle: '',
  tier: 'sprint' as NonNullable<Race['type']>,
  notes: '',
}

export default function RaceCalendarPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [results, setResults] = useState<Record<string, RaceResult | null>>({})
  const [activeRaceId, setActiveRaceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    const [allRaces, active] = await Promise.all([getRaces(), getActiveRace()])
    setRaces(allRaces)
    setActiveRaceId(active?.race.id ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // History = explicitly archived OR chronologically past — a race that's
  // simply over shouldn't need a manual archive click to show its result;
  // "archive" is for pulling a race out of the upcoming view early
  // (skipping it) rather than the only way to reach history.
  const today = todayStr()
  const isHistorical = (r: Race) => r.status === 'archived' || r.date < today

  // Results (for the History section's breakdown) are fetched lazily,
  // only once there's a historical race to show them for.
  useEffect(() => {
    const historical = races.filter(isHistorical)
    if (historical.length === 0) return
    Promise.all(historical.map(r => getRaceResult(r.id).then(res => [r.id, res] as const)))
      .then(pairs => setResults(Object.fromEntries(pairs)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [races])

  const upcoming = races.filter(r => !isHistorical(r)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const archived = races.filter(isHistorical).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const archiveRace = async (id: string) => {
    await setRaceStatus(id, 'archived')
    load()
  }
  const restoreRace = async (id: string) => {
    await setRaceStatus(id, 'upcoming')
    load()
  }
  const removeRace = async (id: string) => {
    if (!confirm('Delete this race permanently? This cannot be undone.')) return
    await deleteRace(id)
    load()
  }

  const submitRace = async () => {
    if (!form.name || !form.date) return
    await addRace({
      name: form.name,
      date: form.date + 'T07:00:00',
      location: form.location,
      sport: form.sport,
      tier: form.sport === 'tri' ? form.tier : undefined,
      distanceSwim: form.sport === 'tri' ? form.distanceSwim : form.sport === 'swim' ? form.distanceSingle : undefined,
      distanceBike: form.sport === 'tri' ? form.distanceBike : form.sport === 'bike' ? form.distanceSingle : undefined,
      distanceRun: form.sport === 'tri' ? form.distanceRun : form.sport === 'run' ? form.distanceSingle : undefined,
      notes: form.notes,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    load()
  }

  const totalRaces = upcoming.length

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Race Calendar</h2>
          <div className="sub">2026 Triathlon Season · {totalRaces} upcoming race{totalRaces === 1 ? '' : 's'}</div>
        </div>
      </div>

      {/* Legend + actions */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <div className="legend" style={{ margin: 0, flex: 1 }}>
          <div className="leg"><div className="ldot" style={{ background: 'var(--sprint-bg)', border: '1px solid var(--sprint-t)' }} /><span>Sprint</span></div>
          <div className="leg"><div className="ldot" style={{ background: 'var(--olympic-bg)', border: '1px solid var(--olympic-t)' }} /><span>Olympic</span></div>
          <div className="leg"><div className="ldot" style={{ background: 'var(--decide-bg)', border: '1px solid var(--decide-t)' }} /><span>Decide (may skip)</span></div>
          <div className="leg"><div className="ldot" style={{ background: 'var(--target-bg)', border: '1px solid var(--target-t)' }} /><span>Target / A race</span></div>
        </div>
        <button className="hub-btn-ghost" onClick={() => setShowHistory(h => !h)} style={{ flexShrink: 0 }}>
          {showHistory ? 'Hide history' : `History (${archived.length})`}
        </button>
        <button className="hub-btn" onClick={() => setShowForm(f => !f)} style={{ flexShrink: 0 }}>
          {showForm ? '✕ Cancel' : '+ Add race'}
        </button>
      </div>

      {/* Add race form */}
      {showForm && (
        <div className="surface-card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Add race
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Race name *</label>
              <input type="text" placeholder="e.g. Atlantic City Tri" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Date *</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Location</label>
              <input type="text" placeholder="City, State" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Sport</label>
              <select value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value as Race['sport'] }))}>
                <option value="tri">Triathlon</option>
                <option value="run">Run</option>
                <option value="bike">Bike</option>
                <option value="swim">Swim</option>
              </select>
            </div>

            {form.sport === 'tri' ? (
              <>
                <div>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Swim distance</label>
                  <input type="text" placeholder="750m" value={form.distanceSwim}
                    onChange={e => setForm(f => ({ ...f, distanceSwim: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Bike distance</label>
                  <input type="text" placeholder="12.4 mi" value={form.distanceBike}
                    onChange={e => setForm(f => ({ ...f, distanceBike: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Run distance</label>
                  <input type="text" placeholder="5K" value={form.distanceRun}
                    onChange={e => setForm(f => ({ ...f, distanceRun: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Race type</label>
                  <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value as NonNullable<Race['type']> }))}>
                    <option value="sprint">Sprint</option>
                    <option value="olympic">Olympic</option>
                    <option value="decide">Decide (may skip)</option>
                    <option value="target">Target / A race</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>
                  {SPORT_LABELS[form.sport]} distance
                </label>
                <input
                  type="text"
                  placeholder={form.sport === 'run' ? '5K, 10K, half marathon...' : form.sport === 'bike' ? '25 mi' : '1500m'}
                  value={form.distanceSingle}
                  onChange={e => setForm(f => ({ ...f, distanceSingle: e.target.value }))}
                />
              </div>
            )}
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Notes / wave info</label>
            <input
              type="text"
              placeholder="e.g. Wave 7:30am · Blue caps · Men 30-39"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <button className="hub-btn" onClick={submitRace}>Add Race</button>
        </div>
      )}

      {!loading && upcoming.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏁</div>
          <div className="empty-title">No races on calendar</div>
          <div>Click &quot;+ Add race&quot; to add your first race.</div>
        </div>
      )}

      <div className="race-grid">
        {upcoming.map(race => {
          const daysOut = getDaysToRace(race)
          const isActive = activeRaceId === race.id
          const typeInfo = race.type ? (TYPE_LABELS[race.type] ?? TYPE_LABELS.sprint) : null

          return (
            <div key={race.id} className="race-card" style={{
              borderColor: isActive ? 'var(--text)' : 'var(--border)',
              position: 'relative',
            }}>
              {/* Archive / delete */}
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
                <button onClick={() => archiveRace(race.id)} title="Archive race"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 12, padding: 2, lineHeight: 1 }}>
                  🗄
                </button>
                <button onClick={() => removeRace(race.id)} title="Delete race permanently"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 13, padding: 2, lineHeight: 1 }}>
                  ✕
                </button>
              </div>

              <div className="race-card-header" style={{ paddingRight: 44 }}>
                <div>
                  <div className="race-name">{race.name}</div>
                  <div className="race-date">{race.dateLabel}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {race.sport !== 'tri' && <span className="tag" style={{ background: 'var(--s3)' }}>{SPORT_LABELS[race.sport]}</span>}
                  {typeInfo && <span className={`tag ${typeInfo.cls}`}>{typeInfo.label}</span>}
                  {isActive && <span className="tag" style={{ background: 'var(--text)', color: 'var(--bg)' }}>Next</span>}
                </div>
              </div>

              <div className="race-location">{race.location}</div>

              {/* Course bar */}
              {race.sport === 'tri' ? (
                <div className="course-bar" style={{ marginBottom: 10 }}>
                  <div className="course-seg cs-swim">{race.distances.swim}</div>
                  <div className="course-seg cs-t1">T1</div>
                  <div className="course-seg cs-bike">{race.distances.bike}</div>
                  <div className="course-seg cs-t2">T2</div>
                  <div className="course-seg cs-run">{race.distances.run}</div>
                </div>
              ) : (
                <div className="course-bar" style={{ marginBottom: 10 }}>
                  <div className={`course-seg cs-${race.sport}`}>
                    {race.distances[race.sport === 'swim' ? 'swim' : race.sport === 'bike' ? 'bike' : 'run']}
                  </div>
                </div>
              )}

              {daysOut >= 0 && (
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
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

      {/* History — archived races with results (breakdown) if entered */}
      {showHistory && (
        <div style={{ marginTop: 24 }}>
          <div className="section-hdr"><span className="ptitle">Race History</span></div>
          {archived.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 16px' }}>
              <div>No archived races yet. Archive a race from the calendar above once it's done.</div>
            </div>
          ) : (
            <div className="race-grid">
              {archived.map(race => {
                const res = results[race.id]
                return (
                  <div key={race.id} className="race-card" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
                      <button onClick={() => restoreRace(race.id)} title="Restore to upcoming"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 11, padding: 2 }}>
                        ↺
                      </button>
                      <button onClick={() => removeRace(race.id)} title="Delete race permanently"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 13, padding: 2, lineHeight: 1 }}>
                        ✕
                      </button>
                    </div>
                    <div className="race-card-header" style={{ paddingRight: 44 }}>
                      <div>
                        <div className="race-name">{race.name}</div>
                        <div className="race-date">{race.dateLabel}</div>
                      </div>
                    </div>
                    <div className="race-location">{race.location}</div>
                    {race.sport === 'tri' && res ? (
                      <div className="rd-results-saved" style={{ marginTop: 8 }}>
                        {[
                          { val: res.swim, lbl: 'Swim' },
                          { val: res.t1, lbl: 'T1' },
                          { val: res.bike, lbl: 'Bike' },
                          { val: res.t2, lbl: 'T2' },
                          { val: res.run, lbl: 'Run' },
                          { val: res.total, lbl: 'Total', total: true },
                        ].map(cell => (
                          <div key={cell.lbl} className={`rd-result-cell${cell.total ? ' total' : ''}`}>
                            <div className="rd-result-val">{cell.val || '—'}</div>
                            <div className="rd-result-lbl">{cell.lbl}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--faint)', marginTop: 8 }}>
                        No results logged — enter times on the <a href="/race-day" className="empty-cta" style={{ display: 'inline' }}>Race Day page</a>.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Open water checklist */}
      <div style={{ marginTop: 32 }}>
        <div className="section-hdr">
          <span className="ptitle">Open Water Safety Checklist</span>
        </div>
        <div className="surface-card">
          <div className="oa-checklist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4px 24px' }}>
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
