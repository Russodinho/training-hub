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
#
# Concurrency: this script gets triggered from more than one place — the
# Task Scheduler's own morning trigger, garmin_sync_poller.ps1 invoking it
# inline for a manual "Sync Garmin now" click, and anyone running it by
# hand. Two instances writing to the same $logFile at once throw "the
# process cannot access the file ... because it is being used by another
# process" and the loser aborts with that as its sync_requests error —
# confirmed happening for real on 2026-09-14, when a manual run collided
# with the poller draining a 2-day backlog of queued sync requests. A
# named mutex serializes them instead of letting them collide.

$mutex = New-Object System.Threading.Mutex($false, "Global\GarminSyncDaily")
if (-not $mutex.WaitOne([TimeSpan]::FromMinutes(10))) {
    Write-Output "Another garmin_sync_daily.ps1 is already running and didn't finish within 10 minutes — skipping this run."
    exit 1
}

try {
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
} finally {
    $mutex.ReleaseMutex()
}
