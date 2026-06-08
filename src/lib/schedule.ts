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
      { time: '4:45', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–5:45', name: 'Gym · Upper A', cls: 'bl-gym' },
      { time: '5:45–6:00', name: 'Mobility · full routine', cls: 'bl-mob' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: '7:15–8:30', name: 'Prep / chores', cls: 'bl-prep' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '12:00–12:30', name: 'Garden (WFH)', cls: 'bl-garden' },
      { time: '5:00–5:15', name: 'Dog walk', cls: 'bl-dog' },
      { time: '5:15–5:45', name: 'Garden harvest', cls: 'bl-garden' },
      { time: '5:45–6:30', name: 'Dinner', cls: 'bl-dinner' },
      { time: '6:30–7:00', name: 'Cleaning', cls: 'bl-clean' },
      { time: '7:00–7:15', name: 'Guitar · 15 min', cls: 'bl-guitar' },
      { time: '7:15 / 8:15 / 9:15', name: 'Soccer', cls: 'bl-soccer' },
      { time: '~10 min before bed', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '~10:00 if early game', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Tuesday',
    tag: 'Commute',
    blocks: [
      { time: '4:45', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–5:45', name: 'Gym · Lower A', cls: 'bl-gym' },
      { time: '5:45–6:00', name: 'Mobility · full routine', cls: 'bl-mob' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: '7:15–8:45', name: 'Commute →', cls: 'bl-commute' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '5:00–6:30', name: 'Commute ←', cls: 'bl-commute' },
      { time: '6:45–7:00', name: 'Dog walk', cls: 'bl-dog' },
      { time: '7:00–7:45', name: 'Dinner', cls: 'bl-dinner' },
      { time: '7:45–8:15', name: 'Cleaning', cls: 'bl-clean' },
      { time: '8:15–9:00', name: 'Guitar · 45 min', cls: 'bl-guitar' },
      { time: '9:00–9:30', name: 'Free time', cls: 'bl-free' },
      { time: '9:30–9:45', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Wednesday',
    tag: 'Commute · Rest',
    blocks: [
      { time: '5:45', name: 'Wake', cls: 'bl-wake' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
      { time: '7:15–8:45', name: 'Commute →', cls: 'bl-commute' },
      { time: '9:00–5:00', name: 'Work', cls: 'bl-work' },
      { time: '5:00–6:30', name: 'Commute ←', cls: 'bl-commute' },
      { time: '6:45–7:00', name: 'Dog walk', cls: 'bl-dog' },
      { time: '7:00–7:45', name: 'Dinner', cls: 'bl-dinner' },
      { time: '7:45–8:15', name: 'Cleaning', cls: 'bl-clean' },
      { time: '8:15–8:45', name: 'Guitar · 30 min', cls: 'bl-guitar' },
      { time: '8:45–9:00', name: 'Ankle + calf only (08+09)', cls: 'bl-mob' },
      { time: '9:00–9:30', name: 'Free / reset', cls: 'bl-free' },
      { time: '9:30–9:45', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: '10:00', name: 'Sleep', cls: 'bl-sleep' },
    ],
  },
  {
    name: 'Thursday',
    tag: 'WFH',
    blocks: [
      { time: '4:45', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–5:45', name: 'Gym · Upper B', cls: 'bl-gym' },
      { time: '5:45–6:00', name: 'Mobility · full routine', cls: 'bl-mob' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
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
      { time: '4:45', name: 'Wake', cls: 'bl-wake' },
      { time: '5:00–5:45', name: 'Gym · Lower B', cls: 'bl-gym' },
      { time: '5:45–6:00', name: 'Mobility · full routine', cls: 'bl-mob' },
      { time: '6:00–7:15', name: 'Dog walk + shower', cls: 'bl-dog' },
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
    tag: 'Easy start',
    blocks: [
      { time: '7:00–8:00', name: 'Wake + breakfast', cls: 'bl-wake' },
      { time: '8:00–10:30', name: 'Dog hike · 3–5 mi', cls: 'bl-dog' },
      { time: '10:30–11:00', name: 'Snack', cls: 'bl-dinner' },
      { time: '11:00–11:45', name: 'Cycling (opt.)', cls: 'bl-free' },
      { time: '12:00–2:00', name: 'Lunch + relax', cls: 'bl-dinner' },
      { time: '2:00–3:00', name: 'Gardening', cls: 'bl-garden' },
      { time: '3:00–4:00', name: 'Guitar · 1 hr', cls: 'bl-guitar' },
      { time: '4:00–6:00', name: 'Free time', cls: 'bl-free' },
      { time: '6:00–6:30', name: 'Light cleaning', cls: 'bl-clean' },
      { time: 'Evening', name: 'Ankle + calf only (08+09)', cls: 'bl-mob' },
      { time: '~10 min before bed', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: 'Evening', name: 'Relax', cls: 'bl-free' },
    ],
  },
  {
    name: 'Sunday',
    tag: 'Soccer + Prep',
    blocks: [
      { time: '7:00–8:00', name: 'Wake + dog + breakfast', cls: 'bl-wake' },
      { time: '8:00–12:00', name: 'Soccer window', cls: 'bl-soccer' },
      { time: '12:30–1:30', name: 'Lunch', cls: 'bl-dinner' },
      { time: '1:30–3:00', name: 'Gardening', cls: 'bl-garden' },
      { time: '3:00–4:00', name: 'Guitar · 1 hr', cls: 'bl-guitar' },
      { time: '4:00–5:00', name: 'Free time', cls: 'bl-free' },
      { time: '5:00–6:00', name: 'Cleaning + weekly prep', cls: 'bl-prep' },
      { time: 'Evening', name: 'Ankle + calf only (08+09)', cls: 'bl-mob' },
      { time: '~10 min before bed', name: 'Wind-down stretch', cls: 'bl-wind' },
      { time: 'Evening', name: 'Relax', cls: 'bl-free' },
    ],
  },
]

const DOW_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

export function getTodaySchedule(): ScheduleDay | undefined {
  const dow = new Date().getDay()
  return SCHEDULE.find(d => DOW_MAP[d.name] === dow)
}
