'use client'
import { getSupabaseClient, todayStr as easternTodayStr, easternNow } from '@/lib/supabase'
import { getProgram, dayForWeekday, DEFAULT_PROGRAM, type ProgramDay, type ProgramExercise as Exercise } from '@/lib/program'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'

// Days and exercises come from the editable program (/program,
// src/lib/program.ts). The day's id is saved as workout_sessions.type.

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

// Unsaved entries are kept in localStorage as the user types, so leaving
// the page (a menu tap, a refresh, the phone reloading the tab) doesn't lose
// them. One draft at a time, keyed by exercise name so it survives program
// edits that reorder lifts. Cleared on a successful save; ignored once it's
// older than DRAFT_MAX_AGE_MS.
const DRAFT_KEY = 'hub:logWorkoutDraft'
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000

interface Draft {
  date: string
  type: string
  notes: string
  exercises: Record<string, ExData>
  updatedAt: number
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as Draft
    if (!d || typeof d.type !== 'string' || Date.now() - d.updatedAt > DRAFT_MAX_AGE_MS) return null
    return d
  } catch { return null }
}

function writeDraft(d: Draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch {}
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch {}
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
      borderRadius: 8, border: '0.5px solid var(--border)',
      background: 'var(--s1)', marginBottom: 10,
      opacity: skipped ? 0.45 : 1, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 12px 4px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{exercise.name}</span>
          </div>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>
            {[`${exercise.sets}×${exercise.reps}`, exercise.rpe && `RPE ${exercise.rpe}`, exercise.rest != null && `${exercise.rest}s rest`].filter(Boolean).join(' · ')}
          </p>
          {exercise.notes && (
            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{exercise.notes}</p>
          )}
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
  const todayStr = easternTodayStr()

  const [days, setDays] = useState<ProgramDay[]>(DEFAULT_PROGRAM)
  const [date, setDate] = useState(todayStr)
  const [workoutType, setWorkoutType] = useState<string>(() => dayForWeekday(DEFAULT_PROGRAM, easternNow().getDay())?.id ?? DEFAULT_PROGRAM[0].id)
  const [exerciseData, setExerciseData] = useState<Record<number, ExData>>({})
  const [prevWeights, setPrevWeights] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  // When the on-screen entries came from a saved draft (shown as a notice).
  const [restoredAt, setRestoredAt] = useState<number | null>(null)
  // True once the user has typed/changed something for the current day, so
  // just opening or switching days never overwrites a draft with blanks.
  const dirty = useRef(false)

  useEffect(() => {
    getProgram().then(({ days: loaded }) => {
      setDays(loaded)
      // Resume an unsaved draft if there is one for a day that still
      // exists; otherwise pick today's scheduled day from the loaded program
      // (it may differ from the built-in default the page first rendered with).
      const draft = readDraft()
      if (draft && loaded.some(d => d.id === draft.type)) {
        setDate(draft.date)
        setWorkoutType(draft.type)
        return
      }
      const todays = dayForWeekday(loaded, easternNow().getDay())
      setWorkoutType(prev => todays?.id ?? (loaded.some(d => d.id === prev) ? prev : loaded[0]?.id ?? prev))
    }).catch(() => {})
  }, [])

  // The day scheduled for the selected date, if any (for the header hint).
  const dateDay = useMemo(() => dayForWeekday(days, new Date(date + 'T00:00:00').getDay()), [days, date])

  const plan = useMemo(() => {
    const day = days.find(d => d.id === workoutType)
    return { label: day?.name ?? '', sub: day?.subtitle ?? '', exercises: day?.exercises ?? [] as Exercise[] }
  }, [workoutType, days])

  useEffect(() => {
    const draft = readDraft()
    const fromDraft = draft && draft.type === workoutType ? draft : null
    const init: Record<number, ExData> = {}
    plan.exercises.forEach((ex, i) => {
      const cached = fromDraft?.exercises[ex.name]
      init[i] = cached && Array.isArray(cached.sets) && cached.sets.length
        ? { skipped: !!cached.skipped, sets: cached.sets }
        : { skipped: false, sets: blankSetState(ex) }
    })
    setExerciseData(init)
    if (fromDraft) setNotes(fromDraft.notes ?? '')
    setRestoredAt(fromDraft ? fromDraft.updatedAt : null)
    dirty.current = false
    setSaved(false)
    setError('')
    // workoutType is read, not a trigger: plan already changes with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan])

  // Persist entries as they change, once the user has touched something.
  useEffect(() => {
    if (!dirty.current) return
    const exercises: Record<string, ExData> = {}
    plan.exercises.forEach((ex, i) => { if (exerciseData[i]) exercises[ex.name] = exerciseData[i] })
    writeDraft({ date, type: workoutType, notes, exercises, updatedAt: Date.now() })
  }, [exerciseData, notes, date, workoutType, plan])

  function discardDraft() {
    clearDraft()
    dirty.current = false
    const init: Record<number, ExData> = {}
    plan.exercises.forEach((ex, i) => { init[i] = { skipped: false, sets: blankSetState(ex) } })
    setExerciseData(init)
    setNotes('')
    setRestoredAt(null)
  }

  // Prefill each exercise with the top weight from the most recent session
  // that included it, whichever day that was logged under (so a lift that
  // moved between days, e.g. RDL from Lower B to Legs, keeps its history).
  useEffect(() => {
    const names = plan.exercises.map(e => e.name)
    if (!names.length) { setPrevWeights({}); return }
    let cancelled = false
    async function fetchPrev() {
      const sb = getSupabaseClient()
      const { data: prevSets } = await sb.from('workout_sets')
        .select('exercise_name, weight, workout_sessions!inner(date)')
        .in('exercise_name', names)
        .not('weight', 'is', null)
      if (cancelled || !prevSets) return
      const latest: Record<string, { date: string; weight: number }> = {}
      for (const s of prevSets as unknown as { exercise_name: string; weight: number; workout_sessions: { date: string } }[]) {
        const d = s.workout_sessions?.date ?? ''
        const cur = latest[s.exercise_name]
        if (!cur || d > cur.date || (d === cur.date && s.weight > cur.weight)) latest[s.exercise_name] = { date: d, weight: s.weight }
      }
      const weights: Record<string, number> = {}
      for (const [n, v] of Object.entries(latest)) weights[n] = v.weight
      setPrevWeights(weights)

      // Backfill only sets the user hasn't touched yet — never overwrite
      // something they've already typed, and this can land after the
      // blank-state init effect above since it's a separate async fetch.
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
    return () => { cancelled = true }
  }, [plan])

  const updateSet = useCallback((exIdx: number, setIdx: number, updated: SetEntry) => {
    dirty.current = true
    setExerciseData(prev => {
      const ex = { ...prev[exIdx] }
      const sets = [...ex.sets]
      sets[setIdx] = updated
      return { ...prev, [exIdx]: { ...ex, sets } }
    })
  }, [])

  const addSet = useCallback((exIdx: number) => {
    dirty.current = true
    setExerciseData(prev => {
      const ex = prev[exIdx]
      return { ...prev, [exIdx]: { ...ex, sets: [...ex.sets, { id: `${Date.now()}`, weight: '', reps: '', rpe: '' }] } }
    })
  }, [])

  const removeSet = useCallback((exIdx: number, setIdx: number) => {
    dirty.current = true
    setExerciseData(prev => {
      const ex = prev[exIdx]
      if (ex.sets.length <= 1) return prev
      return { ...prev, [exIdx]: { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) } }
    })
  }, [])

  const toggleSkip = useCallback((exIdx: number) => {
    dirty.current = true
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
      clearDraft()
      dirty.current = false
      setRestoredAt(null)
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
          <div className="sub">{!dateDay ? 'No lift scheduled this day, logging manually' : workoutType === dateDay.id ? plan.sub : `${dateDay.name} is scheduled this day`}</div>
          <a href="/program" style={{ fontFamily: "'Figtree', sans-serif", fontSize: 12, color: 'var(--accent)' }}>Edit program →</a>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }} />
      </div>

      {/* Workout type selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {days.map(({ id: type, name }) => (
          <button key={type} onClick={() => setWorkoutType(type)} style={{
            flexShrink: 0, padding: '6px 16px', borderRadius: 20,
            fontFamily: "'Figtree', sans-serif", fontSize: 12, fontWeight: workoutType === type ? 600 : 400,
            background: workoutType === type ? 'var(--accent-bg)' : 'transparent',
            color: workoutType === type ? 'var(--accent)' : 'var(--muted)',
            border: `1px solid ${workoutType === type ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {name}
          </button>
        ))}
      </div>

      {restoredAt && (
        <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          Restored your unsaved entries from {new Date(restoredAt).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}.{' '}
          <button onClick={discardDraft} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--accent)' }}>
            Discard
          </button>
        </p>
      )}

      {/* Exercise cards */}
      {plan.exercises.map((ex, i) => (
        <ExerciseCard key={`${workoutType}-${i}`} exercise={ex} exIdx={i}
          setData={exerciseData[i]} prevWeights={prevWeights}
          onUpdateSet={updateSet} onAddSet={addSet} onRemoveSet={removeSet} onToggleSkip={toggleSkip} />
      ))}

      {plan.exercises.length === 0 && (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
          No lifts on this day yet. Add them in <a href="/program" style={{ color: 'var(--accent)' }}>Workout Program</a>.
        </p>
      )}

      {/* Session notes */}
      <textarea placeholder="Session notes (optional)…" value={notes} onChange={e => { dirty.current = true; setNotes(e.target.value) }} rows={2}
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
