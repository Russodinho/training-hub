export interface Race {
  id: string
  name: string
  date: string
  dateLabel: string
  location: string
  headerRight: string
  distances: { swim: string; bike: string; run: string }
  timeline: [string, string, true?][]
  strategy: [string, string][]
  type: 'sprint' | 'olympic' | 'decide'
}

export const RACES: Race[] = [
  {
    id: 'abington',
    name: 'Abington Triathlon',
    date: '2026-05-30T07:00:00',
    dateLabel: 'May 30, 2026 · 7:00 AM',
    location: 'Abington HS · 900 Highland Ave',
    headerRight: 'Wave 7:27am · Yellow caps · Men 30–39\nBib pickup Fri May 29 · 5–7pm · Abington Police HQ',
    distances: { swim: '300m', bike: '11.5 mi', run: '5K' },
    type: 'sprint',
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
    dateLabel: 'Jul 12, 2026 · 7:00 AM',
    location: 'Stone Harbor, NJ',
    headerRight: 'Ocean swim · open water\nCheck race site for wave times',
    distances: { swim: '750m', bike: '12.4 mi', run: '5K' },
    type: 'sprint',
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
    dateLabel: 'Aug 1, 2026 · 7:00 AM',
    location: 'Brigantine, NJ',
    headerRight: 'Ocean swim\nBack-to-back weekend with Steelman — decide based on prior races',
    distances: { swim: '400m', bike: '11 mi', run: '4 mi' },
    type: 'decide',
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
    dateLabel: 'Aug 2, 2026 · 7:00 AM',
    location: 'Quakertown, PA',
    headerRight: 'Lake swim · Olympic distance\nSignificant step-up — decide based on how Abington & Stone Harbor feel',
    distances: { swim: '1500m', bike: '24.9 mi', run: '6.2 mi' },
    type: 'olympic',
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
    dateLabel: 'Sep 13, 2026 · 7:00 AM',
    location: 'Warrington, PA · Marshall Financial Group',
    headerRight: 'Local race\nCheck race site for wave times',
    distances: { swim: '300m', bike: '10 mi', run: '5K' },
    type: 'sprint',
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
    dateLabel: 'Sep 20, 2026 · 7:00 AM',
    location: 'Downingtown, PA',
    headerRight: 'Lake swim · local race\nSeason finale',
    distances: { swim: '750m', bike: '12.4 mi', run: '5K' },
    type: 'sprint',
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
]

export const RACE_LAG_DAYS = 5

export function getActiveRace(): { race: Race; index: number; isPast: boolean } | null {
  const now = new Date()
  for (let i = 0; i < RACES.length; i++) {
    const rd = new Date(RACES[i].date)
    const lagEnd = new Date(rd.getTime() + RACE_LAG_DAYS * 86400000)
    if (now < lagEnd) {
      return { race: RACES[i], index: i, isPast: now >= rd }
    }
  }
  return null
}

export function getDaysToRace(race: Race): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const rd = new Date(race.date); rd.setHours(0, 0, 0, 0)
  return Math.round((rd.getTime() - today.getTime()) / 86400000)
}

export const KIT_CHECKLIST = [
  'Tri shorts (Zoot 7")',
  'Tri top / race kit',
  'Goggles',
  'Swim cap (provided)',
  'Bike helmet (mandatory)',
  'Bike + spare tube + CO2',
  'Cycling shoes / bike shoes',
  'Running shoes',
  'Race belt + bib number',
  'Sunglasses (Goodr / Tifosi)',
  'Towel for transition',
  'Water bottles on bike',
  'Electrolyte drink / gels',
  'Bodyglide / anti-chafe',
  'Flip flops for pool/lake deck',
  'Phone + charger',
  'ID + registration confirmation',
  'Post-race food + recovery drink',
]

export interface MobilityExercise {
  id: string
  name: string
  focus: string
  tool?: string
  sets: number
  duration: string
  cues?: string
  massageGun?: string
}

export const MOBILITY_EXERCISES: MobilityExercise[] = [
  {
    id: '01',
    name: 'Thoracic Extension',
    focus: 'Thoracic spine · posture · swim position',
    tool: 'Foam roller',
    sets: 2,
    duration: '60 sec',
    cues: `Roller at mid-back. Arms crossed or behind head. Extend over roller — don't force it. Move up/down the thoracic spine. Keep glutes on floor.`,
    massageGun: 'Upper back (traps) before or after',
  },
  {
    id: '02',
    name: 'Doorway / Overhead Lat Stretch',
    focus: 'Lats · shoulder · swim catch position',
    tool: 'Doorway or wall',
    sets: 2,
    duration: '45 sec each side',
    cues: 'Arm overhead, hand on doorframe. Lean away and forward — feel the lat pull. Or: wall lat stretch — both arms, hips back.',
    massageGun: 'Lats (side of torso, below armpit) 60 sec each side',
  },
  {
    id: '03',
    name: 'Sleeper Stretch',
    focus: 'Posterior shoulder capsule · swim health',
    sets: 2,
    duration: '45 sec each side',
    cues: 'Lie on side, shoulder at 90°. Use other hand to gently push forearm toward floor. Feel stretch in back of shoulder. No pain — gentle pressure only.',
    massageGun: 'Posterior shoulder / rear delt before stretching',
  },
  {
    id: '04',
    name: "World's Greatest Stretch",
    focus: 'Hip flexors · thoracic rotation · hamstrings · glutes',
    sets: 2,
    duration: '60 sec each side',
    cues: 'Lunge position. Front foot flat. Opposite hand to ground. Rotate top arm to ceiling — follow with eyes. Hold each rotation 2–3 sec. Move slowly.',
  },
  {
    id: '05',
    name: '90/90 Hip Switch',
    focus: 'Hips — internal + external rotation',
    sets: 2,
    duration: '60 sec per position',
    cues: 'Sit with both knees at 90°. Hold each side 30–60 sec. Switch sides. Keep spine tall. Option: active rotation switching back and forth.',
    massageGun: 'Glutes / piriformis (sit on attachment) 60–90 sec each side',
  },
  {
    id: '06',
    name: 'Couch Stretch',
    focus: 'Hip flexors · quads',
    sets: 2,
    duration: '60 sec each side',
    cues: `Back knee on ground, shin up wall or couch. Front foot forward. Drive hips forward and squeeze glute. Tall spine — don't arch low back.`,
    massageGun: 'Quad / hip flexor before stretching — 60–90 sec each side',
  },
  {
    id: '07',
    name: 'Pigeon Pose / Figure Four',
    focus: 'Piriformis · glute · IT band upstream',
    sets: 2,
    duration: '60 sec each side',
    cues: 'Full pigeon: front shin parallel (or angled). Fold forward for deeper stretch. Figure four option: supine, ankle over opposite knee, pull toward chest.',
    massageGun: 'Glutes + IT band 90 sec each side',
  },
  {
    id: '08',
    name: 'Wall Ankle Stretch',
    focus: 'Ankles — dorsiflexion · left Achilles',
    tool: 'Wall',
    sets: 3,
    duration: '45 sec each side · left priority',
    cues: 'Toes on wall, heel on floor. Drive knee toward wall. Start close (2–3"), work back as range improves. Left side gets an extra set — Achilles priority.',
    massageGun: 'Achilles + calf before stretching — especially left',
  },
  {
    id: '09',
    name: 'Calf + Soleus Stretch',
    focus: 'Calves — both heads · Achilles health',
    tool: 'Wall',
    sets: 2,
    duration: '45 sec per variation each side',
    cues: 'Straight leg: standard wall calf stretch. Bent knee: same position but knee slightly bent — hits soleus and deeper Achilles. Both variations every session.',
    massageGun: 'Full calf + Achilles 60–90 sec each side',
  },
]

export const MOB_ALL_IDS = ['01', '02', '03', '04', '05', '06', '07', '08', '09']
export const MOB_YOGA_ONLY_IDS = ['08', '09']

export function mobIsYogaNight(date?: Date): boolean {
  const dow = (date || new Date()).getDay()
  return dow === 0 || dow === 3 || dow === 6 // Sun, Wed, or Sat — ankle+calf only
}

export function mobRequiredIds(date?: Date): string[] {
  return mobIsYogaNight(date) ? MOB_YOGA_ONLY_IDS : MOB_ALL_IDS
}

export interface NutritionDay {
  day: string
  activity: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes: string
}

export const NUTRITION_TARGETS: NutritionDay[] = [
  { day: 'Monday',    activity: 'Upper A + Soccer',   calories: 2290, protein: 200, carbs: 230, fat: 65, notes: 'HIGH — Baseline + rice cakes at lunch' },
  { day: 'Tuesday',   activity: 'Lower A',            calories: 2100, protein: 200, carbs: 150, fat: 60, notes: 'LOW — Baseline minus banana' },
  { day: 'Wednesday', activity: 'Swim',               calories: 2100, protein: 195, carbs: 150, fat: 58, notes: 'LOW — Baseline minus banana' },
  { day: 'Thursday',  activity: 'Upper B + Run',      calories: 2290, protein: 200, carbs: 210, fat: 62, notes: 'HIGH — Baseline + rice cakes at lunch' },
  { day: 'Friday',    activity: 'Lower B',            calories: 2100, protein: 200, carbs: 150, fat: 60, notes: 'LOW — Baseline minus banana' },
  { day: 'Saturday',  activity: 'Bike / Surf',        calories: 0,    protein: 0,   carbs: 0,   fat: 0,  notes: 'Breakfast + lunch on plan. One cheat meal (dinner/going out). No tracking cheat meal. No cheat snacking before or after.' },
  { day: 'Sunday',    activity: 'Rest / Hike / Garden', calories: 2100, protein: 195, carbs: 150, fat: 58, notes: 'LOW — Baseline minus banana. Soccer returns ~Aug 15 — same targets.' },
]

export const NUTRITION_BASELINE = {
  calories: 2130,
  baseCalories: 2222,
  protein: 198,
  carbs: 165,
  fat: 60,
  tdee: 2600,
  deficit: 470,
  lossPerWeek: 0.9,
  weight: 198,
  goalBf: '14–16%',
}
