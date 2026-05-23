# Training Hub — Setup Guide

## Prerequisites

1. **Install Node.js** — download from https://nodejs.org (LTS version, 20+)
2. **Git** — for pushing to GitHub

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.local.example .env.local
# (values are pre-filled in .env.local.example — just copy it)

# 3. Run development server
npm run dev
# Open http://localhost:3000
```

For local Strava OAuth, update `NEXT_PUBLIC_STRAVA_REDIRECT_URI` in `.env.local`:
```
NEXT_PUBLIC_STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
```
And add `http://localhost:3000/api/strava/callback` to your Strava app's Authorized Callback Domains.

---

## Supabase setup

Run these SQL statements in Supabase SQL editor (https://hgemyfdolsrrvyhewqiq.supabase.co):

```sql
create table mobility_log (
  id uuid default gen_random_uuid() primary key,
  date date unique not null,
  items jsonb not null default '[]',
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table race_results (
  id uuid default gen_random_uuid() primary key,
  race_id text not null unique,
  swim text, t1 text, bike text, t2 text, run text, total text,
  notes text,
  created_at timestamptz default now()
);

create table nutrition_actuals (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  calories numeric, protein numeric, fat numeric, carbs numeric, fiber numeric,
  raw_data jsonb,
  created_at timestamptz default now(),
  unique(date)
);

create table daily_goals (
  id uuid default gen_random_uuid() primary key,
  date date unique not null,
  workout boolean default false,
  diet boolean default false,
  tri boolean default false,
  mobility boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table strava_activities (
  id uuid default gen_random_uuid() primary key,
  strava_id bigint unique not null,
  activity_type text not null,
  name text,
  distance numeric,
  moving_time integer,
  elapsed_time integer,
  start_date timestamptz,
  average_speed numeric,
  max_speed numeric,
  average_heartrate numeric,
  total_elevation_gain numeric,
  raw_data jsonb,
  created_at timestamptz default now()
);

create table strava_tokens (
  id uuid default gen_random_uuid() primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  athlete_id bigint,
  updated_at timestamptz default now()
);
```

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit: Training Hub Next.js build"
git remote add origin https://github.com/Russodinho/training-hub.git
git push -u origin main

# 2. Connect repo in Vercel dashboard (vercel.com)
# 3. Add all environment variables from .env.local.example to Vercel
# 4. Deploy
```

### Vercel environment variables to add:

Copy each line from `.env.local.example` into Vercel → Settings → Environment Variables.

For `GOOGLE_SERVICE_ACCOUNT_KEY`, paste the full JSON from `training-hub-496422-54c510dcf7ed.json`.

### After Vercel deploy:

Update Strava app callback URL:
- Go to https://www.strava.com/settings/api
- Set Authorization Callback Domain to: `training-hub.vercel.app`

---

## Strava initial data seed

After connecting Strava via the nav button, trigger a manual sync:
```
POST https://training-hub.vercel.app/api/strava/sync
```

Or just navigate to the site — sync happens automatically on dashboard load.

---

## Google Sheets setup

The service account `training-hub-writer@training-hub-496422.iam.gserviceaccount.com` needs **Editor** access to your spreadsheet.

Share the sheet with this email address in Google Sheets (Share button).

The sheet tabs used:
- `Workouts` — exercise tracking with Start Weight / Current Weight columns
- `Nutrition` — daily nutrition log
- `Bricks` — brick session log
- `Progress` — weight and body comp log (Date, Weight, Body Fat, Notes)
- `Sleep` — sleep tracking
- `Mobility` — mobility session log
