-- workout_sessions/workout_sets (the tables /log's "Save Workout" writes to)
-- also have RLS enabled with no policy attached, same root cause as the
-- garmin_* tables fixed in 0003 — this project appears to force RLS on for
-- every new table. This means /log's save has likely never actually
-- succeeded via the deployed app (it fails silently into the page's error
-- state, using the anon key like everything else here). Disable it to match
-- the rest of the schema.

alter table if exists workout_sessions disable row level security;
alter table if exists workout_sets disable row level security;
