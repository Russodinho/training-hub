'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
    fetch('/api/strava/status').then(r => r.json()).then(d => setStravaConnected(d.connected)).catch(() => {})
  }, [])

  // Close menu when navigating
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const activeRace = getActiveRace()

  return (
    <>
      <style>{`
        .nav-links-desktop {
          display: flex;
          align-items: stretch;
          flex: 1;
          overflow-x: auto;
          min-width: 0;
        }
        .nav-hamburger {
          display: none;
        }
        .nav-mobile-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none;
          }
          .nav-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0 8px;
            height: 44px;
            color: var(--text);
            flex-shrink: 0;
          }
          .nav-mobile-menu {
            display: block;
            position: absolute;
            top: 44px;
            left: 0;
            right: 0;
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            z-index: 200;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          }
          .nav-mobile-menu a {
            display: block;
            padding: 13px 20px;
            font-family: 'DM Mono', monospace;
            font-size: 12px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            text-decoration: none;
            border-bottom: 1px solid var(--border-soft);
            transition: background 0.1s;
          }
          .nav-mobile-menu a:active {
            background: var(--bg);
          }
        }
      `}</style>

      <nav ref={menuRef} style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'stretch', padding: '0 16px', gap: 0,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
          color: 'var(--text)', letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', paddingRight: 16,
          borderRight: '1px solid var(--border)', marginRight: 8,
          whiteSpace: 'nowrap', textDecoration: 'none', flexShrink: 0,
        }}>
          Training Hub <span style={{ color: 'var(--muted)', fontWeight: 300, marginLeft: 6 }}>2026</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links-desktop">
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
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          )}
        </button>

        {/* Right side: Strava + countdown */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, paddingLeft: 12 }}>
          {stravaConnected ? (
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              background: 'var(--lift-bg)', color: 'var(--lift-t)',
              borderRadius: 4, padding: '3px 8px', whiteSpace: 'nowrap',
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

          {activeRace && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              <span style={{ display: 'none' }} className="nav-race-label">{activeRace.race.name.split(' ')[0]} in </span>
              <strong style={{ color: 'var(--text)', fontSize: 14 }}>{daysOut}</strong>{' '}
              {typeof daysOut === 'number' ? 'd' : ''}
            </div>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link key={href} href={href} style={{
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  fontWeight: isActive ? 600 : 400,
                }}>
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>
    </>
  )
}
