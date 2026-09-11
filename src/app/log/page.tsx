'use client'
import { getSupabaseClient } from '@/lib/supabase'
import { useState, useEffect, useCallback, useMemo } from 'react'
import type { CSSProperties } from 'react'

// Maps each lift day onto the categories used by the Settings → Exercises
// page, so custom exercises added/enabled there actually show up here.
const CATEGORY_MAP: Record<string, string[]> = {
  upper_a: ['upper_push', 'core'],
  lower_a: ['lower_quad'],
  upper_b: ['upper_pull', 'core'],
  lower_b: ['lower_glute'],
}

interface DbExercise {
  name: string
  category: string
  default_sets: number | null
  default_reps: string | null
  default_rpe: string | null
  rest_seconds: number | null
  is_active: boolean
  sort_order: number
}

// Monday=Upper A, Tuesday=Lower A, Thursday=Upper B, Friday=Lower B — matches
// the actual training schedule (previously this said Wednesday for Lower A).
const DAY_WORKOUT: Record<number, string> = { 1: 'upper_a', 2: 'lower_a', 4: 'upper_b', 5: 'lower_b' }

// Exercise lists below were reconciled against 19 weeks of real logged
// history (previously tracked in a Google Sheet, now retired in favor of
// this app's own Supabase-backed logging) so the day/exercise structure
// matches what's actually been trained, instead of a divergent guess.
const PLAN: Record<string, { label: string; sub: string; exercises: Exercise[] }> = {
  upper_a: {
    label: 'Upper A', sub: 'Push + Delts',
    exercises: [
      { name: 'Incline DB or BB Press',        sets: 4, reps: '6-8',        rpe: '8-9', rest: 90 },
      { name: 'Flat DB or Machine Press',       sets: 3, reps: '6-8',        rpe: '8',   rest: 90 },
      { name: 'Cable Fly (high-to-low crossover)', sets: 3, reps: '12-15',  rpe: '9',   rest: 45 },
      { name: 'Standing DB OHP',               sets: 3, reps: '8-10',       rpe: '8-9', rest: 90 },
      { name: 'Lateral Raise',                 sets: 3, reps: '12-15',      rpe: '9',   rest: 45 },
      { name: 'Reverse Cable Fly',             sets: 3, reps: '10',         rpe: '9',   rest: 45 },
      { name: 'Cable Triceps Pushdowns',       sets: 3, reps: '12-15',      rpe: '9',   rest: 45 },
      { name: 'Hammer Curls',                  sets: 3, reps: '10',         rpe: '8-9', rest: 45 },
      { name: 'Weighted Cable Crunches',       sets: 4, reps: '15',         rpe: '9',   rest: 30, isCore: true },
      { name: 'Pallof Press',                  sets: 3, reps: '12-15/side', rpe: '9',   rest: 60, isCore: true },
    ],
  },
  lower_a: {
    label: 'Lower A', sub: 'Quad Dominant',
    exercises: [
      { name: 'Hack squat (quad)',                  sets: 4, reps: '4-6',        rpe: '8-9', rest: 90 },
      { name: 'Front foot elevated split squat',    sets: 3, reps: '10/side',    rpe: '8-9', rest: 90 },
      { name: 'Leg press',                          sets: 3, reps: '10-12',      rpe: '9',   rest: 90 },
      { name: 'Seated Hamstring Curl',              sets: 3, reps: '10-12',      rpe: '9',   rest: 60 },
      { name: 'Standing calf raises',               sets: 3, reps: '12-15',      rpe: '9',   rest: 45 },
    ],
  },
  upper_b: {
    label: 'Upper B', sub: 'Pull + Delts',
    exercises: [
      { name: 'Lat Pulldown',                      sets: 4, reps: '8-10',       rpe: '8-9', rest: 90 },
      { name: 'Chest Supported Row',               sets: 4, reps: '8-10',       rpe: '8-9', rest: 90 },
      { name: 'Machine Low Row (single arm)',      sets: 3, reps: '10-12',      rpe: '8-9', rest: 60 },
      { name: 'Reverse Pec Deck',                  sets: 3, reps: '12-15',      rpe: '9',   rest: 45 },
      { name: 'Face Pulls',                         sets: 3, reps: '15',         rpe: '8',   rest: 45 },
      { name: 'EZ Bar Preacher Curl',              sets: 3, reps: '10-12',      rpe: '8-9', rest: 45 },
      { name: 'Rotary Torso',                       sets: 3, reps: '12/side',    rpe: '8-9', rest: 30, isCore: true },
    ],
  },
  lower_b: {
    label: 'Lower B', sub: 'Glute Dominant',
    exercises: [
      { name: 'Romanian Deadlift',                 sets: 4, reps: '6-8',        rpe: '8',   rest: 90 },
      { name: 'Belted Hip Thrust',                 sets: 4, reps: '10-12',      rpe: '8-9', rest: 90 },
      { name: 'Leg Extension',                     sets: 3, reps: '12',         rpe: '9',   rest: 45 },
      { name: 'Hip Abduction',                     sets: 3, reps: '15',         rpe: '9',   rest: 45 },
      { name: 'Standing Cable Hip Flexor Pull',   sets: 3, reps: '12-15/side', rpe: '8',   rest: 45 },
      { name: 'Seated Calf Raises',               sets: 3, reps: '15',         rpe: '7',   rest: 45 },
    ],
  },
}

interface Exercise {
  name: string
  sets: number
  reps: string
  rpe: string
  rest: number
  isCore?: boolean
}

interface SetEntry {
  id: string
  weight: string
  reps: string
  rpe: string
}

interface ExData {
  skipped: boolean
  sets: SetEntry[]
}

function blankSetState(exercise: Exercise): SetEntry[] {
  return Array.from({ length: exercise.sets }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    weight: '', reps: '', rpe: '',
  }))
}

function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

const inputS: CSSProperties = {
  background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 6,
  padding: '6px 8px', fontSize: 13, color: 'var(--text)',
  fontFamily: "'Figtree', sans-serif", width: '100%', outline: 'none',
}

function SetRow({ setNum, data, prevWeight, onChange, onRemove }: {
  setNum: number
  data: SetEntry
  prevWeight?: number
  onChange: (d: SetEntry) => void
  onRemove: () => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr 24px', gap: 4, alignItems: 'center', marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--faint)', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>{setNum}</span>
      <input type="number" inputMode="decimal" placeholder={prevWeight ? `${prevWeight}` : 'lbs'}
        value={data.weight} onChange={e => onChange({ ...data, weight: e.target.value })} style={inputS} />
      <input type="number" inputMode="numeric" placeholder="reps"
        value={data.reps} onChange={e => onChange({ ...data, reps: e.target.value })} style={inputS} />
      <input type="number" inputMode="decimal" placeholder="RPE" step="0.5" min="1" max="10"
        value={data.rpe} onChange={e => onChange({ ...data, rpe: e.target.value })} style={inputS} />
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  )
}

function ExerciseCard({ exercise, exIdx, setData, prevWeights, onUpdateSet, onAddSet, onRemoveSet, onToggleSkip }: {
  exercise: Exercise
  exIdx: number
  setData: ExData | undefined
  prevWeights: Record<string, number>
  onUpdateSet: (exIdx: number, setIdx: number, d: SetEntry) => void
  onAddSet: (exIdx: number) => void
  onRemoveSet: (exIdx: number, setIdx: number) => void
  onToggleSkip: (exIdx: number) => void
}) {
  const skipped = setData?.skipped ?? false
  return (
    <div style={{
      borderRadius: 8, border: `0.5px solid ${exercise.isCore ? 'var(--bike-bd)' : 'var(--border)'}`,
      background: 'var(--s1)', marginBottom: 10,
      opacity: skipped ? 0.45 : 1, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 12px 4px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {exercise.isCore && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 600, color: 'var(--bike)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Core</span>
            )}
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{exercise.name}</span>
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>
            {exercise.sets}×{exercise.reps} · RPE {exercise.rpe} · {exercise.rest}s rest
          </p>
        </div>
        <button onClick={() => onToggleSkip(exIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', paddingTop: 2 }}>
          {skipped ? 'Undo' : 'Skip'}
        </button>
      </div>

      {!skipped && (
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr 24px', gap: 4, marginBottom: 4 }}>
            <span />{['Weight', 'Reps', 'RPE'].map(h => (
              <span key={h} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', textAlign: 'center' }}>{h}</span>
            ))}<span />
          </div>
          {(setData?.sets ?? []).map((s, setIdx) => (
            <SetRow key={s.id} setNum={setIdx + 1} data={s}
              prevWeight={prevWeights[exercise.name]}
              onChange={updated => onUpdateSet(exIdx, setIdx, updated)}
              onRemove={() => onRemoveSet(exIdx, setIdx)} />
          ))}
          <button onClick={() => onAddSet(exIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--swim)', marginTop: 4 }}>
            + Add set
          </button>
        </div>
      )}
    </div>
  )
}

export default function LogWorkoutPage() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todayType = DAY_WORKOUT[today.getDay()]

  const [date, setDate] = useState(todayStr)
  const [workoutType, setWorkoutType] = useState(todayType ?? 'upper_a')
  const [exerciseData, setExerciseData] = useState<Record<number, ExData>>({})
  const [prevWeights, setPrevWeights] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [dbExercises, setDbExercises] = useState<DbExercise[]>([])

  useEffect(() => {
    async function fetchCustomExercises() {
      const sb = getSupabaseClient()
      const { data } = await sb.from('exercises').select('*').eq('is_active', true).order('sort_order').order('name')
      if (data) setDbExercises(data)
    }
    fetchCustomExercises()
  }, [])

  // Exercises table (Settings -> Exercises) is the source of truth — the
  // built-in lifts were seeded in there too (scripts/seed-plan-exercises.mjs),
  // so editing one in Settings changes what shows up here. PLAN's hardcoded
  // exercises only serve as a fallback if the DB has nothing yet for a
  // category (e.g. before that seed has run), so this page never shows a
  // workout with zero exercises.
  const plan = useMemo(() => {
    const base = PLAN[workoutType]
    const categories = CATEGORY_MAP[workoutType] ?? []
    const dbForDay = dbExercises.filter(ex => categories.includes(ex.category))
    const exercises: Exercise[] = dbForDay.map(ex => ({
      name: ex.name,
      sets: ex.default_sets ?? 3,
      reps: ex.default_reps ?? '10-12',
      rpe: ex.default_rpe ?? '8-9',
      rest: ex.rest_seconds ?? 60,
      isCore: ex.category === 'core',
    }))
    return { ...base, exercises: exercises.length ? exercises : base.exercises }
  }, [workoutType, dbExercises])

  useEffect(() => {
    const init: Record<number, ExData> = {}
    plan.exercises.forEach((ex, i) => { init[i] = { skipped: false, sets: blankSetState(ex) } })
    setExerciseData(init)
    setSaved(false)
    setError('')
  }, [plan])

  useEffect(() => {
    async function fetchPrev() {
      const sb = getSupabaseClient()
      const { data: prevSession } = await sb.from('workout_sessions').select('id').eq('type', workoutType).order('date', { ascending: false }).limit(1).single()
      if (!prevSession) return
      const { data: prevSets } = await sb.from('workout_sets').select('exercise_name, weight').eq('session_id', prevSession.id)
      if (!prevSets) return
      const weights: Record<string, number> = {}
      prevSets.forEach((s: { exercise_name: string; weight: number }) => {
        if (s.weight && (!weights[s.exercise_name] || s.weight > weights[s.exercise_name])) {
          weights[s.exercise_name] = s.weight
        }
      })
      setPrevWeights(weights)

      // Backfill only sets the user hasn't touched yet — never overwrite
      // something they've already typed, and this can land after the
      // blank-state init effect below since it's a separate async fetch.
      setExerciseData(prev => {
        const next = { ...prev }
        for (const [exIdx, ex] of Object.entries(next)) {
          const exercise = plan.exercises[Number(exIdx)]
          const prevWeight = exercise && weights[exercise.name]
          if (!prevWeight) continue
          next[Number(exIdx)] = {
            ...ex,
            sets: ex.sets.map(s => s.weight === '' ? { ...s, weight: `${prevWeight}` } : s),
          }
        }
        return next
      })
    }
    fetchPrev()
  }, [workoutType, plan])

  const updateSet = useCallback((exIdx: number, setIdx: number, updated: SetEntry) => {
    setExerciseData(prev => {
      const ex = { ...prev[exIdx] }
      const sets = [...ex.sets]
      sets[setIdx] = updated
      return { ...prev, [exIdx]: { ...ex, sets } }
    })
  }, [])

  const addSet = useCallback((exIdx: number) => {
    setExerciseData(prev => {
      const ex = prev[exIdx]
      return { ...prev, [exIdx]: { ...ex, sets: [...ex.sets, { id: `${Date.now()}`, weight: '', reps: '', rpe: '' }] } }
    })
  }, [])

  const removeSet = useCallback((exIdx: number, setIdx: number) => {
    setExerciseData(prev => {
      const ex = prev[exIdx]
      if (ex.sets.length <= 1) return prev
      return { ...prev, [exIdx]: { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) } }
    })
  }, [])

  const toggleSkip = useCallback((exIdx: number) => {
    setExerciseData(prev => ({ ...prev, [exIdx]: { ...prev[exIdx], skipped: !prev[exIdx].skipped } }))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const sb = getSupabaseClient()
      const { data: session, error: sessionErr } = await sb.from('workout_sessions')
        .upsert({ date, type: workoutType, week_number: getWeekNumber(date), notes }, { onConflict: 'date,type' })
        .select().single()
      if (sessionErr) throw sessionErr

      await sb.from('workout_sets').delete().eq('session_id', session.id)

      const rows: object[] = []
      plan.exercises.forEach((ex, exIdx) => {
        const exData = exerciseData[exIdx]
        if (!exData || exData.skipped) return
        exData.sets.forEach((s, setIdx) => {
          if (!s.weight && !s.reps) return
          rows.push({
            session_id: session.id, exercise_name: ex.name, set_number: setIdx + 1,
            reps: s.reps ? parseInt(s.reps, 10) : null,
            weight: s.weight ? parseFloat(s.weight) : null,
            rpe: s.rpe ? parseFloat(s.rpe) : null,
          })
        })
      })

      if (rows.length) {
        const { error: setsErr } = await sb.from('workout_sets').insert(rows)
        if (setsErr) throw setsErr
      }
      setSaved(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="hub-page">
      <style>{`
        .log-input:focus { border-color: var(--accent) !important; }
      `}</style>

      <div className="page-header">
        <div>
          <h2>Workout Log</h2>
          <div className="sub">{!todayType ? 'No lift scheduled today — logging manually' : plan.sub}</div>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }} />
      </div>

      {/* Workout type selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {Object.entries(PLAN).map(([type, w]) => (
          <button key={type} onClick={() => setWorkoutType(type)} style={{
            flexShrink: 0, padding: '6px 16px', borderRadius: 20,
            fontFamily: "'Figtree', sans-serif", fontSize: 12, fontWeight: workoutType === type ? 600 : 400,
            background: workoutType === type ? 'var(--accent-bg)' : 'transparent',
            color: workoutType === type ? 'var(--accent)' : 'var(--muted)',
            border: `1px solid ${workoutType === type ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {w.label}
          </button>
        ))}
      </div>

      {/* Exercise cards */}
      {plan.exercises.map((ex, i) => (
        <ExerciseCard key={`${workoutType}-${i}`} exercise={ex} exIdx={i}
          setData={exerciseData[i]} prevWeights={prevWeights}
          onUpdateSet={updateSet} onAddSet={addSet} onRemoveSet={removeSet} onToggleSkip={toggleSkip} />
      ))}

      {/* Session notes */}
      <textarea placeholder="Session notes (optional)…" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
        style={{ width: '100%', background: 'var(--s1)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text)', fontFamily: "'Figtree', sans-serif", marginBottom: 12, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      {saved ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ color: 'var(--mobility)', fontFamily: "'Figtree', sans-serif", fontSize: 14, fontWeight: 600 }}>✓ Workout saved</p>
          <button onClick={() => setSaved(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            Edit / re-save
          </button>
        </div>
      ) : (
        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', background: saving ? 'var(--s3)' : 'linear-gradient(180deg, #65f3ec, #22dcd4)', color: saving ? 'var(--muted)' : '#07171c',
          border: 'none', borderRadius: 8, padding: '12px', minHeight: 44, fontFamily: "'Figtree', sans-serif",
          fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', transition: 'all 0.15s',
        }}>
          {saving ? 'Saving…' : 'Save Workout'}
        </button>
      )}
    </div>
  )
}
