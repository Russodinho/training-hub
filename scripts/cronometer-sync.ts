// Standalone sync script — run via `npx tsx scripts/cronometer-sync.ts` (see
// cronometer-sync.ps1). Pulls a year of Cronometer history via the `crono`
// CLI (@milldr/crono, installed globally — automates the real Cronometer
// web UI, since Cronometer has no public API) and backfills it into
// Supabase.
//
// Deliberately INSERT-if-missing / skip-if-present, not upsert: this is a
// backfill tool, not a live sync — it should never overwrite a date that's
// already there (manual edits, earlier imports) just because a re-run
// found it again. Both target tables (nutrition_actuals, biometrics)
// already have a unique constraint on `date` — confirmed by the existing
// /api/nutrition/upload and /api/biometrics/upload routes, which upsert
// onConflict: 'date'. We rely on that same constraint here: a plain
// insert() either succeeds (new date) or fails with Postgres 23505
// (unique violation — date already exists), which we count as "skipped"
// rather than treat as an error.
//
// NOTE on `crono export biometrics`: it returns one row per metric per
// timestamp, not one row per date — and it includes Garmin-sourced vitals
// pushed into Cronometer via Apple Health (Heart Rate, Recovery, Sleep
// Score, Respiration, Sleep), not just Weight/Body Fat. Only Weight and
// Body Fat are written here, matching the existing `biometrics` table's
// schema (weight_lbs, body_fat_pct, lean/fat mass — same formula as
// /api/biometrics/upload). The Garmin-sourced vitals are intentionally
// NOT stored: they'd overlap with garmin_daily_stats, which is already
// fed directly from GarminDB by garmin_sync.py, and writing a second,
// differently-sourced copy of "sleep score" / "resting HR" risks two
// disagreeing sources of truth. Flag to the user if that's wanted later.

import { execSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { createServiceClient } from '../src/lib/supabase'

const LOG_FILE = path.join(process.cwd(), 'cronometer-sync.log')
const RANGE = '365d'

interface NutritionRow {
  date: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  'Fiber (g)'?: number
  [key: string]: unknown
}

interface BiometricRow {
  date: string
  time: string
  metric: string
  unit: string
  amount: number
}

function log(line: string) {
  console.log(line)
  appendFileSync(LOG_FILE, line + '\n')
}

function runCronoExport<T>(type: 'nutrition' | 'biometrics', range: string): T[] {
  const output = execSync(`crono export ${type} -r ${range} --json`, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  return JSON.parse(output) as T[]
}

// Returns true if inserted, false if it already existed (skipped).
async function insertIfMissing(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  table: string,
  row: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await sb.from(table).insert(row)
  if (!error) return true
  if (error.code === '23505') return false // date already exists — expected, not a failure
  throw new Error(`${table} insert failed for date ${row.date}: ${error.message}`)
}

async function syncNutrition(sb: ReturnType<typeof createServiceClient>): Promise<{ inserted: number; skipped: number }> {
  const rows = runCronoExport<NutritionRow>('nutrition', RANGE)
  let inserted = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.date) continue
    const wasInserted = await insertIfMissing(sb, 'nutrition_actuals', {
      date: row.date,
      calories: row.calories ?? null,
      protein: row.protein ?? null,
      fat: row.fat ?? null,
      carbs: row.carbs ?? null,
      fiber: row['Fiber (g)'] ?? null,
      raw_data: row,
    })
    if (wasInserted) inserted++
    else skipped++
  }

  return { inserted, skipped }
}

async function syncBiometrics(sb: ReturnType<typeof createServiceClient>): Promise<{ inserted: number; skipped: number }> {
  const rows = runCronoExport<BiometricRow>('biometrics', RANGE)

  // Long format (one row per metric per timestamp) -> one weight/body-fat
  // pair per date. Last reading of the day wins if there are several.
  const byDate = new Map<string, { weight_lbs: number | null; body_fat_pct: number | null }>()
  for (const row of rows) {
    if (!row.date) continue
    if (!byDate.has(row.date)) byDate.set(row.date, { weight_lbs: null, body_fat_pct: null })
    const entry = byDate.get(row.date)!
    if (row.metric === 'Weight') entry.weight_lbs = row.amount
    if (row.metric === 'Body Fat') entry.body_fat_pct = row.amount
  }

  let inserted = 0
  let skipped = 0

  for (const [date, { weight_lbs, body_fat_pct }] of byDate) {
    if (weight_lbs === null && body_fat_pct === null) continue

    const lean_mass_lbs = weight_lbs && body_fat_pct ? Math.round(weight_lbs * (1 - body_fat_pct / 100) * 10) / 10 : null
    const fat_mass_lbs = weight_lbs && body_fat_pct ? Math.round(weight_lbs * (body_fat_pct / 100) * 10) / 10 : null

    const wasInserted = await insertIfMissing(sb, 'biometrics', {
      date,
      weight_lbs,
      body_fat_pct,
      lean_mass_lbs,
      fat_mass_lbs,
    })
    if (wasInserted) inserted++
    else skipped++
  }

  return { inserted, skipped }
}

async function main() {
  const timestamp = new Date().toISOString()
  log(`\n=== ${timestamp} ===`)

  if (!process.env.CRONO_CRONOMETER_USERNAME || !process.env.CRONO_CRONOMETER_PASSWORD) {
    log('ERROR: CRONO_CRONOMETER_USERNAME / CRONO_CRONOMETER_PASSWORD not set in .env.local')
    process.exit(1)
  }

  const sb = createServiceClient()

  try {
    const nutrition = await syncNutrition(sb)
    log(`nutrition: inserted ${nutrition.inserted}, skipped ${nutrition.skipped} (already present)`)

    const biometrics = await syncBiometrics(sb)
    log(`biometrics: inserted ${biometrics.inserted}, skipped ${biometrics.skipped} (already present)`)

    log('Sync complete.')
  } catch (err) {
    log(`ERROR: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
}

main()
