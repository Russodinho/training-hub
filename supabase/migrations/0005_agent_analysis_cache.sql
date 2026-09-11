-- Caches the coaching agent's daily analysis (Claude draft -> GPT-4 critique ->
-- Claude refine) so it only regenerates once per calendar day instead of on
-- every dashboard/agent-page load. `date` is the cache key (server "today").
--
-- Disabling RLS inline this time — every prior table created in this project
-- came up with RLS enabled and no policy, which silently blocks the anon/
-- service-role keys used everywhere in this app (see 0003/0004).

create table if not exists agent_analysis_cache (
  date date primary key,
  final_recommendation text not null,
  today_action text not null,
  debate_summary text not null,
  confidence integer not null,
  created_at timestamptz not null default now()
);

alter table if exists agent_analysis_cache disable row level security;
