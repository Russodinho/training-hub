'use client'

import { useState, useEffect } from 'react'
import { RACES, KIT_CHECKLIST, getActiveRace, getDaysToRace } from '@/lib/data'
import { getRaceResult, upsertRaceResult, migrateLocalStorage } from '@/lib/supabase'
import type { RaceResult } from '@/lib/supabase'

export default function RaceDayPage() {
  const [results, setResults] = useState<Record<string, RaceResult | null>>({})
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [kitChecked, setKitChecked] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  const active = getActiveRace()

  useEffect(() => {
    async function load() {
      await migrateLocalStorage()
      const allResults: Record<string, RaceResult | null> = {}
      for (const race of RACES) {
        allResults[race.id] = await getRaceResult(race.id)
      }
      setResults(allResults)
      setLoading(false)
    }
    load()
  }, [])

  const saveTime = async (raceId: string) => {
    const prefix = `${raceId}-`
    const get = (field: string) => (formData[prefix + field] || '').trim()
    const result = {
      race_id: raceId,
      swim: get('swim') || null,
      t1: get('t1') || null,
      bike: get('bike') || null,
      t2: get('t2') || null,
      run: get('run') || null,
      total: get('total') || null,
      notes: get('notes') || null,
    }
    await upsertRaceResult(result)
    setResults(prev => ({ ...prev, [raceId]: result as RaceResult }))
    // Clear form
    const cleared = { ...formData }
    ;['swim', 't1', 'bike', 't2', 'run', 'total', 'notes'].forEach(f => delete cleared[prefix + f])
    setFormData(cleared)
  }

  const editTime = async (raceId: string) => {
    setResults(prev => ({ ...prev, [raceId]: null }))
    const prev = results[raceId]
    if (!prev) return
    const prefix = `${raceId}-`
    setFormData(fd => ({
      ...fd,
      [`${prefix}swim`]: prev.swim || '',
      [`${prefix}t1`]: prev.t1 || '',
      [`${prefix}bike`]: prev.bike || '',
      [`${prefix}t2`]: prev.t2 || '',
      [`${prefix}run`]: prev.run || '',
      [`${prefix}total`]: prev.total || '',
    }))
  }

  const toggleKit = (i: number) => {
    setKitChecked(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (loading) {
    return (
      <div className="hub-page">
        <div style={{ textAlign: 'center', padding: 60, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--muted)' }}>Loading...</div>
      </div>
    )
  }

  // Season complete
  if (!active) {
    return (
      <div className="hub-page">
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏁</div>
          <h2 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 24, marginBottom: 8 }}>Season Complete</h2>
          <div style={{ color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, marginBottom: 32 }}>
            2026 triathlon season — every race in the books
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, maxWidth: 700, margin: '0 auto' }}>
            {RACES.map(race => {
              const res = results[race.id]
              return (
                <div key={race.id} className="rd-season-race">
                  <div className="rd-season-race-name">{race.name}</div>
                  <div className="rd-season-race-date">
                    {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  {res?.total
                    ? <div className="rd-season-race-time">{res.total}</div>
                    : <div className="rd-season-race-time none">No time logged</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const race = active.race
  const d = race.distances
  const daysOut = getDaysToRace(race)
  const savedResult = results[race.id]
  const prefix = `${race.id}-`

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Race Day · {race.name}</h2>
          <div className="sub">{race.dateLabel} · {race.location}</div>
        </div>
        <div className="page-header-right" style={{ whiteSpace: 'pre-line' }}>{race.headerRight}</div>
      </div>

      {/* Status banner */}
      {active.isPast ? (
        <div className="rd-status-banner recent">
          <span className="rd-status-pill">Just raced</span>
          <span>Log your times below. Advances to next race in 5 days.</span>
        </div>
      ) : (
        <div className="rd-status-banner upcoming">
          <span className="rd-status-pill">Next race</span>
          <span>{daysOut > 0 ? `${daysOut} day${daysOut === 1 ? '' : 's'} out` : 'Race day!'}</span>
        </div>
      )}

      {/* Course bar */}
      <div className="course-bar" style={{ marginBottom: 20 }}>
        <div className="course-seg cs-swim">{d.swim} swim</div>
        <div className="course-seg cs-t1">T1</div>
        <div className="course-seg cs-bike">{d.bike} bike</div>
        <div className="course-seg cs-t2">T2</div>
        <div className="course-seg cs-run">{d.run} run</div>
      </div>

      {/* Results / time entry */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-hdr">
          <span className="pbadge p1b">{savedResult ? 'Your Results' : 'Enter Your Times'}</span>
        </div>
        {savedResult ? (
          <div>
            <div className="rd-results-saved">
              {[
                { val: savedResult.swim, lbl: 'Swim' },
                { val: savedResult.t1, lbl: 'T1' },
                { val: savedResult.bike, lbl: 'Bike' },
                { val: savedResult.t2, lbl: 'T2' },
                { val: savedResult.run, lbl: 'Run' },
                { val: savedResult.total, lbl: 'Total', total: true },
              ].map(cell => (
                <div key={cell.lbl} className={`rd-result-cell${cell.total ? ' total' : ''}`}>
                  <div className="rd-result-val">{cell.val || '—'}</div>
                  <div className="rd-result-lbl">{cell.lbl}</div>
                </div>
              ))}
            </div>
            <button className="rd-link-btn" onClick={() => editTime(race.id)}>✎ Edit times</button>
          </div>
        ) : (
          <div>
            <div className="rd-results-grid">
              {['swim', 't1', 'bike', 't2', 'run', 'total'].map(field => (
                <div key={field}>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>
                    {field}
                  </label>
                  <input
                    type="text"
                    placeholder={field === 'swim' ? '6:30' : field === 'total' ? '1:20:30' : field === 'bike' ? '42:10' : '1:45'}
                    value={formData[prefix + field] || ''}
                    onChange={e => setFormData(fd => ({ ...fd, [prefix + field]: e.target.value }))}
                    style={{ padding: '7px 10px' }}
                  />
                </div>
              ))}
            </div>
            <button className="hub-btn" style={{ marginTop: 10 }} onClick={() => saveTime(race.id)}>
              Save Race Times
            </button>
          </div>
        )}
      </div>

      {/* Timeline + Strategy + Kit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="section-hdr"><span className="pbadge p1b">Morning Timeline</span></div>
          <div className="rd-timeline">
            {race.timeline.map(([time, item, highlight], i) => (
              <div key={i} className={`rd-row${highlight ? ' rd-highlight' : ''}`}>
                <div className="rd-time">{time}</div>
                <div>{item}</div>
              </div>
            ))}
          </div>

          <div className="section-hdr" style={{ marginTop: 20 }}><span className="pbadge p2b">Race Strategy</span></div>
          <div className="rd-strategy">
            {race.strategy.map(([name, note], i) => (
              <div key={i} className="rd-seg">
                <div className="rd-seg-name">{name}</div>
                <div className="rd-seg-note">{note}</div>
              </div>
            ))}
          </div>

          {/* Transition tips */}
          <div className="section-hdr" style={{ marginTop: 20 }}><span className="pbadge p4b">Transition Tips</span></div>
          <div className="note">
            <strong>T1 (swim→bike):</strong> Have shoes clipped in or ready. Helmet on before touching bike. Dry feet quickly with towel if needed. Don't rush — 30 extra seconds in T1 beats cramping your foot into a wet shoe.<br /><br />
            <strong>T2 (bike→run):</strong> Rack bike, helmet off, swap shoes, grab race belt if not already on. Go. Legs will feel heavy — start slow, let them come around.
          </div>
        </div>

        <div>
          <div className="section-hdr"><span className="pbadge p3b">Kit Checklist</span></div>
          <div className="rd-checklist">
            {KIT_CHECKLIST.map((item, i) => (
              <div
                key={i}
                className={`rd-check${kitChecked.has(i) ? ' checked' : ''}`}
                onClick={() => toggleKit(i)}
              >
                <div className="rd-check-box">{kitChecked.has(i) ? '☑' : '☐'}</div>
                <div>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past races summary */}
      <div style={{ marginTop: 32 }}>
        <div className="section-hdr"><span className="ptitle">All races this season</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {RACES.map(r => {
            const res = results[r.id]
            const isActiveRace = r.id === race.id
            return (
              <div key={r.id} className="surface-card" style={isActiveRace ? { borderColor: 'var(--text)' } : {}}>
                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{r.name.split(' ').slice(0, 2).join(' ')}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', marginBottom: 6 }}>
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {res?.total
                  ? <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 500 }}>{res.total}</div>
                  : <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--faint)' }}>No time yet</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
