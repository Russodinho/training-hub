// Single route registry shared by Sidebar (desktop grouped nav + mobile
// bottom tabs + full mobile menu) and MobileSubnav (per-tab section
// selector) — see design/training-hub-reference-v1/review-3/NAVIGATION.md
// for the proposal this implements. One source of truth so the desktop
// hierarchy, the mobile tabs, and the full menu can't drift out of sync.

export type NavLink = { href: string; label: string }
export type NavEntry =
  | { type: 'link'; href: string; label: string }
  | { type: 'group'; key: string; label: string; children: NavLink[] }

export const DESKTOP_NAV: NavEntry[] = [
  { type: 'link', href: '/', label: 'Home' },
  { type: 'link', href: '/agent', label: 'Coaches' },
  {
    type: 'group', key: 'plan', label: 'Plan',
    children: [
      { href: '/race-calendar', label: 'Race Calendar' },
      { href: '/season-plan', label: 'Season Plan' },
      { href: '/race-day', label: 'Race Day' },
    ],
  },
  {
    type: 'group', key: 'train', label: 'Train',
    children: [
      { href: '/log', label: 'Log Workout' },
      { href: '/training-log', label: 'Training History' },
      { href: '/cardio', label: 'Cardio' },
    ],
  },
  {
    type: 'group', key: 'recover', label: 'Recover',
    children: [
      { href: '/recovery', label: 'Overview' },
      { href: '/injuries', label: 'Injuries' },
      { href: '/mobility', label: 'Mobility' },
      { href: '/wind-down', label: 'Wind-Down' },
      { href: '/sleep', label: 'Sleep' },
    ],
  },
  { type: 'link', href: '/fuel', label: 'Fuel' },
]

// Rendered separately in a quiet utility area (bottom of the desktop
// sidebar, its own section in the mobile full menu) rather than as a
// seventh top-level destination.
export const UTILITY_NAV: NavLink[] = [
  { href: '/settings/exercises', label: 'Exercise Library' },
]

// Five fixed bottom shortcuts on mobile. `paths` decides both the tab's
// active state and its section-selector siblings — deliberately looser
// than DESKTOP_NAV's grouping in one place: Train also claims
// /settings/exercises so the bottom bar highlights correctly there, even
// though Exercise Library lives in the utility area on desktop.
export const MOBILE_TABS: { href: string; label: string; paths: string[] }[] = [
  { href: '/', label: 'Home', paths: ['/'] },
  { href: '/race-calendar', label: 'Plan', paths: ['/race-calendar', '/season-plan', '/race-day'] },
  { href: '/log', label: 'Train', paths: ['/log', '/training-log', '/cardio', '/settings/exercises'] },
  { href: '/recovery', label: 'Recover', paths: ['/recovery', '/injuries', '/mobility', '/wind-down', '/sleep'] },
  { href: '/fuel', label: 'Fuel', paths: ['/fuel'] },
]

export function linkActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function tabActive(pathname: string, paths: string[]): boolean {
  return paths.some(p => (p === '/' ? pathname === '/' : pathname.startsWith(p)))
}

export function groupActive(pathname: string, group: Extract<NavEntry, { type: 'group' }>): boolean {
  return group.children.some(c => linkActive(pathname, c.href))
}

// Which top-level DESKTOP_NAV group (if any) a route belongs to — drives
// the mobile section selector's "Group / Page" label.
export function groupForPath(pathname: string): { key: string; label: string } | null {
  for (const entry of DESKTOP_NAV) {
    if (entry.type === 'group' && groupActive(pathname, entry)) return { key: entry.key, label: entry.label }
  }
  return null
}

const labelEntries: [string, string][] = []
for (const entry of DESKTOP_NAV) {
  if (entry.type === 'link') labelEntries.push([entry.href, entry.label])
  else for (const child of entry.children) labelEntries.push([child.href, child.label])
}
for (const link of UTILITY_NAV) labelEntries.push([link.href, link.label])

export const LABEL_BY_HREF: Record<string, string> = Object.fromEntries(labelEntries)
