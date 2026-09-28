// Pick-list for "+ Add lift" on /program. Picking one only fills in the
// name (still editable); nothing here is stored. Grouped by muscle group /
// modality, then equipment, for <optgroup>s in the dropdown.

export interface ExerciseGroup {
  label: string
  items: string[]
}

export const EXERCISE_LIBRARY: ExerciseGroup[] = [
  { label: 'Chest · Barbell', items: ['Flat bench press', 'Incline bench press', 'Decline bench press', 'Close-grip bench press', 'Spoto press', 'Floor press', 'Paused bench press', 'Reverse-grip bench press'] },
  { label: 'Chest · Dumbbell', items: ['Flat DB press', 'Incline DB press', 'Decline DB press', 'DB flye (flat, incline, decline)', 'DB pullover', 'Single-arm DB press'] },
  { label: 'Chest · Cable / Machine', items: ['Cable crossover (low-to-high, high-to-low, mid)', 'Pec deck / machine flye', 'Machine chest press (flat, incline)', 'Seated cable press'] },
  { label: 'Chest · Bodyweight', items: ['Push-up (standard, wide, narrow, diamond, archer, pike, decline, incline, explosive)', 'Dip (chest-forward lean emphasis)'] },

  { label: 'Back · Barbell', items: ['Conventional deadlift', 'Sumo deadlift', 'Romanian deadlift (RDL)', 'Bent-over barbell row (overhand, underhand)', 'Pendlay row', 'T-bar row', 'Rack pull', 'Good morning', 'Barbell shrug', 'Barbell hip thrust'] },
  { label: 'Back · Dumbbell', items: ['DB row (single-arm, supported, chest-supported)', 'DB shrug', 'DB pullover'] },
  { label: 'Back · Cable', items: ['Lat pulldown (wide, neutral, close, single-arm, behind neck)', 'Seated cable row (wide, narrow, single-arm, high, low)', 'Cable straight-arm pulldown', 'Face pull', 'Cable shrug', 'Single-arm cable row'] },
  { label: 'Back · Machine', items: ['Machine row (chest-supported, plate-loaded, selectorized)', 'Machine lat pulldown', 'Machine pullover', 'Hammer Strength row / pulldown'] },
  { label: 'Back · Bodyweight', items: ['Pull-up (wide, neutral, close, weighted)', 'Chin-up (weighted)', 'Inverted row (TRX, barbell)', 'Ring row'] },

  { label: 'Shoulders · Barbell', items: ['Overhead press / military press (seated, standing)', 'Behind-the-neck press', 'Push press', 'Bradford press', 'Z-press', 'Upright row'] },
  { label: 'Shoulders · Dumbbell', items: ['DB shoulder press (seated, standing)', 'Arnold press', 'Lateral raise (standing, seated, bent-over)', 'Front raise', 'Rear delt flye / reverse flye', 'DB upright row', 'DB shrug'] },
  { label: 'Shoulders · Cable / Machine', items: ['Cable lateral raise', 'Cable front raise', 'Cable rear delt flye', 'Machine shoulder press', 'Machine lateral raise', 'Machine rear delt'] },
  { label: 'Shoulders · Bodyweight', items: ['Pike push-up', 'Handstand push-up (wall-assisted, freestanding)'] },

  { label: 'Biceps · Barbell', items: ['Barbell curl', 'EZ-bar curl', 'Reverse curl', 'Preacher curl (barbell, EZ-bar)', 'Drag curl', 'Cheat curl'] },
  { label: 'Biceps · Dumbbell', items: ['DB curl (standing, seated, alternating, simultaneous)', 'Hammer curl', 'Concentration curl', 'Incline DB curl', 'Zottman curl', 'Cross-body hammer curl'] },
  { label: 'Biceps · Cable / Machine', items: ['Cable curl (straight bar, EZ-bar, rope, single-arm)', 'Machine preacher curl', 'High cable curl', 'Overhead cable curl (double)'] },

  { label: 'Triceps · Barbell', items: ['Skull crusher (flat, incline, EZ-bar)', 'Close-grip bench press', 'JM press'] },
  { label: 'Triceps · Dumbbell', items: ['DB skull crusher', 'Overhead DB tricep extension (single, double)', 'DB kickback'] },
  { label: 'Triceps · Cable / Machine', items: ['Tricep pushdown (rope, straight bar, V-bar, single-arm)', 'Overhead cable tricep extension (rope, single-arm)', 'Cable kickback', 'Machine tricep extension', 'Machine dip'] },
  { label: 'Triceps · Bodyweight', items: ['Dip (tricep-upright emphasis)', 'Diamond push-up', 'Bench dip'] },

  { label: 'Forearms', items: ['Wrist curl (barbell, DB)', 'Reverse wrist curl', "Farmer's carry", 'Plate pinch hold', 'Dead hang', 'Towel pull-up', 'Reverse curl', 'Behind-the-back wrist curl'] },

  { label: 'Quads · Barbell', items: ['Back squat (high bar, low bar)', 'Front squat', 'Hack squat (barbell)', 'Pause squat', 'Box squat', 'Pin squat', 'Bulgarian split squat (barbell)', 'Step-up (barbell)', 'Lunge (barbell, walking, reverse, lateral)'] },
  { label: 'Quads · Dumbbell / Kettlebell', items: ['Goblet squat', 'DB Bulgarian split squat', 'DB lunge', 'DB step-up', 'DB sumo squat'] },
  { label: 'Quads · Machine', items: ['Leg press (feet high, feet low, single-leg, wide, narrow)', 'Hack squat machine', 'Leg extension', 'Smith machine squat', 'Pendulum squat', 'Sissy squat'] },
  { label: 'Quads · Bodyweight', items: ['Bodyweight squat', 'Pistol squat', 'Bulgarian split squat (BW)', 'Wall sit', 'Jump squat'] },

  { label: 'Hamstrings', items: ['Romanian deadlift', 'Stiff-leg deadlift', 'Nordic hamstring curl', 'Leg curl (lying, seated, standing)', 'Single-leg leg curl', 'Glute-ham raise (GHR)', 'Good morning', 'DB single-leg RDL', 'Cable pull-through'] },

  { label: 'Glutes', items: ['Hip thrust (barbell, machine, single-leg)', 'Glute bridge (barbell, BW, single-leg)', 'Cable kickback', 'Machine hip extension', 'Donkey kick', 'Hip abduction machine', 'Banded squat walk', 'RDL (glute emphasis)', 'Step-up (glute emphasis)', 'Reverse hyper'] },

  { label: 'Calves', items: ['Standing calf raise (Smith, machine, DB, single-leg)', 'Seated calf raise', 'Leg press calf raise', 'Donkey calf raise', 'Single-leg calf raise (BW, on step)'] },

  { label: 'Core · Anti-Extension', items: ['Ab wheel rollout', 'Plank (standard, side, RKC)', 'Dead bug', 'Hollow body hold', 'Barbell rollout', 'Stability ball rollout', 'TRX fallout', 'Hardstyle plank'] },
  { label: 'Core · Anti-Rotation', items: ['Pallof press (cable, band)', 'Single-arm carry', 'Suitcase carry'] },
  { label: 'Core · Flexion', items: ['Crunch (BW, weighted, cable)', 'Sit-up', 'Decline sit-up', 'Cable crunch', 'Decline crunch', 'Hanging knee raise', 'Hanging leg raise', 'Toes-to-bar', 'Dragon flag', 'Bicycle crunch', 'V-up', 'Roman chair sit-up', 'Reverse crunch'] },
  { label: 'Core · Anti-Lateral Flexion', items: ['Side plank', 'Suitcase deadlift', 'Copenhagen plank'] },
  { label: 'Core · Rotation', items: ['Russian twist', 'Cable woodchop (high, low, mid)', 'Medicine ball rotational throw', 'Landmine rotation', 'Seated cable twist'] },
  { label: 'Core · Hip Flexors / Integrated', items: ['L-sit (parallettes, rings, floor)', 'Hanging L-sit', 'Lying leg raise', 'Flutter kick', 'Mountain climber'] },

  { label: 'Compound / Full Body / Power', items: ['Power clean', 'Hang clean', 'Power snatch', 'Hang snatch', 'Clean and press', 'Push press', 'Thruster (barbell, DB, KB)', 'Kettlebell swing (single, double)', 'Kettlebell clean', 'Kettlebell snatch', 'Landmine press', 'Landmine squat', 'Landmine deadlift', 'Barbell complex', 'Trap bar deadlift', 'Trap bar jump', "Farmer's carry", 'Yoke carry', 'Sandbag carry / loading', 'Battle ropes', 'Slam ball slam', 'Wall ball'] },

  { label: 'Plyometrics · Lower Body', items: ['Box jump', 'Broad jump', 'Depth jump', 'Drop jump', 'Single-leg box jump', 'Lateral box jump', 'Tuck jump', 'Split jump / scissor jump', 'Broad jump to box jump', 'Bounding', 'Hurdle hop (bilateral, unilateral)', 'Lateral bound', 'Pogo jump', 'Ankle hop', 'Jump squat', 'Squat jump to box', 'Step-up jump', 'Reactive jump (bilateral, unilateral)'] },
  { label: 'Plyometrics · Upper Body', items: ['Plyo push-up (standard, clap, wide, archer)', 'Medicine ball chest pass', 'Medicine ball overhead slam', 'Medicine ball rotational throw', 'Medicine ball push press'] },
  { label: 'Plyometrics · Total Body', items: ['Broad jump to sprint start', 'Skater bounds', 'Reactive drop landing drill', 'Box jump to deceleration', 'Hurdle bound sequence'] },

  { label: 'Static Stretch · Lower Body', items: ['Standing quad stretch', 'Prone quad stretch', 'Kneeling hip flexor stretch (couch, lunge)', 'Pigeon pose', 'Figure-4 / seated piriformis stretch', 'Lying glute stretch', 'Standing hamstring stretch', 'Seated hamstring stretch', 'Supine hamstring stretch', 'Straight-leg calf stretch', 'Bent-knee calf/soleus stretch', 'Butterfly stretch', 'Wide-leg seated forward fold', 'Lateral lunge stretch', 'Ankle cross-body adductor stretch'] },
  { label: 'Static Stretch · Upper Body', items: ['Cross-body shoulder stretch', 'Doorway chest stretch (low, mid, high)', 'Overhead tricep stretch', 'Bicep wall stretch', 'Wrist flexor/extensor stretch', 'Behind-back shoulder reach', 'Neck side tilt / rotation', 'Levator scapulae stretch'] },
  { label: 'Static Stretch · Spine / Thoracic', items: ["Child's pose", 'Cat-cow', 'Supine twist', 'Seated spinal twist', 'Thread the needle', 'Thoracic extension over foam roller', 'Prayer stretch'] },

  { label: 'Mobility · Hip / Lower Body', items: ['Hip circle / hip CARs', 'Leg swing (front-back, lateral)', "World's greatest stretch", 'Deep squat hold / squat to stand', 'Walking lunge with torso rotation', 'Lateral lunge walk', 'Inchworm', 'Spiderman stretch (with rotation)', 'Pigeon stretch flow', '90/90 hip shift', 'Hip hinge to toe touch', 'Sumo squat hip pry'] },
  { label: 'Mobility · Spine / Thoracic', items: ['Thoracic rotation (quadruped, open book, seated)', 'Cat-cow flow', 'Segmental forward fold', 'Prone cobra / press-up', 'Back extension'] },
  { label: 'Mobility · Shoulder / Upper Body', items: ['Arm circle', 'Band pull-apart', 'Wall slide', 'Shoulder CARs', 'Overhead reach with lat bias', 'PVC pipe pass-through', 'Scapular wall slide', 'Wrist circle / wrist CARs'] },
  { label: 'Mobility · Ankle', items: ['Ankle circle / ankle CARs', 'Half-kneeling ankle dorsiflexion', 'Banded ankle distraction'] },

  { label: 'Accessory / Corrective / Stability', items: ['Bird dog', 'Clamshell (banded, cable)', 'Monster walk (banded)', 'Single-leg glute bridge', 'X-band walk', 'Hip abduction (machine, side-lying, cable)', 'Hip adduction (machine, cable)', 'Copenhagen adduction', 'Scapular push-up', 'Prone Y-T-W', 'Band pull-apart', 'Face pull', 'External rotation (cable, DB)', 'Internal rotation (cable, DB)', 'Serratus punch / push-up plus', 'Single-leg balance', 'Split squat iso hold', 'Terminal knee extension (TKE)', 'Reverse hyper', 'Back extension (hyperextension bench)', 'GHR hold / isometric'] },

  { label: 'Kettlebell', items: ['KB halos', 'Around the worlds'] },
]
