'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MOBILE_TABS, LABEL_BY_HREF, linkActive, tabActive } from './navConfig'

// Rendered inside .app-content (normal document flow, sticky — not fixed),
// so it only takes up space on routes that actually have sibling
// destinations (Plan/Train/Recover). Home/Fuel render nothing here.
export default function MobileSubnav() {
  const pathname = usePathname()
  const currentTab = MOBILE_TABS.find(t => tabActive(pathname, t.paths))
  if (!currentTab || currentTab.paths.length < 2) return null

  return (
    <nav className="mobile-subnav">
      {currentTab.paths.map(p => (
        <Link key={p} href={p} className={`mobile-subnav-link${linkActive(pathname, p) ? ' active' : ''}`}>
          {LABEL_BY_HREF[p] ?? p}
        </Link>
      ))}
    </nav>
  )
}
