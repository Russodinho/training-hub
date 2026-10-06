'use client'

import { useState, useEffect, useCallback } from 'react'
import { MOBILITY_EXERCISES, MOB_DAILY_IDS, MOB_COVERAGE, mobDayPlan } from '@/lib/data'
import { upsertMobilityLog, getMobilityLog, getMobilityStreak, migrateLocalStorage, daysAgoStr } from '@/lib/supabase'

// Evening routine. Tonight's required moves come from MOB_DAY_PLAN (fixed
// per weekday, matching that day's training); everything else is optional.
// 08 + 09 alone is the short routine for any night.

// Local date, not UTC: this is done in the evening, and the UTC date has
// already rolled over to tomorrow after 8pm Eastern.
const todayKey = () => daysAgoStr(0)
const shortKey = (date: string) => `hub:mobilityShort:${date}`

export default function MobilityPage() {
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [shortRoutine, setShortRoutine] = useState(false)
  const plan = mobDayPlan()
  const required = shortRoutine ? MOB_DAILY_IDS : plan.ids

  useEffect(() => {
    async function load() {
      try { setShortRoutine(localStorage.getItem(shortKey(todayKey())) === '1') } catch {}
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
    await upsertMobilityLog(todayKey(), next, required)
    setStreak(await getMobilityStreak())
  }, [checkedItems, required])

  const toggleShort = useCallback(async () => {
    const next = !shortRoutine
    setShortRoutine(next)
    try { localStorage.setItem(shortKey(todayKey()), next ? '1' : '0') } catch {}
    // Re-save so completed_at reflects the new required list.
    await upsertMobilityLog(todayKey(), checkedItems, next ? MOB_DAILY_IDS : plan.ids)
  }, [shortRoutine, checkedItems, plan.ids])

  const reset = useCallback(async () => {
    if (!confirm('Reset tonight\'s mobility checklist?')) return
    setCheckedItems([])
    await upsertMobilityLog(todayKey(), [], required)
    setStreak(await getMobilityStreak())
  }, [required])

  const doneCount = required.filter(id => checkedItems.includes(id)).length
  const isComplete = doneCount === required.length
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeLabel = shortRoutine ? '~5 min' : plan.time

  if (loading) {
    return (
      <div className="hub-page">
        <div style={{ textAlign: 'center', padding: 60, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>
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
          <div className="sub">Tonight · {shortRoutine ? 'short routine' : plan.day} · {timeLabel}</div>
        </div>
        <div className="page-header-right">
          {today}<br />
          Tonight: {required.join(' · ')}
        </div>
      </div>

      {/* Status tile */}
      <div className="mob-status" style={isComplete ? { borderColor: 'var(--lift-t)' } : {}}>
        <div className="mob-status-icon">
          {isComplete ? '✅' : required.length === 2 ? '🧘' : '🌙'}
        </div>
        <div>
          <div className="mob-status-title">
            {isComplete ? 'Mobility done for tonight' : `Tonight's mobility · ${required.join(' · ')}`}
          </div>
          <div className="mob-status-sub">
            {shortRoutine ? 'Short routine: 08 + 09 only' : plan.day} · {timeLabel}
            {!shortRoutine && plan.optional ? ` · optional: ${plan.optional}` : ''}
          </div>
        </div>
        <div className="mob-status-right">
          <div className="mob-status-progress">{doneCount}/{required.length}</div>
          <div className="mob-status-streak">
            {streak > 0 ? `${streak} night${streak === 1 ? '' : 's'} streak 🔥` : 'Start a streak tonight'}
          </div>
          {checkedItems.length > 0 && (
            <button className="mob-status-reset" onClick={reset}>↻ Reset</button>
          )}
        </div>
      </div>

      {/* Short routine fallback */}
      <div className="note" style={{ marginBottom: 16, background: 'var(--mob)', borderColor: 'var(--mob-t)', color: 'var(--mob-t)' }}>
        {shortRoutine
          ? 'Short routine tonight: only 08 + 09 are required. The rest are optional.'
          : 'Short on time? Any night can drop to the short routine: 08 + 09 only (left side 3 sets, right 2).'}{' '}
        <button onClick={toggleShort} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textDecoration: 'underline' }}>
          {shortRoutine ? `Back to the full list (${plan.ids.length})` : 'Use short routine tonight'}
        </button>
      </div>

      {/* Exercise grid */}
      <div className="mob-grid">
        {MOBILITY_EXERCISES.map(ex => {
          const isChecked = checkedItems.includes(ex.id)
          const isOptional = !required.includes(ex.id)
          return (
            <div
              key={ex.id}
              className={`mob-card${isChecked ? ' checked' : ''}`}
              onClick={() => toggle(ex.id)}
              style={isOptional && !isChecked ? { opacity: 0.55 } : undefined}
            >
              <div className="mob-card-header">
                <span className="mob-id">{ex.id}</span>
                <span className="mob-name">{ex.name}</span>
                {ex.badge && <span className="mob-optional-badge">{ex.badge}</span>}
                {isOptional && !isChecked && <span className="mob-optional-badge">Optional tonight</span>}
                <span className="mob-check">{isChecked ? '✓' : '○'}</span>
              </div>
              <div className="mob-focus">{ex.focus}</div>
              <div className="mob-meta">
                {ex.dose}
                {ex.tool ? ` · ${ex.tool}` : ''}
              </div>
              {ex.cues && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {ex.cues}
                </div>
              )}
              {ex.massageGun && (
                <div style={{ marginTop: 6, fontFamily: "'Figtree', sans-serif", fontSize: 11, color: 'var(--faint)' }}>
                  🔫 {ex.massageGun}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Weekly coverage */}
      <div style={{ marginTop: 24 }}>
        <div className="section-hdr"><span className="ptitle">Weekly coverage</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {MOB_COVERAGE.map(c => (
            <div key={c.area} className="note">
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{c.area}</div>
              {c.when}
            </div>
          ))}
        </div>
      </div>

      {/* Why this routine */}
      <div style={{ marginTop: 24 }}>
        <div className="section-hdr"><span className="ptitle">Why these exercises</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {[
            { title: '01–03: Shoulders / swim / upper days', body: "Thoracic extension and the lat stretch undo the pressing and pulling from Upper A and B. The cross-body stretch follows Tuesday's swim. It replaced the sleeper stretch because research shows bigger internal-rotation gains and it's less irritating to the front of the shoulder." },
            { title: '04–05: Hips / everything', body: "World's greatest stretch and 90/90 cover hip flexors, hamstrings, thoracic rotation and hip rotation. Highest value per minute." },
            { title: '06–07, 10: Hips / soccer + cycling', body: 'The couch stretch covers hip flexors tight from soccer sprinting, cycling and sitting on commute days. Pigeon covers glutes and piriformis. The adductor rock-back covers the groin, the most common soccer strain area, and is done every soccer night.' },
            { title: '08–09: Achilles / ankles (priority)', body: 'Every night, gym day or not. Left Achilles is a chronic issue: 3 sets left, 2 right.' },
            { title: '11: Achilles loading', body: "Stretching alone doesn't fix chronic tendon problems. Progressive slow calf raises have the best evidence. See a PT if it doesn't improve." },
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
