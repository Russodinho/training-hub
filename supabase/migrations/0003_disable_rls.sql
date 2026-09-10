-- This project auto-enables Row Level Security on newly created tables with
-- no policies attached, which silently rejects every read/write from the
-- app's anon key (there's no auth system here — every page, including the
-- ones that already work like mobility_log/biometrics/sleep_logs, relies on
-- the anon key having open access). Run this AFTER 0001 and 0002 so all six
-- new tables match the rest of the schema's existing (no-RLS) posture.

alter table if exists garmin_activities disable row level security;
alter table if exists garmin_daily_stats disable row level security;
alter table if exists tri_log_entries disable row level security;
alter table if exists manual_weight_log disable row level security;
alter table if exists injuries disable row level security;
alter table if exists injury_updates disable row level security;
