'use client'
import { getSupabaseClient } from '@/lib/supabase'
import { getProgram, newDayId, WEEKDAY_NAMES, type ProgramDay, type ProgramExercise, type LogStyle } from '@/lib/program'
import { EXERCISE_LIBRARY } from '@/lib/exerciseLibrary'
import { useState, useEffect, useCallback } from 'react'
import type { CSSProperties } from 'react'

// Workout Program (/program, formerly /settings/exercises). Add/remove/rename workout days, set which weekday each is
// on, and add/edit/remove/reorder the exercises in each. Everything here is
// what /log shows. Days live in `workout_days`, exercises in `exercises`
// with `category` = the day's id (see src/lib/program.ts).

const inputS: CSSProperties = {
  background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 6,
  padding: '7px 10px', fontSize: 13, color: 'var(--text)', fontFamily: "'Figtree', sans-serif",
  width: '100%', outline: 'none', boxSizing: 'border-box',
}
const smallInputS: CSSProperties = { ...inputS, padding: '6px 8px', fontSize: 12 }
const labelS: CSSProperties = { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', display: 'block', marginBottom: 3 }
const primaryBtn: CSSProperties = {
  background: 'linear-gradient(180deg, #65f3ec, #22dcd4)', color: '#07171c', border: 'none', borderRadius: 8,
  padding: '8px 14px', fontFamily: "'Figtree', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer',
}
const ghostBtn: CSSProperties = {
  background: 'transparent', border: '0.5px solid var(--border)', borderRadius: 6, padding: '7px 12px',
  fontFamily: "'Figtree', sans-serif", fontSize: 12, color: 'var(--muted)', cursor: 'pointer',
}
const linkBtn: CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Figtree', sans-serif",
  fontSize: 11, color: 'var(--faint)', padding: '4px 6px', minHeight: 32,
}

interface ExForm { name: string; sets: string; reps: string; rpe: string; rest: string; notes: string }
const BLANK_EX: ExForm = { name: '', sets: '3', reps: '', rpe: '', rest: '', notes: '' }

function toForm(e: ProgramExercise): ExForm {
  return { name: e.name, sets: String(e.sets), reps: e.reps, rpe: e.rpe, rest: e.rest == null ? '' : String(e.rest), notes: e.notes ?? '' }
}

function toRow(f: ExForm) {
  return {
    name: f.name.trim(),
    default_sets: f.sets ? parseInt(f.sets, 10) : null,
    default_reps: f.reps.trim() || null,
    default_rpe: f.rpe.trim() || null,
    rest_seconds: f.rest ? parseInt(f.rest, 10) : null,
    notes: f.notes.trim() || null,
  }
}

const LOG_STYLE_OPTIONS = (
  <>
    <option value="sets">Sets (weight, reps, RPE per set)</option>
    <option value="simple">Simple (weight + done checkbox)</option>
  </>
)

const CUSTOM = '__custom__'

// "+ Add lift" step 1: pick from EXERCISE_LIBRARY (or Custom). Picking fills
// the name field, which stays editable.
function ExercisePicker({ form, setForm }: { form: ExForm; setForm: (f: ExForm) => void }) {
  const [choice, setChoice] = useState('')
  return (
    <label>
      <span style={labelS}>Exercise</span>
      <select
        autoFocus
        value={choice}
        onChange={e => {
          const v = e.target.value
          setChoice(v)
          setForm({ ...form, name: v === CUSTOM ? '' : v })
        }}
        style={inputS}
      >
        <option value="" disabled>Choose an exercise…</option>
        <option value={CUSTOM}>Custom (type your own)</option>
        {EXERCISE_LIBRARY.map(g => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map(name => <option key={name} value={name}>{name}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

function ExerciseFields({ form, setForm }: { form: ExForm; setForm: (f: ExForm) => void }) {
  return (
    <>
      <input required placeholder="Exercise name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputS} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
        {([['sets', 'Sets', true], ['reps', 'Reps', false], ['rpe', 'RPE', false], ['rest', 'Rest (s)', true]] as [keyof ExForm, string, boolean][]).map(([key, label, digitsOnly]) => (
          <label key={key}>
            <span style={labelS}>{label}</span>
            <input type="text" inputMode={digitsOnly ? 'numeric' : 'text'} value={form[key]}
              onChange={e => setForm({ ...form, [key]: digitsOnly ? e.target.value.replace(/\D/g, '') : e.target.value })} style={smallInputS} />
          </label>
        ))}
      </div>
      <input placeholder="Notes (optional), e.g. final set to failure" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={smallInputS} />
    </>
  )
}

export default function ProgramPage() {
  const [days, setDays] = useState<ProgramDay[]>([])
  const [fromDb, setFromDb] = useState(true)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // day editing
  const [dayForm, setDayForm] = useState<{ name: string; subtitle: string; weekday: string; logStyle: LogStyle }>({ name: '', subtitle: '', weekday: '', logStyle: 'sets' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showNewDay, setShowNewDay] = useState(false)
  const [newDay, setNewDay] = useState<{ name: string; subtitle: string; weekday: string; logStyle: LogStyle }>({ name: '', subtitle: '', weekday: '', logStyle: 'sets' })

  // exercise editing
  const [showAddEx, setShowAddEx] = useState(false)
  const [addForm, setAddForm] = useState<ExForm>(BLANK_EX)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ExForm>(BLANK_EX)

  const load = useCallback(async (selectId?: string) => {
    const res = await getProgram()
    setDays(res.days)
    setFromDb(res.fromDb)
    setActiveId(prev => {
      const want = selectId ?? prev
      return want && res.days.some(d => d.id === want) ? want : res.days[0]?.id ?? null
    })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const active = days.find(d => d.id === activeId) ?? null

  useEffect(() => {
    if (!active) return
    setDayForm({ name: active.name, subtitle: active.subtitle ?? '', weekday: active.weekday == null ? '' : String(active.weekday), logStyle: active.logStyle })
    setConfirmDelete(false)
    setShowAddEx(false)
    setEditingId(null)
    // only when switching days, not on every reload of the same day
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, active?.name, active?.subtitle, active?.weekday, active?.logStyle])

  async function run(fn: () => PromiseLike<{ error: { message: string } | null } | void>, selectId?: string) {
    setBusy(true)
    setError('')
    try {
      const res = await fn()
      if (res && res.error) throw new Error(res.error.message)
      await load(selectId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const sb = () => getSupabaseClient()

  function addDay(e: React.FormEvent) {
    e.preventDefault()
    if (!newDay.name.trim()) return
    const id = newDayId(newDay.name)
    const sortOrder = (days.reduce((m, d) => Math.max(m, d.sortOrder), 0)) + 10
    run(async () => {
      const res = await sb().from('workout_days').insert({
        id, name: newDay.name.trim(), subtitle: newDay.subtitle.trim() || null,
        weekday: newDay.weekday === '' ? null : Number(newDay.weekday), sort_order: sortOrder,
        log_style: newDay.logStyle,
      })
      if (!res.error) { setNewDay({ name: '', subtitle: '', weekday: '', logStyle: 'sets' }); setShowNewDay(false) }
      return res
    }, id)
  }

  function saveDay() {
    if (!active || !dayForm.name.trim()) return
    run(() => sb().from('workout_days').update({
      name: dayForm.name.trim(), subtitle: dayForm.subtitle.trim() || null,
      weekday: dayForm.weekday === '' ? null : Number(dayForm.weekday),
      log_style: dayForm.logStyle,
    }).eq('id', active.id).then(r => r))
  }

  function deleteDay() {
    if (!active) return
    run(async () => {
      const exRes = await sb().from('exercises').delete().eq('category', active.id)
      if (exRes.error) return exRes
      return sb().from('workout_days').delete().eq('id', active.id)
    })
  }

  function moveDay(dir: -1 | 1) {
    if (!active) return
    const idx = days.findIndex(d => d.id === active.id)
    const swap = days[idx + dir]
    if (!swap) return
    const order = [...days]
    order[idx] = swap
    order[idx + dir] = active
    run(async () => {
      for (const [i, d] of order.entries()) {
        const res = await sb().from('workout_days').update({ sort_order: (i + 1) * 10 }).eq('id', d.id)
        if (res.error) return res
      }
    })
  }

  function addExercise(e: React.FormEvent) {
    e.preventDefault()
    if (!active || !addForm.name.trim()) return
    const sortOrder = (active.exercises.length + 1) * 10
    run(async () => {
      const res = await sb().from('exercises').insert({ ...toRow(addForm), category: active.id, is_active: true, sort_order: sortOrder })
      if (!res.error) { setAddForm(BLANK_EX); setShowAddEx(false) }
      return res
    })
  }

  function saveExercise(id: string) {
    if (!editForm.name.trim()) return
    run(async () => {
      const res = await sb().from('exercises').update(toRow(editForm)).eq('id', id)
      if (!res.error) setEditingId(null)
      return res
    })
  }

  function removeExercise(id: string) {
    run(() => sb().from('exercises').delete().eq('id', id).then(r => r))
  }

  function moveExercise(idx: number, dir: -1 | 1) {
    if (!active) return
    const list = [...active.exercises]
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    ;[list[idx], list[target]] = [list[target], list[idx]]
    run(async () => {
      for (const [i, ex] of list.entries()) {
        if (!ex.id) continue
        const res = await sb().from('exercises').update({ sort_order: (i + 1) * 10 }).eq('id', ex.id)
        if (res.error) return res
      }
    })
  }

  const canEdit = fromDb && !busy

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Workout Program</h2>
          <div className="sub">Workout days and lifts. Changes here show up on <a href="/log" style={{ color: 'var(--accent)' }}>Log Workout</a>.</div>
        </div>
        <button onClick={() => setShowNewDay(v => !v)} disabled={!fromDb} style={{ ...primaryBtn, opacity: fromDb ? 1 : 0.5 }}>
          + Day
        </button>
      </div>

      {!loading && !fromDb && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: 'var(--muted)', fontFamily: "'Figtree', sans-serif" }}>
          Showing the built-in program. To edit it, run <code>supabase/migrations/0010_workout_program.sql</code> in the Supabase SQL editor.
        </div>
      )}

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {showNewDay && (
        <form onSubmit={addDay} style={{ background: 'var(--s1)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>New workout day</span>
          <input required placeholder="Day name *, e.g. Full Body" value={newDay.name} onChange={e => setNewDay(d => ({ ...d, name: e.target.value }))} style={inputS} />
          <input placeholder="Subtitle (optional), e.g. ~30 min" value={newDay.subtitle} onChange={e => setNewDay(d => ({ ...d, subtitle: e.target.value }))} style={inputS} />
          <select value={newDay.weekday} onChange={e => setNewDay(d => ({ ...d, weekday: e.target.value }))} style={inputS}>
            <option value="">Not scheduled on a weekday</option>
            {WEEKDAY_NAMES.map((n, i) => <option key={n} value={i}>{n}</option>)}
          </select>
          <select value={newDay.logStyle} onChange={e => setNewDay(d => ({ ...d, logStyle: e.target.value as LogStyle }))} style={inputS} aria-label="Log as">
            {LOG_STYLE_OPTIONS}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: 1 }}>{busy ? 'Saving…' : 'Add day'}</button>
            <button type="button" onClick={() => setShowNewDay(false)} style={ghostBtn}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <>
          {/* Day tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {days.map(d => (
              <button key={d.id} onClick={() => setActiveId(d.id)} style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer', minHeight: 32,
                fontFamily: "'Figtree', sans-serif", fontSize: 12, fontWeight: activeId === d.id ? 600 : 400,
                background: activeId === d.id ? 'var(--accent-bg)' : 'transparent',
                color: activeId === d.id ? 'var(--accent)' : 'var(--muted)',
                border: `1px solid ${activeId === d.id ? 'var(--accent)' : 'var(--border)'}`,
              }}>
                {d.name}{d.weekday != null ? ` · ${WEEKDAY_NAMES[d.weekday].slice(0, 3)}` : ''}
              </button>
            ))}
          </div>

          {days.length === 0 && (
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>No workout days yet. Add one with + Day.</p>
          )}

          {active && (
            <>
              {/* Day settings */}
              <div style={{ background: 'var(--s1)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
                  <label><span style={labelS}>Day name</span>
                    <input value={dayForm.name} disabled={!fromDb} onChange={e => setDayForm(f => ({ ...f, name: e.target.value }))} style={inputS} />
                  </label>
                  <label><span style={labelS}>Weekday</span>
                    <select value={dayForm.weekday} disabled={!fromDb} onChange={e => setDayForm(f => ({ ...f, weekday: e.target.value }))} style={inputS}>
                      <option value="">Not scheduled</option>
                      {WEEKDAY_NAMES.map((n, i) => <option key={n} value={i}>{n}</option>)}
                    </select>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
                  <label><span style={labelS}>Subtitle</span>
                    <input value={dayForm.subtitle} disabled={!fromDb} onChange={e => setDayForm(f => ({ ...f, subtitle: e.target.value }))} style={inputS} />
                  </label>
                  <label><span style={labelS}>Log as</span>
                    <select value={dayForm.logStyle} disabled={!fromDb} onChange={e => setDayForm(f => ({ ...f, logStyle: e.target.value as LogStyle }))} style={inputS}>
                      {LOG_STYLE_OPTIONS}
                    </select>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={saveDay} disabled={!canEdit} style={{ ...primaryBtn, opacity: canEdit ? 1 : 0.5 }}>Save day</button>
                  <button onClick={() => moveDay(-1)} disabled={!canEdit} style={ghostBtn} aria-label="Move day earlier">← Move</button>
                  <button onClick={() => moveDay(1)} disabled={!canEdit} style={ghostBtn} aria-label="Move day later">Move →</button>
                  <span style={{ flex: 1 }} />
                  {confirmDelete ? (
                    <>
                      <button onClick={deleteDay} disabled={!canEdit} style={{ ...ghostBtn, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        Delete {active.name} + its {active.exercises.length} lifts
                      </button>
                      <button onClick={() => setConfirmDelete(false)} style={ghostBtn}>Keep</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)} disabled={!canEdit} style={{ ...ghostBtn, color: 'var(--danger)' }}>Delete day</button>
                  )}
                </div>
                {confirmDelete && (
                  <p style={{ fontSize: 11, color: 'var(--faint)', fontFamily: "'Figtree', sans-serif" }}>
                    Workouts you already logged for this day are kept.
                  </p>
                )}
              </div>

              {/* Exercises */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                  Lifts ({active.exercises.length})
                </span>
                <button onClick={() => { setShowAddEx(v => !v); setAddForm(BLANK_EX) }} disabled={!canEdit} style={{ ...ghostBtn, color: 'var(--accent)' }}>+ Add lift</button>
              </div>

              {showAddEx && (
                <form onSubmit={addExercise} style={{ background: 'var(--s1)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ExercisePicker form={addForm} setForm={setAddForm} />
                  <ExerciseFields form={addForm} setForm={setAddForm} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={busy} style={{ ...primaryBtn, flex: 1 }}>{busy ? 'Saving…' : `Add to ${active.name}`}</button>
                    <button type="button" onClick={() => setShowAddEx(false)} style={ghostBtn}>Cancel</button>
                  </div>
                </form>
              )}

              {active.exercises.length === 0 && !showAddEx && (
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>No lifts on this day yet.</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {active.exercises.map((ex, i) => (
                  <div key={ex.id ?? ex.name} style={{ borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--s1)', padding: '10px 12px' }}>
                    {editingId && editingId === ex.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <ExerciseFields form={editForm} setForm={setEditForm} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => saveExercise(ex.id!)} disabled={busy} style={{ ...primaryBtn, flex: 1 }}>Save</button>
                          <button onClick={() => setEditingId(null)} style={{ ...ghostBtn, flex: 1 }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ex.name}</p>
                          <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>
                            {[`${ex.sets} × ${ex.reps || '—'}`, ex.rpe && `RPE ${ex.rpe}`, ex.rest != null && `${ex.rest}s rest`].filter(Boolean).join(' · ')}
                          </p>
                          {ex.notes && <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{ex.notes}</p>}
                        </div>
                        {canEdit && ex.id && (
                          <>
                            <button onClick={() => moveExercise(i, -1)} disabled={i === 0} style={linkBtn} aria-label={`Move ${ex.name} up`}>↑</button>
                            <button onClick={() => moveExercise(i, 1)} disabled={i === active.exercises.length - 1} style={linkBtn} aria-label={`Move ${ex.name} down`}>↓</button>
                            <button onClick={() => { setEditingId(ex.id!); setEditForm(toForm(ex)) }} style={linkBtn}>Edit</button>
                            <button onClick={() => removeExercise(ex.id!)} style={{ ...linkBtn, color: 'var(--danger)' }}>Remove</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
