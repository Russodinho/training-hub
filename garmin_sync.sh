#!/usr/bin/env bash
# garmin_sync.sh — Download latest Garmin data then push to Supabase
# Run daily (manually or via Task Scheduler / cron)
#
# Usage:
#   ./garmin_sync.sh           # fetch latest + sync last 7 days
#   ./garmin_sync.sh --all     # fetch latest + sync all history

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Step 1: Download + import + analyze latest Garmin data ==="
garmindb_cli.py --all --latest --download --import --analyze

echo ""
echo "=== Step 2: Push to Supabase ==="
cd "$SCRIPT_DIR"

if [[ "${1:-}" == "--all" ]]; then
  python garmin_sync.py --all
else
  python garmin_sync.py --days 7
fi

echo ""
echo "✅  Garmin sync complete"
