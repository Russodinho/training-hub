'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { MOBILE_TABS, LABEL_BY_HREF, linkActive, tabActive } from './navConfig'

// A closed-by-default menu exposing the current mobile tab's sibling routes
// (Plan/Train/Recover each cover several pages but only get one bottom tab).
// Unlike the earlier always-visible bar, this reserves no layout space at
// all until the viewer opens it.
export default function MobileSubnav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentTab = MOBILE_TABS.find(t => tabActive(pathname, t.paths))
  const hasSiblings = !!currentTab && currentTab.paths.length > 1

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  if (!hasSiblings) return null

  return (
    <div className="mobile-subnav-wrap" ref={ref}>
      <button
        type="button"
        className="mobile-subnav-toggle"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(o => !o)}
      >
        {currentTab!.label} pages
        <span className="mobile-subnav-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <nav className="mobile-subnav-menu">
          {currentTab!.paths.map(p => (
            <Link
              key={p}
              href={p}
              className={`mobile-subnav-link${linkActive(pathname, p) ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {LABEL_BY_HREF[p] ?? p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
