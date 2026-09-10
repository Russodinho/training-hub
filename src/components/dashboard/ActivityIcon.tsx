// Inline SVGs (24 viewBox, 1.7 stroke, currentColor) matching the schedule
// block's activity type — reused by the dashboard's workout tile and
// Today's Timeline rows so icon color follows the block's own token
// (bl-gym/bl-swim/etc.) via CSS rather than being baked into the SVG.

const PATHS: Record<string, string> = {
  strength: 'M3 8v8 M6 5v14 M18 5v14 M21 8v8 M6 12h12',
  swim: 'M2 18q2-3 5 0t5 0t5 0t5 0 M3 13l6-3 6 3 M9 10l4-5 5 2 M18 10a2 2 0 1 0 .01 0',
  bike: 'M3 14a4 4 0 1 0 .01 0 M16 14a4 4 0 1 0 .01 0 M7 18l5-10 5 10H7l-3-8 M3 10h5 M11 8h5 M16 5l4 13',
  run: 'M13 7l-3 5 5 3 2 6 M10 12l-4 5H2 M11 9l-4 1-3-2 M13 8l4 3 4-1 M15 3a1.5 1.5 0 1 0 .01 0',
  mobility: 'M13 3a1.5 1.5 0 1 0 .01 0 M12 8l-3 6 5 3 4 4 M10 12l-6 2-2 5 M11 9l6 2 4-3',
  moon: 'M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10z',
  heart: 'M12 20 3 11C-2 3 9 0 12 7c3-7 14-4 9 4z',
}

const CLS_TO_ICON: Record<string, keyof typeof PATHS> = {
  'bl-gym': 'strength',
  'bl-swim': 'swim',
  'bl-bike': 'bike',
  'bl-run': 'run',
  'bl-brick': 'bike',
  'bl-mob': 'mobility',
  'bl-wind': 'moon',
  'bl-soccer': 'heart',
}

export function iconForBlockClass(cls: string): keyof typeof PATHS {
  return CLS_TO_ICON[cls] ?? 'heart'
}

export default function ActivityIcon({ kind, size = 20 }: { kind: keyof typeof PATHS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[kind]} />
    </svg>
  )
}
