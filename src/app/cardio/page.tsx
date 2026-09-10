'use client'
import { getSupabaseClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'

interface GarminActivity {
  id: string
  date: string
  activity_type: string
  name: string | null
  duration_min: number | null
  distance_km: number | null
  avg_hr: number | null
  max_hr: number | null
  calories: number | null
  avg_pace: string | null
}

const TYPE_LABELS: Record<string, string> = {
  running:     'Running',
  cycling:     'Cycling',
  swimming:    'Swimming',
  soccer:      'Soccer',
  hiking:      'Hiking',
  walking:     'Walking',
  strength:    'Strength',
  paddleboard: 'SUP',
  surfing:     'Surfing',
  yoga:        'Yoga',
  other:       'Other',
}

const TYPE_COLOR: Record<string, string> = {
  running:  'var(--run)',
  cycling:  'var(--bike)',
  swimming: 'var(--swim)',
  soccer:   'var(--soccer)',
  hiking:   'var(--strength)',
  walking:  'var(--muted)',
  strength: 'var(--strength)',
  other:    'var(--muted)',
}

const TYPE_BG: Record<string, string> = {
  running:  'var(--run-bg)',
  cycling:  'var(--bike-bg)',
  swimming: 'var(--swim-bg)',
  soccer:   'var(--soccer-bg)',
  hiking:   'var(--strength-bg)',
  strength: 'var(--strength-bg)',
}

const FILTERS = ['All', 'Running', 'Cycling', 'Swimming', 'Soccer', 'Hiking', 'Walking', 'Strength']

function fmt_dur(min: number | null): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function fmt_dist(km: number | null): string {
  if (!km) return ''
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`
}

function weekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - ((day + 6) % 7))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(mon)} – ${fmt(sun)}`
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() - ((day + 6) % 7))
  return mon.toISOString().split('T')[0]
}

function ActivityRow({ a }: { a: GarminActivity }) {
  const type = a.activity_type || 'other'
  const color = TYPE_COLOR[type] ?? 'var(--muted)'
  const bg = TYPE_BG[type] ?? 'transparent'
  const label = TYPE_LABELS[type] ?? type

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {a.name || label}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, padding: '1px 7px', borderRadius: 20, background: bg || 'var(--s3)', color, border: `0.5px solid ${color}`, opacity: 0.9 }}>
            {label}
          </span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)', marginTop: 2 }}>
          {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{fmt_dur(a.duration_min)}</div>
          {a.distance_km ? <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>{fmt_dist(a.distance_km)}</div> : null}
        </div>
        {a.avg_hr ? (
          <div style={{ textAlign: 'right', minWidth: 40 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500, color: 'var(--run)' }}>{a.avg_hr}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--faint)' }}>bpm</div>
          </div>
        ) : <div style={{ minWidth: 40 }} />}
        {a.avg_pace ? (
          <div style={{ textAlign: 'right', minWidth: 48 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--run)' }}>{a.avg_pace}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'var(--faint)' }}>/km</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function CardioPage() {
  const [activities, setActivities] = useState<GarminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [daysBack, setDaysBack] = useState(30)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const sb = getSupabaseClient()
      const since = new Date()
      since.setDate(since.getDate() - daysBack)
      const sinceStr = since.toISOString().split('T')[0]

      const { data, error } = await sb
        .from('garmin_activities')
        .select('id, date, activity_type, name, duration_min, distance_km, avg_hr, max_hr, calories, avg_pace')
        .gte('date', sinceStr)
        .order('date', { ascending: false })

      if (!error && data) setActivities(data)
      setLoading(false)
    }
    load()
  }, [daysBack])

  const filtered = filter === 'All'
    ? activities
    : activities.filter(a => (TYPE_LABELS[a.activity_type] ?? a.activity_type).toLowerCase() === filter.toLowerCase())

  // Weekly grouping
  const byWeek: Record<string, GarminActivity[]> = {}
  for (const a of filtered) {
    const key = getWeekKey(a.date)
    if (!byWeek[key]) byWeek[key] = []
    byWeek[key].push(a)
  }
  const weekKeys = Object.keys(byWeek).sort().reverse()

  // This-week volume
  const thisWeekKey = getWeekKey(new Date().toISOString().split('T')[0])
  const thisWeekActs = activities.filter(a => getWeekKey(a.date) === thisWeekKey)
  const thisWeekMins = thisWeekActs.reduce((s, a) => s + (a.duration_min ?? 0), 0)
  const thisWeekCount = thisWeekActs.length

  // Active filters that have data
  const activeTypes = new Set(activities.map(a => TYPE_LABELS[a.activity_type] ?? a.activity_type))
  const shownFilters = FILTERS.filter(f => f === 'All' || activeTypes.has(f))

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Cardio</h2>
          <div className="sub">Garmin Connect · last {daysBack} days</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[14, 30, 90].map(d => (
            <button key={d} onClick={() => setDaysBack(d)} style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
              background: daysBack === d ? 'var(--s3)' : 'transparent',
              color: daysBack === d ? 'var(--text)' : 'var(--faint)',
              border: `0.5px solid ${daysBack === d ? 'var(--border2)' : 'var(--border)'}`,
            }}>{d}d</button>
          ))}
        </div>
      </div>

      {/* Weekly summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'This week', value: fmt_dur(Math.round(thisWeekMins)), sub: `${thisWeekCount} session${thisWeekCount !== 1 ? 's' : ''}`, accent: 'var(--strength)' },
          { label: 'Activities', value: String(filtered.length), sub: `last ${daysBack} days`, accent: 'var(--text)' },
          { label: 'Total time', value: fmt_dur(Math.round(filtered.reduce((s, a) => s + (a.duration_min ?? 0), 0))), sub: `last ${daysBack} days`, accent: 'var(--swim)' },
        ].map(tile => (
          <div key={tile.label} className="stat-card">
            <div className="stat-card-lbl">{tile.label}</div>
            <div className="stat-card-val" style={{ color: tile.accent }}>{tile.value}</div>
            <div className="stat-card-sub">{tile.sub}</div>
          </div>
        ))}
      </div>

      {/* Type filter pills */}
      {shownFilters.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
          {shownFilters.map(f => {
            const typeKey = Object.entries(TYPE_LABELS).find(([, v]) => v === f)?.[0]
            const color = typeKey ? (TYPE_COLOR[typeKey] ?? 'var(--muted)') : 'var(--muted)'
            const active = filter === f
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                flexShrink: 0, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: active ? 600 : 400,
                background: active ? (typeKey ? TYPE_BG[typeKey] ?? 'var(--s3)' : 'var(--s3)') : 'transparent',
                color: active ? color : 'var(--muted)',
                border: `0.5px solid ${active ? color : 'var(--border)'}`,
              }}>
                {f}
              </button>
            )
          })}
        </div>
      )}

      {/* Activity list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>No activities found</div>
          <div style={{ fontFamily: "'Figtree', sans-serif", fontSize: 12, color: 'var(--faint)' }}>Run garmin_sync.py to import data from GarminDB</div>
        </div>
      ) : (
        <div>
          {weekKeys.map(wk => {
            const acts = byWeek[wk]
            const weekMins = acts.reduce((s, a) => s + (a.duration_min ?? 0), 0)
            return (
              <div key={wk} style={{ marginBottom: 20 }}>
                {/* Week header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', background: 'var(--s2)', borderRadius: '6px 6px 0 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>
                    {weekLabel(wk + 'T00:00:00').toUpperCase()}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--faint)' }}>
                    {acts.length} session{acts.length !== 1 ? 's' : ''} · {fmt_dur(Math.round(weekMins))}
                  </span>
                </div>
                {/* Activity rows */}
                <div style={{ border: '0.5px solid var(--border)', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden', background: 'var(--s1)' }}>
                  {acts.map(a => <ActivityRow key={a.id} a={a} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
