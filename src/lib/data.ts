
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

// Moderate cut, Oct 6 - Dec 31 2026: flat daily targets (same food every
// day), set in Cronometer. Cronometer warns "target totals don't match"
// (macros = 2,233 kcal); ignore it, the gap is ~40g/day of fiber and logged
// days land ~2,150. Saturday: same breakfast + lunch, cheat dinner capped at
// ~800-1,000 kcal and logged with a rough estimate, ~2,600 total. Saturday's
// macros are the weekday ones; only its calories differ.
export const CUT_START = '2026-10-06'
const CUT_NOTE = 'Moderate cut · same food every day'

export const NUTRITION_TARGETS: NutritionDay[] = [
  { day: 'Monday',    activity: 'Upper A + Soccer',   calories: 2150, protein: 180, carbs: 250, fat: 57, notes: CUT_NOTE },
  { day: 'Tuesday',   activity: 'Swim + KB + Soccer', calories: 2150, protein: 180, carbs: 250, fat: 57, notes: CUT_NOTE },
  { day: 'Wednesday', activity: 'Run + Yoga',         calories: 2150, protein: 180, carbs: 250, fat: 57, notes: CUT_NOTE },
  { day: 'Thursday',  activity: 'Upper B',            calories: 2150, protein: 180, carbs: 250, fat: 57, notes: CUT_NOTE },
  { day: 'Friday',    activity: 'Legs',               calories: 2150, protein: 180, carbs: 250, fat: 57, notes: CUT_NOTE },
  { day: 'Saturday',  activity: 'Brick + Yoga',       calories: 2600, protein: 180, carbs: 250, fat: 57, notes: 'Same breakfast + lunch; cheat dinner ~800-1,000 kcal, logged as a rough estimate' },
  { day: 'Sunday',    activity: 'Soccer',             calories: 2150, protein: 180, carbs: 250, fat: 57, notes: CUT_NOTE },
]

// Maintenance targets in effect before CUT_START (Saturday was untracked),
// so charts don't grade older days against the cut.
const PRE_CUT_TARGET = { calories: 2650, protein: 200, carbs: 250, fat: 85 }
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// The target that applied on a given YYYY-MM-DD.
export function nutritionTargetFor(date: string): { calories: number; protein: number; carbs: number; fat: number } {
  const dow = new Date(date + 'T12:00:00').getDay()
  if (date < CUT_START) return dow === 6 ? { calories: 0, protein: 0, carbs: 0, fat: 0 } : PRE_CUT_TARGET
  const t = NUTRITION_TARGETS.find(d => d.day === DAY_NAMES[dow])!
  return { calories: t.calories, protein: t.protein, carbs: t.carbs, fat: t.fat }
}

export const NUTRITION_BASELINE = {
  calories: 2150,
  saturdayCalories: 2600,
  protein: 180,
  carbs: 250,
  fat: 57,
  sodium: '~3,000 mg (3,000–4,000 on soccer days)',
  waterOz: 80,
  maintenance: 2550, // Garmin 4-week average burn
  weeklyAvgCalories: 2215,
  lossPerWeek: 0.65,
  startWeight: 197.5, // Oct 6 2026
  targetWeight: 185,
  weight: 197.5, // static fallback only — the Fuel page shows live weight from Supabase `biometrics` when available
  goalBf: '14–16%',
}

// Every 3 weeks from CUT_START, judged on the 7-day average weight.
export const CUT_CHECK_IN = [
  { when: 'Losing <0.5 lb/week', action: 'Drop to ~2,050 (cut oats to 30g dry, about −110)' },
  { when: 'Losing 0.5–1 lb/week', action: 'No change' },
  { when: 'Losing >1 lb/week', action: 'Go up to ~2,240 (avocado oil back to 3 tsp, +80)' },
]

export const MEAL_TEMPLATE = [
  { meal: 'Breakfast', kcal: '~1,015', items: 'Quaker quick oats 60g dry (1.5 servings), honey 42g, 3 eggs, Wegmans egg whites 60g, blueberries 75g, Fairlife 2% milk 2 cups, medium banana, ketchup 1 tbsp' },
  { meal: 'Lunch', kcal: '~669', items: 'Chicken & Tofu Chili Meal Prep, 1 serving (~753g incl. 93g rice)' },
  { meal: 'Dinner', kcal: '~390', items: 'Lean protein ~5–6 oz (pork tenderloin or chicken breast), cannellini beans 100g, vegetable 100g, avocado oil 1 tsp, garlic' },
  { meal: 'Supplements', kcal: '~83', items: 'Mostly the collagen' },
]
