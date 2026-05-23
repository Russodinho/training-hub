import { RACES, getActiveRace, getDaysToRace } from '@/lib/data'

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  sprint: { label: 'Sprint', cls: 'tag-sprint' },
  olympic: { label: 'Olympic', cls: 'tag-olympic' },
  decide: { label: 'Decide', cls: 'tag-decide' },
}

export default function RaceCalendarPage() {
  const activeRace = getActiveRace()

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Race Calendar</h2>
          <div className="sub">2026 Triathlon Season · 6 races</div>
        </div>
        <div className="page-header-right">
          {activeRace ? (
            <>
              Next: {activeRace.race.name}<br />
              {getDaysToRace(activeRace.race)} days out
            </>
          ) : 'Season complete'}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="leg"><div className="ldot" style={{ background: 'var(--sprint-bg)', border: '1px solid var(--sprint-t)' }} /><span>Sprint</span></div>
        <div className="leg"><div className="ldot" style={{ background: 'var(--olympic-bg)', border: '1px solid var(--olympic-t)' }} /><span>Olympic</span></div>
        <div className="leg"><div className="ldot" style={{ background: 'var(--decide-bg)', border: '1px solid var(--decide-t)' }} /><span>Decide (may skip)</span></div>
        <div className="leg"><div className="ldot" style={{ background: 'var(--target-bg)', border: '1px solid var(--target-t)' }} /><span>Target / A race</span></div>
      </div>

      <div className="race-grid">
        {RACES.map((race, i) => {
          const daysOut = getDaysToRace(race)
          const isPast = daysOut < -5
          const isActive = activeRace?.race.id === race.id
          const typeInfo = TYPE_LABELS[race.type]
          const isTarget = race.id === 'abington'

          return (
            <div key={race.id} className="race-card" style={{
              opacity: isPast ? 0.5 : 1,
              borderColor: isActive ? 'var(--text)' : isTarget ? 'var(--target-t)' : 'var(--border)',
            }}>
              <div className="race-card-header">
                <div>
                  <div className="race-name">{race.name}</div>
                  <div className="race-date">{race.dateLabel}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {isTarget && <span className="tag tag-target">Target</span>}
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

              {race.id === 'abington' && (
                <div className="note" style={{ marginTop: 8, fontSize: 12 }}>
                  Wave 7:27am · Yellow caps · Men 30–39<br />
                  Bib pickup Fri May 29 · 5–7pm · Abington Police HQ
                </div>
              )}
              {race.id === 'brigantine' && (
                <div className="note" style={{ marginTop: 8, fontSize: 12, background: 'var(--decide-bg)', borderColor: 'var(--decide-t)', color: 'var(--decide-t)' }}>
                  Back-to-back weekend with Steelman (Aug 2). Decide based on how Abington and Stone Harbor felt.
                </div>
              )}
              {race.id === 'steelman' && (
                <div className="note" style={{ marginTop: 8, fontSize: 12, background: 'var(--decide-bg)', borderColor: 'var(--decide-t)', color: 'var(--decide-t)' }}>
                  Olympic distance — significant step up. Decide after Abington + Stone Harbor.
                </div>
              )}
            </div>
          )
        })}
      </div>

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
