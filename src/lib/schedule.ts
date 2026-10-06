import type { ProgramDay } from './program'

export interface Block {
  time: string
  name: string
  cls: string
}

export interface ScheduleDay {
  name: string
  tag: string
  blocks: Block[]
}

export const SCHEDULE: ScheduleDay[] = [
  {
    name: 'Monday',
    tag: 'WFH / Soccer',
    blocks: [
      { time: '5:00', name: 'Wake', cls: 'bl-wake' },
      { time: '5:15–5:50', name: 'Gym · Upper A', cls: 'bl-gym' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: 'After dog walk', name: 'Mobility · 01 02 03 08 09 (~19 min)', cls: 'bl-mob' },
      { time: '7:15–8:30', name: 'Prep / chores', cls: 'bl-prep' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '12:00–12:30', name: 'Garden (WFH)', cls: 'bl-garden' },
      { time: '5:00–5:15', name: 'Dog walk', cls: 'bl-dog' },
      { time: '5:15–5:45', name: 'Garden harvest', cls: 'bl-garden' },
      { time: '5:45–6:30', name: 'Dinner', cls: 'bl-dinner' },
      { time: '6:30–7:00', name: 'Cleaning', cls: 'bl-clean' },
      { time: '7:00–7:15', name: 'Guitar · 15 min', cls: 'bl-guitar' },
      { time: '7:15 / 8:15 / 9:15', name: 'Soccer · 100 min', cls: 'bl-soccer' },
      { time: '~10 min before bed', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '~10:00 if early game', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Tuesday',
    tag: 'Commute · Swim + KB',
    blocks: [
      { time: '5:00', name: 'Wake', cls: 'bl-wake' },
      { time: '5:15–5:50', name: 'Swim · 30-35 min', cls: 'bl-swim' },
      { time: '5:50–6:10', name: 'Gym · KB Circuit', cls: 'bl-gym' },
      { time: '6:10–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: 'After dog walk', name: 'Mobility · 03 04 08 09 (~18 min)', cls: 'bl-mob' },
      { time: '7:15–8:45', name: 'Commute →', cls: 'bl-commute' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '5:00–6:30', name: 'Commute ←', cls: 'bl-commute' },
      { time: '6:45–7:00', name: 'Dog walk', cls: 'bl-dog' },
      { time: '7:00–7:45', name: 'Dinner', cls: 'bl-dinner' },
      { time: '7:45–8:15', name: 'Cleaning', cls: 'bl-clean' },
      { time: 'Evening', name: 'Soccer · 40 min (~10-wk season)', cls: 'bl-soccer' },
      { time: '8:15–9:00', name: 'Guitar · 45 min', cls: 'bl-guitar' },
      { time: '9:00–9:30', name: 'Free time', cls: 'bl-free' },
      { time: '9:30–9:45', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Wednesday',
    tag: 'Commute · Run + Yoga',
    blocks: [
      { time: '5:00', name: 'Wake', cls: 'bl-wake' },
      { time: '5:15–6:00', name: 'Run · easy, ~1 mi from home, no pace/distance targets', cls: 'bl-run' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: 'After dog walk', name: 'Mobility · 08 09 (~11 min)', cls: 'bl-mob' },
      { time: '7:15–8:45', name: 'Commute →', cls: 'bl-commute' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '5:00–6:30', name: 'Commute ←', cls: 'bl-commute' },
      { time: '6:45–7:00', name: 'Dog walk', cls: 'bl-dog' },
      { time: '7:00–7:45', name: 'Dinner', cls: 'bl-dinner' },
      { time: '7:45–8:15', name: 'Cleaning', cls: 'bl-clean' },
      { time: 'Evening', name: 'Yoga', cls: 'bl-mob' },
      { time: '8:15–8:45', name: 'Guitar · 30 min', cls: 'bl-guitar' },
      { time: '8:45–9:30', name: 'Free / reset', cls: 'bl-free' },
      { time: '9:30–9:45', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Thursday',
    tag: 'WFH',
    blocks: [
      { time: '5:00', name: 'Wake', cls: 'bl-wake' },
      { time: '5:15–5:55', name: 'Gym · Upper B', cls: 'bl-gym' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: 'After dog walk', name: 'Mobility · 01 02 03 08 09 (~19 min)', cls: 'bl-mob' },
      { time: '7:15–8:30', name: 'Prep / chores', cls: 'bl-prep' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '12:00–12:30', name: 'Garden (WFH)', cls: 'bl-garden' },
      { time: '5:00–5:15', name: 'Dog walk', cls: 'bl-dog' },
      { time: '5:15–5:45', name: 'Garden harvest', cls: 'bl-garden' },
      { time: '5:45–6:30', name: 'Dinner', cls: 'bl-dinner' },
      { time: '6:30–7:00', name: 'Cleaning', cls: 'bl-clean' },
      { time: '7:00–7:45', name: 'Guitar · 45 min', cls: 'bl-guitar' },
      { time: '7:45–9:15', name: 'Free (yoga opt.)', cls: 'bl-free' },
      { time: '9:15–9:30', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Friday',
    tag: 'WFH · Guitar or Climb',
    blocks: [
      { time: '5:00', name: 'Wake', cls: 'bl-wake' },
      { time: '5:15–5:45', name: 'Gym · Legs', cls: 'bl-gym' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: 'After dog walk', name: 'Mobility · 04 05 06 07 08 09 (~27 min)', cls: 'bl-mob' },
      { time: '7:15–8:30', name: 'Prep / chores', cls: 'bl-prep' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '12:00–12:30', name: 'Garden (WFH)', cls: 'bl-garden' },
      { time: '5:00–5:15', name: 'Dog walk', cls: 'bl-dog' },
      { time: '5:15–5:45', name: 'Garden harvest', cls: 'bl-garden' },
      { time: '5:45–6:30', name: 'Dinner', cls: 'bl-dinner' },
      { time: '6:30–7:15 · Opt A', name: 'Guitar · 45 min', cls: 'bl-guitar' },
      { time: '6:30–9:00 · Opt B', name: 'Climbing', cls: 'bl-free' },
      { time: '~10 min before bed', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Saturday',
    tag: 'Brick + Yoga',
    blocks: [
      { time: '5:00', name: 'Wake + breakfast', cls: 'bl-wake' },
      { time: '5:30–7:00', name: 'Brick · bike + run', cls: 'bl-brick' },
      { time: '7:00–7:45', name: 'Yoga', cls: 'bl-mob' },
      { time: '8:00–10:30', name: 'Dog hike · 3–5 mi', cls: 'bl-dog' },
      { time: 'After dog hike', name: 'Mobility · 08 09 (~11 min)', cls: 'bl-mob' },
      { time: '10:30–11:00', name: 'Snack', cls: 'bl-dinner' },
      { time: '12:00–2:00', name: 'Lunch + relax', cls: 'bl-dinner' },
      { time: '2:00–3:00', name: 'Gardening', cls: 'bl-garden' },
      { time: '3:00–4:00', name: 'Guitar · 1 hr', cls: 'bl-guitar' },
      { time: '4:00–6:00', name: 'Free time', cls: 'bl-free' },
      { time: '6:00–6:30', name: 'Light cleaning', cls: 'bl-clean' },
      { time: '~10 min before bed', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: 'Evening', name: 'Relax', cls: 'bl-free' },
    ],
  },
  {
    name: 'Sunday',
    tag: 'Soccer + Prep',
    blocks: [
      { time: '5:00', name: 'Wake + dog + breakfast', cls: 'bl-wake' },
      { time: 'After dog walk', name: 'Mobility · 05 06 08 09 (~19 min)', cls: 'bl-mob' },
      { time: '8:00–12:00', name: 'Soccer · 80 min, 11v11 (Sept–Thanksgiving, Mar–May/Jun)', cls: 'bl-soccer' },
      { time: '12:30–1:30', name: 'Lunch', cls: 'bl-dinner' },
      { time: '1:30–3:00', name: 'Gardening', cls: 'bl-garden' },
      { time: '3:00–4:00', name: 'Guitar · 1 hr', cls: 'bl-guitar' },
      { time: '4:00–5:00', name: 'Free time', cls: 'bl-free' },
      { time: '5:00–6:00', name: 'Cleaning + weekly prep', cls: 'bl-prep' },
      { time: '~10 min before bed', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: 'Evening', name: 'Relax', cls: 'bl-free' },
    ],
  },
]

const DOW_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

// The gym blocks above are placeholders for time slots. The lift itself
// comes from the editable program (/program): each gym block is
// renamed to the program day on that weekday, dropped if no day is
// scheduled there, and a day scheduled on a weekday without a gym slot gets
// one right after waking.
export function applyProgram(day: ScheduleDay, programDays: ProgramDay[]): ScheduleDay {
  const lift = programDays.find(p => p.weekday === DOW_MAP[day.name])
  const hasSlot = day.blocks.some(b => b.cls === 'bl-gym')
  let blocks = day.blocks.flatMap(b => b.cls !== 'bl-gym' ? [b] : lift ? [{ ...b, name: `Gym · ${lift.name}` }] : [])
  if (lift && !hasSlot) {
    const wakeIdx = blocks.findIndex(b => b.cls === 'bl-wake')
    blocks = [...blocks.slice(0, wakeIdx + 1), { time: 'AM', name: `Gym · ${lift.name}`, cls: 'bl-gym' }, ...blocks.slice(wakeIdx + 1)]
  }
  return { ...day, blocks }
}

// Training sessions a schedule day plans, as the same sport buckets
// garminBucket() produces, so planned vs. completed compare like for like.
// A brick counts as a bike and a run (Garmin records them separately).
export function plannedBuckets(day: ScheduleDay): Set<string> {
  const out = new Set<string>()
  for (const b of day.blocks) {
    if (b.cls === 'bl-gym') out.add('lift')
    else if (b.cls === 'bl-swim') out.add('swim')
    else if (b.cls === 'bl-bike') out.add('bike')
    else if (b.cls === 'bl-run') out.add('run')
    else if (b.cls === 'bl-brick') { out.add('bike'); out.add('run') }
    else if (b.cls === 'bl-soccer') out.add('soccer')
    else if (b.cls === 'bl-mob' && /^yoga/i.test(b.name)) out.add('yoga')
  }
  return out
}

export function scheduleWithProgram(programDays?: ProgramDay[]): ScheduleDay[] {
  return programDays ? SCHEDULE.map(d => applyProgram(d, programDays)) : SCHEDULE
}

// `dow` defaults to the server's clock; pass easternNow().getDay() so the
// day doesn't flip early on a UTC server.
export function getTodaySchedule(programDays?: ProgramDay[], dow = new Date().getDay()): ScheduleDay | undefined {
  const day = SCHEDULE.find(d => DOW_MAP[d.name] === dow)
  return day && programDays ? applyProgram(day, programDays) : day
}
