-- Tables that garmin_sync.py writes to and the Cardio/Recovery pages (and the
-- dashboard's activity feed/volume chart/BodyCompWidget weight fallback) read
-- from. These were never created, which is the actual reason Garmin-derived
-- data has never shown up anywhere in the app.

create table if not exists garmin_activities (
  id text primary key,
  date date,
  activity_type text,
  name text,
  duration_min numeric,
  distance_km numeric,
  avg_hr integer,
  max_hr integer,
  calories integer,
  avg_pace text,
  raw_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists garmin_activities_date_idx on garmin_activities (date);

create table if not exists garmin_daily_stats (
  date date primary key,
  resting_hr integer,
  steps integer,
  stress_avg integer,
  body_battery_min integer,
  body_battery_max integer,
  sleep_score integer,
  weight_kg numeric,
  created_at timestamptz not null default now()
);
