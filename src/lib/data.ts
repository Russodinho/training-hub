
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
// 08 + 09 are daily and non-negotiable (Achilles/hip root-cause work).
export const MOB_DAILY_IDS = ['08', '09']

export interface MobilityDayPlan {
  ids: string[]
  why: string
  minutes: number // total hold time
}

// Which moves each day, keyed by getDay() (0 = Sunday). Done at home after
// the dog walk; massage gun one side at a time.
export const MOB_DAY_PLAN: Record<number, MobilityDayPlan> = {
  0: { ids: ['05', '06', '08', '09'], why: 'Hip coverage on the one day with no lift or yoga, after 80 min soccer', minutes: 19 },
  1: { ids: ['01', '02', '03', '08', '09'], why: 'Upper push day; soccer tonight', minutes: 19 },
  2: { ids: ['03', '04', '08', '09'], why: 'Swim shoulders + KB swing hips/T-spine', minutes: 18 },
  3: { ids: ['08', '09'], why: 'Yoga covers 01-07', minutes: 11 },
  4: { ids: ['01', '02', '03', '08', '09'], why: 'Upper pull day', minutes: 19 },
  5: { ids: ['04', '05', '06', '07', '08', '09'], why: 'Legs day, full lower set', minutes: 27 },
  6: { ids: ['08', '09'], why: 'Yoga covers 01-07', minutes: 11 },
}

export function mobDayPlan(date?: Date): MobilityDayPlan {
  return MOB_DAY_PLAN[(date || new Date()).getDay()]
}

export function mobRequiredIds(date?: Date): string[] {
  return mobDayPlan(date).ids
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

const PROTEIN_NOTE = 'Maintenance target. Cronometer protein target is 200g; landing ~175-185g is fine (deliberate trim)'

export const NUTRITION_TARGETS: NutritionDay[] = [
  { day: 'Monday',    activity: 'Upper A + Soccer',   calories: 2650, protein: 200, carbs: 250, fat: 85, notes: PROTEIN_NOTE },
  { day: 'Tuesday',   activity: 'Swim + KB + Soccer', calories: 2650, protein: 200, carbs: 250, fat: 85, notes: PROTEIN_NOTE },
  { day: 'Wednesday', activity: 'Run + Yoga',         calories: 2650, protein: 200, carbs: 250, fat: 85, notes: PROTEIN_NOTE },
  { day: 'Thursday',  activity: 'Upper B',            calories: 2650, protein: 200, carbs: 250, fat: 85, notes: PROTEIN_NOTE },
  { day: 'Friday',    activity: 'Legs',               calories: 2650, protein: 200, carbs: 250, fat: 85, notes: PROTEIN_NOTE },
  { day: 'Saturday',  activity: 'Brick + Yoga',       calories: 0,    protein: 0,   carbs: 0,   fat: 0,  notes: '~1,800 clean through breakfast and lunch + cheat dinner (not tracked)' },
  { day: 'Sunday',    activity: 'Soccer',             calories: 2650, protein: 200, carbs: 250, fat: 85, notes: PROTEIN_NOTE },
]

// Maintenance: weight holds at 2,650 kcal on the current schedule, so it's
// treated as maintenance (recalculate after 1-2 full weeks of Garmin data on
// this schedule). Protein target stays 200g in Cronometer, but landing
// ~175-185g is an accepted, deliberate trim, so don't push it back up.
export const NUTRITION_BASELINE = {
  calories: 2650,
  baseCalories: 2650,
  protein: 200,
  carbs: 250,
  fat: 85,
  proteinAcceptable: '175–185',
  tdee: 2650,
  deficit: 0,
  lossPerWeek: 0,
  weight: 195, // static fallback only — the Fuel page shows live weight from Supabase `biometrics` when available
  goalBf: '14–16%',
}
