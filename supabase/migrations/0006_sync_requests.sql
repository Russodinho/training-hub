-- Backs the dashboard's manual "Sync Garmin now" button. The web app (often
-- viewed from a phone, wherever, not necessarily the PC that owns the data)
-- can't directly run garmin_sync.py — that needs local Python/GarminDB.
-- So the button just inserts a pending row here; a local poller script
-- (garmin_sync_poller.ps1, on a 1-minute Task Scheduler trigger) picks it
-- up, runs the real sync, and marks it done. `type` exists so the same
-- table/flow can cover Cronometer or anything else later without a schema
-- change — only 'garmin' is used today.

create table if not exists sync_requests (
  id bigint generated always as identity primary key,
  type text not null,
  status text not null default 'pending', -- pending | running | done | error
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  error text
);

create index if not exists sync_requests_pending_idx on sync_requests (type, status, requested_at);

alter table if exists sync_requests disable row level security;
