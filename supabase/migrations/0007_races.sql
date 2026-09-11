-- Races used to live as a hardcoded array (src/lib/data.ts) plus browser
-- localStorage for anything added/hidden on the race-calendar page. Neither
-- is visible to the server-rendered dashboard, and localStorage doesn't
-- sync across devices at all — that's the actual cause of "the dashboard
-- doesn't update from the race page." This table replaces both.
--
-- `id` stays text (not a generated uuid) so the 6 existing hardcoded races
-- can keep their original string ids ('abington', 'stoneharbor', etc.) when
-- seeded — race_results.race_id already references those exact strings,
-- and preserving them means existing race results stay linked with zero
-- migration needed on that table.
--
-- `sport` + the split distance_* columns support run/bike/swim races that
-- only need one distance, not the full swim/bike/run trio a triathlon has.
--
-- RLS disabled inline — every table in this project comes up RLS-on-no-
-- policy by default (see 0003/0004), which silently blocks the anon key
-- this app uses everywhere.

create table if not exists races (
  id text primary key,
  name text not null,
  date timestamptz not null,
  location text,
  sport text not null default 'tri', -- 'tri' | 'run' | 'bike' | 'swim'
  tier text,                          -- 'sprint' | 'olympic' | 'decide' | 'target' (tri only)
  distance_swim text,
  distance_bike text,
  distance_run text,
  notes text,                         -- wave info etc (was headerRight)
  timeline jsonb not null default '[]',
  strategy jsonb not null default '[]',
  status text not null default 'upcoming', -- 'upcoming' | 'archived'
  created_at timestamptz not null default now()
);

alter table if exists races disable row level security;
