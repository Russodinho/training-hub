-- Editable workout program. Until now the lift days (Upper A / Lower A /
-- Upper B / Lower B) were hardcoded in /log and Settings -> Exercises, so
-- adding, removing or renaming a day meant a code change. This makes the
-- days themselves data:
--
--   workout_days  one row per lift day. `id` is a stable slug that is also
--                 what workout_sessions.type stores, so renaming a day never
--                 orphans its history. `weekday` (0=Sun .. 6=Sat, nullable)
--                 is which day of the week it's scheduled on.
--   exercises     existing table; `category` now holds the workout_days.id
--                 the exercise belongs to. Adds a free-text `notes` column
--                 for cues like "final set to failure" or "10 min EMOM".
--
-- Old rows in `exercises` with the retired categories (upper_push,
-- lower_quad, core, ...) are left in place but no longer belong to any day,
-- so they stop showing up. Past workout_sessions keep their old types
-- (lower_a, lower_b) and still render with their old labels.
--
-- Seeds the Sep 2026 program. Safe to re-run: days upsert, and exercises
-- are only inserted for a day that has none yet. RLS disabled inline per
-- this project's established default.

create table if not exists workout_days (
  id text primary key,
  name text not null,
  subtitle text,
  weekday smallint check (weekday between 0 and 6),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table if exists workout_days disable row level security;

-- exercises was created with RLS on and no policy (same issue 0003/0004
-- fixed for other tables), so the anon key the app uses read 0 rows and
-- every insert/update/delete from the program editor was rejected.
alter table if exists exercises disable row level security;

alter table exercises add column if not exists notes text;

-- category used to be limited to the old fixed groups (upper_push,
-- lower_quad, core, ...). It now holds a workout_days.id, and days are
-- user-created, so the fixed list has to go. Not replaced with a foreign
-- key because the retired rows still carry the old category values.
alter table exercises drop constraint if exists exercises_category_check;
-- Same for the type /log saves: it's now any workout_days.id (kb_circuit,
-- legs, user-added days), not just the old four. No-op if absent.
alter table workout_sessions drop constraint if exists workout_sessions_type_check;

insert into workout_days (id, name, subtitle, weekday, sort_order) values
  ('upper_a',    'Upper A',    'Push-dominant · ~30-35 min', 1, 10),
  ('kb_circuit', 'KB Circuit', 'After swim · ~15-18 min',    2, 20),
  ('upper_b',    'Upper B',    'Pull-dominant · ~35-40 min', 4, 30),
  ('legs',       'Legs',       'Combined · ~30 min',         5, 40)
on conflict (id) do nothing;

insert into exercises (name, category, default_sets, default_reps, default_rpe, rest_seconds, notes, is_active, sort_order)
select v.name, v.category, v.sets, v.reps, v.rpe, v.rest, v.notes, true, v.sort_order
from (values
  ('Incline DB or BB Press',       'upper_a',    3,  '6-8',                 '8, 8, 9-10', 90, 'Final set to near/true failure', 10),
  ('Standing DB OHP',              'upper_a',    2,  '8-10',                '8',          60, null, 20),
  ('Chest Supported Row',          'upper_a',    2,  '8-10',                '8',          60, null, 30),
  ('Face Pulls',                   'upper_a',    2,  '15',                  '8',          45, null, 40),
  ('Single Arm Preacher Curl',     'upper_a',    2,  '10-12/side',          '8',          45, null, 50),

  ('KB Halos',                     'kb_circuit', 3,  '8-10 each direction', null,         null, '2-3 rounds', 10),
  ('KB Swings',                    'kb_circuit', 10, '15-20',               null,         null, '10 min EMOM, one set at the top of each minute', 20),
  ('Around the Worlds',            'kb_circuit', 3,  '8-10 each direction', null,         null, '2-3 rounds', 30),

  ('Lat Pulldown or Pull-Up',      'upper_b',    3,  '6-8',                 '8, 8, 9-10', 60, 'Final set to near/true failure', 10),
  ('Machine Low Row (single arm)', 'upper_b',    2,  '10-12/side',          '8',          60, null, 20),
  ('Flat DB Press',                'upper_b',    2,  '8-10',                '8',          60, null, 30),
  ('Cable Crunch',                 'upper_b',    3,  '12-15',               '8-9',        45, null, 40),
  ('Reverse Crunch',               'upper_b',    3,  '12-15',               '8-9',        45, null, 50),

  ('Zercher Squat',                'legs',       3,  '4-6',                 '8, 8, 9',    90, 'Final set: heaviest load with a clean upright position held. Use a barbell pad.', 10),
  ('Romanian Deadlift',            'legs',       2,  '6-8',                 '8',          90, null, 20),
  ('Belted Hip Thrust',            'legs',       2,  '8-10',                '8-9',        60, null, 30),
  ('Hip Abduction',                'legs',       2,  '15',                  '7-8',        45, 'Kept for the left hip stability issue', 40)
) as v(name, category, sets, reps, rpe, rest, notes, sort_order)
where not exists (select 1 from exercises e where e.category = v.category);
