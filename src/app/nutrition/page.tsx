'use client'

import { useState, useCallback } from 'react'
import { NUTRITION_TARGETS, NUTRITION_BASELINE } from '@/lib/data'
import NutritionActualsPanel from '@/components/dashboard/NutritionActualsPanel'
import MacroAccuracyPanel from '@/components/dashboard/MacroAccuracyPanel'

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
    { meal: 'Dinner (6:00pm)', foods: 'Salmon 180g · potato 200g · salad + olive oil', kcal: 720, p: 48, c: 55, f: 24 },
    { meal: 'Evening', foods: 'Cottage cheese 200g', kcal: 180, p: 23, c: 8, f: 5 },
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

export default function NutritionPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    setUploading(true)
    setUploadMsg('')
    const text = await file.text()
    try {
      const res = await fetch('/api/nutrition/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      })
      const data = await res.json()
      setUploadMsg(data.message || `Imported ${data.rows} days`)
    } catch {
      setUploadMsg('Upload failed — try again')
    }
    setUploading(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Nutrition</h2>
          <div className="sub">Daily targets · meal plans · Cronometer actuals</div>
        </div>
        <div className="page-header-right">
          Baseline: {NUTRITION_BASELINE.calories} kcal<br />
          ~{NUTRITION_BASELINE.deficit} kcal/day deficit · ~{NUTRITION_BASELINE.lossPerWeek} lbs/wk
        </div>
      </div>

      {/* Cronometer upload */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-hdr">
          <span className="ptitle">Cronometer Data Upload</span>
        </div>
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          style={{
            border: `2px dashed ${dragging ? 'var(--text)' : 'var(--border)'}`,
            borderRadius: 10,
            padding: '28px 24px',
            textAlign: 'center',
            background: dragging ? 'var(--bg)' : 'var(--surface)',
            transition: 'all 0.15s',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('csv-input')?.click()}
        >
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>
            {uploading ? 'Uploading...' : 'Drag & drop Cronometer daily summary CSV · or click to select'}
          </div>
          {uploadMsg && (
            <div style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--lift-t)' }}>
              {uploadMsg}
            </div>
          )}
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
          Export from Cronometer: Trends → Export → Daily Summary. CSV columns: Date, Energy (kcal), Protein (g), Fat (g), Carbs (g), Fiber (g)
        </div>
      </div>

      {/* Actuals overview panels */}
      <div className="chart-row" style={{ marginBottom: 24 }}>
        <div className="chart-card">
          <NutritionActualsPanel />
        </div>
        <div className="chart-card">
          <MacroAccuracyPanel />
        </div>
      </div>

      {/* Macro baseline */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-hdr">
          <span className="ptitle">Daily targets by day</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
          {NUTRITION_TARGETS.map(day => (
            <div key={day.day} className="nutrition-day">
              <div className="nutrition-day-header">
                <div>
                  <div className="nutrition-day-name">{day.day}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>{day.activity}</div>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500 }}>{day.calories.toLocaleString()}</div>
              </div>
              <div className="macro-strip" style={{ marginBottom: 8 }}>
                <div className="macro-chip"><span>P</span>{day.protein}g</div>
                <div className="macro-chip"><span>C</span>{day.carbs}g</div>
                <div className="macro-chip"><span>F</span>{day.fat}g</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{day.notes}</div>

              {/* Expand meals */}
              <button
                className="hub-btn-ghost"
                style={{ marginTop: 10, fontSize: 10 }}
                onClick={() => setExpanded(expanded === day.day ? null : day.day)}
              >
                {expanded === day.day ? '▲ Hide meal plan' : '▼ Show meal plan'}
              </button>

              {expanded === day.day && MEAL_PLANS[day.day] && (
                <div style={{ marginTop: 10 }}>
                  {MEAL_PLANS[day.day].map((meal, i) => (
                    <div key={i} style={{ padding: '7px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>{meal.meal}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{meal.kcal} kcal</span>
                      </div>
                      <div style={{ marginBottom: 4 }}>{meal.foods}</div>
                      <div style={{ display: 'flex', gap: 10, fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
                        <span>P {meal.p}g</span>
                        <span>C {meal.c}g</span>
                        <span>F {meal.f}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strategy notes */}
      <div className="section-hdr"><span className="ptitle">Nutrition strategy</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {[
          { title: '🥩 Protein target: 185–190g/day', body: 'Prioritize protein at every meal — minimum 40g per sitting. Whey + collagen post-workout. Cottage cheese before bed. Never skip the protein shake.' },
          { title: '🍚 Carb cycling', body: 'Highest carbs on Monday (310g, soccer + Upper A) and lowest on Wednesday (205g, swim only). Carbs track activity load — not arbitrary.' },
          { title: '⚡ Pre-workout nutrition', body: 'Banana + coffee 45–60 min before gym. Collagen 20g first thing every morning. Full meal 90 min+ before any tri session.' },
          { title: '💊 Supplements timing', body: 'Creatine daily (5g with breakfast). Vitamin D3 with breakfast. Magnesium glycinate before bed. Zinc at dinner. See Supplements page for full stack.' },
          { title: '🏊 Race-day fueling', body: 'Oats + banana 2–2.5 hrs before race. Nothing heavy within 90 min. Electrolytes throughout. Gel if race > 1.5 hrs (Stone Harbor+).' },
          { title: '📊 Tracking method', body: 'Cronometer daily summary export. Upload CSV here for tracking actuals vs targets. Progress chart shows 7-day rolling average for each macro.' },
        ].map((note, i) => (
          <div key={i} className="note">
            <div style={{ fontWeight: 500, marginBottom: 6 }}>{note.title}</div>
            {note.body}
          </div>
        ))}
      </div>
    </div>
  )
}
