# garmin_sync_poller.ps1 — runs every ~1 min via the GarminSyncPoller
# scheduled task. Checks Supabase for a pending manual sync request (from
# the dashboard's "Sync Garmin now" button) and, if found, runs the real
# sync (garmin_sync_daily.ps1) and reports the result back. When idle,
# this is a single cheap REST read — no local Python/GarminDB work happens
# unless a request is actually pending.

$root       = "C:\Users\mjrus\Documents\Training Website HTML"
$envFile    = Join-Path $root ".env.local"
$syncScript = Join-Path $root "garmin_sync_daily.ps1"
$logFile    = Join-Path $root "garmin_sync_poller.log"

function Get-EnvValue($key, $path) {
    $line = Get-Content $path | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
    if ($line) { return ($line -replace "^$key=", "").Trim() }
    return $null
}

$supabaseUrl = Get-EnvValue "NEXT_PUBLIC_SUPABASE_URL" $envFile
$supabaseKey = Get-EnvValue "NEXT_PUBLIC_SUPABASE_ANON_KEY" $envFile

if (-not $supabaseUrl -or -not $supabaseKey) {
    Add-Content $logFile "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ERROR: missing Supabase env vars in .env.local"
    exit 1
}

$headers = @{
    "apikey"        = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type"  = "application/json"
}

$pendingUrl = "$supabaseUrl/rest/v1/sync_requests?type=eq.garmin&status=eq.pending&order=requested_at.asc&limit=1"

try {
    $pending = Invoke-RestMethod -Uri $pendingUrl -Headers $headers -Method Get
} catch {
    Add-Content $logFile "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ERROR checking pending requests: $($_.Exception.Message)"
    exit 1
}

if (-not $pending -or $pending.Count -eq 0) {
    exit 0
}

$request = $pending[0]
$id = $request.id
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $logFile "`n=== $timestamp — request #$id ==="

$patchUrl = "$supabaseUrl/rest/v1/sync_requests?id=eq.$id"

try {
    Invoke-RestMethod -Uri $patchUrl -Headers $headers -Method Patch -Body (@{ status = "running" } | ConvertTo-Json -Compress) | Out-Null

    & $syncScript
    if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) {
        throw "garmin_sync_daily.ps1 exited with code $LASTEXITCODE"
    }

    $body = @{ status = "done"; completed_at = (Get-Date).ToUniversalTime().ToString("o") } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $patchUrl -Headers $headers -Method Patch -Body $body | Out-Null
    Add-Content $logFile "  -> done"
} catch {
    $errMsg = $_.Exception.Message
    $body = @{ status = "error"; completed_at = (Get-Date).ToUniversalTime().ToString("o"); error = $errMsg } | ConvertTo-Json -Compress
    try { Invoke-RestMethod -Uri $patchUrl -Headers $headers -Method Patch -Body $body | Out-Null } catch {}
    Add-Content $logFile "  -> ERROR: $errMsg"
}
