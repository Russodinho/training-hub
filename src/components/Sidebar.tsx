'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getActiveRace } from '@/lib/supabase'
import {
  DESKTOP_NAV, UTILITY_NAV, MOBILE_TABS,
  linkActive, tabActive, groupActive, groupForPath,
} from './navConfig'
import { useOverlay } from './useOverlay'

// ── Icons (16×16, stroke-based) ────────────────────────────────────────────
function Icon({ d, vb = '0 0 16 16' }: { d: string; vb?: string }) {
  return (
    <svg width="18" height="18" viewBox={vb} fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

const ICONS: Record<string, React.ReactNode> = {
  '/': <Icon d="M2 6.5 8 2l6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />,
  '/agent': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M2 3.5h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6.5L3.5 14v-2.5H2a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" />
      <path d="M5 7h6M5 9h3.5" />
    </svg>
  ),
  '/race-calendar': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" />
      <path d="M1.5 7h13M5 1.5v3M11 1.5v3" />
    </svg>
  ),
  '/season-plan': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="1.5,12.5 5,8 8.5,10 14.5,3.5" />
      <polyline points="11,3.5 14.5,3.5 14.5,7" />
    </svg>
  ),
  '/log': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5.5 8h5M3 5.5h1.5M3 8h1.5M3 10.5h1.5" />
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
    </svg>
  ),
  '/training-log': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="2" y="10" width="2.5" height="4" rx="0.5" />
      <rect x="6.75" y="7" width="2.5" height="7" rx="0.5" />
      <rect x="11.5" y="4" width="2.5" height="10" rx="0.5" />
      <path d="M1.5 14.5h13" />
    </svg>
  ),
  '/cardio': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="1.5,8 4,8 5.5,4.5 7.5,11.5 9.5,6 11,8 14.5,8" />
    </svg>
  ),
  '/mobility': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="3" r="1.4" />
      <path d="M5 6.5q3-2.5 6 0l-1 5.5M8 9l-1.5 4" />
    </svg>
  ),
  '/sleep': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M11.5 9.5A5.5 5.5 0 0 1 6 4a5.5 5.5 0 1 0 9 9 5.5 5.5 0 0 1-3.5-3.5z" />
    </svg>
  ),
  '/wind-down': <Icon d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10z" vb="0 0 24 24" />,
  '/recovery': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" />
      <polyline points="13.5,2.5 13.5,8 8,8" />
    </svg>
  ),
  '/injuries': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="6.5" y="1.5" width="3" height="13" rx="1" />
      <rect x="1.5" y="6.5" width="13" height="3" rx="1" />
    </svg>
  ),
  '/fuel': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M5.5 1.5v5a2.5 2.5 0 0 1-2.5 2.5v5.5M11.5 1.5v13M8.5 4a3 3 0 0 1 3-3" />
    </svg>
  ),
  '/race-day': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M3 1.5v13M3 1.5l9 3.5-9 4" />
    </svg>
  ),
  '/settings/exercises': (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
    </svg>
  ),
}

// Representative icon for each collapsible desktop group's toggle button.
const GROUP_ICONS: Record<string, React.ReactNode> = {
  plan: ICONS['/race-calendar'],
  train: ICONS['/log'],
  recover: ICONS['/recovery'],
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
      <polyline points="4,6 8,10 12,6" />
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [daysOut, setDaysOut] = useState<number | string>('—')
  const [raceName, setRaceName] = useState('')

  useEffect(() => {
    getActiveRace().then(active => {
      if (!active) return
      setRaceName(active.race.name)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const rd = new Date(active.race.date); rd.setHours(0, 0, 0, 0)
      const d = Math.round((rd.getTime() - today.getTime()) / 86400000)
      setDaysOut(d > 0 ? d : d === 0 ? 'Today!' : 'Done')
    })
  }, [])

  // Which desktop groups are expanded. The current route's group always
  // gets added (on load, on deep link, on navigation) without collapsing
  // any group the user opened by hand.
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const g = groupForPath(pathname)
    return g ? new Set([g.key]) : new Set()
  })
  useEffect(() => {
    const g = groupForPath(pathname)
    if (g) setOpenGroups(prev => (prev.has(g.key) ? prev : new Set(prev).add(g.key)))
  }, [pathname])
  const toggleGroup = useCallback((key: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Full mobile menu (all 15 routes, opened from the top bar's Menu button).
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const menuRef = useOverlay<HTMLDivElement>(menuOpen, closeMenu)
  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [menuOpen])

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
          {DESKTOP_NAV.map(entry => {
            if (entry.type === 'link') {
              const active = linkActive(pathname, entry.href)
              return (
                <Link key={entry.href} href={entry.href} className={`sidebar-link${active ? ' active' : ''}`}>
                  <span style={{ color: active ? 'var(--accent)' : 'inherit', display: 'flex', alignItems: 'center' }}>
                    {ICONS[entry.href] ?? null}
                  </span>
                  {entry.label}
                </Link>
              )
            }
            const active = groupActive(pathname, entry)
            const open = openGroups.has(entry.key)
            return (
              <div key={entry.key} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-group-toggle${active ? ' active' : ''}`}
                  aria-expanded={open}
                  aria-controls={`sidebar-group-${entry.key}`}
                  onClick={() => toggleGroup(entry.key)}
                >
                  <span style={{ color: active ? 'var(--accent)' : 'inherit', display: 'flex', alignItems: 'center' }}>
                    {GROUP_ICONS[entry.key] ?? null}
                  </span>
                  {entry.label}
                  <Chevron open={open} />
                </button>
                <div id={`sidebar-group-${entry.key}`} className="sidebar-group-children" hidden={!open}>
                  {entry.children.map(child => {
                    const childActive = linkActive(pathname, child.href)
                    return (
                      <Link key={child.href} href={child.href} className={`sidebar-link sidebar-link-child${childActive ? ' active' : ''}`}>
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="sidebar-utility">
          {UTILITY_NAV.map(link => {
            const active = linkActive(pathname, link.href)
            return (
              <Link key={link.href} href={link.href} className={`sidebar-link${active ? ' active' : ''}`}>
                <span style={{ color: active ? 'var(--accent)' : 'inherit', display: 'flex', alignItems: 'center' }}>
                  {ICONS[link.href] ?? null}
                </span>
                {link.label}
              </Link>
            )
          })}
        </div>

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
        <Link href="/" className="sidebar-brand-link" style={{ fontSize: 14 }}>
          Training Hub <span className="sidebar-brand-year">2026</span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="mobile-menu-btn"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
          {raceName && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span className="sidebar-race-num" style={{ fontSize: 20 }}>{daysOut}</span>
              {typeof daysOut === 'number' && (
                <span className="sidebar-race-unit">d</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-bottom-nav">
        {MOBILE_TABS.map(({ href, label, paths }) => {
          const active = tabActive(pathname, paths)
          return (
            <Link
              key={href}
              href={href}
              className={`mobile-tab${active ? ' active' : ''}`}
            >
              <span style={{ display: 'flex' }}>{ICONS[href] ?? null}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── Full mobile menu (all 15 routes) ── */}
      {menuOpen && (
        <div className="mobile-fullmenu-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) closeMenu() }}>
          <div
            className="mobile-fullmenu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            ref={menuRef}
          >
            <div className="mobile-fullmenu-header">
              <span className="mobile-fullmenu-title">Menu</span>
              <button type="button" className="mobile-fullmenu-close" aria-label="Close menu" onClick={closeMenu}>✕</button>
            </div>
            <nav className="mobile-fullmenu-nav">
              {DESKTOP_NAV.map(entry => {
                if (entry.type === 'link') {
                  const active = linkActive(pathname, entry.href)
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={`mobile-fullmenu-link${active ? ' active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span style={{ display: 'flex' }}>{ICONS[entry.href] ?? null}</span>
                      {entry.label}
                      {active && <span className="mobile-fullmenu-check">✓</span>}
                    </Link>
                  )
                }
                return (
                  <div key={entry.key} className="mobile-fullmenu-group">
                    <div className="mobile-fullmenu-group-label">{entry.label}</div>
                    {entry.children.map(child => {
                      const active = linkActive(pathname, child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`mobile-fullmenu-link child${active ? ' active' : ''}`}
                          aria-current={active ? 'page' : undefined}
                        >
                          {child.label}
                          {active && <span className="mobile-fullmenu-check">✓</span>}
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
              <div className="mobile-fullmenu-group">
                <div className="mobile-fullmenu-group-label">More</div>
                {UTILITY_NAV.map(link => {
                  const active = linkActive(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`mobile-fullmenu-link child${active ? ' active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {link.label}
                      {active && <span className="mobile-fullmenu-check">✓</span>}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
