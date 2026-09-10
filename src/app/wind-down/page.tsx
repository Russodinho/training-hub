'use client'

import { useState } from 'react'

interface Stretch {
  id: number
  num: string
  name: string
  focus: string
  badges: string[]
  cue: string
  breath: string
}

const STRETCHES: Stretch[] = [
  {
    id: 1,
    num: '01',
    name: 'Legs Up the Wall',
    focus: 'Leg drainage · heart rate drop · nervous system reset',
    badges: ['Wall', '3–5 min', 'No side'],
    cue: 'Lie on your back, scoot your butt as close to the wall as comfortable, legs straight up the wall. Arms by your sides or hands on belly. Close your eyes. Let gravity drain your legs. This is especially good after soccer, run days, and long days on your feet. You should feel your heart rate slow within the first minute.',
    breath: 'Breathe: slow nasal breathing · no count needed · just slow',
  },
  {
    id: 2,
    num: '02',
    name: 'Supine Spinal Twist',
    focus: 'Lower back release · gentle spinal decompression',
    badges: ['Floor', '60 sec', 'Each side'],
    cue: "Lie on your back, knees bent. Let both knees fall to the right, arms out in a T. Head can turn left or stay neutral. Gravity does the work — don't force the knees down. You're not trying to crack anything. Breathe into the stretch. Switch sides.",
    breath: 'Breathe: 4 sec inhale nose · 6 sec exhale mouth',
  },
  {
    id: 3,
    num: '03',
    name: "Child's Pose",
    focus: 'Full-body release · breath deepening · mental quiet',
    badges: ['Floor', '2 min', 'No side'],
    cue: "Knees wide, big toes touching, sit back toward heels. Walk hands forward, forehead on floor. Arms extended or tucked by your sides — whichever feels more restful. Let your whole body go heavy. If your forehead doesn't reach the floor comfortably, stack your fists or use a pillow. You might fall asleep here. That's fine.",
    breath: 'Breathe: into your lower back · feel ribs expand laterally',
  },
  {
    id: 4,
    num: '04',
    name: '90/90 Breathing',
    focus: 'Diaphragm reset · parasympathetic activation · the actual sleep switch',
    badges: ['Wall or chair', '10 breaths', 'No side'],
    cue: "Lie on your back, feet flat on the wall (or on a chair) so knees and hips are both at 90 degrees. Hands on your belly. This position flattens your lower back and puts your diaphragm in an optimal position. Take 10 slow breaths: inhale 4 seconds through your nose (feel belly rise), exhale 6–8 seconds through your mouth (feel belly fall). Make each exhale longer than the inhale. This is the single most effective thing you can do to flip from sympathetic to parasympathetic.",
    breath: 'Breathe: 4 sec inhale nose · 6–8 sec exhale mouth · 10 breaths',
  },
  {
    id: 5,
    num: '05',
    name: 'Neck Release',
    focus: 'Desk tension · swim tension · upper trap release',
    badges: ['Seated or lying', '30 sec', 'Each side'],
    cue: "Seated on the edge of your bed or lying down. Gently drop your right ear toward your right shoulder — don't force it, just let the weight of your head do the work. You can place your right hand lightly on the left side of your head for the tiniest bit of extra weight, but don't pull. Hold 30 seconds, switch sides. You carry tension here from desk work, swimming, and stress. This is the last thing before lights out.",
    breath: 'Breathe: slow · jaw unclenched · shoulders dropped',
  },
]

const RULES: { title: string; body: string }[] = [
  { title: 'No massage gun.', body: 'The gun is stimulating — it wakes up tissue. Save it for post-workout mobility.' },
  { title: 'No active movements.', body: "No World's Greatest Stretch, no hip switches, no couch stretch. Those are mobility work. This is wind-down." },
  { title: 'Dark room preferred.', body: 'Do this with low light or no light. Blue light from screens works against everything you\'re doing here.' },
  { title: 'On the floor or in bed.', body: "All 5 can be done on a carpet, yoga mat, or your bed. Don't overthink the surface." },
  { title: 'Order matters slightly.', body: 'Legs up the wall first (drains legs, starts the slowdown), 90/90 breathing second-to-last (the real nervous system flip), neck release last (final tension dump before sleep).' },
  { title: 'If you only do one:', body: 'Do the 90/90 breathing. 10 breaths, 2 minutes, biggest impact on sleep latency.' },
]

function MoonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10z" />
    </svg>
  )
}

function CompletionRing({ done, total }: { done: number; total: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const pct = total > 0 ? done / total : 0
  const offset = circ * (1 - pct)
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--s3)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="var(--strength)" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text x="50" y="47" textAnchor="middle" dominantBaseline="middle"
        fill="var(--text)" fontFamily="Figtree, sans-serif" fontSize="20" fontWeight="700">{done} / {total}</text>
      <text x="50" y="65" textAnchor="middle" dominantBaseline="middle"
        fill="var(--muted)" fontFamily="Figtree, sans-serif" fontSize="10">Completed</text>
    </svg>
  )
}

export default function WindDownPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<number | null>(null)
  const [rulesOpen, setRulesOpen] = useState(false)

  const toggle = (id: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const total = STRETCHES.length
  const done = checked.size

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Wind-Down</h2>
          <div className="sub">Slow down. Settle into sleep.</div>
        </div>
      </div>

      {/* Summary card */}
      <div className="wind-summary">
        <div>
          <div className="wind-summary-title">Tonight&apos;s routine</div>
          <div className="wind-summary-sub">{total} stretches · About 10 min</div>
          <div className="wind-summary-link">Slow breathing</div>
        </div>
        <CompletionRing done={done} total={total} />
      </div>

      {/* Stretch rows */}
      <div className="wind-grid">
        {STRETCHES.map(stretch => {
          const isChecked = checked.has(stretch.id)
          const isOpen = expanded === stretch.id
          return (
            <div key={stretch.id} className={`wind-card${isChecked ? ' checked' : ''}`}>
              <div className="wind-row">
                <button
                  type="button"
                  className="wind-disclosure"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : stretch.id)}
                >
                  <span className="wind-icon-tile"><MoonIcon /></span>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span className="wind-name">{stretch.name}</span>
                    <span className="wind-focus">{stretch.focus}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={`wind-check${isChecked ? ' checked' : ''}`}
                  onClick={() => toggle(stretch.id)}
                  aria-label={isChecked ? `Mark ${stretch.name} not done` : `Mark ${stretch.name} done`}
                >
                  <span className="wind-check-dot">{isChecked && '✓'}</span>
                </button>
              </div>
              {isOpen && (
                <div className="wind-detail">
                  <div className="wind-badges">
                    {stretch.badges.map(b => <span key={b} className="wind-badge">{b}</span>)}
                  </div>
                  <div className="wind-cue">{stretch.cue}</div>
                  <div className="wind-breath">{stretch.breath}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ground rules */}
      <div className="wind-rules">
        <button type="button" className="wind-rules-title" aria-expanded={rulesOpen} onClick={() => setRulesOpen(o => !o)}>
          Ground rules
          <span className="wind-rules-toggle">{rulesOpen ? '▲ collapse' : '▼ expand'}</span>
        </button>
        {rulesOpen && RULES.map((rule, i) => (
          <div key={i} className="wind-rule-item">
            <strong>{rule.title}</strong> {rule.body}
          </div>
        ))}
      </div>
    </div>
  )
}
