// Shared nav data between Sidebar (desktop list + mobile bottom tabs) and
// MobileSubnav (exposes each mobile tab's sibling routes).

export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/race-calendar', label: 'Race Calendar' },
  { href: '/season-plan', label: 'Season Plan' },
  { href: '/log', label: 'Workout Log' },
  { href: '/training-log', label: 'Training Log' },
  { href: '/cardio', label: 'Cardio' },
  { href: '/fuel', label: 'Fuel' },
  { href: '/mobility', label: 'Mobility' },
  { href: '/sleep', label: 'Sleep Protocol' },
  { href: '/recovery', label: 'Recovery' },
  { href: '/wind-down', label: 'Wind-Down' },
  { href: '/injuries', label: 'Injuries' },
  { href: '/race-day', label: 'Race Day' },
  { href: '/settings/exercises', label: 'Exercises' },
]

export const MOBILE_TABS = [
  { href: '/', label: 'Home', paths: ['/'] },
  { href: '/race-calendar', label: 'Plan', paths: ['/race-calendar', '/season-plan', '/race-day'] },
  { href: '/log', label: 'Train', paths: ['/log', '/training-log', '/cardio', '/settings/exercises'] },
  { href: '/mobility', label: 'Recover', paths: ['/mobility', '/wind-down', '/sleep', '/recovery', '/injuries'] },
  { href: '/fuel', label: 'Fuel', paths: ['/fuel'] },
]

export function linkActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function tabActive(pathname: string, paths: string[]): boolean {
  return paths.some(p => (p === '/' ? pathname === '/' : pathname.startsWith(p)))
}

export const LABEL_BY_HREF: Record<string, string> = Object.fromEntries(
  NAV_ITEMS.map(i => [i.href, i.label])
)
