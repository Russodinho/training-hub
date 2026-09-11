-- Persists each coach's daily check-in message, keyed by calendar date +
-- agent. This is what actually enforces "once per calendar day upon
-- request" — the unique constraint means a second attempt for the same
-- agent on the same date can never insert a second row (the API route
-- checks first and returns the cached row; if two requests ever race, the
-- loser's insert just hits the constraint and is swallowed, same pattern
-- as agent_cache/sync_requests from earlier this session). It's also what
-- lets the /agent page show a "previous days" history section below
-- today's results.
--
-- RLS disabled inline per this project's established default.

create table if not exists agent_messages (
  id bigint generated always as identity primary key,
  date date not null,
  agent_id text not null,
  message text not null,
  created_at timestamptz not null default now(),
  unique (date, agent_id)
);

create index if not exists agent_messages_date_idx on agent_messages (date desc);

alter table if exists agent_messages disable row level security;
