'use client'

import { useState } from 'react'
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

type Tab = 'plan' | 'goals'

export default function SeasonPlanPage() {
  const [tab, setTab] = useState<Tab>('plan')
  const active = getActiveRace()
  const daysOut = active ? getDaysToRace(active.race) : null

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Season Plan</h2>
          <div className="sub">7-week tri plan · stretch goals · 2026</div>
        </div>
        <div className="page-header-right">
          {daysOut !== null && daysOut >= 0 ? (
            <>{active!.race.name.split(' ')[0]} in<br /><strong style={{ fontFamily: "'DM Mono', monospace", fontSize: 20 }}>{daysOut}</strong> days</>
          ) : active ? `${active.race.name}` : 'Season in progress'}
        </div>
      </div>

      {/* Tab bar */}
      <div className="mh-tab-bar">
        {(['plan', 'goals'] as Tab[]).map(t => (
          <button
            key={t}
            className={`mh-tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'plan' ? 'Tri Plan' : 'Stretch Goals'}
          </button>
        ))}
      </div>

      {/* ── TRI PLAN TAB ── */}
      {tab === 'plan' && (
        <>
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
                <div style={{ fontWeight: 500, fontSize: 18 }}>{active!.race.name}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {active!.race.dateLabel} · {active!.race.location}
                </div>
                <div className="course-bar" style={{ marginTop: 12 }}>
                  <div className="course-seg cs-swim">{active!.race.distances.swim}</div>
                  <div className="course-seg cs-t1">T1</div>
                  <div className="course-seg cs-bike">{active!.race.distances.bike}</div>
                  <div className="course-seg cs-t2">T2</div>
                  <div className="course-seg cs-run">{active!.race.distances.run}</div>
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

              <div style={{ marginBottom: 14 }}>
                {phase.notes.map((note, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                    <span>·</span><span>{note}</span>
                  </div>
                ))}
              </div>

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

          {/* Key race-day targets */}
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
        </>
      )}

      {/* ── STRETCH GOALS TAB ── */}
      {tab === 'goals' && (
        <>
          {/* Swim progression */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr">
              <span className="pbadge p1b">Swim</span>
              <span className="ptitle">Distance progression</span>
            </div>
            <div className="surface-card">
              {[
                { date: 'Apr 10–20', target: '150–200m', note: 'Phase 1 baseline · easy pace · breathing focus', done: true },
                { date: 'Apr 21–May 4', target: '200–300m', note: 'Phase 2 build · approaching race distance', done: false },
                { date: 'May 5–18', target: '300m at race pace', note: 'Phase 3 sharpening · not comfortable, practiced', done: false },
                { date: 'May 30', target: '300m · Abington race', note: '🏁 A-race swim · 13 pool lengths', done: false },
                { date: 'Jul 12', target: '750m · Stone Harbor', note: 'First ocean open water · 2.5× race distance', done: false },
                { date: 'Aug 1', target: '400m · Brigantine', note: 'Ocean sprint · decide based on Stone Harbor', done: false },
                { date: 'Aug 2', target: '1500m · Steelman', note: '🎯 Olympic distance swim · biggest stretch goal', done: false },
              ].map((row, i) => (
                <div key={i} className="stretch-item">
                  <span className="stretch-date">{row.date}</span>
                  <span className="tag tg-swim">{row.target}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{row.note}</span>
                  {row.done && <span style={{ color: 'var(--lift-t)', fontSize: 12 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Brick progression */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr">
              <span className="pbadge p3b">Bricks</span>
              <span className="ptitle">Brick session progression</span>
            </div>
            <div className="surface-card">
              {[
                { date: 'Apr 3', label: '#1 · Warmup brick', target: '400m swim → 5 mi bike → 1.6km run', note: 'Pre-plan baseline test · stationary + treadmill' },
                { date: 'May 7', label: '#2 · First outdoor brick', target: '400m swim → 11.5 mi outdoor → 1.4km run', note: 'Outdoor bike · realistic race conditions' },
                { date: 'May (Phase 2)', label: '#3 · Build brick', target: '40 min bike → 1.5 mi run', note: 'First in-plan brick · expect heavy legs' },
                { date: 'May (Phase 3)', label: '#4 · Race sim', target: '50 min bike → 5K run', note: 'Full race simulation · race-pace effort' },
                { date: 'Jun–Jul', label: 'Stone Harbor prep', target: 'Longer bike → 5K run', note: 'Build toward 12.4 mi bike distance' },
                { date: 'Jul–Aug', label: 'Steelman prep', target: '25 mi bike → 6.2 mi run', note: '🎯 Olympic brick · significant challenge' },
              ].map((row, i) => (
                <div key={i} className="stretch-item">
                  <span className="stretch-date">{row.date}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{row.label}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>{row.target}</div>
                    <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>{row.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Run progression */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr">
              <span className="pbadge p3b">Run</span>
              <span className="ptitle">Off-bike run progression</span>
            </div>
            <div className="surface-card">
              {[
                { date: 'Phase 1', target: '20 min easy', note: 'Conversational pace · no pressure' },
                { date: 'Phase 2', target: '25–30 min + tempo finish', note: 'Last 5–10 min at effort' },
                { date: 'Phase 3', target: '5K at race pace', note: 'Negative split · target 9:30–11:00 min/mi' },
                { date: 'Taper', target: '20 min easy', note: 'Back to easy · preserve legs' },
                { date: 'May 30 · Race', target: '5K at race pace', note: '🏁 Off the bike · expect first mile to hurt' },
                { date: 'Jul–Aug', target: '5K → 10K off bike', note: 'Stone Harbor → Steelman progression' },
              ].map((row, i) => (
                <div key={i} className="stretch-item">
                  <span className="stretch-date">{row.date}</span>
                  <span className="tag tg-run">{row.target}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{row.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Season big goals */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr">
              <span className="ptitle">Season big goals</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {[
                { icon: '🏁', title: 'Finish Abington', body: 'Healthy, controlled, no stops. Any time is a win for race #1.' },
                { icon: '🌊', title: 'Open water confidence', body: "Stone Harbor ocean swim — sight well, stay calm in the washing machine, don't panic." },
                { icon: '🏆', title: 'Steelman Olympic (stretch)', body: '1500m swim · 24.9 mi bike · 6.2 mi run. The biggest ask of the season — decide after Stone Harbor.' },
                { icon: '💪', title: 'All 6 races', body: 'No injuries, no missed starts. Complete every race on the calendar.' },
                { icon: '⚖️', title: 'Body composition', body: "~0.9 lbs/wk deficit. Performance-first — don't sacrifice energy for weight loss. Recomp, not cut." },
                { icon: '🧘', title: '30-day mobility streak', body: 'Consistent nightly mobility. The Achilles has been a chronic issue — this is the long game fix.' },
              ].map((goal, i) => (
                <div key={i} className="surface-card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{goal.icon}</div>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{goal.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{goal.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Open water readiness checklist */}
          <div>
            <div className="section-hdr"><span className="ptitle">Open water readiness checklist</span></div>
            <div className="surface-card">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4px 24px' }}>
                {[
                  'Completed at least 2 open water swims before Stone Harbor',
                  'Practiced sighting: look up every 6–8 strokes, pick a landmark',
                  'Know the buoy sequence and turn directions for each race',
                  'Comfortable with rolling start or deep-water start',
                  'Wetsuit if water < 78°F — practice in a wetsuit before race day',
                  'Bodyglide on neck, wrists, ankles before wetsuit',
                  'Have a mantra: Calm · Sight · Rhythm',
                  'Know the course cut-off times (Steelman especially)',
                  'Practiced beach or dock entry/exit with shoes off',
                  'Mental rehearsal: being touched/bumped does not mean emergency',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 13, borderBottom: '1px solid var(--border-soft)' }}>
                    <span style={{ color: 'var(--swim-t)' }}>○</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
