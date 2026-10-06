// Calendar training phases, independent of any race. Drives the dashboard
// "Training week" tile and the coaches' phase when no race is close enough
// to set a race-based phase (see agentContext.ts). Add the next phase here
// when it's planned.

export interface TrainingPhase {
  name: string
  start: string // YYYY-MM-DD, inclusive
  end: string | null // YYYY-MM-DD, inclusive; null = open-ended
  focus: string
}

export const TRAINING_PHASES: TrainingPhase[] = [
  {
    name: 'Consistency',
    start: '2026-09-25',
    end: '2026-12-31',
    focus: 'Consistency only: no volume or PR push. Lock in the structure and protect sleep. Deload every 4th-6th week (all lifts RPE 8).',
  },
  {
    name: 'Olympic tri build',
    start: '2027-01-01',
    end: null,
    focus: 'Olympic-distance triathlon build. Lifting will likely shrink to fit.',
  },
]

const dayNum = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86400000

// The phase containing `date` (YYYY-MM-DD) and which week of it that is
// (week 1 = the phase's first 7 days).
export function phaseOn(date: string): { phase: TrainingPhase; week: number } | null {
  const phase = TRAINING_PHASES.find(p => date >= p.start && (p.end == null || date <= p.end))
  if (!phase) return null
  return { phase, week: Math.floor((dayNum(date) - dayNum(phase.start)) / 7) + 1 }
}
