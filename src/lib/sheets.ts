import Papa from 'papaparse'

const SHEET_URLS = {
  workouts: process.env.NEXT_PUBLIC_SHEET_URL_WORKOUTS!,
  nutrition: process.env.NEXT_PUBLIC_SHEET_URL_NUTRITION!,
  bricks: process.env.NEXT_PUBLIC_SHEET_URL_BRICKS!,
  progress: process.env.NEXT_PUBLIC_SHEET_URL_PROGRESS!,
  sleep: process.env.NEXT_PUBLIC_SHEET_URL_SLEEP!,
  mobility: process.env.NEXT_PUBLIC_SHEET_URL_MOBILITY!,
}

export type SheetName = keyof typeof SHEET_URLS

// Raw fetch — returns string[][] (no header row consumed). Used for non-standard CSVs.
export async function fetchSheetRaw(name: SheetName): Promise<string[][]> {
  const url = SHEET_URLS[name]
  if (!url) return []
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const csv = await res.text()
  const result = Papa.parse<string[]>(csv, { header: false, skipEmptyLines: false })
  return result.data as string[][]
}

export async function fetchSheet(name: SheetName): Promise<Record<string, string>[]> {
  const url = SHEET_URLS[name]
  if (!url) return []

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []

  const csv = await res.text()
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  return result.data
}

// Parse progress sheet: expects columns Date, Weight, BodyFat, Notes
export interface ProgressEntry {
  date: string
  weight: number | null
  bodyFat: number | null
  notes: string
}

export function parseProgressSheet(rows: Record<string, string>[]): ProgressEntry[] {
  return rows.map(row => ({
    date: row.Date || row.date || '',
    weight: parseFloat(row.Weight || row.weight || '') || null,
    bodyFat: parseFloat(row['Body Fat'] || row.bodyFat || row.bf || '') || null,
    notes: row.Notes || row.notes || '',
  })).filter(e => e.date)
}

// Parse workout sheet: expects Exercise, Sets, Reps, Weight columns
export interface WorkoutEntry {
  exercise: string
  sets: string
  reps: string
  startWeight: string
  currentWeight: string
  change: string
}

export function parseWorkoutSheet(rows: Record<string, string>[]): WorkoutEntry[] {
  return rows.map(row => {
    const start = parseFloat(row['Start Weight'] || row.startWeight || '')
    const current = parseFloat(row['Current Weight'] || row.currentWeight || row.Weight || '')
    const pct = start && current ? (((current - start) / start) * 100).toFixed(0) : ''
    return {
      exercise: row.Exercise || row.exercise || '',
      sets: row.Sets || row.sets || '',
      reps: row.Reps || row.reps || '',
      startWeight: start ? `${start} lbs` : '—',
      currentWeight: current ? `${current} lbs` : '—',
      change: pct ? `${Number(pct) > 0 ? '+' : ''}${pct}%` : '—',
    }
  }).filter(e => e.exercise)
}

