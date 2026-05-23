import { getActiveRace, getDaysToRace } from '@/lib/data'

interface Phase {
  num: number
  badge: string
  badgeCls: string
  title: string
  dates: string
  weeks: Week[]
  notes: string[]
}

interface Week {
  label: string
  dates: string
  rows: { sport: string; detail: string }[]
  highlight?: boolean
}

const PHASES: Phase[] = [
  {
    num: 1,
    badge: 'Phase 1',
    badgeCls: 'p1b',
    title: 'Re-entry',
    dates: 'Wks 1–2 · Apr 10–20',
    notes: [
      'Priority: showing up — not performance',
      'No brick sessions yet — let legs adapt',
      'Every session counts regardless of duration',
    ],
    weeks: [
      {
        label: 'Week 1',
        dates: 'Apr 10–13',
        rows: [
          { sport: 'Swim', detail: '150–200m easy · focus on breathing + form' },
          { sport: 'Run', detail: '20 min easy · conversational pace' },
          { sport: 'Bike', detail: '30–35 min easy · stationary OK · 75–80 RPM' },
        ],
      },
      {
        label: 'Week 2',
        dates: 'Apr 14–20',
        rows: [
          { sport: 'Swim', detail: '175–200m · add 2×25m at effort if feeling good' },
          { sport: 'Run', detail: '22–25 min · same easy pace' },
          { sport: 'Bike', detail: '35 min · slight resistance increase' },
        ],
      },
    ],
  },
  {
    num: 2,
    badge: 'Phase 2',
    badgeCls: 'p2b',
    title: 'Build + Brick Intro',
    dates: 'Wks 3–4 · Apr 21–May 4',
    notes: [
      'First brick session in Week 4 — keep it short',
      'Run off the bike will feel strange — expect heavy legs for 2–3 min',
      'Swim should reach race distance (300m) by end of phase',
    ],
    weeks: [
      {
        label: 'Week 3',
        dates: 'Apr 21–27',
        rows: [
          { sport: 'Swim', detail: '200–250m · maintain 2–3 sessions' },
          { sport: 'Run', detail: '25 min · start adding slight tempo pickup last 5 min' },
          { sport: 'Bike', detail: '40–45 min · 80–82 RPM target' },
        ],
      },
      {
        label: 'Week 4',
        dates: 'Apr 28–May 4',
        highlight: true,
        rows: [
          { sport: 'Swim', detail: '275–300m · approaching race distance' },
          { sport: 'Run', detail: '28–30 min · tempo last 10 min' },
          { sport: 'Brick', detail: '40 min bike → 1.5 mi run (first brick 🧱)' },
        ],
      },
    ],
  },
  {
    num: 3,
    badge: 'Phase 3',
    badgeCls: 'p3b',
    title: 'Race Sharpening',
    dates: 'Wks 5–6 · May 5–18',
    notes: [
      'Swim hits 300m at race pace — not comfortable, practiced',
      'Brick sessions simulate race sequence: bike → 5K run',
      'Lift volume drops ~20% — prioritize tri sessions',
      'Focus shifts from fitness building to race-specific conditioning',
    ],
    weeks: [
      {
        label: 'Week 5',
        dates: 'May 5–11',
        rows: [
          { sport: 'Swim', detail: '300m · practice race pace · 2 sessions' },
          { sport: 'Run', detail: '5K at race pace · 1 session' },
          { sport: 'Brick', detail: '45 min bike → 2 mi run' },
          { sport: 'Lift', detail: 'Reduced ~20% volume · keep intensity' },
        ],
      },
      {
        label: 'Week 6',
        dates: 'May 12–18',
        rows: [
          { sport: 'Swim', detail: '300m race-pace · + 2×50m fast finish' },
          { sport: 'Run', detail: '5K race pace · negative split effort' },
          { sport: 'Brick', detail: '50 min bike → 5K run (race simulation)' },
          { sport: 'Lift', detail: 'Reduced · skip isolation work' },
        ],
      },
    ],
  },
  {
    num: 4,
    badge: 'Phase 4',
    badgeCls: 'p4b',
    title: 'Taper',
    dates: 'Wk 7 · May 19–30',
    notes: [
      'Volume cuts in half — this is intentional, trust it',
      `Keep some intensity to stay sharp — don't go fully easy`,
      'Race week: almost no training, just movement to stay loose',
      'Sleep, eat, hydrate — race week is about recovery, not fitness',
    ],
    weeks: [
      {
        label: 'Wk 7a',
        dates: 'May 19–25',
        rows: [
          { sport: 'Swim', detail: '200m easy + 2×50m fast — stay sharp' },
          { sport: 'Brick', detail: '30 min bike → 10 min run — short and controlled' },
          { sport: 'Run', detail: '20 min easy · no tempo' },
          { sport: 'Lift', detail: 'One session max · upper body only · light' },
        ],
      },
      {
        label: 'Race week',
        dates: 'May 26–30',
        highlight: true,
        rows: [
          { sport: 'Mon', detail: 'Easy 20 min run or bike — keep legs moving' },
          { sport: 'Tue', detail: 'Rest or 15 min light swim' },
          { sport: 'Wed', detail: 'Rest' },
          { sport: 'Thu', detail: '10 min easy run · 5×strides · stay sharp' },
          { sport: 'Fri', detail: 'Bib pickup 5–7pm · Abington Police HQ' },
          { sport: 'Sat', detail: '🏁 Race Day · Abington · 7:27am wave' },
        ],
      },
    ],
  },
]

export default function TriPlanPage() {
  const active = getActiveRace()
  const daysOut = active ? getDaysToRace(active.race) : null

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Tri Plan · 2026</h2>
          <div className="sub">7-week program · Apr 10 – May 30 · Abington Triathlon</div>
        </div>
        <div className="page-header-right">
          {daysOut !== null && daysOut >= 0 ? (
            <>Abington in<br /><strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 20 }}>{daysOut}</strong> days</>
          ) : active ? `${active.race.name}` : 'Season in progress'}
        </div>
      </div>

      {/* Big countdown */}
      {daysOut !== null && daysOut >= 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '24px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 64, fontWeight: 500, lineHeight: 1 }}>{daysOut}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>days to race</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 18 }}>Abington Triathlon</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>May 30, 2026 · 7:27 AM · Yellow caps · Men 30–39</div>
            <div className="course-bar" style={{ marginTop: 12 }}>
              <div className="course-seg cs-swim">300m swim</div>
              <div className="course-seg cs-t1">T1</div>
              <div className="course-seg cs-bike">11.5 mi bike</div>
              <div className="course-seg cs-t2">T2</div>
              <div className="course-seg cs-run">5K run</div>
            </div>
          </div>
        </div>
      )}

      {/* Key principles */}
      <div className="note" style={{ marginBottom: 20 }}>
        <strong>Plan philosophy:</strong> Consistency over intensity. The goal is to arrive at the start line healthy, having swum 300m and run a 5K in the last 2 weeks. Every session you complete — even shortened — is a win. Skip nothing without replacing it.
      </div>

      {/* Phases */}
      {PHASES.map(phase => (
        <div key={phase.num} className="plan-phase">
          <div className="plan-phase-header">
            <span className={`pbadge ${phase.badgeCls}`}>{phase.badge}</span>
            <span className="plan-phase-title">{phase.title}</span>
            <span className="plan-phase-dates">{phase.dates}</span>
          </div>

          {/* Phase notes */}
          <div style={{ marginBottom: 14 }}>
            {phase.notes.map((note, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                <span>·</span><span>{note}</span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="plan-wk-grid">
            {phase.weeks.map(wk => (
              <div key={wk.label} className="plan-wk" style={wk.highlight ? { borderColor: 'var(--text)', borderWidth: '1.5px' } : {}}>
                <div className="plan-wk-label">{wk.label} · {wk.dates}</div>
                {wk.rows.map((row, i) => (
                  <div key={i} className="plan-row">
                    <span className="plan-sport">{row.sport}</span>
                    <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{row.detail}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Strategy notes */}
      <div style={{ marginTop: 24 }}>
        <div className="section-hdr">
          <span className="ptitle">Key race-day targets</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {[
            { seg: '🏊 Swim · 300m', target: '~8–10 min', note: '13 pool lengths · controlled breathing · push off wall smoothly' },
            { seg: '🚴 Bike · 11.5 mi', target: '~40–45 min', note: '82 RPM target · controlled effort · save legs for run' },
            { seg: '🏃 Run · 5K', target: '~29–33 min', note: '9:30–11:00 min/mi · start slow · negative split' },
            { seg: '⏱ Total', target: '~1:15–1:30', note: 'Including T1 + T2 · estimated 1:30 for first race' },
          ].map((item, i) => (
            <div key={i} className="surface-card">
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{item.seg}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{item.target}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
