export default function StretchGoalsPage() {
  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Stretch Goals</h2>
          <div className="sub">Season progression targets · beyond the A-race</div>
        </div>
      </div>

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
            { icon: '🌊', title: 'Open water confidence', body: 'Stone Harbor ocean swim — sight well, stay calm in the washing machine, don\'t panic.' },
            { icon: '🏆', title: 'Steelman Olympic (stretch)', body: '1500m swim · 24.9 mi bike · 6.2 mi run. The biggest ask of the season — decide after Stone Harbor.' },
            { icon: '💪', title: 'All 6 races', body: 'No injuries, no missed starts. Complete every race on the calendar.' },
            { icon: '⚖️', title: 'Body composition', body: '~0.9 lbs/wk deficit. Performance-first — don\'t sacrifice energy for weight loss. Recomp, not cut.' },
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

      {/* Open water safety */}
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
    </div>
  )
}
