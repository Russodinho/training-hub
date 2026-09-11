'use client'

import { useState, useEffect } from 'react'
import { NUTRITION_TARGETS, NUTRITION_BASELINE } from '@/lib/data'
import { getSupabaseClient } from '@/lib/supabase'
import NutritionActualsPanel from '@/components/dashboard/NutritionActualsPanel'
import MacroAccuracyPanel from '@/components/dashboard/MacroAccuracyPanel'

// ── Supplement data ─────────────────────────────────────────────

interface Supplement { name: string; dose: string; note?: string }
interface TimingBlock { timing: string; items: Supplement[] }

const SUPPLEMENT_STACK: TimingBlock[] = [
  {
    timing: 'First thing / Pre-workout (4:50am)',
    items: [
      { name: 'Collagen', dose: '20g', note: 'Mix in warm water or coffee · take before any movement for max absorption with Vitamin C' },
      { name: 'Vitamin C', dose: '500mg', note: 'Taken alongside collagen — critical for collagen synthesis · doubles as antioxidant' },
      { name: 'Pre-workout', dose: '1 scoop', note: 'Caffeinated · ~150–200mg caffeine · skip if swimming (harder to gauge exertion in water)' },
      { name: 'Creatine Monohydrate', dose: '5g', note: 'Mix into pre-workout or water · timing not critical — daily consistency matters most' },
      { name: 'Electrolytes', dose: '1 serving', note: 'Salt / potassium / magnesium blend · especially important on gym + soccer days' },
    ],
  },
  {
    timing: 'Breakfast (post-workout)',
    items: [
      { name: 'Multivitamin', dose: '1 cap', note: 'With food — fat-soluble vitamins absorb better with a meal' },
      { name: 'Vitamin D3', dose: '2000–4000 IU', note: 'With fat — take with breakfast that has some fat. Consider 5000 IU in winter months.' },
      { name: 'Vitamin K2 (MK-7)', dose: '100mcg', note: 'Taken with D3 — works synergistically. Directs calcium to bones, not arteries.' },
      { name: 'Fish Oil (EPA+DHA)', dose: '750–1000mg EPA+DHA', note: 'With food to avoid fishy burps. Anti-inflammatory — critical for joint + tendon recovery.' },
    ],
  },
  {
    timing: 'Dinner',
    items: [
      { name: 'Zinc Picolinate', dose: '22mg', note: 'With food (reduces nausea). Take at dinner, away from calcium — calcium blocks absorption. Supports testosterone + immune function.' },
    ],
  },
  {
    timing: 'Before bed',
    items: [
      { name: 'Magnesium Glycinate', dose: '200–400mg', note: 'Glycinate form = better absorption + less laxative effect vs oxide. Promotes sleep quality + muscle recovery + reduces cramping.' },
    ],
  },
  {
    timing: 'Race day / long sessions only',
    items: [
      { name: 'Electrolyte drink', dose: '1 bottle', note: 'Sodium + potassium focus. Before + during any session > 60 min.' },
      { name: 'Carb gel', dose: '1 gel / 45 min', note: 'Only for races > 1.5 hrs (Stone Harbor, Steelman). Practice in training first.' },
    ],
  },
]

// ── Nutrition meal plans ─────────────────────────────────────────

const MEAL_PLANS: Record<string, { meal: string; foods: string; kcal: number; p: number; c: number; f: number }[]> = {
  Monday: [
    { meal: 'Pre-workout (4:50am)', foods: 'Banana + coffee (black) + collagen 20g', kcal: 195, p: 20, c: 28, f: 1 },
    { meal: 'Breakfast (7:00am)', foods: 'Oats 100g · egg whites 200ml · whole egg 1 · blueberries · protein shake', kcal: 620, p: 55, c: 75, f: 10 },
    { meal: 'Lunch (12:00pm)', foods: 'Rice 200g cooked · chicken breast 180g · broccoli · olive oil 1 tbsp', kcal: 680, p: 52, c: 78, f: 12 },
    { meal: 'Pre-soccer snack (5:30pm)', foods: 'Banana · protein shake · electrolytes', kcal: 290, p: 30, c: 35, f: 3 },
    { meal: 'Post-soccer dinner (8:30pm)', foods: 'Salmon 180g · sweet potato 250g · salad + olive oil · cottage cheese', kcal: 780, p: 55, c: 74, f: 24 },
    { meal: 'Evening', foods: 'Greek yogurt 200g · nuts 20g', kcal: 335, p: 21, c: 20, f: 21 },
  ],
  Tuesday: [
    { meal: 'Pre-workout (4:50am)', foods: 'Banana + coffee + collagen 20g', kcal: 195, p: 20, c: 28, f: 1 },
    { meal: 'Breakfast (7:00am)', foods: 'Oats 80g · egg whites 200ml · whole egg 1 · protein shake', kcal: 540, p: 52, c: 58, f: 10 },
    { meal: 'Lunch (12:30pm)', foods: 'Rice 150g · chicken 200g · veg + olive oil', kcal: 620, p: 55, c: 60, f: 13 },
    { meal: 'Dinner (6:30pm)', foods: 'Ground turkey 200g · pasta 120g · tomato sauce · parmesan', kcal: 720, p: 52, c: 62, f: 21 },
    { meal: 'Evening', foods: 'Cottage cheese 200g', kcal: 180, p: 23, c: 8, f: 5 },
  ],
  Wednesday: [
    { meal: 'Pre-swim (5:00am)', foods: 'Coffee (black) + half banana', kcal: 55, p: 1, c: 14, f: 0 },
    { meal: 'Breakfast (6:30am)', foods: 'Oats 80g · eggs 2 whole · egg whites 150ml · collagen + protein shake', kcal: 570, p: 52, c: 58, f: 12 },
    { meal: 'Lunch (12:30pm)', foods: 'Rice 150g · chicken 180g · veg', kcal: 570, p: 48, c: 57, f: 10 },
    { meal: 'Dinner (6:30pm)', foods: 'Lean beef 180g · potato 200g · salad', kcal: 680, p: 52, c: 55, f: 20 },
    { meal: 'Evening', foods: 'Greek yogurt 150g', kcal: 120, p: 15, c: 8, f: 2 },
  ],
  Thursday: [
    { meal: 'Pre-workout (4:50am)', foods: 'Banana + coffee + collagen 20g', kcal: 195, p: 20, c: 28, f: 1 },
    { meal: 'Breakfast (7:00am)', foods: 'Oats 100g · eggs 2 · egg whites 150ml · protein shake', kcal: 590, p: 52, c: 68, f: 11 },
    { meal: 'Lunch (12:30pm)', foods: 'Rice 175g · chicken 200g · veg + olive oil', kcal: 650, p: 55, c: 67, f: 13 },
    { meal: 'Pre-run snack (7:00pm)', foods: 'Banana · electrolytes', kcal: 110, p: 1, c: 28, f: 0 },
    { meal: 'Dinner (8:30pm)', foods: 'Salmon 180g · sweet potato 200g · veg · olive oil', kcal: 720, p: 48, c: 64, f: 22 },
    { meal: 'Evening', foods: 'Cottage cheese 200g', kcal: 180, p: 23, c: 8, f: 5 },
  ],
  Friday: [
    { meal: 'Pre-workout (4:50am)', foods: 'Banana + coffee + collagen 20g', kcal: 195, p: 20, c: 28, f: 1 },
    { meal: 'Breakfast (7:00am)', foods: 'Oats 80g · eggs 2 · egg whites 150ml · protein shake', kcal: 560, p: 50, c: 60, f: 11 },
    { meal: 'Lunch (12:30pm)', foods: 'Rice 150g · chicken 180g · veg', kcal: 580, p: 48, c: 60, f: 11 },
    { meal: 'Dinner (6:30pm)', foods: 'Ground turkey 180g · pasta 100g · tomato sauce', kcal: 660, p: 46, c: 70, f: 18 },
    { meal: 'Evening', foods: 'Greek yogurt 200g · nuts 15g', kcal: 275, p: 21, c: 13, f: 17 },
  ],
  Saturday: [
    { meal: 'Breakfast (7:30am)', foods: 'Oats 100g · eggs 2 · protein shake · banana', kcal: 620, p: 50, c: 78, f: 10 },
    { meal: 'Pre-bike snack (10:30am)', foods: 'Banana · electrolytes', kcal: 110, p: 1, c: 28, f: 0 },
    { meal: 'Lunch (12:30pm)', foods: 'Rice 175g · chicken 200g · veg + olive oil', kcal: 650, p: 55, c: 67, f: 13 },
    { meal: 'Dinner — cheat, not tracked', foods: 'Whatever you want. No tracking, no cheat snacking before or after.', kcal: 0, p: 0, c: 0, f: 0 },
  ],
  Sunday: [
    { meal: 'Breakfast (7:30am)', foods: 'Oats 80g · eggs 2 · protein shake', kcal: 510, p: 48, c: 55, f: 11 },
    { meal: 'Pre-soccer (7:30am)', foods: 'Banana · coffee', kcal: 110, p: 1, c: 28, f: 0 },
    { meal: 'Halftime snack', foods: 'Banana · electrolytes', kcal: 110, p: 1, c: 28, f: 0 },
    { meal: 'Post-soccer lunch (12:30pm)', foods: 'Rice 200g · chicken 200g · veg + olive oil', kcal: 700, p: 57, c: 78, f: 13 },
    { meal: 'Dinner (6:30pm)', foods: 'Lean beef 180g · sweet potato 200g · salad', kcal: 680, p: 48, c: 58, f: 19 },
    { meal: 'Evening', foods: 'Greek yogurt 150g · nuts 15g', kcal: 235, p: 18, c: 11, f: 13 },
  ],
}

// ── Top-level tabs ───────────────────────────────────────────────

type FuelTab = 'targets' | 'supplements'

export default function FuelPage() {
  const [tab, setTab] = useState<FuelTab>('targets')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [liveBio, setLiveBio] = useState<{ weight_lbs: number | null; body_fat_pct: number | null } | null>(null)

  // Latest weight/body-fat from Supabase `biometrics` — backfilled from
  // Cronometer via scripts/cronometer-sync.ts. Falls back to the static
  // NUTRITION_BASELINE.weight only if nothing's synced yet.
  useEffect(() => {
    getSupabaseClient()
      .from('biometrics')
      .select('weight_lbs, body_fat_pct')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setLiveBio(data))
  }, [])

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Fuel</h2>
          <div className="sub">Nutrition targets · supplement stack</div>
        </div>
        <div className="page-header-right">
          Maintenance target: {NUTRITION_BASELINE.calories} kcal · TDEE ~{NUTRITION_BASELINE.tdee} (full training)<br />
          {liveBio?.weight_lbs ?? NUTRITION_BASELINE.weight} lbs{liveBio?.body_fat_pct != null ? ` · ${liveBio.body_fat_pct}% BF` : ''}
        </div>
      </div>

      {/* Top-level tab bar */}
      <div className="mh-tab-bar">
        {(['targets', 'supplements'] as FuelTab[]).map(t => (
          <button
            key={t}
            className={`mh-tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'targets' ? 'Targets' : 'Supplements'}
          </button>
        ))}
      </div>

      {/* ── TARGETS TAB ── */}
      {tab === 'targets' && (
        <>
          {/* Actuals panels */}
          <div className="chart-row" style={{ marginBottom: 24 }}>
            <div className="chart-card"><NutritionActualsPanel onFuelPage /></div>
            <div className="chart-card"><MacroAccuracyPanel onFuelPage /></div>
          </div>

          {/* Daily targets by day */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr"><span className="ptitle">Daily targets by day</span></div>
            <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
              {NUTRITION_TARGETS.map(day => {
                const isFlex = day.calories === 0
                return (
                  <div key={day.day} className="nutrition-day">
                    <div className="nutrition-day-header">
                      <div>
                        <div className="nutrition-day-name">{day.day}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>{day.activity}</div>
                      </div>
                      {isFlex ? (
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--bike)', fontWeight: 500 }}>Flex</div>
                      ) : (
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 500 }}>{day.calories.toLocaleString()}</div>
                      )}
                    </div>
                    {!isFlex && (
                      <div className="macro-strip" style={{ marginBottom: 8 }}>
                        <div className="macro-chip"><span>P</span>{day.protein}g</div>
                        <div className="macro-chip"><span>C</span>{day.carbs}g</div>
                        <div className="macro-chip"><span>F</span>{day.fat}g</div>
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{day.notes}</div>
                    {!isFlex && (
                      <>
                        <button className="hub-btn-ghost" style={{ marginTop: 10, fontSize: 10 }}
                          onClick={() => setExpanded(expanded === day.day ? null : day.day)}>
                          {expanded === day.day ? '▲ Hide meal plan' : '▼ Show meal plan'}
                        </button>
                        {expanded === day.day && MEAL_PLANS[day.day] && (
                          <div style={{ marginTop: 10 }}>
                            {MEAL_PLANS[day.day].map((meal, i) => (
                              <div key={i} style={{ padding: '7px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>{meal.meal}</span>
                                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{meal.kcal} kcal</span>
                                </div>
                                <div style={{ marginBottom: 4 }}>{meal.foods}</div>
                                <div style={{ display: 'flex', gap: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
                                  <span>P {meal.p}g</span><span>C {meal.c}g</span><span>F {meal.f}g</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Strategy notes */}
          <div className="section-hdr"><span className="ptitle">Strategy notes</span></div>
          <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {[
              { title: '🥩 Protein: 200g every day', body: 'Non-negotiable regardless of day type. Eggs + egg whites + Greek yogurt at breakfast. Chicken at dinner. This number doesn\'t change.' },
              { title: '🎯 Fixed targets, every day', body: 'No more high/low lever — 2,650 kcal · 200g P · 250g C · 85g F is the target every day except Saturday. Cronometer\'s own fixed targets total 2,565 kcal; the ~85 cal buffer fills naturally from cooking oils, supplements, and rounding.' },
              { title: '🍯 Honey stays — always', body: '31g honey in breakfast is untouched. It\'s pre/intra workout carbs that matter for performance and compliance. Not where to cut.' },
              { title: '🚴 As training ramps up', body: 'Real TDEE with full training runs ~2,700–2,800. Food stays the same — the slight natural deficit comes from high-activity days (soccer 3x/week), not from cutting food.' },
              { title: '🏊 Race-day fueling', body: 'Oats + banana 2–2.5 hrs pre-race. Nothing heavy within 90 min. Electrolytes throughout. Gel if race > 1.5 hrs (Stone Harbor+). Breakfast is already the race-day template.' },
              { title: '📊 Tracking', body: 'Nutrition and weight/body-fat sync automatically from Cronometer (scripts/cronometer-sync.ts) — no manual upload needed. Goal is 14–16% body fat, sustainable year-round — not a crash cut.' },
            ].map((note, i) => (
              <div key={i} className="note">
                <div style={{ fontWeight: 500, marginBottom: 6 }}>{note.title}</div>
                {note.body}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── SUPPLEMENTS TAB ── */}
      {tab === 'supplements' && (
        <>
          <div style={{ marginBottom: 8 }}>
            <div className="page-header-right" style={{ marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
              6 daily supplements · + race-day additions
            </div>
          </div>

          {SUPPLEMENT_STACK.map(block => (
            <div key={block.timing} className="supp-timing">
              <div className="supp-timing-label">{block.timing}</div>
              <div className="surface-card">
                {block.items.map((item, i) => (
                  <div key={i} className="supp-item">
                    <div>
                      <div className="supp-name">{item.name}</div>
                      <div className="supp-dose">{item.dose}</div>
                    </div>
                    {item.note && <div className="supp-note">{item.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <div className="section-hdr"><span className="ptitle">Key principles</span></div>
            <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {[
                { title: '🦴 Collagen + Vitamin C', body: `Collagen only works with Vitamin C present — it's required for collagen synthesis. Always pair them. Take 30–45 min before training for tendons, joints, and connective tissue.` },
                { title: '☀️ D3 + K2 synergy', body: "D3 increases calcium absorption. K2 directs that calcium into bones (not arteries). They're always taken together. Winter: consider 5000 IU D3." },
                { title: '💊 Zinc timing matters', body: 'Zinc competes with calcium for absorption. Take at dinner, away from dairy-heavy meals. Deficiency is common in athletes — impacts testosterone, immunity, wound healing.' },
                { title: '😴 Magnesium for recovery', body: 'Magnesium glycinate is the gentlest form (unlike oxide which is largely a laxative). Improves sleep quality, reduces muscle cramps, supports >300 enzymatic processes.' },
                { title: '🐟 Fish oil dosing', body: 'Target 750–1000mg of EPA+DHA combined — not total fish oil. Most 1g capsules contain only 300mg EPA+DHA. Check the label. Anti-inflammatory for chronic tendon issues (Achilles).' },
                { title: '⚡ Creatine basics', body: "5g daily. No loading phase needed. Timing doesn't matter — consistency does. Takes ~4 weeks to fully saturate. Do not cycle off. Benefits compound over time." },
              ].map((note, i) => (
                <div key={i} className="note">
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{note.title}</div>
                  {note.body}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
