# cronometer-sync.ps1 — runs the TypeScript backfill script that pulls a
# year of Cronometer history via the `crono` CLI and inserts any missing
# dates into Supabase. See scripts/cronometer-sync.ts for the actual logic
# and cronometer-sync.log for run history — this wrapper just invokes it,
# same role as garmin_sync_run.bat does for garmin_sync_daily.ps1.

Set-Location "C:\Users\mjrus\Documents\Training Website HTML"
npx tsx scripts/cronometer-sync.ts
