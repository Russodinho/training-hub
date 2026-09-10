'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getActiveRace } from '@/lib/data'

const NAV_GROUPS: { group: string | null; items: { href: string; label: string }[] }[] = [
  {
    group: null,
    items: [{ href: '/', label: 'Dashboard' }],
  },
  {
    group: 'Plan',
    items: [
      { href: '/race-calendar', label: 'Calendar' },
      { href: '/season-plan', label: 'Season' },
    ],
  },
  {
    group: 'Train',
    items: [
      { href: '/log', label: 'Workout' },
      { href: '/training-log', label: 'Training Log' },
      { href: '/cardio', label: 'Cardio' },
    ],
  },
  {
    group: 'Recover',
    items: [
      { href: '/mobility', label: 'Mobility' },
      { href: '/sleep', label: 'Sleep' },
      { href: '/recovery', label: 'Recovery' },
      { href: '/injuries', label: 'Injuries' },
    ],
  },
  {
    group: 'Fuel',
    items: [{ href: '/fuel', label: 'Nutrition' }],
  },
  {
    group: 'Race',
    items: [{ href: '/race-day', label: 'Race Day' }],
  },
  {
    group: 'Settings',
    items: [{ href: '/settings/exercises', label: 'Exercises' }],
  },
]

const MOBILE_TABS = [
  { href: '/', label: 'Home', paths: ['/'] },
  { href: '/race-calendar', label: 'Plan', paths: ['/race-calendar', '/season-plan'] },
  { href: '/log', label: 'Train', paths: ['/log', '/training-log', '/cardio'] },
  { href: '/mobility', label: 'Recover', paths: ['/mobility', '/sleep', '/recovery', '/injuries'] },
  { href: '/fuel', label: 'Fuel', paths: ['/fuel', '/race-day', '/settings'] },
]

function linkActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

function tabActive(pathname: string, paths: string[]): boolean {
  return paths.some(p => (p === '/' ? pathname === '/' : pathname.startsWith(p)))
}

export default function Sidebar() {
  const pathname = usePathname()
  const [daysOut, setDaysOut] = useState<number | string>('—')
  const [raceName, setRaceName] = useState('')

  useEffect(() => {
    const active = getActiveRace()
    if (active) {
      setRaceName(active.race.name)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const rd = new Date(active.race.date); rd.setHours(0, 0, 0, 0)
      const d = Math.round((rd.getTime() - today.getTime()) / 86400000)
      setDaysOut(d > 0 ? d : d === 0 ? 'Today!' : 'Done')
    }
  }, [])

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <Link href="/" className="sidebar-brand-link">
            Training Hub <span className="sidebar-brand-year">2026</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map(({ group, items }) => (
            <div key={group ?? 'root'} className="sidebar-group">
              {group && <div className="sidebar-group-label">{group}</div>}
              {items.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link${linkActive(pathname, href) ? ' active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {raceName && (
          <div className="sidebar-race">
            <div className="sidebar-race-name">{raceName}</div>
            <div className="sidebar-race-days">
              <span className="sidebar-race-num">{daysOut}</span>
              {typeof daysOut === 'number' && (
                <span className="sidebar-race-unit"> days</span>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="mobile-topbar">
        <Link href="/" className="sidebar-brand-link" style={{ fontSize: 11 }}>
          Training Hub <span className="sidebar-brand-year">2026</span>
        </Link>
        {raceName && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span className="sidebar-race-num" style={{ fontSize: 20 }}>{daysOut}</span>
            {typeof daysOut === 'number' && (
              <span className="sidebar-race-unit">d</span>
            )}
          </div>
        )}
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottom-nav">
        {MOBILE_TABS.map(({ href, label, paths }) => (
          <Link
            key={href}
            href={href}
            className={`mobile-tab${tabActive(pathname, paths) ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
