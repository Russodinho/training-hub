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
& $python $cli --all --latest --download --import --analyze 2>&1 | Tee-Object -Append -FilePath $logFile

# Step 2: push all data to Supabase (upsert is idempotent — safe to run daily)
& $python $sync --all 2>&1 | Tee-Object -Append -FilePath $logFile
