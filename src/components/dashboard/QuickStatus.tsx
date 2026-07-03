import { getActiveRace, getDaysToRace, RACES } from '@/lib/data'

interface QuickStatusProps {
  mobilityStreak: number
  mobilityToday: { done: number; total: number }
}

const DAY_SCHEDULE: Record<number, { label: string; workouts: string[] }> = {
  0: { label: 'Sunday', workouts: ['Soccer · 8am–12pm', 'Recovery run · 1:30–2pm (easy 2km)'] },
  1: { label: 'Monday', workouts: ['Gym Upper A · 5–6am', 'Soccer · evening'] },
  2: { label: 'Tuesday', workouts: ['Gym Lower A · 5–6am', 'Commute day'] },
  3: { label: 'Wednesday', workouts: ['Swim · 5:15–6am (200m easy)', 'Commute day'] },
  4: { label: 'Thursday', workouts: ['Gym Upper B · 5–6am', 'Run · 7:45–8:15pm (5K build)'] },
  5: { label: 'Friday', workouts: ['Gym Lower B · 5–6am'] },
  6: { label: 'Saturday', workouts: ['Dog hike · 8–10:30am', 'Bike/Brick · 11am–12:15pm'] },
}

export default function QuickStatus({ mobilityStreak, mobilityToday }: QuickStatusProps) {
  const active = getActiveRace()
  const today = new Date()
  const dow = today.getDay()
  const todaySchedule = DAY_SCHEDULE[dow]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Today's schedule */}
      <div className="surface-card">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Today · {todaySchedule.label}
        </div>
        {todaySchedule.workouts.map((w, i) => (
          <div key={i} style={{ fontSize: 13, padding: '5px 0', borderBottom: i < todaySchedule.workouts.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>
            {w}
          </div>
        ))}
      </div>

      {/* Mobility status */}
      <div className="surface-card">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Mobility tonight
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 500 }}>
              {mobilityToday.done}/{mobilityToday.total}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>exercises</span>
          </div>
          {mobilityStreak > 0 && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
              🔥 {mobilityStreak}d streak
            </span>
          )}
        </div>
        <a href="/mobility" style={{ display: 'block', marginTop: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', textDecoration: 'underline' }}>
          Open checklist →
        </a>
      </div>

      {/* Next race */}
      {active && (
        <div className="surface-card">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Next race
          </div>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{active.race.name}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{active.race.dateLabel}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
            {active.race.distances.swim} swim · {active.race.distances.bike} bike · {active.race.distances.run} run
          </div>
        </div>
      )}

      {/* Upcoming races */}
      <div className="surface-card">
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Season at a glance
        </div>
        {RACES.map(race => {
          const d = getDaysToRace(race)
          const isPast = d < -5
          return (
            <div key={race.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border-soft)', opacity: isPast ? 0.4 : 1 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', minWidth: 55, textAlign: 'right' }}>
                {isPast ? 'Done' : d === 0 ? 'Today' : d > 0 ? `${d}d` : ''}
              </span>
              <span style={{ fontSize: 12 }}>{race.name.split(' ').slice(0, 2).join(' ')}</span>
              <span style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
                {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
