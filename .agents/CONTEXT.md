# Training Hub — Agent Context

## Stack
Next.js 15, TypeScript, Tailwind CSS, Supabase, Recharts

## Data Sources
- Garmin sync (garmin_sync.py / garmin_sync.ps1) → garmin_activities, garmin_daily_stats
- Google Sheets (src/lib/sheets.ts) → workouts sheet (training-log), progress sheet
- Cronometer CSV upload → biometrics, nutrition_actuals (api/biometrics, api/nutrition)
- Strava integration was removed (see HANDOFF.md 2026-09-10) — do not re-add
  src/lib/strava.ts or src/app/api/strava/* without re-wiring the dashboard to it.

## Pages
Live routes: /, cardio, fuel, injuries, log, mobility, race-calendar, race-day,
recovery, season-plan, settings/exercises, sleep, training-log, wind-down.

/nutrition, /meal-hub, /supplements redirect → /fuel
/workouts, /progress redirect → /training-log
/tri-plan, /stretch-goals redirect → /season-plan
/schedule redirects → /
(see next.config.js `redirects()` — the old page files were deleted 2026-09-10,
don't recreate them; extend the pages they redirect to instead)

## Key Files
- src/lib/supabase.ts — database client
- src/app/page.tsx — main dashboard
- src/components/ — shared components

## Dev Server
npm run dev → http://localhost:3000

## Deployment
[fill in where this is hosted]

## Current Goal
[fill in what you're building right now]