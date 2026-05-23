'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { RACES, getActiveRace } from '@/lib/data'

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/race-calendar', label: 'Race Calendar' },
  { href: '/tri-plan', label: 'Tri Plan' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/workouts', label: 'Workouts' },
  { href: '/supplements', label: 'Supplements' },
  { href: '/mobility', label: 'Mobility' },
  { href: '/stretch-goals', label: 'Stretch Goals' },
  { href: '/race-day', label: 'Race Day' },
  { href: '/progress', label: 'Progress' },
  { href: '/injuries', label: 'Injuries' },
  { href: '/meal-hub', label: 'Meal Hub' },
]

export default function Nav() {
  const pathname = usePathname()
  const [daysOut, setDaysOut] = useState<string | number>('—')
  const [stravaConnected, setStravaConnected] = useState(false)

  useEffect(() => {
    const active = getActiveRace()
    if (active) {
      const today = new Date(); today.setHours(0,0,0,0)
      const rd = new Date(active.race.date); rd.setHours(0,0,0,0)
      const d = Math.round((rd.getTime() - today.getTime()) / 86400000)
      setDaysOut(d > 0 ? d : d === 0 ? 'Today!' : 'Done')
    } else {
      setDaysOut('Done')
    }
    // Check strava connection
    fetch('/api/strava/status').then(r => r.json()).then(d => setStravaConnected(d.connected)).catch(() => {})
  }, [])

  const activeRace = getActiveRace()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'stretch', padding: '0 24px', gap: 0,
      overflowX: 'auto',
    }}>
      <Link href="/" style={{
        fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
        color: 'var(--text)', letterSpacing: '0.04em',
        display: 'flex', alignItems: 'center', paddingRight: 24,
        borderRight: '1px solid var(--border)', marginRight: 8,
        whiteSpace: 'nowrap', textDecoration: 'none',
        flexShrink: 0,
      }}>
        Training Hub <span style={{ color: 'var(--muted)', fontWeight: 300, marginLeft: 6 }}>2026</span>
      </Link>

      {NAV_LINKS.map(({ href, label }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link key={href} href={href} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            letterSpacing: '0.04em',
            color: isActive ? 'var(--text)' : 'var(--muted)',
            padding: '0 12px', height: 44,
            display: 'flex', alignItems: 'center',
            borderBottom: `2px solid ${isActive ? 'var(--text)' : 'transparent'}`,
            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
            textDecoration: 'none', flexShrink: 0,
            transition: 'color 0.15s, border-color 0.15s',
          }}>
            {label}
          </Link>
        )
      })}

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, paddingLeft: 16 }}>
        {/* Strava connect */}
        {stravaConnected ? (
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            background: 'var(--lift-bg)', color: 'var(--lift-t)',
            borderRadius: 4, padding: '3px 8px',
          }}>
            ● Strava
          </span>
        ) : (
          <a href="/api/strava/auth" style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            background: '#FC4C02', color: '#fff',
            borderRadius: 4, padding: '3px 8px',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Connect Strava
          </a>
        )}

        {/* Countdown */}
        {activeRace && (
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            {activeRace.race.name.split(' ')[0]} in{' '}
            <strong style={{ color: 'var(--text)', fontSize: 14 }}>{daysOut}</strong>{' '}
            {typeof daysOut === 'number' ? 'days' : ''}
          </div>
        )}
      </div>
    </nav>
  )
}
