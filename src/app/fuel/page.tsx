'use client'

import { useState, useEffect } from 'react'
import { NUTRITION_BASELINE, MEAL_TEMPLATE, CUT_CHECK_IN } from '@/lib/data'
import { getSupabaseClient } from '@/lib/supabase'
import NutritionActualsPanel from '@/components/dashboard/NutritionActualsPanel'
import MacroAccuracyPanel from '@/components/dashboard/MacroAccuracyPanel'

// ── Supplement data ─────────────────────────────────────────────

interface Supplement { name: string; dose: string; note?: string }
interface TimingBlock { timing: string; items: Supplement[] }

const SUPPLEMENT_STACK: TimingBlock[] = [
  {
    timing: 'First thing / Pre-workout (5:00am)',
    items: [
      { name: 'Collagen', dose: '15g', note: 'Mix in warm water or coffee · take before any movement for max absorption with Vitamin C' },
      { name: 'Vitamin C', dose: '500mg', note: 'Taken alongside collagen — critical for collagen synthesis · doubles as antioxidant' },
      { name: 'Pre-workout', dose: '1 scoop', note: 'Stim-free' },
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
      { name: 'Zinc Picolinate', dose: '22mg', note: 'Heavy days only. With food (reduces nausea), away from calcium — calcium blocks absorption. Supports testosterone + immune function.' },
    ],
  },
  {
    timing: 'Before bed',
    items: [
      { name: 'Magnesium Glycinate', dose: '200–400mg', note: 'Nightly. Glycinate form = better absorption + less laxative effect vs oxide. Promotes sleep quality + muscle recovery + reduces cramping.' },
      { name: 'Tart Cherry', dose: 'Per label', note: 'Recovery + sleep support.' },
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
          Moderate cut: {NUTRITION_BASELINE.calories.toLocaleString()} kcal/day · ~{NUTRITION_BASELINE.lossPerWeek} lb/wk<br />
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

          {/* Daily targets — moderate cut from CUT_START: flat targets Sun-Fri,
              Saturday the same food plus a capped cheat dinner. */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr"><span className="ptitle">Daily targets · moderate cut (Oct 6 – Dec 31)</span></div>
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
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Same food every day. Sodium {NUTRITION_BASELINE.sodium} · water {NUTRITION_BASELINE.waterOz} oz minimum (not logged).
                </div>
              </div>
              <div className="nutrition-day">
                <div className="nutrition-day-header">
                  <div className="nutrition-day-name">Saturday</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 500 }}>~{NUTRITION_BASELINE.saturdayCalories.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Same breakfast and lunch. Cheat dinner capped at ~800–1,000 kcal, logged with a rough estimate.</div>
              </div>
            </div>
          </div>

          {/* Meal template */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr"><span className="ptitle">Daily meal template · ~2,160 kcal</span></div>
            <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {MEAL_TEMPLATE.map(m => (
                <div key={m.meal} className="note">
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{m.meal} · {m.kcal}</div>
                  {m.items}
                </div>
              ))}
            </div>
          </div>

          {/* Check-in rule */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-hdr"><span className="ptitle">3-week check-in</span></div>
            <div className="note" style={{ marginBottom: 10 }}>
              Weigh every morning and track the 7-day average. Every 3 weeks from Oct 6 (first check Oct 27):
            </div>
            <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {CUT_CHECK_IN.map(c => (
                <div key={c.when} className="note">
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>{c.when}</div>
                  {c.action}
                </div>
              ))}
            </div>
          </div>

          {/* Strategy notes */}
          <div className="section-hdr"><span className="ptitle">Strategy notes</span></div>
          <div className="fuel-nested-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {[
              { title: '📉 Weekly math', body: `Garmin 4-week average burn ~${NUTRITION_BASELINE.maintenance.toLocaleString()}/day (soccer days ~2,750–3,050, others ~2,300–2,450). Average intake ~${NUTRITION_BASELINE.weeklyAvgCalories.toLocaleString()}/day, ~335 under maintenance, ~${NUTRITION_BASELINE.lossPerWeek} lb/week. Start ${NUTRITION_BASELINE.startWeight} lbs, long-term target ~${NUTRITION_BASELINE.targetWeight}.` },
              { title: '🎯 Goal', body: 'Lose fat while keeping strength and soccer performance.' },
              { title: '⚠️ Cronometer "totals don\'t match"', body: 'Macros add up to 2,233 kcal. Ignore the warning: the gap is ~40g/day of fiber, and logged days land ~2,150.' },
              { title: '⚽ Soccer days (optional)', body: 'If you feel flat in games: 1 banana 60–90 min before kickoff (+105).' },
              { title: '🍲 Open item: chili logs high', body: 'Logs ~669 kcal / 52P / 94C / 13F per serving vs ~545 expected. Carbs are ~20g/serving high, so one ingredient entry may be wrong (a bean or tomato entry is more likely than the chicken).' },
              { title: '🏊 Race-day fueling', body: 'Oats + banana 2–2.5 hrs pre-race. Nothing heavy within 90 min. Electrolytes throughout. Gel if race > 1.5 hrs. Breakfast is already the race-day template.' },
              { title: '📊 Tracking', body: 'Nutrition and weight/body-fat sync automatically from Cronometer (scripts/cronometer-sync.ts) — no manual upload needed.' },
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
