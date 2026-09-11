'use client'

type MapInjury = { key: string; name: string; pain: string; location: string }
// Anatomical left is screen-right in the front view. Coordinates use the asset's native canvas.
const regions: Record<string, { x: number; y: number; rx: number; ry: number }> = {
  knee: { x: 380, y: 1005, rx: 35, ry: 55 },
  ankle: { x: 650, y: 1360, rx: 29, ry: 35 },
  achilles: { x: 625, y: 1320, rx: 20, ry: 65 },
}

export default function InjuryBodyMap({ injuries }: { injuries: MapInjury[] }) {
  return (
    <section className="inj-map surface-card" aria-labelledby="inj-map-title">
      <div className="inj-map-art">
        <svg viewBox="0 0 1024 1536" role="img" aria-label="Front body overview with numbered approximate injury areas. Corresponding injury names and pain scores are listed below.">
          <image href="/training-hub-design/body-silhouette.png" width="1024" height="1536" />
          <text x="150" y="230" fill="#afbec8" fontSize="42">R</text>
          <text x="845" y="230" fill="#afbec8" fontSize="42">L</text>
          {injuries.map((inj, i) => {
            const r = regions[inj.key]
            if (!r) return null
            const n = inj.pain.trim() === '' ? NaN : Number(inj.pain)
            const valid = Number.isFinite(n) && n >= 0 && n <= 10
            const color = !valid ? '#afbec8' : n === 0 ? '#75e888' : n <= 3 ? '#ffd45f' : n <= 6 ? '#ffa45b' : '#ff7877'
            return <g key={inj.key}>
              <title>{inj.name}: {valid ? `${n}/10 reported pain` : 'pain not recorded'}</title>
              <ellipse cx={r.x} cy={r.y} rx={r.rx * 1.8} ry={r.ry * 1.4} fill={color} opacity=".14" />
              <ellipse cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} fill={color} fillOpacity=".38" stroke={color} strokeWidth="4" strokeDasharray={inj.key === 'achilles' ? '10 8' : undefined} />
              <path d={`M${r.x} ${r.y}H${inj.key === 'knee' ? 230 : inj.key === 'ankle' ? 840 : 780}`} stroke={color} strokeWidth="3" />
              <circle cx={inj.key === 'knee' ? 230 : inj.key === 'ankle' ? 840 : 780} cy={r.y} r="28" fill="#14232d" stroke={color} strokeWidth="3" />
              <text x={inj.key === 'knee' ? 230 : inj.key === 'ankle' ? 840 : 780} y={r.y + 10} textAnchor="middle" fill={color} fontSize="30">{i + 1}</text>
            </g>
          })}
        </svg>
      </div>
      <div className="inj-map-summary">
        <div className="inj-map-eyebrow">Recovery / Injuries</div>
        <h3 id="inj-map-title">Your body at a glance</h3>
        <p>Reported pain across {injuries.length} tracked {injuries.length === 1 ? 'injury' : 'injuries'}.</p>
        <ol className="inj-map-list">
          {injuries.map((inj, i) => <li key={inj.key}>
            <a href={`#injury-${inj.key}`}><span className="inj-map-number">{i + 1}</span><span><strong>{inj.name}</strong><small>{regions[inj.key] ? inj.key === 'achilles' ? 'Rear tendon · projected on front view' : inj.location : 'Location not mapped · see details'}</small></span><span className="inj-map-pain">{inj.pain || '—'}<small>/10</small></span></a>
          </li>)}
        </ol>
        <div className="inj-map-legend"><span>🟡 1–3</span><span>🟠 4–6</span><span>🔴 7–10</span><span>0 = no pain</span></div>
        <p className="inj-map-note">Color reflects your reported pain, not tissue damage. Highlights show approximate areas; overlapping ankle and tendon regions have separate labels.</p>
      </div>
    </section>
  )
}
