'use client'

import { useState, useEffect, useCallback } from 'react'
import { MOBILITY_EXERCISES, MOB_ALL_IDS, MOB_YOGA_ONLY_IDS, mobIsYogaNight, mobRequiredIds } from '@/lib/data'
import { upsertMobilityLog, getMobilityLog, getMobilityStreak, migrateLocalStorage } from '@/lib/supabase'

function todayKey(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export default function MobilityPage() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const isYoga = mobIsYogaNight()
  const required = mobRequiredIds()

  useEffect(() => {
    async function load() {
      await migrateLocalStorage()
      const [log, streakVal] = await Promise.all([
        getMobilityLog(todayKey()),
        getMobilityStreak(),
      ])
      setCheckedItems(log?.items ?? [])
      setStreak(streakVal)
      setLoading(false)
    }
    load()
  }, [])

  const toggle = useCallback(async (id: string) => {
    const next = checkedItems.includes(id)
      ? checkedItems.filter(x => x !== id)
      : [...checkedItems, id]
    setCheckedItems(next)
    await upsertMobilityLog(todayKey(), next)
    const newStreak = await getMobilityStreak()
    setStreak(newStreak)
  }, [checkedItems])

  const reset = useCallback(async () => {
    if (!confirm('Reset today\'s mobility checklist?')) return
    setCheckedItems([])
    await upsertMobilityLog(todayKey(), [])
    setStreak(await getMobilityStreak())
  }, [])

  const doneCount = required.filter(id => checkedItems.includes(id)).length
  const isComplete = doneCount === required.length
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div className="hub-page">
        <div style={{ textAlign: 'center', padding: 60, fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Mobility</h2>
          <div className="sub">Daily checklist · ~15–18 min</div>
        </div>
        <div className="page-header-right">
          {today}<br />
          {isYoga ? 'Short routine · 08+09 only' : 'Full routine · all 9'}
        </div>
      </div>

      {/* Status tile */}
      <div className="mob-status" style={isComplete ? { borderColor: 'var(--lift-t)' } : {}}>
        <div className="mob-status-icon">
          {isComplete ? '✅' : isYoga ? '🧘' : '🌙'}
        </div>
        <div>
          <div className="mob-status-title">
            {isComplete ? 'Mobility done for tonight' : isYoga ? 'Short routine — 08+09 only' : 'Mobility — post-workout'}
          </div>
          <div className="mob-status-sub">
            {isYoga ? 'Only 08 + 09 tonight (non-gym day) · skip 01–07' : 'All 9 movements · ~15–18 min · post-workout'}
          </div>
        </div>
        <div className="mob-status-right">
          <div className="mob-status-progress">{doneCount}/{required.length}</div>
          <div className="mob-status-streak">
            {streak > 0 ? `${streak} day${streak === 1 ? '' : 's'} streak 🔥` : 'Start a streak tonight'}
          </div>
          {checkedItems.length > 0 && (
            <button className="mob-status-reset" onClick={reset}>↻ Reset</button>
          )}
        </div>
      </div>

      {/* Yoga night banner */}
      {isYoga && (
        <div className="note" style={{ marginBottom: 16, background: 'var(--mob)', borderColor: 'var(--mob-t)', color: 'var(--mob-t)' }}>
          Non-gym day (Wed / Sat / Sun) — only exercises 08 and 09 are required: wall ankle stretch and calf stretch. Exercises 01–07 are optional and shown dimmed.
        </div>
      )}

      {/* Exercise grid */}
      <div className="mob-grid">
        {MOBILITY_EXERCISES.map(ex => {
          const isChecked = checkedItems.includes(ex.id)
          const isOptional = isYoga && !MOB_YOGA_ONLY_IDS.includes(ex.id)
          return (
            <div
              key={ex.id}
              className={`mob-card${isChecked ? ' checked' : ''}${isOptional && !isChecked ? ' dimmed' : ''}`}
              onClick={() => toggle(ex.id)}
            >
              <div className="mob-card-header">
                <span className="mob-id">{ex.id}</span>
                <span className="mob-name">{ex.name}</span>
                <span className="mob-check">{isChecked ? '✓' : '○'}</span>
              </div>
              <div className="mob-focus">{ex.focus}</div>
              <div className="mob-meta">
                {ex.sets} sets · {ex.duration}
                {ex.tool ? ` · ${ex.tool}` : ''}
              </div>
              {ex.cues && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {ex.cues}
                </div>
              )}
              {ex.massageGun && (
                <div style={{ marginTop: 6, fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--faint)' }}>
                  🔫 {ex.massageGun}
                </div>
              )}
              {isOptional && (
                <div style={{ marginTop: 6, fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--faint)' }}>
                  Optional tonight (yoga night)
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Why this routine */}
      <div style={{ marginTop: 24 }}>
        <div className="section-hdr"><span className="ptitle">Why these exercises</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {[
            { title: '01–03: Shoulder / swim', body: 'Thoracic extension, lat stretch, and sleeper stretch directly address swim posture and shoulder health. Pool sessions load the shoulder in overhead position — these undo the stress.' },
            { title: "04–05: Hips / everything", body: "World's greatest stretch and 90/90 hip switch hit hip flexors, hamstrings, thoracic rotation, and hip IR/ER. The most bang-for-buck exercises in the routine. Never skip." },
            { title: '06–07: Hip flexors / glutes', body: 'Couch stretch targets the hip flexors that get tight from cycling. Pigeon hits the piriformis and glute, which protects the IT band and lower back. Key for brick sessions.' },
            { title: '08–09: Achilles / ankles (priority)', body: 'Wall ankle stretch (dorsiflexion) and calf+soleus stretch are done every night — gym days or not. Left Achilles is a chronic issue. Three sets on left side, two on right.' },
          ].map((note, i) => (
            <div key={i} className="note">
              <div style={{ fontWeight: 500, marginBottom: 6 }}>{note.title}</div>
              {note.body}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
