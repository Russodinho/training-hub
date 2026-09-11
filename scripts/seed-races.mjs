// One-time seed: migrates the 6 hardcoded races that used to live in
// src/lib/data.ts into the new Supabase `races` table (0007_races.sql).
// IDs are preserved exactly ('abington', 'stoneharbor', etc.) so existing
// race_results rows (keyed by race_id) stay linked with no changes there.
// Run once via: node scripts/seed-races.mjs — safe to re-run (upsert).

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const races = [
  {
    id: 'abington',
    name: 'Abington Triathlon',
    date: '2026-05-30T07:00:00',
    location: 'Abington HS · 900 Highland Ave',
    notes: 'Wave 7:27am · Yellow caps · Men 30–39\nBib pickup Fri May 29 · 5–7pm · Abington Police HQ',
    distance_swim: '300m', distance_bike: '11.5 mi', distance_run: '5K',
    tier: 'sprint',
    timeline: [
      ['5:00 am', 'Wake up · light breakfast (oats, banana, coffee + collagen)'],
      ['5:30 am', 'Supplements · eat 90 min before wave start'],
      ['6:00 am', 'Leave for Abington HS · arrive early'],
      ['6:15 am', 'Rack bike · set up transition area'],
      ['6:30 am', 'Body marking · check in · get yellow cap'],
      ['6:45 am', 'Warm up · light jog + arm circles + ankle mobility'],
      ['7:00 am', 'Race start (earlier waves)'],
      ['7:27 am', '🏊 Your wave · yellow caps · men 30–39 · push off wall', true],
    ],
    strategy: [
      ['🏊 Swim · 300m · 13 lengths', "Start easy — breathing rhythm is everything. Push off wall confidently each length. If you need a 2 sec pause at the wall, take it. Don't panic, don't sprint the first length."],
      ['🚴 Bike · 11.5 mi', 'This is your strongest leg. Controlled effort — not all out. Save something for the run. Target 82 RPM, same as your brick training.'],
      ['🏃 Run · 5K', "First half mile will feel awful — legs like concrete. That's normal. Don't panic, don't stop. By mile 1 you'll find your rhythm. Target 9:30–11:00 min/mile. Negative split — second half faster than first."],
    ],
  },
  {
    id: 'stoneharbor',
    name: 'Stone Harbor Triathlon',
    date: '2026-07-12T07:00:00',
    location: 'Stone Harbor, NJ',
    notes: 'Ocean swim · open water\nCheck race site for wave times',
    distance_swim: '750m', distance_bike: '12.4 mi', distance_run: '5K',
    tier: 'sprint',
    timeline: [
      ['Wake', 'Light breakfast 2.5–3 hrs before start (oats, banana, coffee + collagen)'],
      ['−90 min', 'Supplements · final fueling'],
      ['−60 min', 'Arrive · rack bike · set up transition'],
      ['−45 min', 'Check in · body marking · cap'],
      ['−25 min', 'Warm up · light jog + arm swings + a few minutes in the water if allowed'],
      ['Start', '🏊 Ocean swim — first open-water race of the season', true],
    ],
    strategy: [
      ['🏊 Swim · 750m · ocean', "Open water — no walls to rest on. Sight every 6–8 strokes off a fixed landmark. Start wide and calm to avoid the washing-machine. Settle into rhythm before pushing pace. This is 2.5× your Abington swim, so respect it."],
      ['🚴 Bike · 12.4 mi', 'Flat, fast coastal course. You can ride this a touch harder than Abington — but still leave legs for the run. Watch for wind off the water.'],
      ['🏃 Run · 5K', "You'll have more swim fatigue than at Abington. Start conservative, build into it. Negative split."],
    ],
  },
  {
    id: 'brigantine',
    name: 'Brigantine Sprint Triathlon',
    date: '2026-08-01T07:00:00',
    location: 'Brigantine, NJ',
    notes: 'Ocean swim\nBack-to-back weekend with Steelman — decide based on prior races',
    distance_swim: '400m', distance_bike: '11 mi', distance_run: '4 mi',
    tier: 'decide',
    timeline: [
      ['Wake', 'Light breakfast 2.5–3 hrs before start'],
      ['−90 min', 'Supplements · final fueling'],
      ['−60 min', 'Arrive · rack bike · set up transition'],
      ['−45 min', 'Check in · body marking · cap'],
      ['−25 min', 'Warm up · light jog + arm swings + short water warm-up'],
      ['Start', '🏊 Ocean swim', true],
    ],
    strategy: [
      ['🏊 Swim · 400m · ocean', 'Short ocean swim. Sight regularly, start calm and wide. Closer to Abington distance — should feel manageable with Stone Harbor in the legs.'],
      ['🚴 Bike · 11 mi', 'Flat coastal course. Controlled effort — this is a decide race, ride smart.'],
      ['🏃 Run · 4 mi', "Slightly longer run than your sprints. Hold something back for the extra mile."],
    ],
  },
  {
    id: 'steelman',
    name: 'Steelman Racing Triathlon',
    date: '2026-08-02T07:00:00',
    location: 'Quakertown, PA',
    notes: 'Lake swim · Olympic distance\nSignificant step-up — decide based on how Abington & Stone Harbor feel',
    distance_swim: '1500m', distance_bike: '24.9 mi', distance_run: '6.2 mi',
    tier: 'olympic',
    timeline: [
      ['Wake', 'Full breakfast 3 hrs before — this is a long day, fuel accordingly'],
      ['−2 hrs', 'Supplements · top-off fueling'],
      ['−75 min', 'Arrive · rack bike · set up transition'],
      ['−50 min', 'Check in · body marking · cap'],
      ['−25 min', 'Warm up · jog + mobility + lake warm-up swim'],
      ['Start', '🏊 Lake swim — Olympic distance', true],
    ],
    strategy: [
      ['🏊 Swim · 1500m · lake', "Your longest swim by far. Pace it like a steady aerobic effort, not a sprint. Sight off buoys. Break it into chunks mentally. Calm and efficient wins here."],
      ['🚴 Bike · 24.9 mi', 'More than double your sprint bike distance. Fuel on the bike — take in carbs and fluid. Steady, sustainable power. Do not chase people.'],
      ['🏃 Run · 6.2 mi (10K)', "A real 10K off a 25-mile bike. The first 2 miles set the tone — go out easy. Walk aid stations if needed. This is about finishing strong, not heroics."],
    ],
  },
  {
    id: 'warrington',
    name: 'Warrington Sprint Tri',
    date: '2026-09-13T07:00:00',
    location: 'Warrington, PA · Marshall Financial Group',
    notes: 'Local race\nCheck race site for wave times',
    distance_swim: '300m', distance_bike: '10 mi', distance_run: '5K',
    tier: 'sprint',
    timeline: [
      ['Wake', 'Light breakfast 2.5–3 hrs before start'],
      ['−90 min', 'Supplements · final fueling'],
      ['−60 min', 'Arrive · rack bike · set up transition'],
      ['−45 min', 'Check in · body marking · cap'],
      ['−25 min', 'Warm up · light jog + arm circles + ankle mobility'],
      ['Start', '🏊 Swim start', true],
    ],
    strategy: [
      ['🏊 Swim · 300m', 'Back to a short sprint swim — by now this should feel comfortable. Smooth and controlled.'],
      ['🚴 Bike · 10 mi', 'Shortest bike of the season. You can push this one — late-season fitness, ride strong.'],
      ['🏃 Run · 5K', "End-of-season legs are seasoned legs. Race it. Negative split and finish hard."],
    ],
  },
  {
    id: 'marshcreek',
    name: 'Marsh Creek Triathlon',
    date: '2026-09-20T07:00:00',
    location: 'Downingtown, PA',
    notes: 'Lake swim · local race\nSeason finale',
    distance_swim: '750m', distance_bike: '12.4 mi', distance_run: '5K',
    tier: 'sprint',
    timeline: [
      ['Wake', 'Light breakfast 2.5–3 hrs before start'],
      ['−90 min', 'Supplements · final fueling'],
      ['−60 min', 'Arrive · rack bike · set up transition'],
      ['−45 min', 'Check in · body marking · cap'],
      ['−25 min', 'Warm up · jog + mobility + short lake warm-up'],
      ['Start', '🏊 Lake swim — season finale', true],
    ],
    strategy: [
      ['🏊 Swim · 750m · lake', 'Last swim of the season. You know how to do this now — calm, sighted, rhythmic.'],
      ['🚴 Bike · 12.4 mi', 'Lake-course bike. Ride it with everything you learned this season.'],
      ['🏃 Run · 5K', "Final 5K of the year. Leave nothing on the course — this is the one to remember the season by."],
    ],
  },
].map(r => ({ ...r, sport: 'tri', status: 'upcoming' }))

const { error } = await sb.from('races').upsert(races, { onConflict: 'id' })
if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
console.log(`Seeded ${races.length} races.`)
