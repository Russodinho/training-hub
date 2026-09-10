'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getActiveRace } from '@/lib/data'

// ── Icons (16×16, stroke-based) ────────────────────────────────────────────
function Icon({ d, vb = '0 0 16 16' }: { d: string; vb?: string }) {
  return (
    <svg width="15" height="15" viewBox={vb} fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

const ICONS: Record<string, React.ReactNode> = {
  '/': <Icon d="M2 6.5 8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />,
  '/race-calendar': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" />
      <path d="M1.5 7h13M5 1.5v3M11 1.5v3" />
    </svg>
  ),
  '/season-plan': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="1.5,12.5 5,8 8.5,10 14.5,3.5" />
      <polyline points="11,3.5 14.5,3.5 14.5,7" />
    </svg>
  ),
  '/log': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5.5 8h5M3 5.5h1.5M3 8h1.5M3 10.5h1.5" />
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
    </svg>
  ),
  '/training-log': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="2" y="10" width="2.5" height="4" rx="0.5" />
      <rect x="6.75" y="7" width="2.5" height="7" rx="0.5" />
      <rect x="11.5" y="4" width="2.5" height="10" rx="0.5" />
      <path d="M1.5 14.5h13" />
    </svg>
  ),
  '/cardio': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="1.5,8 4,8 5.5,4.5 7.5,11.5 9.5,6 11,8 14.5,8" />
    </svg>
  ),
  '/mobility': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="3" r="1.4" />
      <path d="M5 6.5q3-2.5 6 0l-1 5.5M8 9l-1.5 4" />
    </svg>
  ),
  '/sleep': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M11.5 9.5A5.5 5.5 0 0 1 6 4a5.5 5.5 0 1 0 9 9 5.5 5.5 0 0 1-3.5-3.5z" />
    </svg>
  ),
  '/recovery': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" />
      <polyline points="13.5,2.5 13.5,8 8,8" />
    </svg>
  ),
  '/injuries': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="6.5" y="1.5" width="3" height="13" rx="1" />
      <rect x="1.5" y="6.5" width="13" height="3" rx="1" />
    </svg>
  ),
  '/fuel': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5.5 1.5v5a2.5 2.5 0 0 1-2.5 2.5v5.5M11.5 1.5v13M8.5 4a3 3 0 0 1 3-3" />
    </svg>
  ),
  '/race-day': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M3 1.5v13M3 1.5l9 3.5-9 4" />
    </svg>
  ),
  '/settings/exercises': (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
    </svg>
  ),
}

// ── Nav structure ───────────────────────────────────────────────────────────
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
              {items.map(({ href, label }) => {
                const active = linkActive(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`sidebar-link${active ? ' active' : ''}`}
                  >
                    <span style={{ color: active ? 'var(--strength)' : 'inherit',
                      display: 'flex', alignItems: 'center' }}>
                      {ICONS[href] ?? null}
                    </span>
                    {label}
                  </Link>
                )
              })}
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
