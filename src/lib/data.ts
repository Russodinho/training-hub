
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
  dose: string
  cues?: string
  massageGun?: string
  badge?: string // e.g. 'Strength' for the one non-stretch
}

// Evening routine; each night matches that day's training (MOB_DAY_PLAN).
export const MOBILITY_EXERCISES: MobilityExercise[] = [
  {
    id: '01', name: 'Thoracic Extension', focus: 'Thoracic spine · posture · swim position', tool: 'Foam roller',
    dose: '2 sets × 60s',
    cues: "Roller at mid-back. Arms crossed or behind head. Extend over the roller, don't force it. Move up and down the thoracic spine. Glutes stay on the floor.",
    massageGun: 'Upper back (traps) before or after',
  },
  {
    id: '02', name: 'Doorway / Overhead Lat Stretch', focus: 'Lats · shoulder · swim catch position', tool: 'Doorway or wall',
    dose: '2 sets × 45s each side',
    cues: 'Arm overhead, hand on the doorframe. Lean away and forward until you feel the lat. Or wall lat stretch: both arms on the wall, hips back.',
    massageGun: 'Lats (side of torso below armpit) 60s each side',
  },
  {
    id: '03', name: 'Cross-Body Shoulder Stretch', focus: 'Back of shoulder · swim health',
    dose: '2 sets × 45s each side',
    cues: "Arm across the chest at shoulder height. The other hand pulls at the elbow. Keep the shoulder blade down and back, don't shrug.",
    massageGun: 'Rear delt / back of shoulder before stretching',
  },
  {
    id: '04', name: "World's Greatest Stretch", focus: 'Hip flexors · thoracic rotation · hamstrings · glutes',
    dose: '2 sets × 60s each side',
    cues: 'Lunge position, front foot flat. Opposite hand to the ground. Rotate the top arm to the ceiling, eyes follow. Hold each rotation 2-3s. Move slowly.',
  },
  {
    id: '05', name: '90/90 Hip Switch', focus: 'Hip internal + external rotation',
    dose: '2 sets × 60s per position',
    cues: 'Sit with both knees at 90 degrees. Hold each side 30-60s, then switch. Spine tall. Option: actively switch back and forth.',
    massageGun: 'Glutes / piriformis 60-90s each side',
  },
  {
    id: '06', name: 'Couch Stretch', focus: 'Hip flexors · quads', tool: 'Wall or couch',
    dose: '2 sets × 60s each side',
    cues: "Back knee on the ground, shin up the wall or couch, front foot forward. Drive hips forward and squeeze the glute. Tall spine, don't arch the low back.",
    massageGun: 'Quads / hip flexors 60-90s each side',
  },
  {
    id: '07', name: 'Pigeon Pose / Figure Four', focus: 'Piriformis · glutes · outer hip',
    dose: '2 sets × 60s each side',
    cues: 'Pigeon: front shin parallel or angled, fold forward to go deeper. Figure four: lie on your back, ankle over the opposite knee, pull toward the chest.',
    massageGun: 'Glutes + IT band 90s each side',
  },
  {
    id: '08', name: 'Wall Ankle Stretch', focus: 'Ankle dorsiflexion · left Achilles', tool: 'Wall',
    dose: '45s holds · 3 sets left / 2 sets right',
    cues: "Toes on the wall, heel down. Drive the knee toward the wall. Start 2-3 inches away and move back as range improves. If the pain is where the tendon attaches to the heel bone, don't push the end range.",
    massageGun: 'Achilles + calf, especially left',
  },
  {
    id: '09', name: 'Calf + Soleus Stretch', focus: 'Calves (both heads) · Achilles', tool: 'Wall',
    dose: '45s per variation each side · 3 sets left / 2 sets right',
    cues: 'Straight leg: standard wall calf stretch. Bent knee: same position with the knee slightly bent to hit the soleus. Do both variations every session.',
    massageGun: 'Full calf + Achilles 60-90s each side',
  },
  {
    id: '10', name: 'Adductor Rock-Back', focus: 'Groin / adductors (soccer)',
    dose: '2 sets × 8-10 slow reps each side',
    cues: 'On hands and knees, one leg straight out to the side, foot flat. Sit the hips back toward the heels with a flat back, pause 2s, return.',
    massageGun: 'Inner thigh 60s each side',
  },
  {
    id: '11', name: 'Single-Leg Calf Raise', focus: 'Left Achilles tendon loading', tool: 'Floor, not off a step; add a dumbbell when easy',
    dose: '3 sets × 8-12 · left first', badge: 'Strength',
    cues: "3s up, 3s down. Mild discomfort up to 3/10 that settles by the next morning is OK. If it's worse the next morning, reduce the load.",
  },
]

export const MOB_ALL_IDS = MOBILITY_EXERCISES.map(e => e.id)
// 08 + 09 are required every night (left Achilles), and on their own are
// the short routine for any night.
export const MOB_DAILY_IDS = ['08', '09']

export interface MobilityDayPlan {
  day: string // what the night follows
  ids: string[] // required tonight, in order
  optional?: string // extra note, e.g. Saturday's optional 06
  time: string
}

// Required moves per night, keyed by getDay() (0 = Sunday).
export const MOB_DAY_PLAN: Record<number, MobilityDayPlan> = {
  0: { day: 'Soccer 80 min', ids: ['05', '06', '10', '08', '09'], time: '~10 min' },
  1: { day: 'Upper A (push) + soccer 100 min', ids: ['01', '02', '05', '06', '10', '08', '09', '11'], time: '~14 min + calf raises' },
  2: { day: 'Swim + KB swings + soccer 40 min', ids: ['01', '02', '03', '04', '10', '08', '09'], time: '~14 min' },
  3: { day: 'Run AM + yoga PM', ids: ['08', '09'], time: '~5 min (yoga covers the rest)' },
  4: { day: 'Upper B (pull), lightest day', ids: ['01', '02', '05', '06', '07', '08', '09', '11'], time: '~14 min + calf raises' },
  5: { day: 'Legs', ids: ['04', '06', '07', '10', '08', '09'], time: '~12 min' },
  6: { day: 'Brick + yoga', ids: ['08', '09'], optional: '06 too if yoga skipped hip flexors', time: '~5-8 min' },
}

export function mobDayPlan(date?: Date): MobilityDayPlan {
  return MOB_DAY_PLAN[(date || new Date()).getDay()]
}

export function mobRequiredIds(date?: Date): string[] {
  return mobDayPlan(date).ids
}

export const MOB_COVERAGE: { area: string; when: string }[] = [
  { area: 'Thoracic / lats (01, 02)', when: 'Mon, Tue, Thu, plus Wed/Sat yoga' },
  { area: 'Back of shoulder (03)', when: 'Tue, after swim' },
  { area: 'Hip rotation (05)', when: 'Mon, Thu, Sun' },
  { area: 'Hip flexors / quads (06)', when: 'Mon, Thu, Fri, Sun, plus Sat optional' },
  { area: 'Glutes / piriformis (07)', when: 'Thu, Fri' },
  { area: 'Groin (10)', when: 'Sun, Mon, Tue (every soccer day), Fri' },
  { area: 'Full chain (04)', when: 'Tue, Fri' },
  { area: 'Ankle / Achilles (08, 09)', when: 'Every night' },
  { area: 'Achilles loading (11)', when: 'Mon, Thu' },
]

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
