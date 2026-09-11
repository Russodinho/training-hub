# cronometer_sync.ps1 — same Task Scheduler pattern as garmin_sync_daily.ps1.
# Scans Downloads for a Cronometer CSV export, posts it to the app's import
# endpoint, archives the processed file, and logs the result with a timestamp.
#
# NOTE: $apiUrl points at port 3001 as specified. This app's dev server
# (npm run dev) defaults to port 3000 — if you're not running a separate
# instance on 3001, update this to match whatever's actually serving the app.

$downloadsDir = "C:\Users\mjrus\Downloads"
$archiveDir   = "C:\Users\mjrus\Documents\Training Website HTML\cronometer-archive"
$logFile      = "C:\Users\mjrus\Documents\Training Website HTML\cronometer_sync.log"
$apiUrl       = "http://localhost:3001/api/nutrition/cronometer-import"

if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

$files = Get-ChildItem -Path $downloadsDir -Filter "cronometer*.csv" -File -ErrorAction SilentlyContinue

if (-not $files) {
    exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $logFile "`n=== $timestamp ==="

foreach ($file in $files) {
    Add-Content $logFile "Found $($file.Name)"
    try {
        $csvContent = Get-Content -Path $file.FullName -Raw
        $body = @{ csv = $csvContent } | ConvertTo-Json -Compress
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
        Add-Content $logFile "  -> $($response.message)"

        $archiveName = "$(Get-Date -Format 'yyyyMMdd_HHmmss')_$($file.Name)"
        Move-Item -Path $file.FullName -Destination (Join-Path $archiveDir $archiveName) -Force
        Add-Content $logFile "  -> archived as $archiveName"
    } catch {
        Add-Content $logFile "  -> ERROR: $($_.Exception.Message)"
    }
}
