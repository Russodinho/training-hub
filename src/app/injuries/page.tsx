'use client'

import { useState, useEffect } from 'react'

interface InjuryUpdate {
  date: string
  status: string
  pain: string
  note: string
}

interface InjuryCard {
  key: string
  name: string
  status: string
  pain: string
  since: string
  location: string
  aggravated: string
  notAffected: string
  treatment: string
  notes: string
  symptoms: string
  isBuiltin?: boolean
}

interface ArchivedInjury extends InjuryCard {
  archivedAt: string
  finalStatus: string
  injuryUpdates: InjuryUpdate[]
}

const BUILTIN_INJURIES: InjuryCard[] = [
  {
    key: 'achilles',
    name: 'Left Achilles',
    status: 'monitoring',
    pain: '2',
    since: '2024-09-01',
    location: 'Left Achilles tendon · insertion and mid-body',
    aggravated: 'Hill running · barefoot walking · explosive push-off · morning stiffness',
    notAffected: 'Flat biking · swimming · upper body gym · walking on flat ground',
    treatment: 'Daily exercises 08+09 · wall ankle + soleus stretch · massage gun before stretching · ice after hard sessions · collagen + fish oil',
    symptoms: 'Morning stiffness (worst in first 10 steps). Clicking/creaking sensation. Occasional sharp pain on push-off under load. Improves with warmup.',
    notes: 'Chronic issue — started from increased running volume. Currently stable. Left ankle mobility restriction contributing factor. No flare-ups in last 2 weeks.',
    isBuiltin: true,
  },
  {
    key: 'knee',
    name: 'Right Knee (IT Band)',
    status: 'monitoring',
    pain: '1',
    since: '2025-03-01',
    location: 'Right knee · lateral aspect · IT band insertion',
    aggravated: 'Long runs · stairs · prolonged sitting with bent knee',
    notAffected: 'Biking · swimming · gym (with hip abduction work)',
    treatment: 'Hip abduction + glute medius work (Friday Lower B) · pigeon pose + IT band rollout · avoid overstriding · anti-inflammatory (fish oil)',
    symptoms: 'Lateral knee pain during and after long runs. Tightness from hip down to knee. No swelling. Worse on downhill.',
    notes: 'Stable. Hip abduction exercise added to Friday Lower B specifically for this. Monitoring — does not affect soccer or biking.',
    isBuiltin: true,
  },
  {
    key: 'ankle',
    name: 'Left Ankle',
    status: 'improving',
    pain: '1',
    since: '2026-03-20',
    location: 'Left ankle · lateral ligaments',
    aggravated: 'Uneven terrain · lateral movements at soccer · pivoting',
    notAffected: 'Swimming · biking · flat running',
    treatment: 'Ankle strengthening (single-leg balance) · RICE protocol initially · taping for soccer · dorsiflexion mobility work',
    symptoms: 'Minor hyperextension during soccer. Some lateral instability. No significant swelling after first week. Strength returning.',
    notes: 'Recent injury (Mar 20). Minor hyperextension in soccer. Progressing well — doing ankle stability work. Taped for soccer as precaution.',
    isBuiltin: true,
  },
]

type StatusType = 'monitoring' | 'improving' | 'resolved' | 'worse' | 'active'

const STATUS_CLS: Record<string, string> = {
  monitoring: 'inj-monitoring',
  improving: 'inj-improving',
  resolved: 'inj-resolved-badge',
  worse: 'inj-worse',
  active: 'inj-recent-badge',
}

function formatDate(d: string) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getDuration(since: string, until: string): string {
  if (!since) return '—'
  const days = Math.round((new Date(until).getTime() - new Date(since).getTime()) / 86400000)
  if (days < 0) return '—'
  if (days < 14) return `${days}d`
  if (days < 90) return `${Math.round(days / 7)} wks`
  return `${(days / 30.44).toFixed(1)} mo`
}

export default function InjuriesPage() {
  const [updates, setUpdates] = useState<Record<string, InjuryUpdate[]>>({})
  const [newInjuries, setNewInjuries] = useState<InjuryCard[]>([])
  const [archivedInjuries, setArchivedInjuries] = useState<ArchivedInjury[]>([])
  const [archivedOpen, setArchivedOpen] = useState(false)
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null)
  const [updateForms, setUpdateForms] = useState<Record<string, { note: string; status: string; pain: string; date: string }>>({})
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState({
    name: '', since: '', status: 'monitoring', pain: '',
    location: '', aggravated: '', notAffected: '', treatment: '', notes: '',
  })

  // Track which built-in keys are archived
  const [archivedBuiltinKeys, setArchivedBuiltinKeys] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('injury_updates')
    if (stored) setUpdates(JSON.parse(stored))
    const storedNew = localStorage.getItem('new_injuries')
    if (storedNew) setNewInjuries(JSON.parse(storedNew))
    const storedArchive = localStorage.getItem('archived_injuries')
    if (storedArchive) {
      const parsed: ArchivedInjury[] = JSON.parse(storedArchive)
      setArchivedInjuries(parsed)
      setArchivedBuiltinKeys(parsed.filter(a => a.isBuiltin).map(a => a.key))
    }
  }, [])

  const saveUpdates = (u: typeof updates) => {
    setUpdates(u)
    localStorage.setItem('injury_updates', JSON.stringify(u))
  }

  const addUpdate = (key: string) => {
    const form = updateForms[key] || { note: '', status: 'monitoring', pain: '', date: '' }
    if (!form.note && !form.pain) return
    const entry: InjuryUpdate = {
      date: form.date || new Date().toISOString().split('T')[0],
      status: form.status,
      pain: form.pain,
      note: form.note,
    }
    const next = { ...updates, [key]: [entry, ...(updates[key] || [])] }
    saveUpdates(next)
    setUpdateForms(f => ({ ...f, [key]: { note: '', status: 'monitoring', pain: '', date: '' } }))
  }

  const addInjury = () => {
    if (!newForm.name) return
    const inj: InjuryCard = { ...newForm, key: `inj-${Date.now()}`, symptoms: '' }
    const next = [...newInjuries, inj]
    setNewInjuries(next)
    localStorage.setItem('new_injuries', JSON.stringify(next))
    setNewForm({ name: '', since: '', status: 'monitoring', pain: '', location: '', aggravated: '', notAffected: '', treatment: '', notes: '' })
    setShowNewForm(false)
  }

  const archiveInjury = (inj: InjuryCard) => {
    const injUpdates = updates[inj.key] || []
    const finalStatus = injUpdates.length > 0 ? injUpdates[0].status : inj.status
    const archivedAt = new Date().toISOString().split('T')[0]

    const archived: ArchivedInjury = {
      ...inj,
      archivedAt,
      finalStatus,
      injuryUpdates: injUpdates,
    }

    const nextArchive = [archived, ...archivedInjuries]
    setArchivedInjuries(nextArchive)
    localStorage.setItem('archived_injuries', JSON.stringify(nextArchive))

    if (inj.isBuiltin) {
      const nextKeys = [...archivedBuiltinKeys, inj.key]
      setArchivedBuiltinKeys(nextKeys)
    } else {
      const next = newInjuries.filter(i => i.key !== inj.key)
      setNewInjuries(next)
      localStorage.setItem('new_injuries', JSON.stringify(next))
    }
  }

  const activeInjuries = [
    ...BUILTIN_INJURIES.filter(i => !archivedBuiltinKeys.includes(i.key)),
    ...newInjuries,
  ]

  const renderCard = (inj: InjuryCard) => {
    const injUpdates = updates[inj.key] || []
    const currentStatus = injUpdates.length > 0 ? injUpdates[0].status : inj.status
    const currentPain = injUpdates.length > 0 ? injUpdates[0].pain : inj.pain
    const form = updateForms[inj.key] || { note: '', status: currentStatus, pain: '', date: '' }

    return (
      <div key={inj.key} className="inj-card">
        <div className="inj-header">
          <span className={`inj-badge ${STATUS_CLS[currentStatus] || 'inj-monitoring'}`}>{currentStatus}</span>
          <span className="inj-name">{inj.name}</span>
          {currentPain && <span className="inj-pain-badge">Pain: {currentPain}/10</span>}
          <button
            onClick={() => archiveInjury(inj)}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--faint)', fontSize: 14, padding: '0 2px', lineHeight: 1, flexShrink: 0,
            }}
            title="Archive injury (moves to past injuries)"
          >✕</button>
        </div>

        {[
          { label: 'Since', val: inj.since },
          { label: 'Location', val: inj.location },
          { label: 'Aggravated by', val: inj.aggravated },
          { label: 'Not affected by', val: inj.notAffected },
          { label: 'Treatment', val: inj.treatment },
        ].filter(r => r.val).map(row => (
          <div key={row.label} className="inj-detail">
            <span className="inj-label">{row.label}</span>
            <span>{row.val}</span>
          </div>
        ))}

        {inj.symptoms && (
          <div className="inj-detail">
            <span className="inj-label">Symptoms</span>
            <span>{inj.symptoms}</span>
          </div>
        )}

        {inj.notes && (
          <div className="inj-detail">
            <span className="inj-label">Notes</span>
            <span>{inj.notes}</span>
          </div>
        )}

        {/* Recovery log */}
        <div className="inj-recovery-log">
          <div className="inj-recovery-header">Recovery Log</div>
          {injUpdates.length === 0 ? (
            <div className="inj-recovery-empty">No updates yet</div>
          ) : injUpdates.map((u, i) => (
            <div key={i} className="inj-recovery-entry">
              <span className="inj-rec-date">{u.date}</span>
              <span className={`inj-badge ${STATUS_CLS[u.status] || 'inj-monitoring'}`} style={{ fontSize: 9 }}>{u.status}</span>
              <span className="inj-rec-note">{u.note}</span>
              {u.pain && <span className="inj-rec-pain">{u.pain}/10</span>}
            </div>
          ))}
        </div>

        {/* Update form */}
        <div className="inj-update-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <input type="date" value={form.date} onChange={e => setUpdateForms(f => ({ ...f, [inj.key]: { ...form, date: e.target.value } }))} />
            <select value={form.status} onChange={e => setUpdateForms(f => ({ ...f, [inj.key]: { ...form, status: e.target.value } }))}>
              <option value="monitoring">Monitoring</option>
              <option value="improving">Improving</option>
              <option value="resolved">Resolved</option>
              <option value="worse">Getting worse</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px', gap: 6 }}>
            <input type="text" placeholder="Update note..." value={form.note} onChange={e => setUpdateForms(f => ({ ...f, [inj.key]: { ...form, note: e.target.value } }))} />
            <input type="number" placeholder="Pain" min="0" max="10" value={form.pain} onChange={e => setUpdateForms(f => ({ ...f, [inj.key]: { ...form, pain: e.target.value } }))} />
          </div>
          <button className="hub-btn" onClick={() => addUpdate(inj.key)}>Add Update</button>
        </div>
      </div>
    )
  }

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Injuries</h2>
          <div className="sub">Active · monitoring · recovery log</div>
        </div>
        <div className="page-header-right">
          {activeInjuries.length} active<br />
          {archivedInjuries.length} archived
        </div>
      </div>

      <div className="inj-grid">
        {activeInjuries.map(renderCard)}
        {activeInjuries.length === 0 && (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--muted)', padding: '20px 0' }}>
            No active injuries — all clear 🟢
          </div>
        )}
      </div>

      {/* ── Log new injury ── */}
      <div style={{ marginTop: 24 }}>
        <div className="section-hdr">
          <span className="ptitle">Log new injury</span>
          <button className="hub-btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setShowNewForm(!showNewForm)}>
            {showNewForm ? '▲ Cancel' : '+ Add injury'}
          </button>
        </div>

        {showNewForm && (
          <div className="surface-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
              {[
                { label: 'Injury name *', val: newForm.name, set: (v: string) => setNewForm(f => ({ ...f, name: v })), placeholder: 'e.g. Right hamstring' },
                { label: 'Date started', val: newForm.since, set: (v: string) => setNewForm(f => ({ ...f, since: v })), type: 'date' },
                { label: 'Pain (0–10)', val: newForm.pain, set: (v: string) => setNewForm(f => ({ ...f, pain: v })), type: 'number', placeholder: '3' },
                { label: 'Location', val: newForm.location, set: (v: string) => setNewForm(f => ({ ...f, location: v })), placeholder: 'e.g. Right hamstring, distal' },
                { label: 'Aggravated by', val: newForm.aggravated, set: (v: string) => setNewForm(f => ({ ...f, aggravated: v })), placeholder: 'e.g. Running, sitting' },
                { label: 'Not affected by', val: newForm.notAffected, set: (v: string) => setNewForm(f => ({ ...f, notAffected: v })), placeholder: 'e.g. Swimming, biking' },
                { label: 'Treatment', val: newForm.treatment, set: (v: string) => setNewForm(f => ({ ...f, treatment: v })), placeholder: 'e.g. Ice, stretching' },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>{field.label}</label>
                  <input type={field.type || 'text'} placeholder={field.placeholder} value={field.val} onChange={e => field.set(e.target.value)} />
                </div>
              ))}
              <div>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Initial status</label>
                <select value={newForm.status} onChange={e => setNewForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="monitoring">Monitoring</option>
                  <option value="improving">Improving</option>
                  <option value="worse">Getting worse</option>
                  <option value="active">Active / acute</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 3 }}>Notes</label>
              <input type="text" placeholder="Additional context..." value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <button className="hub-btn" onClick={addInjury}>Log Injury</button>
          </div>
        )}
      </div>

      {/* ── Past Injuries ── */}
      {archivedInjuries.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="section-hdr" style={{ cursor: 'pointer' }} onClick={() => setArchivedOpen(o => !o)}>
            <span className="ptitle">Past Injuries</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>
              {archivedInjuries.length} archived
            </span>
            <span style={{ marginLeft: 'auto', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)' }}>
              {archivedOpen ? '▲ collapse' : '▼ expand'}
            </span>
          </div>

          {archivedOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {archivedInjuries.map(a => {
                const isExpanded = expandedArchive === a.key
                const duration = getDuration(a.since, a.archivedAt)
                return (
                  <div
                    key={a.key + a.archivedAt}
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, overflow: 'hidden',
                    }}
                  >
                    {/* Compact row */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setExpandedArchive(isExpanded ? null : a.key + a.archivedAt)}
                    >
                      <span className={`inj-badge ${STATUS_CLS[a.finalStatus] || 'inj-monitoring'}`} style={{ flexShrink: 0 }}>
                        {a.finalStatus}
                      </span>
                      <span style={{ fontWeight: 500, fontSize: 14, flex: 1 }}>{a.name}</span>
                      {a.since && (
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>
                          {formatDate(a.since)} → {formatDate(a.archivedAt)}
                        </span>
                      )}
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500,
                        color: 'var(--text)', background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '2px 8px', flexShrink: 0,
                      }}>
                        {duration}
                      </span>
                      <span style={{ color: 'var(--faint)', fontSize: 11, flexShrink: 0 }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
                        {[
                          { label: 'Location', val: a.location },
                          { label: 'Aggravated by', val: a.aggravated },
                          { label: 'Treatment', val: a.treatment },
                          { label: 'Notes', val: a.notes },
                        ].filter(r => r.val).map(row => (
                          <div key={row.label} className="inj-detail" style={{ marginTop: 8 }}>
                            <span className="inj-label">{row.label}</span>
                            <span style={{ fontSize: 13 }}>{row.val}</span>
                          </div>
                        ))}

                        {a.injuryUpdates.length > 0 && (
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                              Recovery Log ({a.injuryUpdates.length} entries)
                            </div>
                            {a.injuryUpdates.map((u, i) => (
                              <div key={i} className="inj-recovery-entry">
                                <span className="inj-rec-date">{u.date}</span>
                                <span className={`inj-badge ${STATUS_CLS[u.status] || 'inj-monitoring'}`} style={{ fontSize: 9 }}>{u.status}</span>
                                <span className="inj-rec-note">{u.note}</span>
                                {u.pain && <span className="inj-rec-pain">{u.pain}/10</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
