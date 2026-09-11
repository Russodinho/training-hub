-- Season Plan used to be a hardcoded 7-week plan tied specifically to the
-- original May-Sept race calendar — it didn't adapt to whatever race is
-- actually next, or update when races change. This table caches a
-- generated plan per race (not per day — a training arc doesn't need
-- daily regeneration like the coach check-ins do), so it's cheap to read
-- and only regenerates when the target race changes or the user asks for
-- a refresh. RLS disabled inline per this project's established default.

create table if not exists season_plans (
  race_id text primary key references races(id) on delete cascade,
  plan jsonb not null,
  generated_at timestamptz not null default now()
);

alter table if exists season_plans disable row level security;
