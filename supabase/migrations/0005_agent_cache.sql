-- Supersedes the never-run 0005_agent_analysis_cache.sql from the previous
-- session — same purpose (cache the coaching agent's daily analysis so it
-- only regenerates once per UTC day), renamed table + explicit id column
-- and unique constraint per the user's spec, so a race between two
-- simultaneous requests can't produce two rows for the same day.
--
-- RLS disabled inline — every table created in this project comes up
-- RLS-on-no-policy by default (see 0003/0004), which silently blocks the
-- anon/service-role keys this app uses everywhere.

create table if not exists agent_cache (
  id bigint generated always as identity primary key,
  date date not null unique,
  final_recommendation text not null,
  today_action text not null,
  debate_summary text not null,
  confidence integer not null,
  created_at timestamptz not null default now()
);

alter table if exists agent_cache disable row level security;
