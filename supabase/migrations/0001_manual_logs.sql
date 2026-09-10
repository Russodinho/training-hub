-- Tables for data that was previously trapped in browser localStorage only
-- (Progress / Training Log manual entries, and Injuries). Run this once in
-- the Supabase SQL editor (or `supabase db push`) before deploying the code
-- that reads/writes these tables.

create table if not exists tri_log_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('swim', 'bike', 'run', 'brick')),
  date date not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tri_log_entries_kind_date_idx on tri_log_entries (kind, date);

create table if not exists manual_weight_log (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  weight numeric not null,
  bf numeric,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists manual_weight_log_date_idx on manual_weight_log (date);

create table if not exists injuries (
  key text primary key,
  name text not null,
  status text not null default 'monitoring',
  pain text,
  since date,
  location text,
  aggravated text,
  not_affected text,
  treatment text,
  notes text,
  symptoms text,
  is_builtin boolean not null default false,
  archived boolean not null default false,
  archived_at date,
  final_status text,
  created_at timestamptz not null default now()
);

create table if not exists injury_updates (
  id uuid primary key default gen_random_uuid(),
  injury_key text not null,
  date date not null,
  status text,
  pain text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists injury_updates_key_idx on injury_updates (injury_key);
