#!/usr/bin/env bash
# garmin_sync.sh — Download latest Garmin data then push to Supabase
# Run daily (manually or via Task Scheduler)
#
# Usage:
#   ./garmin_sync.sh           # fetch latest + sync last 7 days
#   ./garmin_sync.sh --all     # fetch latest + sync all history

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GARMINDB_CLI="$HOME/AppData/Local/Programs/Python/Python312/Scripts/garmindb_cli.py"
PYTHON="$HOME/AppData/Local/Programs/Python/Python312/python.exe"

echo "=== Step 1: Download + import + analyze latest Garmin data ==="
"$PYTHON" "$GARMINDB_CLI" --all --latest --download --import --analyze

echo ""
echo "=== Step 2: Push to Supabase ==="
cd "$SCRIPT_DIR"

if [[ "${1:-}" == "--all" ]]; then
  "$PYTHON" garmin_sync.py --all
else
  "$PYTHON" garmin_sync.py --days 7
fi

echo ""
echo "✅  Garmin sync complete"
