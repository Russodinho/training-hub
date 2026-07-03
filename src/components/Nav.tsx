'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { RACES, getActiveRace } from '@/lib/data'

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/race-calendar', label: 'Calendar' },
  { href: '/season-plan', label: 'Season' },
  { href: '/training-log', label: 'Log' },
  { href: '/fuel', label: 'Fuel' },
  { href: '/race-day', label: 'Race Day' },
  { href: '/injuries', label: 'Injuries' },
]

const NAV_PLACEHOLDERS = [
  { label: 'Recovery', soon: true },
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

  useEffect(() => { setMenuOpen(false) }, [pathname])

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
          align-items: center;
          flex: 1;
          gap: 2px;
          overflow-x: auto;
          min-width: 0;
          scrollbar-width: none;
        }
        .nav-links-desktop::-webkit-scrollbar { display: none; }
        .nav-hamburger { display: none; }
        .nav-mobile-menu { display: none; }

        @media (max-width: 768px) {
          .nav-links-desktop { display: none; }
          .nav-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0 8px;
            height: 44px;
            color: var(--muted);
            flex-shrink: 0;
          }
          .nav-mobile-menu {
            display: block;
            position: absolute;
            top: 44px;
            left: 0;
            right: 0;
            background: var(--s1);
            border-bottom: 0.5px solid var(--border);
            z-index: 200;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          }
          .nav-mobile-menu a, .nav-mobile-menu span.mobile-item {
            display: block;
            padding: 12px 20px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            text-decoration: none;
            border-bottom: 0.5px solid var(--border);
          }
          .nav-mobile-menu a:active { background: var(--s2); }
        }
      `}</style>

      <nav ref={menuRef} style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--s1)',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 0, height: 44,
      }}>
        {/* Brand */}
        <Link href="/" style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: '0.14em',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center',
          paddingRight: 16,
          borderRight: '0.5px solid var(--border)',
          marginRight: 10,
          whiteSpace: 'nowrap',
          textDecoration: 'none',
          flexShrink: 0,
        }}>
          Training Hub{' '}
          <span style={{ color: 'var(--strength)', marginLeft: 6 }}>2026</span>
        </Link>

        {/* Desktop tabs */}
        <div className="nav-links-desktop">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: isActive ? 500 : 400,
                letterSpacing: '0.06em',
                color: isActive ? 'var(--text)' : 'var(--muted)',
                padding: '5px 12px',
                borderRadius: 6,
                background: isActive ? 'var(--s3)' : 'transparent',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'color 0.15s, background 0.15s',
              }}>
                {label}
              </Link>
            )
          })}
          {NAV_PLACEHOLDERS.map(({ label }) => (
            <span key={label} style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'var(--dim)',
              padding: '5px 12px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              cursor: 'default',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {label}
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 8,
                background: 'var(--s3)',
                border: '0.5px solid var(--border)',
                borderRadius: 3,
                padding: '1px 4px',
                letterSpacing: '0.06em',
                color: 'var(--dim)',
              }}>soon</span>
            </span>
          ))}
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="3" x2="15" y2="15" />
              <line x1="15" y1="3" x2="3" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="5" x2="16" y2="5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13" x2="16" y2="13" />
            </svg>
          )}
        </button>

        {/* Right: Strava + countdown */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, paddingLeft: 12 }}>
          {stravaConnected ? (
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              background: 'rgba(252,76,2,0.12)',
              border: '0.5px solid rgba(252,76,2,0.3)',
              color: '#fc4c02',
              borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap',
            }}>
              ● Strava
            </span>
          ) : (
            <a href="/api/strava/auth" style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              background: 'rgba(252,76,2,0.12)',
              border: '0.5px solid rgba(252,76,2,0.3)',
              color: '#fc4c02',
              borderRadius: 20, padding: '3px 10px',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Connect Strava
            </a>
          )}

          {activeRace && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              <strong style={{ color: 'var(--strength)', fontSize: 14 }}>{daysOut}</strong>
              {typeof daysOut === 'number' ? <span style={{ fontSize: 10 }}> d</span> : ''}
            </div>
          )}
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link key={href} href={href} style={{
                  color: isActive ? 'var(--text)' : 'var(--muted)',
                  fontWeight: isActive ? 500 : 400,
                }}>
                  {label}
                </Link>
              )
            })}
            {NAV_PLACEHOLDERS.map(({ label }) => (
              <span key={label} className="mobile-item" style={{ color: 'var(--dim)' }}>
                {label}{' '}
                <span style={{ fontSize: 8, background: 'var(--s3)', border: '0.5px solid var(--border)', borderRadius: 3, padding: '1px 4px' }}>soon</span>
              </span>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}
