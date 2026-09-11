// One-time seed: migrates the hardcoded PLAN exercises from src/app/log/
// page.tsx into the `exercises` table, so Settings > Exercises shows the
// same 28 built-in lifts /log actually uses, and editing one there is
// reflected in the workout log (they're now the same data). Safe to
// re-run — skips any name already present (case-insensitive), since the
// exercises table has no unique constraint on name to upsert against.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// [name, category, sets, reps, rpe, restSeconds] — order matches PLAN's
// declared order exactly, which becomes sort_order below.
const EXERCISES = [
  // upper_a — Push + Delts (isCore items -> 'core', shared with upper_b)
  ['Incline DB or BB Press', 'upper_push', 4, '6-8', '8-9', 90],
  ['Flat DB or Machine Press', 'upper_push', 3, '6-8', '8', 90],
  ['Cable Fly (high-to-low crossover)', 'upper_push', 3, '12-15', '9', 45],
  ['Standing DB OHP', 'upper_push', 3, '8-10', '8-9', 90],
  ['Lateral Raise', 'upper_push', 3, '12-15', '9', 45],
  ['Reverse Cable Fly', 'upper_push', 3, '10', '9', 45],
  ['Cable Triceps Pushdowns', 'upper_push', 3, '12-15', '9', 45],
  ['Hammer Curls', 'upper_push', 3, '10', '8-9', 45],
  ['Weighted Cable Crunches', 'core', 4, '15', '9', 30],
  ['Pallof Press', 'core', 3, '12-15/side', '9', 60],
  // lower_a — Quad Dominant
  ['Hack squat (quad)', 'lower_quad', 4, '4-6', '8-9', 90],
  ['Front foot elevated split squat', 'lower_quad', 3, '10/side', '8-9', 90],
  ['Leg press', 'lower_quad', 3, '10-12', '9', 90],
  ['Seated Hamstring Curl', 'lower_quad', 3, '10-12', '9', 60],
  ['Standing calf raises', 'lower_quad', 3, '12-15', '9', 45],
  // upper_b — Pull + Delts
  ['Lat Pulldown', 'upper_pull', 4, '8-10', '8-9', 90],
  ['Chest Supported Row', 'upper_pull', 4, '8-10', '8-9', 90],
  ['Machine Low Row (single arm)', 'upper_pull', 3, '10-12', '8-9', 60],
  ['Reverse Pec Deck', 'upper_pull', 3, '12-15', '9', 45],
  ['Face Pulls', 'upper_pull', 3, '15', '8', 45],
  ['EZ Bar Preacher Curl', 'upper_pull', 3, '10-12', '8-9', 45],
  ['Rotary Torso', 'core', 3, '12/side', '8-9', 30],
  // lower_b — Glute Dominant
  ['Romanian Deadlift', 'lower_glute', 4, '6-8', '8', 90],
  ['Belted Hip Thrust', 'lower_glute', 4, '10-12', '8-9', 90],
  ['Leg Extension', 'lower_glute', 3, '12', '9', 45],
  ['Hip Abduction', 'lower_glute', 3, '15', '9', 45],
  ['Standing Cable Hip Flexor Pull', 'lower_glute', 3, '12-15/side', '8', 45],
  ['Seated Calf Raises', 'lower_glute', 3, '15', '7', 45],
]

const { data: existing } = await sb.from('exercises').select('name')
const existingNames = new Set((existing ?? []).map(r => r.name.toLowerCase()))

const rows = EXERCISES
  .filter(([name]) => !existingNames.has(name.toLowerCase()))
  .map(([name, category, sets, reps, rpe, rest], i) => ({
    name, category,
    default_sets: sets, default_reps: reps, default_rpe: rpe, rest_seconds: rest,
    is_active: true, sort_order: i + 1,
  }))

if (rows.length === 0) {
  console.log('All PLAN exercises already present — nothing to seed.')
  process.exit(0)
}

const { error } = await sb.from('exercises').insert(rows)
if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
console.log(`Seeded ${rows.length} exercises (skipped ${EXERCISES.length - rows.length} already present).`)
