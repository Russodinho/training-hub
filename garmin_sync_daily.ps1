# garmin_sync_daily.ps1 — runs by Windows Task Scheduler every morning
# Downloads latest Garmin data then pushes it to Supabase

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
