import { SCHEDULE } from '@/lib/schedule'

const LEGEND: [string, string][] = [
  ['bl-gym', 'Gym'],
  ['bl-mob', 'Mobility (post-workout)'],
  ['bl-wind', 'Wind-down (pre-sleep)'],
  ['bl-guitar', 'Guitar'],
  ['bl-soccer', 'Soccer'],
  ['bl-dog', 'Dog / hike'],
  ['bl-garden', 'Garden'],
  ['bl-commute', 'Commute'],
  ['bl-work', 'Work'],
  ['bl-free', 'Free / optional'],
  ['bl-sleep', 'Sleep'],
]

export default function SchedulePage() {
  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>In-Season Schedule</h2>
          <div className="sub">Spring &amp; Fall · all 7 days</div>
        </div>
        <div className="page-header-right">
          No massage gun<br />
          No active movements<br />
          Dark room · slow breathing
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        {LEGEND.map(([cls, label]) => (
          <div key={cls} className="leg">
            <div className={`ldot ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* 7-day grid */}
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Note bar */}
      <div className="note" style={{ marginTop: 20, fontSize: 11, lineHeight: 1.8 }}>
        <strong>Mobility:</strong> Full 9-exercise routine done post-workout on gym days (Mon/Tue/Thu/Fri). Non-gym days (Wed/Sat/Sun) — ankle + calf only (exercises 08+09) in the evening. Yoga nights (Thu opt.) cover exercises 01–07.
        {' '}<strong>Wind-down:</strong> 5 passive stretches (~10 min) every night before bed. No massage gun, no active movements — parasympathetic only. Legs up the wall, spinal twist, child&apos;s pose, 90/90 breathing, neck release.
      </div>
    </div>
  )
}
