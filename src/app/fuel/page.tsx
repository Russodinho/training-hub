'use client'

import { useState, useEffect } from 'react'
import { NUTRITION_BASELINE } from '@/lib/data'
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

// ── Top-level tabs ───────────────────────────────────────────────

type FuelTab = 'targets' | 'supplements'

export default function FuelPage() {
  const [tab, setTab] = useState<FuelTab>('targets')
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

          {/* Daily targets — Sunday-Friday are identical, shown as one row;
              Saturday stays separate (flex, untracked cheat meal). Workout
              names were dropped from here since what's scheduled on a given
              day changes with the season and shouldn't be baked into a
              fixed nutrition-target display. */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr"><span className="ptitle">Daily targets</span></div>
            <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
              <div className="nutrition-day">
                <div className="nutrition-day-header">
                  <div className="nutrition-day-name">Sunday – Friday</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 500 }}>{NUTRITION_BASELINE.calories.toLocaleString()}</div>
                </div>
                <div className="macro-strip" style={{ marginBottom: 8 }}>
                  <div className="macro-chip"><span>P</span>{NUTRITION_BASELINE.protein}g</div>
                  <div className="macro-chip"><span>C</span>{NUTRITION_BASELINE.carbs}g</div>
                  <div className="macro-chip"><span>F</span>{NUTRITION_BASELINE.fat}g</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Maintenance target — protein stays at 200g+ regardless of day</div>
              </div>
              <div className="nutrition-day">
                <div className="nutrition-day-header">
                  <div className="nutrition-day-name">Saturday</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--bike)', fontWeight: 500 }}>Flex</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>~1,800 calories clean with one cheat meal (not tracked)</div>
              </div>
            </div>
          </div>

          {/* Strategy notes */}
          <div className="section-hdr"><span className="ptitle">Strategy notes</span></div>
          <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {[
              { title: '🥩 Protein: 200g every day', body: 'Non-negotiable regardless of day type. Eggs + egg whites + Greek yogurt at breakfast. Chicken at dinner. This number doesn\'t change.' },
              { title: '🎯 Fixed targets, every day', body: 'No more high/low lever — 2,650 kcal · 200g P · 250g C · 85g F is the target every day except Saturday. Cronometer\'s own fixed targets total 2,565 kcal; the ~85 cal buffer fills naturally from cooking oils, supplements, and rounding.' },
              { title: '🚴 As training ramps up', body: 'Real TDEE with full training runs ~2,700–2,800. Food stays the same — the slight natural deficit comes from high-activity days, not from cutting food.' },
              { title: '🏊 Race-day fueling', body: 'Oats + banana 2–2.5 hrs pre-race. Nothing heavy within 90 min. Electrolytes throughout. Gel if race > 1.5 hrs. Breakfast is already the race-day template.' },
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
