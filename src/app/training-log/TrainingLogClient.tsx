'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { migrateLocalStorage } from '@/lib/supabase'
import type { WorkoutSet } from '@/lib/workoutsParser'
import LiftProgressChart from '@/components/dashboard/LiftProgressChart'
import SessionBrowser from '@/components/workouts/SessionBrowser'
import BodyCompWidget from '@/components/dashboard/BodyCompWidget'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

interface Entry {
  date: string
  [key: string]: string
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

type TriKind = 'swim' | 'bike' | 'run' | 'brick'

// Tri session logs (swim/bike/run/brick) persisted in Supabase (tri_log_entries)
// instead of localStorage, so they survive a cleared cache / show up cross-device.
function useSupaTriLog(kind: TriKind) {
  const [data, setData] = useState<Entry[]>([])
  useEffect(() => {
    const sb = getSupabase()
    sb.from('tri_log_entries').select('date, data').eq('kind', kind).order('date', { ascending: true })
      .then(({ data: rows }) => {
        setData((rows || []).map((r: { date: string; data: Record<string, string> }) => ({ date: r.date, ...r.data })))
      })
  }, [kind])
  const add = useCallback(async (entry: Entry) => {
    const { date, ...rest } = entry
    const sb = getSupabase()
    await sb.from('tri_log_entries').insert({ kind, date, data: rest })
    setData(prev => [...prev, entry])
  }, [kind])
  return [data, add] as const
}

// Manual weight/body-fat log persisted in Supabase (manual_weight_log).
function useSupaWeightLog() {
  const [data, setData] = useState<Entry[]>([])
  useEffect(() => {
    const sb = getSupabase()
    sb.from('manual_weight_log').select('date, weight, bf, notes').order('date', { ascending: true })
      .then(({ data: rows }) => {
        setData((rows || []).map((r: { date: string; weight: number; bf: number | null; notes: string | null }) => ({
          date: r.date, weight: String(r.weight), bf: r.bf != null ? String(r.bf) : '', notes: r.notes || '',
        })))
      })
  }, [])
  const add = useCallback(async (entry: Entry) => {
    const sb = getSupabase()
    await sb.from('manual_weight_log').insert({
      date: entry.date,
      weight: parseFloat(entry.weight),
      bf: entry.bf ? parseFloat(entry.bf) : null,
      notes: entry.notes || null,
    })
    setData(prev => [...prev, entry])
  }, [])
  return [data, add] as const
}

type Tab = 'lifts' | 'tri' | 'bodycomp' | 'history'

interface LoggedSet {
  exercise_name: string
  set_number: number
  weight: number | null
  reps: number | null
  rpe: number | null
}

interface LoggedSession {
  id: string
  date: string
  type: string
  notes: string | null
  sets: LoggedSet[]
}

interface Props {
  workouts: WorkoutSet[]
  byWeekDay: Record<number, Record<string, WorkoutSet[]>>
  weeks: number[]
  totalSets: number
  sessions: number
  latestWeek: number
}

export default function TrainingLogClient({ workouts, byWeekDay, weeks, totalSets, sessions, latestWeek }: Props) {
  const [tab, setTab] = useState<Tab>('lifts')

  // One-time carry-over of any pre-Supabase localStorage tri-log/injury data.
  useEffect(() => { migrateLocalStorage() }, [])

  // ── Logged sessions history (from the /log page's own workout_sessions/workout_sets) ──
  const [loggedSessions, setLoggedSessions] = useState<LoggedSession[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  useEffect(() => {
    if (tab !== 'history' || historyLoaded) return
    async function loadHistory() {
      setHistoryLoading(true)
      const sb = getSupabase()
      const { data: sessions } = await sb.from('workout_sessions')
        .select('id, date, type, notes')
        .order('date', { ascending: false })
        .limit(20)
      if (!sessions || sessions.length === 0) {
        setLoggedSessions([])
        setHistoryLoading(false)
        setHistoryLoaded(true)
        return
      }
      const ids = sessions.map((s: { id: string }) => s.id)
      const { data: sets } = await sb.from('workout_sets')
        .select('session_id, exercise_name, set_number, weight, reps, rpe')
        .in('session_id', ids)
      const bySession: Record<string, LoggedSet[]> = {}
      for (const s of sets || []) {
        const key = (s as { session_id: string }).session_id
        if (!bySession[key]) bySession[key] = []
        bySession[key].push(s)
      }
      setLoggedSessions(sessions.map((s: { id: string; date: string; type: string; notes: string | null }) => ({
        ...s, sets: (bySession[s.id] || []).sort((a, b) => a.exercise_name.localeCompare(b.exercise_name) || a.set_number - b.set_number),
      })))
      setHistoryLoading(false)
      setHistoryLoaded(true)
    }
    loadHistory()
  }, [tab, historyLoaded])

  // ── Tri session log state ──
  const [wDate, setWDate] = useState(todayStr())
  const [wWeight, setWWeight] = useState('')
  const [wBf, setWBf] = useState('')
  const [wNotes, setWNotes] = useState('')
  const [weightLog, addWeightEntry] = useSupaWeightLog()

  const [sDate, setSDate] = useState(todayStr())
  const [sDist, setSDist] = useState('')
  const [sTime, setSTime] = useState('')
  const [sNotes, setSNotes] = useState('')
  const [swimLog, addSwimEntry] = useSupaTriLog('swim')

  const [bDate, setBDate] = useState(todayStr())
  const [bDist, setBDist] = useState('')
  const [bTime, setBTime] = useState('')
  const [bRpm, setBRpm] = useState('')
  const [bType, setBType] = useState('stationary')
  const [bNotes, setBNotes] = useState('')
  const [bikeLog, addBikeEntry] = useSupaTriLog('bike')

  const [rDate, setRDate] = useState(todayStr())
  const [rDist, setRDist] = useState('')
  const [rTime, setRTime] = useState('')
  const [rType, setRType] = useState('easy')
  const [rNotes, setRNotes] = useState('')
  const [runLog, addRunEntry] = useSupaTriLog('run')

  const [brDate, setBrDate] = useState(todayStr())
  const [brNum, setBrNum] = useState('')
  const [brLoc, setBrLoc] = useState('stationary')
  const [brSwim, setBrSwim] = useState('')
  const [brBike, setBrBike] = useState('')
  const [brBikeTime, setBrBikeTime] = useState('')
  const [brRpm, setBrRpm] = useState('')
  const [brRun, setBrRun] = useState('')
  const [brRunTime, setBrRunTime] = useState('')
  const [brNotes, setBrNotes] = useState('')
  const [brickLog, addBrickEntry] = useSupaTriLog('brick')

  // ── Body comp state ──
  const [bioUploading, setBioUploading] = useState(false)
  const [bioMsg, setBioMsg] = useState('')
  const [bioDragging, setBioDragging] = useState(false)
  const [latestBio, setLatestBio] = useState<{ weight_lbs: number | null; body_fat_pct: number | null; date: string } | null>(null)
  const [oldestBio, setOldestBio] = useState<{ weight_lbs: number | null; date: string } | null>(null)

  useEffect(() => {
    const since = new Date()
    since.setDate(since.getDate() - 365)
    getSupabase()
      .from('biometrics')
      .select('date, weight_lbs, body_fat_pct')
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setLatestBio(data[0]) })

    getSupabase()
      .from('biometrics')
      .select('date, weight_lbs')
      .order('date', { ascending: true })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setOldestBio(data[0]) })
  }, [])

  const handleBioFile = useCallback(async (file: File) => {
    setBioUploading(true)
    setBioMsg('')
    const text = await file.text()
    try {
      const res = await fetch('/api/biometrics/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      })
      const data = await res.json()
      setBioMsg(data.message || `Imported ${data.rows} entries`)
    } catch {
      setBioMsg('Upload failed — try again')
    }
    setBioUploading(false)
  }, [])

  // ── Tri log actions ──
  const logWeight = async () => {
    if (!wWeight) return
    await addWeightEntry({ date: wDate, weight: wWeight, bf: wBf, notes: wNotes })
    setWWeight(''); setWBf(''); setWNotes('')
  }
  const logSwim = async () => {
    if (!sDist) return
    await addSwimEntry({ date: sDate, dist: sDist, time: sTime, notes: sNotes })
    setSDist(''); setSTime(''); setSNotes('')
  }
  const logBike = async () => {
    if (!bDist) return
    await addBikeEntry({ date: bDate, dist: bDist, time: bTime, rpm: bRpm, type: bType, notes: bNotes })
    setBDist(''); setBTime(''); setBRpm(''); setBNotes('')
  }
  const logRun = async () => {
    if (!rDist) return
    await addRunEntry({ date: rDate, dist: rDist, time: rTime, type: rType, notes: rNotes })
    setRDist(''); setRTime(''); setRNotes('')
  }
  const logBrick = async () => {
    if (!brSwim && !brBike && !brRun) return
    await addBrickEntry({ date: brDate, num: brNum, loc: brLoc, swim: brSwim, bike: brBike, bikeTime: brBikeTime, rpm: brRpm, run: brRun, runTime: brRunTime, notes: brNotes })
    setBrNum(''); setBrSwim(''); setBrBike(''); setBrBikeTime(''); setBrRpm(''); setBrRun(''); setBrRunTime(''); setBrNotes('')
  }

  const allBricks = [...brickLog]
  const weights = weightLog.filter(e => e.weight).map(e => parseFloat(e.weight))
  const swims = swimLog.filter(e => e.dist).map(e => parseFloat(e.dist))
  const bikes = bikeLog.filter(e => e.dist).map(e => parseFloat(e.dist))
  const runs = runLog.filter(e => e.dist).map(e => parseFloat(e.dist))

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Training Log</h2>
          <div className="sub">Lifts · tri sessions · body comp</div>
        </div>
        <div className="page-header-right">
          {sessions} sessions · {totalSets} sets<br />
          Week {latestWeek} most recent
        </div>
      </div>

      {/* Tab bar */}
      <div className="mh-tab-bar">
        {(['lifts', 'tri', 'bodycomp', 'history'] as Tab[]).map(t => (
          <button
            key={t}
            className={`mh-tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'lifts' ? 'Lifts' : t === 'tri' ? 'Tri Sessions' : t === 'bodycomp' ? 'Body Comp' : 'History'}
          </button>
        ))}
      </div>

      {/* ── LIFTS TAB ── */}
      {tab === 'lifts' && (
        <>
          {workouts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏋️</div>
              <div className="empty-title">No workout data found</div>
              <div>Log a session on the <a href="/log">Workout Log</a> page to see your lift progress here.</div>
            </div>
          ) : (
            <>
              <div className="chart-card" style={{ marginBottom: 16 }}>
                <LiftProgressChart workouts={workouts} />
              </div>
              <SessionBrowser byWeekDay={byWeekDay} weeks={weeks} />
            </>
          )}
        </>
      )}

      {/* ── TRI SESSIONS TAB ── */}
      {tab === 'tri' && (
        <>
          {/* Swim */}
          <div className="tracker-card">
            <div className="section-hdr">
              <span className="ptitle">Swim</span>
              <span className="tag tg-swim" style={{ marginLeft: 8 }}>pool</span>
            </div>
            <div className="tracker-stats">
              <div className="tracker-stat"><div className="tracker-stat-val">{swims.length > 0 ? `${Math.max(...swims)}m` : '—'}</div><div className="tracker-stat-lbl">Max distance</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">{swimLog.length}</div><div className="tracker-stat-lbl">Sessions</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">{swims.length > 0 ? `${swims[swims.length - 1]}m` : '—'}</div><div className="tracker-stat-lbl">Last session</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">—</div><div className="tracker-stat-lbl">Best pace</div></div>
            </div>
            <div className="tracker-form">
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Date</label><input type="date" value={sDate} onChange={e => setSDate(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Distance (m)</label><input type="number" placeholder="200" value={sDist} onChange={e => setSDist(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Time (min)</label><input type="number" placeholder="8.5" value={sTime} onChange={e => setSTime(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Notes</label><input type="text" placeholder="Easy pace" value={sNotes} onChange={e => setSNotes(e.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><button className="hub-btn" onClick={logSwim}>Log</button></div>
            </div>
            <div style={{ maxHeight: 120, overflowY: 'auto' }}>
              {swimLog.slice().reverse().map((e, i) => (
                <div key={i} className="tracker-log-entry">
                  <span className="tl-date">{e.date}</span>
                  <span className="tl-val">{e.dist}m</span>
                  <span className="tl-val">{e.time ? `${e.time} min` : '—'}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{e.notes}</span>
                </div>
              ))}
              {swimLog.length === 0 && <div className="tracker-log-empty">No entries yet</div>}
            </div>
          </div>

          {/* Bike */}
          <div className="tracker-card">
            <div className="section-hdr">
              <span className="ptitle">Bike</span>
              <span className="tag tg-bike" style={{ marginLeft: 8 }}>stationary + outdoor</span>
            </div>
            <div className="tracker-stats">
              <div className="tracker-stat"><div className="tracker-stat-val">{bikes.length > 0 ? `${Math.max(...bikes).toFixed(1)} mi` : '—'}</div><div className="tracker-stat-lbl">Max distance</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">{bikeLog.length}</div><div className="tracker-stat-lbl">Sessions</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">{bikes.length > 0 ? `${bikes[bikes.length - 1]} mi` : '—'}</div><div className="tracker-stat-lbl">Last session</div></div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">
                  {bikeLog.filter(e => e.rpm).length > 0
                    ? Math.round(bikeLog.filter(e => e.rpm).reduce((a, e) => a + parseFloat(e.rpm), 0) / bikeLog.filter(e => e.rpm).length)
                    : '—'}
                </div>
                <div className="tracker-stat-lbl">Avg RPM</div>
              </div>
            </div>
            <div className="tracker-form">
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Date</label><input type="date" value={bDate} onChange={e => setBDate(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Distance (mi)</label><input type="number" placeholder="11.5" value={bDist} onChange={e => setBDist(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Time (min)</label><input type="number" placeholder="48" value={bTime} onChange={e => setBTime(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Avg RPM</label><input type="number" placeholder="82" value={bRpm} onChange={e => setBRpm(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Type</label><select value={bType} onChange={e => setBType(e.target.value)}><option value="stationary">Stationary</option><option value="outdoor">Outdoor</option></select></div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><button className="hub-btn" onClick={logBike}>Log</button></div>
            </div>
          </div>

          {/* Run */}
          <div className="tracker-card">
            <div className="section-hdr">
              <span className="ptitle">Run</span>
            </div>
            <div className="tracker-stats">
              <div className="tracker-stat"><div className="tracker-stat-val">{runs.length > 0 ? `${Math.max(...runs).toFixed(1)} km` : '—'}</div><div className="tracker-stat-lbl">Max distance</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">{runLog.length}</div><div className="tracker-stat-lbl">Sessions</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">{runs.length > 0 ? `${runs[runs.length - 1]} km` : '—'}</div><div className="tracker-stat-lbl">Last session</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">—</div><div className="tracker-stat-lbl">Best pace</div></div>
            </div>
            <div className="tracker-form">
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Date</label><input type="date" value={rDate} onChange={e => setRDate(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Distance (km)</label><input type="number" placeholder="5" value={rDist} onChange={e => setRDist(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Time (min)</label><input type="number" placeholder="29" value={rTime} onChange={e => setRTime(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Type</label><select value={rType} onChange={e => setRType(e.target.value)}><option value="easy">Easy</option><option value="tempo">Tempo</option><option value="race">Race pace</option><option value="off-bike">Off bike</option></select></div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><button className="hub-btn" onClick={logRun}>Log</button></div>
            </div>
          </div>

          {/* Bricks */}
          <div className="tracker-card">
            <div className="section-hdr">
              <span className="ptitle">Brick Sessions</span>
            </div>
            <div className="tracker-stats">
              <div className="tracker-stat"><div className="tracker-stat-val">{allBricks.length}</div><div className="tracker-stat-lbl">Total bricks</div></div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">
                  {allBricks.filter(e => e.bike).length > 0 ? `${Math.max(...allBricks.filter(e => e.bike).map(e => parseFloat(e.bike))).toFixed(1)} mi` : '—'}
                </div>
                <div className="tracker-stat-lbl">Max bike</div>
              </div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">
                  {allBricks.filter(e => e.run).length > 0 ? `${Math.max(...allBricks.filter(e => e.run).map(e => parseFloat(e.run))).toFixed(1)} km` : '—'}
                </div>
                <div className="tracker-stat-lbl">Max run</div>
              </div>
              <div className="tracker-stat"><div className="tracker-stat-val">{allBricks.slice(-1)[0]?.date || '—'}</div><div className="tracker-stat-lbl">Last brick</div></div>
            </div>

            {allBricks.map((e, i) => (
              <div key={i} className="brick-entry">
                <div className="brick-entry-header">
                  <span className="brick-num-badge">#{e.num || '?'}</span>
                  <span className="brick-date">{e.date}</span>
                  <span className="brick-loc-badge">{e.loc === 'outdoor' ? '🌤 Outdoor' : '🏢 Stationary'}</span>
                </div>
                <div className="brick-stats">
                  {e.swim && <div className="brick-stat"><div className="bsv">{e.swim}m</div><div className="bsl">Swim</div></div>}
                  {e.bike && <div className="brick-stat"><div className="bsv">{e.bike} mi</div><div className="bsl">Bike{e.bikeTime ? ` · ${e.bikeTime} min` : ''}{e.rpm ? ` · ${e.rpm} RPM` : ''}</div></div>}
                  {e.run && <div className="brick-stat"><div className="bsv">{e.run} km</div><div className="bsl">Run{e.runTime ? ` · ${e.runTime} min` : ''}</div></div>}
                </div>
                {e.notes && <div className="brick-note">{e.notes}</div>}
              </div>
            ))}

            <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Log new brick session</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 10 }}>
                {[
                  { label: 'Date', val: brDate, set: setBrDate, type: 'date' },
                  { label: '# Number', val: brNum, set: setBrNum, placeholder: '3' },
                  { label: 'Swim (m)', val: brSwim, set: setBrSwim, placeholder: '400' },
                  { label: 'Bike (mi)', val: brBike, set: setBrBike, placeholder: '11.5' },
                  { label: 'Bike time (min)', val: brBikeTime, set: setBrBikeTime, placeholder: '48' },
                  { label: 'Avg RPM', val: brRpm, set: setBrRpm, placeholder: '82' },
                  { label: 'Run (km)', val: brRun, set: setBrRun, placeholder: '5' },
                  { label: 'Run time (min)', val: brRunTime, set: setBrRunTime, placeholder: '29' },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>{field.label}</label>
                    <input type={field.type || 'number'} placeholder={field.placeholder} value={field.val} onChange={e => field.set(e.target.value)} />
                  </div>
                ))}
                <div>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Location</label>
                  <select value={brLoc} onChange={e => setBrLoc(e.target.value)}><option value="stationary">Stationary</option><option value="outdoor">Outdoor</option></select>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Notes</label>
                <input type="text" placeholder="How did it feel?" value={brNotes} onChange={e => setBrNotes(e.target.value)} />
              </div>
              <button className="hub-btn" onClick={logBrick}>Log Brick Session</button>
            </div>
          </div>
        </>
      )}

      {/* ── BODY COMP TAB ── */}
      {tab === 'bodycomp' && (
        <>
          <div className="tracker-card">
            <div className="section-hdr"><span className="ptitle">Body Comp (Cronometer)</span></div>

            <div className="tracker-stats">
              <div className="tracker-stat">
                <div className="tracker-stat-val">{latestBio?.weight_lbs ? `${latestBio.weight_lbs} lbs` : '—'}</div>
                <div className="tracker-stat-lbl">Latest weight</div>
              </div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">{oldestBio?.weight_lbs ? `${oldestBio.weight_lbs} lbs` : '—'}</div>
                <div className="tracker-stat-lbl">Starting weight</div>
              </div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">
                  {latestBio?.weight_lbs && oldestBio?.weight_lbs
                    ? `${(latestBio.weight_lbs - oldestBio.weight_lbs > 0 ? '+' : '')}${(latestBio.weight_lbs - oldestBio.weight_lbs).toFixed(1)} lbs`
                    : '—'}
                </div>
                <div className="tracker-stat-lbl">Change</div>
              </div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">{latestBio?.body_fat_pct ? `${latestBio.body_fat_pct}%` : '—'}</div>
                <div className="tracker-stat-lbl">Latest BF%</div>
              </div>
            </div>

            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <BodyCompWidget />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                Upload Cronometer biometrics CSV
              </div>
              <div
                onDrop={e => { e.preventDefault(); setBioDragging(false); const f = e.dataTransfer.files[0]; if (f) handleBioFile(f) }}
                onDragOver={e => { e.preventDefault(); setBioDragging(true) }}
                onDragLeave={() => setBioDragging(false)}
                onClick={() => document.getElementById('bio-csv-input-tl')?.click()}
                style={{
                  border: `2px dashed ${bioDragging ? 'var(--text)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '16px 20px', textAlign: 'center',
                  background: bioDragging ? 'var(--bg)' : 'var(--surface)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
                  {bioUploading ? 'Uploading…' : 'Drag & drop · or click to select biometrics CSV'}
                </div>
                {bioMsg && (
                  <div style={{ marginTop: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--lift-t)' }}>
                    {bioMsg}
                  </div>
                )}
                <input id="bio-csv-input-tl" type="file" accept=".csv" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleBioFile(f) }} />
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                Cronometer → Profile → Export Data → Measurements / Biometrics CSV
              </div>
            </div>
          </div>

          {/* Manual weight log */}
          <div className="tracker-card">
            <div className="section-hdr"><span className="ptitle">Weight & Body Comp (manual log)</span></div>
            <div className="tracker-stats">
              <div className="tracker-stat"><div className="tracker-stat-val">{weights.length > 0 ? `${weights[weights.length - 1]} lbs` : '—'}</div><div className="tracker-stat-lbl">Current</div></div>
              <div className="tracker-stat"><div className="tracker-stat-val">{weights.length > 0 ? `${weights[0]} lbs` : '—'}</div><div className="tracker-stat-lbl">Starting</div></div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">
                  {weights.length > 1 ? `${(weights[weights.length - 1] - weights[0] > 0 ? '+' : '')}${(weights[weights.length - 1] - weights[0]).toFixed(1)} lbs` : '—'}
                </div>
                <div className="tracker-stat-lbl">Change</div>
              </div>
              <div className="tracker-stat">
                <div className="tracker-stat-val">{weightLog.filter(e => e.bf).slice(-1)[0]?.bf ? `${weightLog.filter(e => e.bf).slice(-1)[0].bf}%` : '—'}</div>
                <div className="tracker-stat-lbl">Latest BF%</div>
              </div>
            </div>
            <div className="tracker-form">
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Date</label><input type="date" value={wDate} onChange={e => setWDate(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Weight (lbs)</label><input type="number" placeholder="195.5" value={wWeight} onChange={e => setWWeight(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Body Fat %</label><input type="number" placeholder="18.5" value={wBf} onChange={e => setWBf(e.target.value)} /></div>
              <div><label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Notes</label><input type="text" placeholder="Morning fasted" value={wNotes} onChange={e => setWNotes(e.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><button className="hub-btn" onClick={logWeight}>Log</button></div>
            </div>
            <div style={{ maxHeight: 150, overflowY: 'auto' }}>
              {weightLog.slice().reverse().map((e, i) => (
                <div key={i} className="tracker-log-entry">
                  <span className="tl-date">{e.date}</span>
                  <span className="tl-val">{e.weight} lbs</span>
                  <span className="tl-val">{e.bf ? `${e.bf}%` : '—'}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{e.notes}</span>
                </div>
              ))}
              {weightLog.length === 0 && <div className="tracker-log-empty">No entries yet</div>}
            </div>
          </div>
        </>
      )}

      {/* ── HISTORY TAB — sessions logged via /log ── */}
      {tab === 'history' && (
        <div className="tracker-card">
          <div className="section-hdr"><span className="ptitle">Logged workout sessions</span></div>
          {historyLoading ? (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)', padding: '16px 0' }}>Loading…</div>
          ) : loggedSessions.length === 0 ? (
            <div className="tracker-log-empty">No sessions logged yet — use the <a href="/log">Workout Log</a> page to record one.</div>
          ) : (
            loggedSessions.map(session => (
              <div key={session.id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600 }}>{session.date}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>{session.type}</span>
                </div>
                {session.sets.length === 0 ? (
                  <div className="tracker-log-empty">No sets recorded</div>
                ) : (
                  session.sets.map((s, i) => (
                    <div key={i} className="tracker-log-entry">
                      <span className="tl-date">{s.exercise_name}</span>
                      <span className="tl-val">set {s.set_number}</span>
                      <span className="tl-val">{s.weight ? `${s.weight} lbs` : '—'}</span>
                      <span className="tl-val">{s.reps ? `${s.reps} reps` : '—'}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>{s.rpe ? `RPE ${s.rpe}` : ''}</span>
                    </div>
                  ))
                )}
                {session.notes && <div className="brick-note">{session.notes}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
