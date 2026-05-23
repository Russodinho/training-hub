interface Block {
  time: string
  name: string
  detail?: string
  cls: string
}

interface Day {
  name: string
  tag: string
  blocks: Block[]
}

const SCHEDULE: Day[] = [
  {
    name: 'Monday',
    tag: 'WFH / Soccer',
    blocks: [
      { time: '4:45 am', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–6:00', name: 'Gym · Upper A', detail: 'Incline press · flat press · OHP · laterals · dips · pushdowns · core', cls: 'bl-gym' },
      { time: '6:15–7:00', name: 'Prep + commute-free', cls: 'bl-prep' },
      { time: '7:00–9:00', name: 'Work block', cls: 'bl-work' },
      { time: '12:00–12:30', name: 'Dog walk', cls: 'bl-dog' },
      { time: '2:00–5:00', name: 'Work block', cls: 'bl-work' },
      { time: '5:00–5:45', name: 'Dinner', cls: 'bl-dinner' },
      { time: '6:00–8:00', name: 'Soccer', cls: 'bl-soccer' },
      { time: '9:30', name: 'Mobility · 08+09 only', detail: 'Ankle stretch + calf stretch', cls: 'bl-run' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Tuesday',
    tag: 'Commute + Gym',
    blocks: [
      { time: '4:45 am', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–6:00', name: 'Gym · Lower A', detail: 'RDL · hack squat · split squat · leg press · calf raises', cls: 'bl-gym' },
      { time: '6:15–7:15', name: 'Commute', cls: 'bl-commute' },
      { time: '7:30–5:00', name: 'Office', cls: 'bl-work' },
      { time: '5:00–6:00', name: 'Commute home', cls: 'bl-commute' },
      { time: '6:00–7:00', name: 'Dinner', cls: 'bl-dinner' },
      { time: '7:30–8:00', name: 'Free / guitar / garden', cls: 'bl-free' },
      { time: '9:30', name: 'Mobility · full routine', detail: 'All 9 exercises · ~18 min', cls: 'bl-run' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Wednesday',
    tag: 'Swim + Commute',
    blocks: [
      { time: '5:00 am', name: 'Wake', cls: 'bl-wake' },
      { time: '5:15–6:00', name: 'Swim', detail: '200m easy · 13 lengths · breathing focus', cls: 'bl-swim' },
      { time: '6:30–7:30', name: 'Commute', cls: 'bl-commute' },
      { time: '7:45–5:00', name: 'Office', cls: 'bl-work' },
      { time: '5:00–6:00', name: 'Commute home', cls: 'bl-commute' },
      { time: '6:00–7:00', name: 'Dinner', cls: 'bl-dinner' },
      { time: '7:30–8:00', name: 'Free / guitar', cls: 'bl-free' },
      { time: '9:00', name: 'Yoga night · 08+09', detail: 'Wall ankle + calf stretch only', cls: 'bl-run' },
      { time: '9:30', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Thursday',
    tag: 'Gym + Run',
    blocks: [
      { time: '4:45 am', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–6:00', name: 'Gym · Upper B', detail: 'Pull-ups · shrugs · rows · rear delt · curls · core · finisher', cls: 'bl-gym' },
      { time: '6:15–7:00', name: 'Prep + commute-free', cls: 'bl-prep' },
      { time: '7:00–9:00', name: 'Work block', cls: 'bl-work' },
      { time: '12:00–12:30', name: 'Dog walk', cls: 'bl-dog' },
      { time: '2:00–5:30', name: 'Work block', cls: 'bl-work' },
      { time: '5:30–6:15', name: 'Dinner', cls: 'bl-dinner' },
      { time: '7:45–8:15', name: 'Run', detail: '5K build · start easy · tempo last mile', cls: 'bl-run' },
      { time: '9:30', name: 'Mobility · full routine', detail: 'All 9 exercises', cls: 'bl-run' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Friday',
    tag: 'Gym + Recovery',
    blocks: [
      { time: '4:45 am', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–6:00', name: 'Gym · Lower B', detail: 'RDL · Bulgarian SS · step-downs · hip abduction · hip flexor · ham curl · calf', cls: 'bl-gym' },
      { time: '6:15–7:00', name: 'Prep', cls: 'bl-prep' },
      { time: '7:00–9:00', name: 'Work block', cls: 'bl-work' },
      { time: '12:00–12:30', name: 'Dog walk', cls: 'bl-dog' },
      { time: '2:00–5:00', name: 'Work block', cls: 'bl-work' },
      { time: '5:00–6:00', name: 'Dinner', cls: 'bl-dinner' },
      { time: '6:00–8:00', name: 'Guitar or climbing', cls: 'bl-guitar' },
      { time: '9:30', name: 'Mobility · full routine', detail: 'All 9 exercises', cls: 'bl-run' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Saturday',
    tag: 'Hike + Bike/Brick',
    blocks: [
      { time: '7:00 am', name: 'Wake', cls: 'bl-wake' },
      { time: '7:30–8:00', name: 'Breakfast + coffee', cls: 'bl-prep' },
      { time: '8:00–10:30', name: 'Dog hike', detail: 'Pennypack · ~2.5 hrs · easy pace · ankle terrain', cls: 'bl-dog' },
      { time: '10:30–11:00', name: 'Prep + fuel up', cls: 'bl-prep' },
      { time: '11:00–12:15', name: 'Bike or Brick', detail: 'Stationary or outdoor · 82 RPM · → run if brick', cls: 'bl-brick' },
      { time: '12:30–2:00', name: 'Lunch + recovery', cls: 'bl-dinner' },
      { time: '2:00–4:00', name: 'Garden / clean / free', cls: 'bl-garden' },
      { time: '6:00–7:00', name: 'Dinner', cls: 'bl-dinner' },
      { time: '8:00–9:00', name: 'Yoga night · 08+09', detail: 'Wall ankle + calf stretch', cls: 'bl-run' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Sunday',
    tag: 'Soccer + Recovery',
    blocks: [
      { time: '7:00 am', name: 'Wake', cls: 'bl-wake' },
      { time: '7:30–8:00', name: 'Breakfast + coffee', cls: 'bl-prep' },
      { time: '8:00–12:00', name: 'Soccer', detail: '4 hrs · high load · most calories burned', cls: 'bl-soccer' },
      { time: '12:00–1:00', name: 'Lunch + refuel', cls: 'bl-dinner' },
      { time: '1:30–2:00', name: 'Recovery run', detail: 'Easy 2km · flush legs · conversational pace', cls: 'bl-run' },
      { time: '2:00–4:00', name: 'Chill / nap / free', cls: 'bl-free' },
      { time: '6:00–7:00', name: 'Dinner', cls: 'bl-dinner' },
      { time: '8:00–9:00', name: 'Mobility · full routine', detail: 'All 9 exercises · prep for week ahead', cls: 'bl-run' },
      { time: '9:30', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
]

export default function SchedulePage() {
  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Weekly Schedule</h2>
          <div className="sub">Typical training week · all 7 days</div>
        </div>
        <div className="page-header-right">
          Wake 4:45 Mon/Tue/Thu/Fri<br />
          Yoga nights: Wed + Sat
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        {[
          ['bl-gym', 'Gym'],
          ['bl-swim', 'Swim'],
          ['bl-bike', 'Bike'],
          ['bl-run', 'Run / Mobility'],
          ['bl-brick', 'Brick'],
          ['bl-soccer', 'Soccer'],
          ['bl-dog', 'Dog / Hike'],
          ['bl-sleep', 'Sleep'],
          ['bl-commute', 'Commute'],
          ['bl-work', 'Work'],
        ].map(([cls, label]) => (
          <div key={cls} className="leg">
            <div className={`ldot ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="sched-grid">
        {SCHEDULE.map(day => (
          <div key={day.name} className="sched-day">
            <div className="sched-day-header">
              <div className="sched-day-name">{day.name}</div>
              <div className="sched-day-tag">{day.tag}</div>
            </div>
            <div className="sched-blocks">
              {day.blocks.map((block, i) => (
                <div key={i} className={`block ${block.cls}`}>
                  <div className="block-time">{block.time}</div>
                  <div className="block-name">{block.name}</div>
                  {block.detail && <div className="block-detail">{block.detail}</div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {[
          { title: '🌙 Yoga night (Wed + Sat)', body: 'Only exercises 08 + 09 required — wall ankle stretch and calf stretch. The full 9-exercise routine is skipped on these nights.' },
          { title: '🏋️ Gym timing', body: 'Gym at 5–6am every weekday. Upper A (Mon) → Lower A (Tue) → Swim (Wed) → Upper B (Thu) → Lower B (Fri). Upper and Lower alternate.' },
          { title: '🚴 Saturday bike/brick', body: 'After morning dog hike. Stationary bike or outdoor ride. Phase 2+ adds a short run off the bike. Target 82 RPM throughout.' },
          { title: '⚡ Training load', body: 'Heaviest day: Monday (Upper A + Soccer). Lightest: Wednesday (swim only). Tri sessions layer on top of existing gym schedule.' },
        ].map((note, i) => (
          <div key={i} className="note">
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{note.title}</div>
            {note.body}
          </div>
        ))}
      </div>
    </div>
  )
}
