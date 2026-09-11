'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MOBILE_TABS, LABEL_BY_HREF, linkActive, tabActive } from './navConfig'
import { useOverlay } from './useOverlay'

// A closed-by-default menu exposing the current mobile tab's sibling routes
// (Plan/Train/Recover each cover several pages but only get one bottom tab).
// Unlike an always-visible bar, this reserves no layout space at all until
// the viewer opens it.
export default function MobileSubnav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  const menuRef = useOverlay<HTMLDivElement>(open, close)

  const currentTab = MOBILE_TABS.find(t => tabActive(pathname, t.paths))
  const hasSiblings = !!currentTab && currentTab.paths.length > 1
  const currentLabel = LABEL_BY_HREF[pathname] ?? currentTab?.label ?? ''

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open, close])

  if (!hasSiblings) return null

  return (
    <div className="mobile-subnav-wrap" ref={wrapRef}>
      <button
        type="button"
        className="mobile-subnav-toggle"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="mobile-subnav-menu"
        onClick={() => setOpen(o => !o)}
      >
        {currentTab!.label} / {currentLabel}
        <span className="mobile-subnav-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div id="mobile-subnav-menu" className="mobile-subnav-menu" ref={menuRef}>
          <div className="mobile-subnav-menu-header">
            <span>{currentTab!.label} pages</span>
            <button type="button" className="mobile-subnav-close" aria-label="Close menu" onClick={close}>✕</button>
          </div>
          <nav>
            {currentTab!.paths.map(p => {
              const active = linkActive(pathname, p)
              return (
                <Link
                  key={p}
                  href={p}
                  className={`mobile-subnav-link${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={close}
                >
                  {LABEL_BY_HREF[p] ?? p}
                  {active && <span className="mobile-subnav-check">✓</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
