import { fetchSheet, parseWorkoutSheet } from '@/lib/sheets'

interface ExerciseGroup {
  day: string
  tag: string
  tagCls: string
  exercises: { name: string; sets: string; reps?: string; note?: string }[]
}

const WORKOUT_PLAN: ExerciseGroup[] = [
  {
    day: 'Monday',
    tag: 'Upper A',
    tagCls: 'tg-lift',
    exercises: [
      { name: 'Incline Bench Press', sets: '4', reps: '6–8', note: 'Primary chest push' },
      { name: 'Flat Dumbbell Press', sets: '3', reps: '8–10' },
      { name: 'Overhead Press (DB)', sets: '4', reps: '8–10' },
      { name: 'Lateral Raises', sets: '3', reps: '15–20', note: 'Cable or DB' },
      { name: 'Weighted Dips', sets: '3', reps: '8–10' },
      { name: 'Tricep Pushdown (cable)', sets: '3', reps: '12–15' },
      { name: 'Core (plank / dead bug)', sets: '3', reps: '45–60 sec' },
    ],
  },
  {
    day: 'Tuesday',
    tag: 'Lower A',
    tagCls: 'tg-lift',
    exercises: [
      { name: 'Romanian Deadlift (RDL)', sets: '4', reps: '6–8', note: 'Hamstring + glute focus' },
      { name: 'Hack Squat', sets: '4', reps: '8–10' },
      { name: 'Bulgarian Split Squat', sets: '3', reps: '8–10 each', note: 'Quad dominant' },
      { name: 'Leg Press', sets: '3', reps: '10–12' },
      { name: 'Standing Calf Raises', sets: '4', reps: '15–20' },
    ],
  },
  {
    day: 'Wednesday',
    tag: 'Swim',
    tagCls: 'tg-swim',
    exercises: [
      { name: 'Pool swim', sets: '1', reps: '200m', note: '5:15–6:00am · easy pace · breathing focus' },
      { name: 'Phase 3+: 300m at race pace', sets: '1', reps: '—', note: '+ 2×50m fast finish' },
    ],
  },
  {
    day: 'Thursday',
    tag: 'Upper B',
    tagCls: 'tg-lift',
    exercises: [
      { name: 'Weighted Pull-ups', sets: '4', reps: '5–8', note: 'Back width · supinated or neutral grip' },
      { name: 'Barbell Shrugs', sets: '3', reps: '10–12' },
      { name: 'Chest-Supported DB Row', sets: '4', reps: '8–10', note: 'Horizontal pull' },
      { name: 'Reverse Pec Deck / Face Pulls', sets: '3', reps: '15–20', note: 'Rear delt health' },
      { name: 'EZ-Bar Curls', sets: '3', reps: '10–12' },
      { name: 'Hammer Curls', sets: '2', reps: '12–15' },
      { name: 'Core (cable crunch / ab wheel)', sets: '3', reps: '12–15' },
      { name: 'Finisher: band pull-aparts', sets: '2', reps: '20 reps' },
    ],
  },
  {
    day: 'Friday',
    tag: 'Lower B',
    tagCls: 'tg-lift',
    exercises: [
      { name: 'Romanian Deadlift (RDL)', sets: '3', reps: '8', note: 'Lighter than Tue — fatigue management' },
      { name: 'Bulgarian Split Squat', sets: '3', reps: '10 each', note: 'Focus: left ankle / achilles stability' },
      { name: 'Lateral Step-Downs', sets: '3', reps: '10–12 each', note: 'Knee tracking + eccentric quad' },
      { name: 'Hip Abduction (cable or machine)', sets: '3', reps: '15', note: 'Glute medius · IT band protection' },
      { name: 'Hip Flexor Raise (cable)', sets: '3', reps: '12 each' },
      { name: 'Lying Hamstring Curl', sets: '3', reps: '12–15' },
      { name: 'Seated Calf Raises (soleus)', sets: '3', reps: '20', note: 'Achilles health' },
    ],
  },
  {
    day: 'Saturday',
    tag: 'Bike / Brick',
    tagCls: 'tg-brick',
    exercises: [
      { name: 'Stationary or outdoor bike', sets: '1', reps: '40–60 min', note: '82 RPM · controlled effort' },
      { name: 'Brick run (Phase 2+)', sets: '1', reps: '1.5–5K', note: 'Immediately off bike · expect heavy legs' },
    ],
  },
  {
    day: 'Sunday',
    tag: 'Soccer + Recovery',
    tagCls: 'tg-soc',
    exercises: [
      { name: 'Soccer', sets: '1', reps: '4 hrs', note: '8am–12pm · high load' },
      { name: 'Recovery run', sets: '1', reps: '2km', note: '1:30pm · conversational pace · flush legs' },
    ],
  },
]

export default async function WorkoutsPage() {
  const sheetRows = await fetchSheet('workouts').catch(() => [])
  const sheetData = parseWorkoutSheet(sheetRows)

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Workout Plan</h2>
          <div className="sub">4-day upper/lower split + tri sessions</div>
        </div>
        <div className="page-header-right">
          Gym: Mon / Tue / Thu / Fri · 5–6am<br />
          Tri: Wed swim · Sat bike/brick · Sun soccer
        </div>
      </div>

      {/* Google Sheets live data */}
      {sheetData.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-hdr">
            <span className="ptitle">Live from Google Sheets</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--faint)', marginLeft: 'auto' }}>
              Current cycle
            </span>
          </div>
          <div className="surface-card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Exercise', 'Sets', 'Reps', 'Start', 'Current', 'Change'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--muted)', fontWeight: 400, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 500, fontSize: 13 }}>{row.exercise}</td>
                      <td style={{ padding: '7px 10px' }}>{row.sets}</td>
                      <td style={{ padding: '7px 10px' }}>{row.reps}</td>
                      <td style={{ padding: '7px 10px', color: 'var(--muted)' }}>{row.startWeight}</td>
                      <td style={{ padding: '7px 10px' }}>{row.currentWeight}</td>
                      <td style={{ padding: '7px 10px', color: row.change.startsWith('+') ? 'var(--lift-t)' : row.change === '—' ? 'var(--faint)' : 'var(--race-t)' }}>
                        {row.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Plan */}
      <div className="section-hdr"><span className="ptitle">Weekly plan</span></div>
      <div className="workout-grid">
        {WORKOUT_PLAN.map(group => (
          <div key={group.day} className="workout-day">
            <div className="workout-day-header">
              <span className="workout-day-name">{group.day}</span>
              <span className={`tag ${group.tagCls}`}>{group.tag}</span>
            </div>
            {group.exercises.map((ex, i) => (
              <div key={i} className="exercise-row">
                <div>
                  <div className="exercise-name">{ex.name}</div>
                  {ex.note && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--faint)' }}>{ex.note}</div>}
                </div>
                <div className="exercise-sets">
                  {ex.sets}×{ex.reps || ''}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginTop: 24 }}>
        <div className="section-hdr"><span className="ptitle">Training notes</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {[
            { title: '🏋️ Progressive overload', body: 'Add weight when you hit the top of the rep range for all sets. Log starting weight in Google Sheets. Track weekly.' },
            { title: '🦵 Lower B focus: injury prevention', body: 'Lateral step-downs and hip abduction are key for left Achilles and IT band health. Never skip these. Prioritize over higher-rep work if time-limited.' },
            { title: '🏊 Tri phase adjustments', body: 'Phase 3 (May 5+): reduce lift volume ~20%. Drop isolation work first. Keep compound movements. Prioritize swim and brick sessions.' },
            { title: '⚡ Taper week', body: 'Race week: one light upper body session maximum. No lower body. Nothing heavy within 5 days of race. The hay is in the barn.' },
          ].map((note, i) => (
            <div key={i} className="note">
              <div style={{ fontWeight: 500, marginBottom: 6 }}>{note.title}</div>
              {note.body}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
