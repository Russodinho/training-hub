'use client'
import { getSupabaseClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'

const PROTOCOL_STEPS = [
  { key: 'magnesium_taken', time: '9:00 PM',  label: 'Magnesium Glycinate',  sub: 'Take it now — before you get distracted',                                              icon: '💊' },
  { key: 'phone_out',       time: '9:30 PM',  label: 'Phone Across the Room', sub: 'Not out of the room — you need to get out of bed to turn off your alarm',            icon: '📵' },
  { key: 'wind_down_done',  time: '9:35 PM',  label: 'Wind-Down Routine',    sub: "Legs up wall · Spinal twist · Child's pose · 90/90 breathing · Neck release",         icon: '🧘' },
  { key: 'in_bed_reading',  time: '9:45 PM',  label: 'In Bed Reading',       sub: 'Orange lamp only — no screens',                                                        icon: '📖' },
] as const

type StepKey = typeof PROTOCOL_STEPS[number]['key']

export default function SleepPage() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const [date, setDate] = useState(todayStr)
  const [checks, setChecks] = useState<Record<StepKey, boolean>>({
    magnesium_taken: false, phone_out: false, wind_down_done: false, in_bed_reading: false,
  })
  const [lightsOutTime, setLightsOutTime] = useState('22:10')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const sb = getSupabaseClient()
      const { data } = await sb.from('sleep_logs').select('*').eq('date', date).single()
      if (data) {
        setChecks({ magnesium_taken: data.magnesium_taken, phone_out: data.phone_out, wind_down_done: data.wind_down_done, in_bed_reading: data.in_bed_reading })
        setLightsOutTime(data.lights_out_time || '22:10')
        setNotes(data.notes || '')
        setSaved(true)
      } else {
        setChecks({ magnesium_taken: false, phone_out: false, wind_down_done: false, in_bed_reading: false })
        setLightsOutTime('22:10')
        setNotes('')
        setSaved(false)
      }
    }
    load()
  }, [date])

  useEffect(() => {
    async function calcStreak() {
      const sb = getSupabaseClient()
      const { data } = await sb.from('sleep_logs').select('date, phone_out, wind_down_done').order('date', { ascending: false }).limit(30)
      if (!data) return
      let s = 0
      for (const row of data) { if (row.phone_out && row.wind_down_done) s++; else break }
      setStreak(s)
    }
    calcStreak()
  }, [saved])

  const toggle = (key: StepKey) => { setChecks(prev => ({ ...prev, [key]: !prev[key] })); setSaved(false) }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const sb = getSupabaseClient()
      const { error: err } = await sb.from('sleep_logs').upsert(
        { date, ...checks, lights_out_time: lightsOutTime || null, notes: notes || null },
        { onConflict: 'date' }
      )
      if (err) throw err
      setSaved(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const completedSteps = Object.values(checks).filter(Boolean).length
  const totalSteps = PROTOCOL_STEPS.length

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Sleep Protocol</h2>
          <div className="sub">{completedSteps}/{totalSteps} steps · lights out 10–10:15 PM</div>
        </div>
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setSaved(false) }}
          style={{ background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }} />
      </div>

      {streak !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>Protocol streak</span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
            background: streak >= 14 ? 'var(--mobility-bg)' : streak >= 7 ? 'var(--swim-bg)' : streak >= 3 ? 'var(--bike-bg)' : 'var(--s3)',
            color: streak >= 14 ? 'var(--mobility)' : streak >= 7 ? 'var(--swim)' : streak >= 3 ? 'var(--bike)' : 'var(--muted)',
            border: `0.5px solid ${streak >= 14 ? 'var(--mobility-bd)' : streak >= 7 ? 'var(--swim-bd)' : streak >= 3 ? 'var(--bike-bd)' : 'var(--border)'}`,
          }}>{streak} nights</span>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--s3)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--strength)', borderRadius: 2, width: `${(completedSteps / totalSteps) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Protocol steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {PROTOCOL_STEPS.map(step => (
          <button key={step.key} onClick={() => toggle(step.key)} style={{
            width: '100%', textAlign: 'left', borderRadius: 8, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s',
            background: checks[step.key] ? 'var(--strength-bg)' : 'var(--s1)',
            border: `0.5px solid ${checks[step.key] ? 'var(--strength-bd)' : 'var(--border)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                background: checks[step.key] ? 'var(--mobility)' : 'transparent',
                border: `2px solid ${checks[step.key] ? 'var(--mobility)' : 'var(--border2)'}`,
              }}>
                {checks[step.key] && <span style={{ color: '#07171c', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{step.icon}</span>
                  <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, fontWeight: 600, color: checks[step.key] ? 'var(--muted)' : 'var(--text)' }}>{step.label}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', marginLeft: 'auto' }}>{step.time}</span>
                </div>
                <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{step.sub}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lights out time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>Lights out</label>
        <input type="time" value={lightsOutTime} onChange={e => { setLightsOutTime(e.target.value); setSaved(false) }}
          style={{ background: 'var(--s2)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 13, color: 'var(--text)', fontFamily: "'IBM Plex Mono', monospace" }} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)' }}>target 10:00–10:15</span>
      </div>

      <textarea placeholder="Notes (fell asleep fast, woke at 3am, etc.)…" value={notes} onChange={e => { setNotes(e.target.value); setSaved(false) }} rows={2}
        style={{ width: '100%', background: 'var(--s1)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text)', fontFamily: "'Figtree', sans-serif", marginBottom: 12, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />

      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', border: 'none', borderRadius: 8, padding: '12px', minHeight: 44,
        fontFamily: "'Figtree', sans-serif", fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', transition: 'all 0.15s',
        background: saved ? 'var(--mobility-bg)' : 'linear-gradient(180deg, #65f3ec, #22dcd4)',
        color: saved ? 'var(--mobility)' : '#07171c',
        outline: saved ? `1px solid var(--mobility-bd)` : 'none',
      }}>
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Log'}
      </button>
    </div>
  )
}
