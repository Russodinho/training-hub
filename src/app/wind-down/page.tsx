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
  {
    title: 'No massage gun.',
    body: 'The gun is stimulating — it wakes up tissue. Save it for post-workout mobility.',
  },
  {
    title: 'No active movements.',
    body: "No World's Greatest Stretch, no hip switches, no couch stretch. Those are mobility work. This is wind-down.",
  },
  {
    title: 'Dark room preferred.',
    body: 'Do this with low light or no light. Blue light from screens works against everything you\'re doing here.',
  },
  {
    title: 'On the floor or in bed.',
    body: "All 5 can be done on a carpet, yoga mat, or your bed. Don't overthink the surface.",
  },
  {
    title: 'Order matters slightly.',
    body: 'Legs up the wall first (drains legs, starts the slowdown), 90/90 breathing second-to-last (the real nervous system flip), neck release last (final tension dump before sleep).',
  },
  {
    title: 'If you only do one:',
    body: 'Do the 90/90 breathing. 10 breaths, 2 minutes, biggest impact on sleep latency.',
  },
]

export default function WindDownPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set())

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
  const complete = done === total

  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Pre-Sleep Wind-Down</h2>
          <div className="sub">5 stretches · ~10 min · every night before bed · parasympathetic only</div>
        </div>
        <div className="page-header-right">
          No massage gun<br />
          No active movements<br />
          Dark room · slow breathing
        </div>
      </div>

      {/* Intent */}
      <div className="wind-intent">
        <strong>Purpose:</strong> This is not a mobility session — it&apos;s a nervous system shut-off switch. Everything here is passive, gravity-assisted, and breath-focused. The goal is to downregulate from the day and transition into sleep. If you feel like you&apos;re &ldquo;working&rdquo; during any of these, you&apos;re doing too much.
      </div>

      {/* Status tile */}
      <div className={`wind-status${complete ? ' complete' : ''}`}>
        <div className="wind-status-icon">{complete ? '✅' : '🌙'}</div>
        <div>
          <div className="wind-status-title">
            {complete ? 'Wind-down complete' : 'Wind-down'}
          </div>
          <div className="wind-status-sub">
            {complete ? 'Time for sleep. Lights out.' : 'Click each stretch as you finish it'}
          </div>
        </div>
        <div className="wind-status-right">
          <div className="wind-status-progress">{done}/{total}</div>
        </div>
      </div>

      {/* Stretch cards */}
      <div className="wind-grid">
        {STRETCHES.map(stretch => {
          const isChecked = checked.has(stretch.id)
          return (
            <div
              key={stretch.id}
              className={`wind-card${isChecked ? ' checked' : ''}`}
              onClick={() => toggle(stretch.id)}
            >
              <div className="wind-num">{stretch.num}</div>
              <div>
                <div className="wind-name">{stretch.name}</div>
                <div className="wind-focus">{stretch.focus}</div>
                <div className="wind-badges">
                  {stretch.badges.map(b => (
                    <span key={b} className="wind-badge">{b}</span>
                  ))}
                </div>
                <div className="wind-cue">{stretch.cue}</div>
                <div className="wind-breath">{stretch.breath}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ground rules */}
      <div className="wind-rules">
        <div className="wind-rules-title">Ground Rules</div>
        {RULES.map((rule, i) => (
          <div key={i} className="wind-rule-item">
            <strong>{rule.title}</strong> {rule.body}
          </div>
        ))}
      </div>
    </div>
  )
}
