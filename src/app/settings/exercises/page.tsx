'use client'
import { getSupabaseClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  { value: 'upper_push',   label: 'Upper A — Push' },
  { value: 'upper_pull',   label: 'Upper B — Pull' },
  { value: 'lower_quad',   label: 'Lower A — Quads' },
  { value: 'lower_glute',  label: 'Lower B — Glute/Ham' },
  { value: 'core',         label: 'Core' },
  { value: 'conditioning', label: 'Conditioning' },
]

interface Exercise {
  id: string
  name: string
  category: string
  default_sets: number | null
  default_reps: string | null
  default_rpe: string | null
  rest_seconds: number | null
  is_active: boolean
  sort_order: number
}

const DEFAULT_FORM = { name: '', category: 'upper_push', default_sets: '', default_reps: '', default_rpe: '', rest_seconds: '' }

const inputS = {
  background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 6,
  padding: '7px 10px', fontSize: 13, color: 'var(--text)', fontFamily: "'Figtree', sans-serif",
  width: '100%', outline: 'none', boxSizing: 'border-box' as const,
}

const smallInputS = { ...inputS, padding: '6px 8px', fontSize: 12 }

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upper_push')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Exercise>>({})

  async function fetchExercises() {
    setLoading(true)
    const sb = getSupabaseClient()
    const { data } = await sb.from('exercises').select('*').order('sort_order').order('name')
    setExercises(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchExercises() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const sb = getSupabaseClient()
    const { error } = await sb.from('exercises').insert({
      name: form.name.trim(), category: form.category,
      default_sets: form.default_sets ? parseInt(form.default_sets, 10) : null,
      default_reps: form.default_reps || null, default_rpe: form.default_rpe || null,
      rest_seconds: form.rest_seconds ? parseInt(form.rest_seconds, 10) : null,
    })
    setSaving(false)
    if (!error) { setForm(DEFAULT_FORM); setShowAdd(false); fetchExercises() }
  }

  async function toggleActive(ex: Exercise) {
    const sb = getSupabaseClient()
    await sb.from('exercises').update({ is_active: !ex.is_active }).eq('id', ex.id)
    fetchExercises()
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const sb = getSupabaseClient()
    await sb.from('exercises').update({
      name: editForm.name,
      default_sets: editForm.default_sets ? Number(editForm.default_sets) : null,
      default_reps: editForm.default_reps || null, default_rpe: editForm.default_rpe || null,
      rest_seconds: editForm.rest_seconds ? Number(editForm.rest_seconds) : null,
    }).eq('id', id)
    setSaving(false)
    setEditingId(null)
    fetchExercises()
  }

  const tabExercises = exercises.filter(ex => ex.category === activeTab)

  return (
    <div className="hub-page">
      <div className="page-header">
        <h2>Exercises</h2>
        <button onClick={() => { setShowAdd(!showAdd); setForm({ ...DEFAULT_FORM, category: activeTab }) }} style={{
          background: 'linear-gradient(180deg, #65f3ec, #22dcd4)', color: '#07171c', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontFamily: "'Figtree', sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          + Add
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setActiveTab(cat.value)} style={{
            flexShrink: 0, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: activeTab === cat.value ? 600 : 400,
            background: activeTab === cat.value ? 'var(--text)' : 'transparent',
            color: activeTab === cat.value ? 'var(--bg)' : 'var(--muted)',
            border: `0.5px solid ${activeTab === cat.value ? 'var(--text)' : 'var(--border)'}`,
          }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} style={{ background: 'var(--s1)', border: '0.5px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>New Exercise</span>
          <input required placeholder="Exercise name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputS} />
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{ ...inputS, appearance: 'none' }}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: 'var(--s2)' }}>{c.label}</option>)}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {[['default_sets','Sets','number'],['default_reps','Reps','text'],['default_rpe','RPE','text'],['rest_seconds','Rest s','number']].map(([key, ph, type]) => (
              <input key={key} type={type} placeholder={ph}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={smallInputS} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ flex: 1, background: 'linear-gradient(180deg, #65f3ec, #22dcd4)', color: '#07171c', border: 'none', borderRadius: 8, padding: '9px', fontFamily: "'Figtree', sans-serif", fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Add Exercise'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '9px 16px', background: 'transparent', border: '0.5px solid var(--border)', borderRadius: 6, fontFamily: "'Figtree', sans-serif", fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Exercise list */}
      {loading ? (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>Loading…</p>
      ) : tabExercises.length === 0 ? (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>No exercises in this category yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tabExercises.map(ex => (
            <div key={ex.id} style={{ borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--s1)', padding: '10px 12px' }}>
              {editingId === ex.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inputS} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    {([['default_sets','Sets'],['default_reps','Reps'],['default_rpe','RPE'],['rest_seconds','Rest']] as [keyof Exercise, string][]).map(([key, ph]) => (
                      <input key={key} placeholder={ph} value={String(editForm[key] ?? '')}
                        onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} style={smallInputS} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => saveEdit(ex.id)} disabled={saving} style={{ flex: 1, background: 'linear-gradient(180deg, #65f3ec, #22dcd4)', color: '#07171c', border: 'none', borderRadius: 8, padding: '7px', fontFamily: "'Figtree', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ flex: 1, background: 'transparent', border: '0.5px solid var(--border)', borderRadius: 6, padding: '7px', fontFamily: "'Figtree', sans-serif", fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</p>
                      {!ex.is_active && (
                        <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: 10, fontWeight: 600, color: 'var(--faint)', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 20, padding: '1px 8px', flexShrink: 0 }}>Inactive</span>
                      )}
                    </div>
                    {(ex.default_sets || ex.default_reps) && (
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>
                        {[ex.default_sets && `${ex.default_sets} sets`, ex.default_reps && `${ex.default_reps} reps`, ex.default_rpe && `RPE ${ex.default_rpe}`, ex.rest_seconds && `${ex.rest_seconds}s rest`].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => { setEditingId(ex.id); setEditForm(ex) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: 11, color: 'var(--faint)', padding: '0 4px' }}>Edit</button>
                  <button onClick={() => toggleActive(ex)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: 11, color: ex.is_active ? 'var(--faint)' : 'var(--accent)', padding: '0 4px' }}>
                    {ex.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
