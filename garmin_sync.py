#!/usr/bin/env python3
"""
garmin_sync.py — Sync GarminDB SQLite → Supabase

Usage:
  python garmin_sync.py              # sync last 7 days
  python garmin_sync.py --days 30    # sync last 30 days
  python garmin_sync.py --all        # sync everything

Requirements:
  pip install supabase
  (garmindb must have already run --download --import --analyze)

Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local
"""

import argparse
import json
import os
import sqlite3
import sys

# Windows' default console codepage (cp1252) can't encode the emoji used in
# the status messages below, which crashes the script before anything runs
# (both interactively and under Task Scheduler). Force UTF-8 stdout/stderr.
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, 'reconfigure'):
        _stream.reconfigure(encoding='utf-8', errors='replace')
from datetime import date, datetime, timedelta
from pathlib import Path

# ── Load env from .env.local ────────────────────────────────────────────────────
def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, _, v = line.partition('=')
        k = k.strip()
        v = v.strip().strip('"\'')
        os.environ.setdefault(k, v)

_load_dotenv(Path(__file__).parent / '.env.local')
_load_dotenv(Path(__file__).parent / '.env')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit('❌  Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')

# ── GarminDB default paths ──────────────────────────────────────────────────────
# GarminDB stores DBs in ~/HealthData/DBs/ by default.
# If you customised the path in ~/.GarminDB/GarminConnectConfig.json, change this.
HEALTH_DIR    = Path.home() / 'HealthData' / 'DBs'
DB_ACTIVITIES = HEALTH_DIR / 'garmin_activities.db'
DB_SUMMARY    = HEALTH_DIR / 'garmin_summary.db'
DB_MONITORING = HEALTH_DIR / 'garmin_monitoring.db'

# ── Sport type mapping ──────────────────────────────────────────────────────────
_SPORT_MAP = {
    'running':                 'running',
    'trail_running':           'running',
    'cycling':                 'cycling',
    'indoor_cycling':          'cycling',
    'virtual_ride':            'cycling',
    'mountain_biking':         'cycling',
    'swimming':                'swimming',
    'open_water_swimming':     'swimming',
    'pool_swimming':           'swimming',
    'lap_swimming':            'swimming',
    'soccer':                  'soccer',
    'football':                'soccer',
    'hiking':                  'hiking',
    'walking':                 'walking',
    'strength_training':       'strength',
    'weight_training':         'strength',
    'training':                'strength',
    'stand_up_paddleboarding': 'paddleboard',
    'surfing':                 'surfing',
    'yoga':                    'yoga',
    'generic':                 'other',
    'transition':              'other',
    'multi_sport':             'other',
}

def _normalize_sport(sport, sub_sport=None) -> str:
    for val in [sport, sub_sport]:
        if not val:
            continue
        key = str(val).lower().replace(' ', '_').replace('-', '_')
        mapped = _SPORT_MAP.get(key)
        if mapped:
            return mapped
    return str(sport or 'other').lower().replace(' ', '_')


# ── Conversion helpers ──────────────────────────────────────────────────────────
def _to_minutes(val) -> float | None:
    """HH:MM:SS string, integer seconds, or float seconds → decimal minutes."""
    if val is None:
        return None
    if isinstance(val, str) and ':' in val:
        parts = val.split(':')
        try:
            if len(parts) == 3:
                h, m, s = int(parts[0]), int(parts[1]), float(parts[2])
            else:
                h, m, s = 0, int(parts[0]), float(parts[1])
            return round((h * 3600 + m * 60 + s) / 60, 2)
        except (ValueError, IndexError):
            return None
    try:
        secs = float(val)
        return round(secs / 60, 2) if secs > 0 else None
    except (TypeError, ValueError):
        return None

def _to_km(val) -> float | None:
    """GarminDB stores distance in meters. Convert to km."""
    if val is None:
        return None
    try:
        m = float(val)
        if m <= 0:
            return None
        # Heuristic: values > 500 are almost certainly meters, not km
        return round(m / 1000, 3) if m > 500 else round(m, 3)
    except (TypeError, ValueError):
        return None

def _pace_from_speed(speed_ms) -> str | None:
    """m/s → 'M:SS /km' pace string for runs."""
    try:
        ms = float(speed_ms)
        if ms <= 0:
            return None
        spk = 1000 / ms
        return f'{int(spk // 60)}:{int(spk % 60):02d}'
    except (TypeError, ValueError, ZeroDivisionError):
        return None

def _get(d: dict, *keys):
    for k in keys:
        v = d.get(k)
        if v is not None:
            return v
    return None

def _columns(conn: sqlite3.Connection, table: str) -> set[str]:
    try:
        return {r[1] for r in conn.execute(f'PRAGMA table_info("{table}")').fetchall()}
    except Exception:
        return set()

def _date_from_start(start) -> str | None:
    if not start:
        return None
    s = str(start)
    return s[:10] if len(s) >= 10 else None


# ── Activities sync ─────────────────────────────────────────────────────────────
def sync_activities(since: date, sb) -> int:
    if not DB_ACTIVITIES.exists():
        print(f'⚠️  {DB_ACTIVITIES} not found — run garmindb_cli.py --all --download --import --analyze first')
        return 0

    conn = sqlite3.connect(str(DB_ACTIVITIES))
    conn.row_factory = sqlite3.Row

    # GarminDB may name this table 'activities' in garmin_activities.db
    table = 'activities'
    cols = _columns(conn, table)
    if not cols:
        print(f'⚠️  Table "{table}" not found in {DB_ACTIVITIES}')
        conn.close()
        return 0

    # Date filter: start_time is a datetime string like '2024-03-15 07:30:00'
    rows = conn.execute(
        f'SELECT * FROM "{table}" WHERE date(start_time) >= ? ORDER BY start_time DESC',
        (since.isoformat(),)
    ).fetchall()
    conn.close()

    if not rows:
        print('   No activity rows in range.')
        return 0

    records = []
    for r in rows:
        d = dict(r)
        act_id = str(_get(d, 'activity_id', 'id') or '').strip()
        if not act_id:
            continue

        sport      = _normalize_sport(d.get('sport'), d.get('sub_sport'))
        elapsed    = _to_minutes(_get(d, 'elapsed_time', 'moving_time', 'duration'))
        dist_km    = _to_km(_get(d, 'distance'))
        avg_speed  = _get(d, 'avg_speed')
        start      = d.get('start_time', '')
        act_date   = _date_from_start(start)

        records.append({
            'id':            act_id,
            'date':          act_date,
            'activity_type': sport,
            'name':          d.get('name'),
            'duration_min':  elapsed,
            'distance_km':   dist_km,
            'avg_hr':        _get(d, 'avg_hr'),
            'max_hr':        _get(d, 'max_hr'),
            'calories':      _get(d, 'calories'),
            'avg_pace':      _pace_from_speed(avg_speed) if sport == 'running' else None,
            'raw_data':      json.dumps({k: str(v) for k, v in d.items() if v is not None}),
        })

    if not records:
        return 0

    sb.table('garmin_activities').upsert(records, on_conflict='id').execute()
    return len(records)


# ── Daily stats sync ────────────────────────────────────────────────────────────
def sync_daily_stats(since: date, sb) -> int:
    # GarminDB may put daily summaries in garmin_summary.db or garmin_monitoring.db
    candidates = [
        (DB_SUMMARY,    'days_summary'),
        (DB_SUMMARY,    'daily_summary'),
        (DB_MONITORING, 'daily_summary'),
        (DB_MONITORING, 'days_summary'),
    ]

    for db_path, table in candidates:
        if not db_path.exists():
            continue
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cols = _columns(conn, table)
        if not cols:
            conn.close()
            continue

        date_col = 'day' if 'day' in cols else 'date'
        rows = conn.execute(
            f'SELECT * FROM "{table}" WHERE {date_col} >= ? ORDER BY {date_col} DESC',
            (since.isoformat(),)
        ).fetchall()
        conn.close()

        records = []
        for r in rows:
            d = dict(r)
            day = d.get('day') or d.get('date')
            if not day:
                continue
            weight_val = _get(d, 'weight', 'weight_kg')
            # GarminDB stores weight in kg when metric, or lbs when imperial
            # We store as kg; if value is suspiciously large it may be lbs
            weight_kg = None
            if weight_val is not None:
                try:
                    w = float(weight_val)
                    weight_kg = round(w * 0.453592, 2) if w > 150 else round(w, 2)
                except (TypeError, ValueError):
                    pass

            records.append({
                'date':             str(day)[:10],
                'resting_hr':       _get(d, 'resting_hr', 'hr_min'),
                'steps':            d.get('steps'),
                'stress_avg':       d.get('stress_avg'),
                'body_battery_min': d.get('body_battery_min'),
                'body_battery_max': d.get('body_battery_max'),
                'sleep_score':      d.get('sleep_score'),
                'weight_kg':        weight_kg,
            })

        records = [r for r in records if r['date']]
        if not records:
            return 0

        sb.table('garmin_daily_stats').upsert(records, on_conflict='date').execute()
        return len(records)

    print(f'⚠️  Daily stats DB not found at {DB_SUMMARY} or {DB_MONITORING}')
    return 0


# ── Main ────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Sync GarminDB SQLite data → Supabase')
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--days', type=int, default=7, metavar='N', help='Sync last N days (default: 7)')
    group.add_argument('--all',  dest='sync_all', action='store_true', help='Sync all available data')
    args = parser.parse_args()

    since = date(2000, 1, 1) if args.sync_all else date.today() - timedelta(days=args.days)
    label = 'all time' if args.sync_all else f'last {args.days} days'
    print(f'🔄  Syncing {label} (since {since}) → Supabase')
    print(f'    DB dir: {HEALTH_DIR}')

    try:
        from supabase import create_client
    except ImportError:
        raise SystemExit('❌  Run: pip install supabase')

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    n_act  = sync_activities(since, sb)
    n_stat = sync_daily_stats(since, sb)

    print(f'✅  Done — {n_act} activities, {n_stat} daily stat rows pushed to Supabase')


if __name__ == '__main__':
    main()
