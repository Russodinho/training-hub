'use client'

import { useState } from 'react'

type IngState = 'raw' | 'cooked' | 'canned' | 'dry' | 'frozen' | 'seasoning'
type ReheatMethod = 'microwave' | 'stovetop' | 'oven' | 'cold' | 'toaster' | 'airfryer'
type TabType = 'breakfast' | 'lunch' | 'dinner'

interface Ingredient {
  name: string
  state: IngState
  full: string
  per: string
}

interface Step {
  title: string
  desc: string
}

interface Reheat {
  method: ReheatMethod
  desc: string
}

interface Meal {
  name: string
  subtitle: string
  icon: string
  tag: string
  kcal: number
  p: number
  c: number
  f: number
  ingredients: Ingredient[]
  steps: Step[]
  note: string
  reheat: Reheat[]
}

const MEALS: Record<TabType, Meal[]> = {
  breakfast: [
    {
      name: "Current Breakfast — Egg White Oat Scramble",
      subtitle: "Fairlife milk · oats · 3 eggs + egg whites · Greek yogurt · honey · blueberries",
      icon: "⭐",
      tag: "Your current breakfast · Benchmark",
      kcal: 1080, p: 91, c: 108, f: 16,
      ingredients: [
        { name: "Fairlife 2% milk", state: "raw", full: "2 cups", per: "2 cups" },
        { name: "Quaker rolled oats", state: "dry", full: "80g", per: "80g" },
        { name: "Whole eggs", state: "raw", full: "3 large", per: "3 large" },
        { name: "Liquid egg whites", state: "raw", full: "92g", per: "92g" },
        { name: "Fage 0% Greek yogurt", state: "raw", full: "170g", per: "170g" },
        { name: "Honey", state: "raw", full: "31g", per: "31g" },
        { name: "Blueberries", state: "raw", full: "50g", per: "50g" },
        { name: "Flaxseed, ground", state: "raw", full: "10g", per: "10g" },
        { name: "Chia seeds", state: "raw", full: "5g", per: "5g" },
        { name: "Avocado oil spray", state: "seasoning", full: "1 tsp", per: "1 tsp" },
      ],
      steps: [
        { title: "Cook oats", desc: "Cook oats in Fairlife milk on stovetop or microwave 3–4 min. Stir in flaxseed and chia. Top with blueberries and drizzle honey over." },
        { title: "Scramble eggs", desc: "Spray pan over medium heat. Whisk whole eggs and egg whites together. Scramble until just set — don't overcook." },
        { title: "Plate", desc: "Serve oats and eggs side by side. Add Greek yogurt on the side — eat plain or alongside the oats." },
      ],
      note: "Your daily anchor. Use this on the heaviest training days (Mon, Thu: 2,900 / 2,700 kcal) when you need the full carb load. Honey is non-negotiable — stays in every day.",
      reheat: [
        { method: "cold", desc: "No reheat needed — make fresh each morning in ~10 min. Oats cook in 3–4 min on stovetop or microwave." },
      ],
    },
    {
      name: "Greek Yogurt Power Bowl",
      subtitle: "Fage 0% · granola · banana · honey · peanut butter · protein shake",
      icon: "🥣",
      tag: "Zero cooking · 3 min assembly",
      kcal: 1040, p: 89, c: 112, f: 15,
      ingredients: [
        { name: "Fage 0% Greek yogurt", state: "raw", full: "340g", per: "340g" },
        { name: "Low-sugar granola", state: "dry", full: "50g", per: "50g" },
        { name: "Banana, sliced", state: "raw", full: "1 medium", per: "1 medium" },
        { name: "Honey", state: "raw", full: "20g", per: "20g" },
        { name: "Powdered peanut butter (PB2)", state: "dry", full: "20g", per: "20g" },
        { name: "Fairlife Core Power shake (vanilla)", state: "raw", full: "1 bottle (414ml)", per: "1 bottle" },
      ],
      steps: [
        { title: "Build bowl", desc: "Spoon Greek yogurt into a wide bowl. Top with granola and sliced banana." },
        { title: "Add toppings", desc: "Mix PB2 with 2 tbsp water until smooth. Drizzle over the bowl along with honey." },
        { title: "Drink shake alongside", desc: "Pop the Core Power — drink it with the bowl to hit full protein target." },
      ],
      note: "Literally 3 minutes. Fairlife Core Power has 26g P per bottle and tastes good cold. PB2 adds peanut butter flavor at 80% less fat than regular peanut butter. Keep everything stocked and there is zero decision-making in the morning.",
      reheat: [
        { method: "cold", desc: "No reheat — assembled straight from the fridge. This is a feature, not a bug." },
      ],
    },
    {
      name: "High-Protein Breakfast Burrito",
      subtitle: "Carb Balance tortillas · eggs · black beans · salsa",
      icon: "🌯",
      tag: "Best meal-prep option",
      kcal: 1060, p: 87, c: 108, f: 17,
      ingredients: [
        { name: "Mission Carb Balance tortillas (large)", state: "raw", full: "10 (batch of 5)", per: "2" },
        { name: "Whole eggs", state: "raw", full: "15 large (batch of 5)", per: "3 large" },
        { name: "Liquid egg whites", state: "raw", full: "920g (batch of 5)", per: "184g" },
        { name: "Black beans, drained", state: "canned", full: "600g (batch of 5)", per: "120g" },
        { name: "Bell pepper & onion mix, diced", state: "raw", full: "500g (batch of 5)", per: "100g" },
        { name: "Reduced-fat cheddar", state: "raw", full: "150g (batch of 5)", per: "30g" },
        { name: "Salsa", state: "raw", full: "300g (batch of 5)", per: "60g" },
        { name: "Avocado oil spray", state: "seasoning", full: "5 tsp (batch of 5)", per: "1 tsp" },
        { name: "Cumin", state: "seasoning", full: "2½ tsp (batch of 5)", per: "½ tsp" },
        { name: "Garlic powder", state: "seasoning", full: "2½ tsp (batch of 5)", per: "½ tsp" },
        { name: "Salt", state: "seasoning", full: "2½ tsp (batch of 5)", per: "½ tsp" },
      ],
      steps: [
        { title: "Cook veg & beans", desc: "Spray pan, sauté peppers and onions with cumin, garlic, and salt ~4 min. Add beans and warm through." },
        { title: "Scramble eggs", desc: "Whisk eggs and egg whites. Scramble in the same pan until just set — slightly underdone is fine." },
        { title: "Build burritos", desc: "Lay out both tortillas. Divide filling, top with cheese and salsa. Roll tightly, tucking edges." },
        { title: "Toast or store", desc: "Toast seam-side down 1–2 min for crisp exterior, or wrap in foil and refrigerate." },
      ],
      note: "Make 5 on Sunday. Reheat from fridge in 3 min. Carb Balance tortillas: 70 kcal, 7g fiber, 5g P each — best macro tortilla available.",
      reheat: [
        { method: "microwave", desc: "Wrap in a damp paper towel, microwave 2–3 min flipping halfway. Keeps it moist and avoids rubbery eggs." },
        { method: "stovetop", desc: "Unwrap foil, place in a dry pan over medium-low, cover with a lid. 4–5 min per side — gets the tortilla crispy again." },
        { method: "oven", desc: "Keep in foil, bake at 350°F for 15–18 min. Best for heating from frozen." },
      ],
    },
    {
      name: "Protein Waffle Stack",
      subtitle: "Kodiak mix · eggs · Greek yogurt · banana · peanut butter",
      icon: "🧇",
      tag: "Feels like a cheat meal",
      kcal: 1055, p: 88, c: 107, f: 17,
      ingredients: [
        { name: "Kodiak Cakes Power Waffles mix", state: "dry", full: "140g", per: "140g" },
        { name: "Whole eggs", state: "raw", full: "2 large", per: "2 large" },
        { name: "Fairlife 2% milk", state: "raw", full: "180ml", per: "180ml" },
        { name: "Fage 0% Greek yogurt", state: "raw", full: "170g", per: "170g" },
        { name: "Banana, sliced", state: "raw", full: "1 medium", per: "1 medium" },
        { name: "Powdered peanut butter (PB2)", state: "dry", full: "20g", per: "20g" },
        { name: "Honey", state: "raw", full: "15g", per: "15g" },
        { name: "Avocado oil spray", state: "seasoning", full: "1 tsp", per: "1 tsp" },
      ],
      steps: [
        { title: "Make batter", desc: "Whisk Kodiak mix, eggs, and Fairlife milk together until just combined — small lumps are fine." },
        { title: "Cook waffles", desc: "Spray waffle iron with avocado oil. Pour batter per your iron's instructions. Cook until golden and crisp, ~4–5 min." },
        { title: "Make PB drizzle", desc: "Mix PB2 with 2–3 tbsp water until smooth and pourable." },
        { title: "Stack & top", desc: "Stack waffles on a plate. Top with Greek yogurt, sliced banana, drizzle PB2 and honey." },
      ],
      note: "Kodiak Cakes: 14g P per 1/2 cup dry — by far the highest-protein waffle mix available. Batter keeps refrigerated 2 days. PB2 adds peanut butter flavor at 80% less fat. Genuinely one of the best-tasting breakfasts on this list.",
      reheat: [
        { method: "toaster", desc: "Best option — 2 min on medium setting. Waffles come out crispy again like fresh off the iron." },
        { method: "oven", desc: "400°F for 5–6 min directly on the rack. Nearly as good as the toaster, better for multiple waffles at once." },
        { method: "stovetop", desc: "Dry pan over medium, 2 min per side. Gets a nice crust but takes more attention." },
      ],
    },
    {
      name: "High-Protein French Toast Stack",
      subtitle: "Protein bread · eggs · Greek yogurt · mixed berries",
      icon: "🍞",
      tag: "Feels like a cheat meal",
      kcal: 1050, p: 89, c: 110, f: 16,
      ingredients: [
        { name: "High-protein bread (Dave's Killer or Ezekiel)", state: "raw", full: "4 slices", per: "4 slices" },
        { name: "Whole eggs", state: "raw", full: "3 large", per: "3 large" },
        { name: "Liquid egg whites", state: "raw", full: "138g", per: "138g" },
        { name: "Fairlife 2% milk", state: "raw", full: "120ml", per: "120ml" },
        { name: "Fage 0% Greek yogurt", state: "raw", full: "170g", per: "170g" },
        { name: "Mixed berries", state: "raw", full: "150g", per: "150g" },
        { name: "Honey", state: "raw", full: "20g", per: "20g" },
        { name: "Vanilla extract", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Cinnamon", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Avocado oil spray", state: "seasoning", full: "1 tsp", per: "1 tsp" },
      ],
      steps: [
        { title: "Make egg dip", desc: "Whisk whole eggs, egg whites, milk, vanilla, and cinnamon in a wide shallow bowl." },
        { title: "Soak bread", desc: "Soak each slice 30 seconds per side until fully saturated." },
        { title: "Cook", desc: "Spray pan over medium heat. Cook each slice 2–3 min per side until golden. Work in batches." },
        { title: "Top & serve", desc: "Stack slices. Top with Greek yogurt, mixed berries, and drizzle honey." },
      ],
      note: "Dave's Killer 21 Whole Grains: 5g P per slice. Ezekiel: 6g P per slice. Greek yogurt adds 18g more protein in place of whipped cream.",
      reheat: [
        { method: "toaster", desc: "Best option — 1–2 min on medium. Restores the crispy exterior perfectly. Add toppings after." },
        { method: "stovetop", desc: "Dry pan over medium, 1–2 min per side. Watch closely — the honey in the egg coating burns fast on high heat." },
        { method: "oven", desc: "375°F for 8–10 min on a rack. Good for a full batch at once." },
      ],
    },
  ],

  lunch: [
    {
      name: "Turkey & Rice Burrito Bowl",
      subtitle: "Ground turkey · brown rice · black beans · spinach",
      icon: "🥣",
      tag: "4 servings · Office-safe",
      kcal: 590, p: 43, c: 58, f: 12,
      ingredients: [
        { name: "Ground turkey 93/7", state: "raw", full: "600g", per: "150g" },
        { name: "Brown rice, dry", state: "dry", full: "280g", per: "70g" },
        { name: "Black beans, drained", state: "canned", full: "320g", per: "80g" },
        { name: "Spinach, raw", state: "raw", full: "120g", per: "30g" },
        { name: "Salsa", state: "raw", full: "4 tbsp", per: "1 tbsp" },
        { name: "Cumin", state: "seasoning", full: "2 tsp", per: "½ tsp" },
        { name: "Paprika", state: "seasoning", full: "2 tsp", per: "½ tsp" },
        { name: "Garlic powder", state: "seasoning", full: "1 tsp", per: "¼ tsp" },
        { name: "Onion powder", state: "seasoning", full: "1 tsp", per: "¼ tsp" },
        { name: "Low-sodium soy sauce", state: "seasoning", full: "2 tbsp", per: "½ tbsp" },
        { name: "Avocado oil spray", state: "seasoning", full: "2 tsp", per: "½ tsp" },
      ],
      steps: [
        { title: "Cook rice", desc: "Cook brown rice per package instructions. Fluff and cool." },
        { title: "Brown turkey", desc: "Spray pan, add turkey, break apart. Cook until no pink remains ~8 min." },
        { title: "Season", desc: "Add cumin, paprika, garlic powder, onion powder, and soy sauce. Stir and cook 2 more min." },
        { title: "Add beans", desc: "Stir in black beans and warm through ~2 min." },
        { title: "Portion", desc: "Divide rice across 4 containers, top with turkey-bean mix and salsa. Keep spinach separate — add cold at work." },
      ],
      note: "~45 min total Sunday prep for 4 containers. Reheat 2 min, add cold spinach after.",
      reheat: [
        { method: "microwave", desc: "2 min covered, stir halfway. Add cold spinach on top after heating — don't microwave the greens." },
        { method: "stovetop", desc: "Tip into a small pan over medium heat, splash of water to loosen, stir 3–4 min until hot. Add spinach raw on top when plating." },
      ],
    },
    {
      name: "Turkey & Veggie Stir-Fry over Rice",
      subtitle: "Ground turkey · frozen stir-fry veg · brown rice · Asian seasoning",
      icon: "🥡",
      tag: "4 servings · Works cold",
      kcal: 570, p: 42, c: 55, f: 14,
      ingredients: [
        { name: "Ground turkey 93/7", state: "raw", full: "600g", per: "150g" },
        { name: "Brown rice, dry", state: "dry", full: "280g", per: "70g" },
        { name: "Frozen stir-fry veg blend", state: "frozen", full: "480g", per: "120g" },
        { name: "Low-sodium soy sauce", state: "seasoning", full: "4 tbsp", per: "1 tbsp" },
        { name: "Garlic powder", state: "seasoning", full: "1 tsp", per: "¼ tsp" },
        { name: "Ginger powder", state: "seasoning", full: "1 tsp", per: "¼ tsp" },
        { name: "Rice vinegar", state: "seasoning", full: "2 tbsp", per: "½ tbsp" },
        { name: "Sesame oil", state: "seasoning", full: "1 tsp", per: "¼ tsp" },
        { name: "Avocado oil spray", state: "seasoning", full: "1 tsp", per: "¼ tsp" },
      ],
      steps: [
        { title: "Cook rice", desc: "Cook brown rice per package. Set aside." },
        { title: "Brown turkey", desc: "Spray pan, add turkey. Break apart and cook through ~8 min." },
        { title: "Add veg", desc: "Add frozen veg directly from bag. Cook 4–5 min until liquid evaporates." },
        { title: "Season", desc: "Add soy sauce, garlic, ginger, rice vinegar, and sesame oil. Toss and cook 2 more min." },
        { title: "Portion", desc: "Divide rice across 4 containers, top with stir-fry mixture." },
      ],
      note: "Stir-fry texture holds up well in the microwave. Works cold if you're in a pinch.",
      reheat: [
        { method: "microwave", desc: "2 min covered. Stir-fry holds up better than most meals — texture stays solid." },
        { method: "stovetop", desc: "Best option — high heat, 3 min in a pan with a splash of soy sauce. Brings back the stir-fry char." },
        { method: "cold", desc: "Actually works fine cold — the rice firms up and the flavors intensify overnight." },
      ],
    },
    {
      name: "Greek Chicken & Farro Bowl",
      subtitle: "Chicken thighs · farro · tzatziki · cucumber · cherry tomatoes",
      icon: "🫙",
      tag: "4 servings · Top pick · Office-safe",
      kcal: 580, p: 46, c: 52, f: 16,
      ingredients: [
        { name: "Boneless skinless chicken thighs", state: "raw", full: "700g", per: "175g" },
        { name: "Farro, dry", state: "dry", full: "240g", per: "60g" },
        { name: "Cherry tomatoes, halved", state: "raw", full: "200g", per: "50g" },
        { name: "Cucumber, diced", state: "raw", full: "200g", per: "50g" },
        { name: "Fage 0% Greek yogurt (tzatziki)", state: "raw", full: "80g", per: "20g" },
        { name: "Lemon, juiced", state: "raw", full: "1 lemon", per: "¼ lemon" },
        { name: "Garlic cloves, minced", state: "raw", full: "2 cloves", per: "½ clove" },
        { name: "Dried oregano", state: "seasoning", full: "2 tsp", per: "½ tsp" },
        { name: "Paprika", state: "seasoning", full: "1 tsp", per: "¼ tsp" },
        { name: "Avocado oil", state: "seasoning", full: "1 tbsp", per: "¼ tbsp" },
        { name: "Dried dill", state: "seasoning", full: "½ tsp", per: "pinch" },
      ],
      steps: [
        { title: "Marinate chicken", desc: "Mix oil, lemon, oregano, paprika, garlic, and salt. Coat thighs and marinate ≥30 min (overnight best)." },
        { title: "Cook farro", desc: "Cook farro in salted water 25–30 min. Drain and cool." },
        { title: "Cook chicken", desc: "Grill or pan-cook thighs 5–6 min per side until 165°F internal. Rest 5 min, then slice." },
        { title: "Make tzatziki", desc: "Mix Greek yogurt with lemon juice, dill, and a pinch of salt." },
        { title: "Portion", desc: "Divide farro and chicken across 4 containers. Pack tomatoes, cucumber, and tzatziki separately — add cold at work." },
      ],
      note: "Office-friendly — no strong smell. Chicken thighs reheat without drying out unlike breast. Keep veg separate to prevent sogginess.",
      reheat: [
        { method: "microwave", desc: "Reheat farro + chicken only, 2 min covered. Add cold cucumber, tomatoes, and tzatziki straight from the container after." },
        { method: "stovetop", desc: "Slice chicken thin, heat in a pan over medium with a tbsp of water or lemon juice, 2–3 min. Heat farro separately in a small pot with a splash of water. Add cold veg after." },
        { method: "cold", desc: "Genuinely good cold — farro holds its texture well. A solid option if you're short on time at the office." },
      ],
    },
    {
      name: "Baked Salmon & Sweet Potato",
      subtitle: "Salmon fillet · sweet potato · broccoli · lemon-dill",
      icon: "🐠",
      tag: "3 servings · Home only",
      kcal: 560, p: 44, c: 48, f: 18,
      ingredients: [
        { name: "Salmon fillets", state: "raw", full: "540g", per: "180g" },
        { name: "Sweet potato, cubed", state: "raw", full: "450g", per: "150g" },
        { name: "Broccoli florets", state: "raw", full: "300g", per: "100g" },
        { name: "Avocado oil", state: "seasoning", full: "1½ tbsp", per: "½ tbsp" },
        { name: "Lemon, juiced", state: "raw", full: "2 lemons", per: "⅔ lemon" },
        { name: "Garlic powder", state: "seasoning", full: "1 tsp", per: "⅓ tsp" },
        { name: "Dried dill", state: "seasoning", full: "¾ tsp", per: "¼ tsp" },
        { name: "Paprika", state: "seasoning", full: "¾ tsp", per: "¼ tsp" },
        { name: "Salt", state: "seasoning", full: "¾ tsp", per: "¼ tsp" },
      ],
      steps: [
        { title: "Preheat", desc: "Preheat oven to 425°F. Line a large sheet pan with foil." },
        { title: "Prep sweet potato", desc: "Toss sweet potato cubes with half the oil, paprika, and salt. Spread on one side of the pan." },
        { title: "Start roasting", desc: "Roast sweet potato 15 min." },
        { title: "Add salmon & broccoli", desc: "Add broccoli tossed in remaining oil. Place salmon skin-side down in center. Drizzle lemon, sprinkle garlic and dill." },
        { title: "Finish", desc: "Roast 12–15 more min until salmon flakes and broccoli is lightly charred." },
        { title: "Portion", desc: "Cool and divide into 3 containers." },
      ],
      note: "⚠️ Do NOT bring to the office. Prep Wednesday evening — good Thu and Fri only (3 days max refrigerated). Reheat 2 min with lid on.",
      reheat: [
        { method: "oven", desc: "Best option — 275°F for 12–15 min covered with foil. Low and slow prevents the salmon from drying out or getting rubbery." },
        { method: "stovetop", desc: "Medium-low heat, splash of water in the pan, cover with a lid. 3–4 min. Watch it — salmon overcooks fast." },
        { method: "cold", desc: "Cold salmon over the sweet potato and broccoli is actually solid. No reheat needed if you're okay with it room temp." },
      ],
    },
    {
      name: "Cajun Shrimp & Quinoa",
      subtitle: "Frozen shrimp · quinoa · bell peppers · Cajun seasoning",
      icon: "🍤",
      tag: "3 servings · Home only · Leanest",
      kcal: 510, p: 45, c: 54, f: 8,
      ingredients: [
        { name: "Frozen shrimp, peeled & deveined", state: "frozen", full: "450g", per: "150g" },
        { name: "Quinoa, dry", state: "dry", full: "210g", per: "70g" },
        { name: "Bell peppers, sliced", state: "raw", full: "300g", per: "100g" },
        { name: "Avocado oil", state: "seasoning", full: "1 tbsp", per: "⅓ tbsp" },
        { name: "Cajun seasoning (low sodium)", state: "seasoning", full: "2 tsp", per: "⅔ tsp" },
        { name: "Garlic powder", state: "seasoning", full: "¾ tsp", per: "¼ tsp" },
        { name: "Smoked paprika", state: "seasoning", full: "¾ tsp", per: "¼ tsp" },
        { name: "Lemon, juiced", state: "raw", full: "1 lemon", per: "⅓ lemon" },
      ],
      steps: [
        { title: "Cook quinoa", desc: "Cook quinoa with 1.5× water, bring to boil, cover, simmer 12–15 min. Fluff and cool." },
        { title: "Prep shrimp", desc: "Thaw fully. Pat completely dry — critical for sear not steam." },
        { title: "Cook peppers", desc: "Heat half the oil over medium-high. Cook peppers 5–6 min until charred. Set aside." },
        { title: "Cook shrimp", desc: "Add remaining oil. Season shrimp with Cajun, garlic, and paprika. Cook in a single layer — 2 min per side until just opaque." },
        { title: "Portion", desc: "Squeeze lemon over shrimp. Divide quinoa into 3 containers, top with peppers and shrimp." },
      ],
      note: "⚠️ Home lunches only. Add 2 rice cakes on the side to hit carb targets on high-demand days. Thaw shrimp overnight in fridge — never microwave to thaw.",
      reheat: [
        { method: "stovetop", desc: "Best option — high heat, 2 min in a pan. Shrimp reheats fast; pull it off the second it's hot or it turns rubbery. Heat quinoa separately with a splash of water." },
        { method: "cold", desc: "Quinoa holds up cold and shrimp is fine room temp. If you meal-prepped Thursday morning, it's ready to eat by lunch without any reheating." },
      ],
    },
  ],

  dinner: [
    {
      name: "Classic Chicken Breast & Cannellini Beans",
      subtitle: "Chicken breast · cannellini beans · green beans",
      icon: "🍗",
      tag: "Your current dinner",
      kcal: 441, p: 61, c: 15, f: 8,
      ingredients: [
        { name: "Chicken breast", state: "raw", full: "170g", per: "170g" },
        { name: "Goya cannellini beans", state: "canned", full: "100g", per: "100g" },
        { name: "Green beans", state: "raw", full: "100g", per: "100g" },
        { name: "Avocado oil", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Metamucil fiber", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Garlic powder", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Paprika", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Salt", state: "seasoning", full: "½ tsp", per: "½ tsp" },
      ],
      steps: [
        { title: "Cook chicken", desc: "Season breast with garlic, paprika, and salt. Cook in oil over medium-high 5–6 min per side until 165°F. Rest 2 min." },
        { title: "Cook veg & beans", desc: "Steam or microwave green beans 3–4 min. Warm cannellini beans in a small pan." },
        { title: "Metamucil", desc: "Mix in a glass of water and drink before or with the meal." },
      ],
      note: "Your baseline. Avocado oil is your primary calorie lever — skip it on low-target days (Wed: 2,300 kcal). Metamucil every night regardless of which dinner you choose.",
      reheat: [
        { method: "stovetop", desc: "Slice chicken first, then heat in a pan over medium with a tbsp of water or chicken broth, 2–3 min covered. Keeps it moist. Warm beans in the same pan after." },
        { method: "oven", desc: "375°F for 10–12 min covered with foil. Best if reheating a whole breast without slicing." },
      ],
    },
    {
      name: "Lean Beef & Lentil Skillet",
      subtitle: "96/4 ground beef · canned lentils · spinach · tomatoes",
      icon: "🥩",
      tag: "Iron & B12 boost",
      kcal: 430, p: 58, c: 18, f: 9,
      ingredients: [
        { name: "Ground beef 96/4 (extra lean)", state: "raw", full: "150g", per: "150g" },
        { name: "Canned lentils, drained", state: "canned", full: "100g", per: "100g" },
        { name: "Spinach, raw", state: "raw", full: "100g", per: "100g" },
        { name: "Diced tomatoes, canned (no salt)", state: "canned", full: "100g", per: "100g" },
        { name: "Metamucil fiber", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Avocado oil spray", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Cumin", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Smoked paprika", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Garlic powder", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Salt", state: "seasoning", full: "½ tsp", per: "½ tsp" },
      ],
      steps: [
        { title: "Brown beef", desc: "Spray pan over medium-high. Add beef, break apart. Cook until fully browned ~6–8 min." },
        { title: "Season", desc: "Add cumin, paprika, garlic powder, and salt. Stir to coat." },
        { title: "Add lentils & tomatoes", desc: "Add canned lentils and diced tomatoes. Simmer 3–4 min until liquid reduces." },
        { title: "Wilt spinach", desc: "Add spinach and stir until fully wilted ~2 min." },
        { title: "Metamucil", desc: "Serve from pan. Mix Metamucil in water alongside." },
      ],
      note: "96/4 beef = ~145 kcal per 100g, nearly as lean as chicken breast but significantly more iron, zinc, and B12. Good for heavy Monday nights after soccer.",
      reheat: [
        { method: "stovetop", desc: "Back in the pan over medium, splash of water to loosen, stir 3–4 min. The lentils and tomatoes keep it moist — almost impossible to overcook on reheat." },
        { method: "oven", desc: "Oven-safe dish, covered at 350°F for 12 min. Less hands-on than stovetop." },
      ],
    },
    {
      name: "Garlic Ginger Shrimp & Bok Choy Stir-Fry",
      subtitle: "Shrimp · edamame · bok choy · soy-ginger sauce",
      icon: "🦐",
      tag: "Lightest option · Best for Wed",
      kcal: 370, p: 58, c: 14, f: 8,
      ingredients: [
        { name: "Shrimp, frozen peeled & deveined", state: "frozen", full: "200g", per: "200g" },
        { name: "Shelled edamame, frozen", state: "frozen", full: "100g", per: "100g" },
        { name: "Bok choy, chopped", state: "raw", full: "200g", per: "200g" },
        { name: "Metamucil fiber", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Avocado oil spray", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Low-sodium soy sauce", state: "seasoning", full: "1½ tbsp", per: "1½ tbsp" },
        { name: "Sesame oil", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Ginger powder", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Garlic cloves, minced", state: "raw", full: "2 cloves", per: "2 cloves" },
        { name: "Rice vinegar", state: "seasoning", full: "1 tsp", per: "1 tsp" },
      ],
      steps: [
        { title: "Prep shrimp", desc: "Thaw fully and pat completely dry — critical for sear." },
        { title: "Sear shrimp", desc: "Spray pan over high heat. Cook shrimp single layer 90 sec per side. Remove and set aside." },
        { title: "Cook veg", desc: "Add garlic, cook 30 sec. Add bok choy and edamame, stir-fry 3–4 min." },
        { title: "Sauce & finish", desc: "Add soy sauce, sesame oil, ginger, and rice vinegar. Toss. Return shrimp and toss once more." },
        { title: "Metamucil", desc: "Drink Metamucil in water alongside." },
      ],
      note: "Shrimp = 24g P per 100g at only 99 kcal — best protein-per-calorie on the dinner list. Perfect for Wednesday's 2,300 kcal target.",
      reheat: [
        { method: "stovetop", desc: "High heat, 2 min max — shrimp goes rubbery fast. Add a splash of soy sauce and toss constantly. Pull the second it's hot." },
        { method: "cold", desc: "Edamame and bok choy are both fine cold or room temp. This meal works as a cold bowl if you don't want to bother with the pan." },
      ],
    },
    {
      name: "Pork Tenderloin with Brussels & White Beans",
      subtitle: "Pork tenderloin · Brussels sprouts · cannellini beans",
      icon: "🥦",
      tag: "Different protein source",
      kcal: 445, p: 60, c: 17, f: 9,
      ingredients: [
        { name: "Pork tenderloin", state: "raw", full: "180g", per: "180g" },
        { name: "Cannellini beans, drained", state: "canned", full: "100g", per: "100g" },
        { name: "Brussels sprouts, halved", state: "raw", full: "200g", per: "200g" },
        { name: "Metamucil fiber", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Avocado oil", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Dijon mustard", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Garlic powder", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Dried thyme", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Smoked paprika", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Salt", state: "seasoning", full: "½ tsp", per: "½ tsp" },
      ],
      steps: [
        { title: "Roast Brussels", desc: "Preheat oven to 425°F. Toss Brussels with avocado spray and salt. Roast 20–22 min until crispy-edged." },
        { title: "Season pork", desc: "Rub tenderloin with Dijon, garlic, thyme, paprika, and salt." },
        { title: "Sear & roast", desc: "Heat oil in oven-safe pan over high. Sear pork 2 min per side until browned all over. Transfer to oven, roast until 145°F internal ~15–18 min." },
        { title: "Rest & warm beans", desc: "Rest pork 5 min, then slice. Warm cannellini beans separately." },
        { title: "Metamucil", desc: "Plate and drink Metamucil in water alongside." },
      ],
      note: "Pork tenderloin = ~143 kcal per 100g, 26g P — nearly identical macros to chicken breast. Completely different texture and flavor. Dijon acts as a binder and adds flavor without calories.",
      reheat: [
        { method: "oven", desc: "Best option — 325°F for 12–15 min covered with foil. Pork dries out fast; low and slow is the move. Toss Brussels on the same pan uncovered for the last 5 min to re-crisp them." },
        { method: "stovetop", desc: "Slice pork thin, medium heat with a tbsp of water, 2–3 min covered. Reheat Brussels separately in a dry pan on high for 2 min to restore some char." },
        { method: "airfryer", desc: "400°F for 4–5 min. The Brussels come back to life and the pork stays juicy. Best all-around reheat method if you have one." },
      ],
    },
    {
      name: "Turkey & Black Bean Stuffed Peppers",
      subtitle: "Ground turkey · bell peppers · black beans · salsa",
      icon: "🫑",
      tag: "Batch-friendly",
      kcal: 450, p: 57, c: 19, f: 10,
      ingredients: [
        { name: "Large bell peppers, halved lengthwise", state: "raw", full: "2", per: "2" },
        { name: "Ground turkey 93/7", state: "raw", full: "170g", per: "170g" },
        { name: "Black beans, drained", state: "canned", full: "100g", per: "100g" },
        { name: "Salsa", state: "raw", full: "80g", per: "80g" },
        { name: "Metamucil fiber", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Avocado oil spray", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Cumin", state: "seasoning", full: "1 tsp", per: "1 tsp" },
        { name: "Chili powder", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Garlic powder", state: "seasoning", full: "½ tsp", per: "½ tsp" },
        { name: "Salt", state: "seasoning", full: "½ tsp", per: "½ tsp" },
      ],
      steps: [
        { title: "Prep peppers", desc: "Preheat oven to 375°F. Halve peppers, remove seeds. Place cut-side up in a baking dish." },
        { title: "Make filling", desc: "Spray pan, brown turkey with cumin, chili, garlic, and salt. Add beans and salsa, stir to combine." },
        { title: "Fill", desc: "Spoon filling into each pepper half, pressing to pack." },
        { title: "Bake", desc: "Cover with foil and bake ~25 min until peppers are tender." },
        { title: "Metamucil", desc: "Plate two stuffed halves and drink Metamucil in water alongside." },
      ],
      note: "Make the filling in bulk, stuff peppers as needed through the week. Can also microwave assembled and raw 8–10 min in a pinch.",
      reheat: [
        { method: "oven", desc: "Best option — 375°F for 18–20 min covered with foil, then uncover for 5 min. The pepper softens perfectly and the filling heats evenly." },
        { method: "stovetop", desc: "Add ½ cup water to a lidded pan, place peppers in, cover and steam over medium for 10–12 min. Less crispy than the oven but gets the job done." },
        { method: "airfryer", desc: "350°F for 8–10 min. Slightly dries out the pepper edges which some people love — adds a bit of char." },
      ],
    },
  ],
}

const TAB_META: Record<TabType, { label: string; color: string; bg: string; target: string }> = {
  breakfast: { label: 'Breakfast', color: 'var(--meal-breakfast)', bg: 'var(--meal-breakfast-bg)', target: '~1,000–1,100 kcal · 85–95g P · 95–115g C' },
  lunch:     { label: 'Lunch',     color: 'var(--meal-lunch)',     bg: 'var(--meal-lunch-bg)',     target: '~510–600 kcal · 42–46g P · 48–59g C' },
  dinner:    { label: 'Dinner',    color: 'var(--meal-dinner)',    bg: 'var(--meal-dinner-bg)',    target: '~370–460 kcal · 55–65g P · 12–20g C' },
}

function MacroBar({ kcal, p, c, f }: { kcal: number; p: number; c: number; f: number }) {
  return (
    <div className="mh-macro-bar">
      <div className="mh-mstat kcal"><div className="mh-val">{kcal}</div><div className="mh-lbl">kcal</div></div>
      <div className="mh-mstat prot"><div className="mh-val">{p}g</div><div className="mh-lbl">protein</div></div>
      <div className="mh-mstat carb"><div className="mh-val">{c}g</div><div className="mh-lbl">carbs</div></div>
      <div className="mh-mstat fats"><div className="mh-val">{f}g</div><div className="mh-lbl">fat</div></div>
    </div>
  )
}

function MealCard({ meal, tab, defaultOpen }: { meal: Meal; tab: TabType; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const meta = TAB_META[tab]

  return (
    <div className={`mh-card${open ? ' open' : ''}`}>
      {/* Header */}
      <div className="mh-card-header" onClick={() => setOpen(o => !o)}>
        <div className="mh-icon" style={{ background: meta.bg }}>{meal.icon}</div>
        <div className="mh-info">
          <div className="mh-name">{meal.name}</div>
          <div className="mh-subtitle">{meal.subtitle}</div>
        </div>
        <div className="mh-pills">
          <span className="mh-pill pill-kcal">{meal.kcal} kcal</span>
          <span className="mh-pill pill-p">{meal.p}g P</span>
          <span className="mh-pill pill-c">{meal.c}g C</span>
          <span className="mh-pill pill-f">{meal.f}g F</span>
        </div>
        <div className="mh-chevron">
          <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1,1 5,5 9,1" />
          </svg>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="mh-body">
          <span className="mh-tag" style={{ color: meta.color, borderColor: meta.color }}>{meal.tag}</span>
          <MacroBar kcal={meal.kcal} p={meal.p} c={meal.c} f={meal.f} />

          {/* Ingredients */}
          <div className="mh-section-label">Ingredients</div>
          <table className="mh-ing-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>State</th>
                <th className="col-r">Full recipe</th>
                <th className="col-r">Per serving</th>
              </tr>
            </thead>
            <tbody>
              {meal.ingredients.map((ing, i) => (
                <tr key={i}>
                  <td className="ing-name">{ing.name}</td>
                  <td><span className={`ing-state ${ing.state}`}>{ing.state}</span></td>
                  <td className="col-r col-full">{ing.full}</td>
                  <td className="col-r">{ing.per}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Steps */}
          <div className="mh-section-label">Method</div>
          <ol className="mh-steps">
            {meal.steps.map((step, i) => (
              <li key={i} className="mh-step">
                <div className="mh-step-num">{i + 1}</div>
                <div className="mh-step-content">
                  <div className="mh-step-title">{step.title}</div>
                  <div className="mh-step-desc">{step.desc}</div>
                </div>
              </li>
            ))}
          </ol>

          {/* Note */}
          <div className="mh-note">{meal.note}</div>

          {/* Reheat */}
          <div className="mh-reheat">
            <div className="mh-reheat-header">🔥 How to reheat</div>
            <div className="mh-reheat-rows">
              {meal.reheat.map((r, i) => (
                <div key={i} className="mh-reheat-row">
                  <span className={`mh-reheat-method ${r.method}`}>{r.method}</span>
                  <span className="mh-reheat-desc">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MealHubPage() {
  const [tab, setTab] = useState<TabType>('breakfast')
  const meta = TAB_META[tab]

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Meal Hub</h2>
          <div className="sub">Recomp · 189g P avg · 241g C avg · 72g F avg</div>
        </div>
        <div className="page-header-right" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, textAlign: 'right' }}>
          3 meals/day<br />
          <span style={{ color: 'var(--muted)' }}>5 options each</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mh-tab-bar">
        {(Object.keys(TAB_META) as TabType[]).map(t => (
          <button
            key={t}
            className={`mh-tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
            style={tab === t ? { color: TAB_META[t].color } : {}}
          >
            <span className="mh-dot" style={{ background: TAB_META[t].color }} />
            {TAB_META[t].label}
          </button>
        ))}
      </div>

      {/* Panel header */}
      <div className="mh-panel-header">
        <h3 style={{ color: meta.color }}>{meta.label}</h3>
        <span className="mh-target-badge">{meta.target}</span>
      </div>

      {/* Meal cards */}
      <div className="mh-meals-grid">
        {MEALS[tab].map((meal, i) => (
          <MealCard key={`${tab}-${i}`} meal={meal} tab={tab} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  )
}
