# garmin_sync_daily.ps1 — runs by Windows Task Scheduler every morning
# Downloads latest Garmin data then pushes it to Supabase
#
# Task Scheduler defaults an action's working directory to
# C:\Windows\System32 when none is set. garmindb_cli.py writes its own
# internal log via a bare relative filename ('garmindb.log'), which
# resolves against that cwd and crashes with a permission error before it
# downloads anything — silently leaving only Step 2 (push whatever's
# already in the local GarminDB cache) to run, re-pushing stale data
# every time. Set-Location to the home dir fixes the crash; NOT the
# project dir, since this project also has its own garmindb.log (see
# $logFile below) at the same relative name — using the project dir would
# just trade the permission error for a file-lock collision between the
# two (confirmed by trial).

Set-Location $env:USERPROFILE

$python  = "C:\Users\mjrus\AppData\Local\Programs\Python\Python312\python.exe"
$cli     = "C:\Users\mjrus\AppData\Local\Programs\Python\Python312\Scripts\garmindb_cli.py"
$sync    = "C:\Users\mjrus\Documents\Training Website HTML\garmin_sync.py"
$logFile = "C:\Users\mjrus\Documents\Training Website HTML\garmindb.log"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $logFile "`n=== $timestamp ==="

# Step 1: download + import + analyze latest from Garmin Connect
#
# Explicit stats instead of --all: --hrv downloads real JSON files every
# run, but every single one comes back `{}` (confirmed by checking all 985
# backfilled files directly) — this Garmin account/device just doesn't
# report HRV. garmindb_cli.py's "have we already got this" check is
# `SELECT MAX(day) FROM hrv`, which is永always empty since nothing ever
# imports, so it re-does a ~985-day historical re-scan on *every* run
# (15-20 min) for data that will never exist. Dropping --hrv is the fix —
# not a bug in our code, just no reason to keep asking for data this
# account has none of. (garmin_sync.py doesn't read HRV anyway.)
& $python $cli --activities --monitoring --rhr --sleep --weight --latest --download --import --analyze 2>&1 | Tee-Object -Append -FilePath $logFile

# Step 2: push all data to Supabase (upsert is idempotent — safe to run daily)
& $python $sync --all 2>&1 | Tee-Object -Append -FilePath $logFile
