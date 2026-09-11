'use client'

type MapInjury = { key: string; name: string; pain: string; location: string }
// Anatomical left is screen-right in front, screen-left in back.
// Each asset uses its own native 1024x1536 coordinates.
const regions: Record<string, { view: 'front' | 'back'; x: number; y: number; rx: number; ry: number; labelX: number }> = {
  knee: { view: 'front', x: 380, y: 1005, rx: 35, ry: 55, labelX: 210 },
  ankle: { view: 'front', x: 650, y: 1360, rx: 29, ry: 35, labelX: 840 },
  achilles: { view: 'back', x: 377, y: 1335, rx: 23, ry: 62, labelX: 200 },
}

export default function InjuryBodyMap({ injuries }: { injuries: MapInjury[] }) {
  return (
    <section className="inj-map surface-card" aria-labelledby="inj-map-title">
      <div className="inj-map-art">
        {(['front', 'back'] as const).map(view => <figure className="inj-map-view" key={view}>
        <figcaption>{view === 'front' ? 'Front' : 'Back'}</figcaption>
        <svg viewBox="0 0 1024 1536" role="img" aria-label={`${view === 'front' ? 'Front' : 'Back'} body overview with numbered approximate injury areas. Names and pain scores follow in the injury list.`}>
          <image href={`/training-hub-design/body-silhouette${view === 'back' ? '-back' : ''}.png`} width="1024" height="1536" />
          <text x="150" y="230" fill="#afbec8" fontSize="60">{view === 'front' ? 'R' : 'L'}</text>
          <text x="845" y="230" fill="#afbec8" fontSize="60">{view === 'front' ? 'L' : 'R'}</text>
          {injuries.map((inj, i) => {
            const r = regions[inj.key]
            if (!r || r.view !== view) return null
            const n = inj.pain.trim() === '' ? NaN : Number(inj.pain)
            const valid = Number.isFinite(n) && n >= 0 && n <= 10
            const color = !valid ? '#afbec8' : n === 0 ? '#75e888' : n <= 3 ? '#ffd45f' : n <= 6 ? '#ffa45b' : '#ff7877'
            return <g key={inj.key}>
              <title>{inj.name}: {valid ? `${n}/10 reported pain` : 'pain not recorded'}</title>
              <ellipse cx={r.x} cy={r.y} rx={r.rx * 1.8} ry={r.ry * 1.4} fill={color} opacity=".14" />
              <ellipse cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} fill={color} fillOpacity=".38" stroke={color} strokeWidth="4" />
              <path d={`M${r.x} ${r.y}H${r.labelX}`} stroke={color} strokeWidth="4" />
              <circle cx={r.labelX} cy={r.y} r="42" fill="#14232d" stroke={color} strokeWidth="4" />
              <text x={r.labelX} y={r.y + 16} textAnchor="middle" fill={color} fontSize="48">{i + 1}</text>
            </g>
          })}
        </svg>
        </figure>)}
      </div>
      <div className="inj-map-summary">
        <div className="inj-map-eyebrow">Recovery / Injuries</div>
        <h3 id="inj-map-title">Your body at a glance</h3>
        <p>Reported pain across {injuries.length} tracked {injuries.length === 1 ? 'injury' : 'injuries'}.</p>
        <ol className="inj-map-list">
          {injuries.map((inj, i) => <li key={inj.key}>
            <a href={`#injury-${inj.key}`}><span className="inj-map-number">{i + 1}</span><span><strong>{inj.name}</strong><small>{regions[inj.key] ? `${regions[inj.key].view === 'back' ? 'Back' : 'Front'} view · ${inj.location}` : 'Location not mapped · see details'}</small></span><span className="inj-map-pain">{inj.pain || '—'}<small>/10</small></span></a>
          </li>)}
        </ol>
        <div className="inj-map-legend"><span>🟡 1–3</span><span>🟠 4–6</span><span>🔴 7–10</span><span>0 = no pain</span></div>
        <p className="inj-map-note">Color reflects your reported pain, not tissue damage. Highlights show approximate areas. L and R refer to your left and right.</p>
      </div>
    </section>
  )
}
