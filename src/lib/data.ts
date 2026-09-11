
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
  { day: 'Monday',    activity: 'Upper A + Soccer',   calories: 2650, protein: 200, carbs: 250, fat: 85, notes: 'Maintenance target — protein stays at 200g+ regardless of day' },
  { day: 'Tuesday',   activity: 'Lower A',            calories: 2650, protein: 200, carbs: 250, fat: 85, notes: 'Maintenance target — protein stays at 200g+ regardless of day' },
  { day: 'Wednesday', activity: 'Swim',               calories: 2650, protein: 200, carbs: 250, fat: 85, notes: 'Maintenance target — protein stays at 200g+ regardless of day' },
  { day: 'Thursday',  activity: 'Upper B + Run',      calories: 2650, protein: 200, carbs: 250, fat: 85, notes: 'Maintenance target — protein stays at 200g+ regardless of day' },
  { day: 'Friday',    activity: 'Lower B',            calories: 2650, protein: 200, carbs: 250, fat: 85, notes: 'Maintenance target — protein stays at 200g+ regardless of day' },
  { day: 'Saturday',  activity: 'Bike / Surf',        calories: 0,    protein: 0,   carbs: 0,   fat: 0,  notes: '~1,800 clean through breakfast and lunch + cheat dinner (not tracked)' },
  { day: 'Sunday',    activity: 'Rest / Hike / Garden', calories: 2650, protein: 200, carbs: 250, fat: 85, notes: 'Maintenance target — protein stays at 200g+ regardless of day' },
]

// Maintenance-calorie approach: real TDEE with full training (soccer 3x/week
// included) runs ~2,700–2,800, so fixed targets at 2,650 produce a small
// natural deficit without actively cutting. Cronometer's own fixed targets
// total 2,565 — the ~85 cal buffer fills naturally from cooking oils,
// supplements, and rounding.
export const NUTRITION_BASELINE = {
  calories: 2650,
  baseCalories: 2650,
  protein: 200,
  carbs: 250,
  fat: 85,
  tdee: 2750,
  deficit: 100,
  lossPerWeek: 0.2,
  weight: 195, // static fallback only — the Fuel page shows live weight from Supabase `biometrics` when available
  goalBf: '14–16%',
}
