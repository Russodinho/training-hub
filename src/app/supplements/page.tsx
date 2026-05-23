interface Supplement {
  name: string
  dose: string
  note?: string
}

interface TimingBlock {
  timing: string
  items: Supplement[]
}

const SUPPLEMENT_STACK: TimingBlock[] = [
  {
    timing: 'First thing / Pre-workout (4:50am)',
    items: [
      { name: 'Collagen', dose: '20g', note: 'Mix in warm water or coffee · take before any movement for max absorption with Vitamin C' },
      { name: 'Vitamin C', dose: '500mg', note: 'Taken alongside collagen — critical for collagen synthesis · doubles as antioxidant' },
      { name: 'Pre-workout', dose: '1 scoop', note: 'Caffeinated · ~150–200mg caffeine · skip if swimming (harder to gauge exertion in water)' },
      { name: 'Creatine Monohydrate', dose: '5g', note: 'Mix into pre-workout or water · timing not critical — daily consistency matters most' },
      { name: 'Electrolytes', dose: '1 serving', note: 'Salt / potassium / magnesium blend · especially important on gym + soccer days' },
    ],
  },
  {
    timing: 'Breakfast (post-workout)',
    items: [
      { name: 'Multivitamin', dose: '1 cap', note: 'With food — fat-soluble vitamins absorb better with a meal' },
      { name: 'Vitamin D3', dose: '2000–4000 IU', note: 'With fat — take with breakfast that has some fat. Consider 5000 IU in winter months.' },
      { name: 'Vitamin K2 (MK-7)', dose: '100mcg', note: 'Taken with D3 — works synergistically. Directs calcium to bones, not arteries.' },
      { name: 'Fish Oil (EPA+DHA)', dose: '750–1000mg EPA+DHA', note: 'With food to avoid fishy burps. Anti-inflammatory — critical for joint + tendon recovery.' },
    ],
  },
  {
    timing: 'Dinner',
    items: [
      { name: 'Zinc Picolinate', dose: '22mg', note: 'With food (reduces nausea). Take at dinner, away from calcium — calcium blocks absorption. Supports testosterone + immune function.' },
    ],
  },
  {
    timing: 'Before bed',
    items: [
      { name: 'Magnesium Glycinate', dose: '200–400mg', note: 'Glycinate form = better absorption + less laxative effect vs oxide. Promotes sleep quality + muscle recovery + reduces cramping.' },
    ],
  },
  {
    timing: 'Race day / long sessions only',
    items: [
      { name: 'Electrolyte drink', dose: '1 bottle', note: 'Sodium + potassium focus. Before + during any session > 60 min.' },
      { name: 'Carb gel', dose: '1 gel / 45 min', note: 'Only for races > 1.5 hrs (Stone Harbor, Steelman). Practice in training first.' },
    ],
  },
]

export default function SupplementsPage() {
  return (
    <div className="hub-page">
      <div className="page-header">
        <div>
          <h2>Supplements</h2>
          <div className="sub">Daily stack · timing · rationale</div>
        </div>
        <div className="page-header-right">
          6 daily supplements<br />
          + race-day additions
        </div>
      </div>

      {SUPPLEMENT_STACK.map(block => (
        <div key={block.timing} className="supp-timing">
          <div className="supp-timing-label">{block.timing}</div>
          <div className="surface-card">
            {block.items.map((item, i) => (
              <div key={i} className="supp-item">
                <div>
                  <div className="supp-name">{item.name}</div>
                  <div className="supp-dose">{item.dose}</div>
                </div>
                {item.note && <div className="supp-note">{item.note}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Key principles */}
      <div style={{ marginTop: 8 }}>
        <div className="section-hdr"><span className="ptitle">Key principles</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {[
            { title: '🦴 Collagen + Vitamin C', body: `Collagen only works with Vitamin C present — it's required for collagen synthesis. Always pair them. Take 30–45 min before training for tendons, joints, and connective tissue.` },
            { title: '☀️ D3 + K2 synergy', body: 'D3 increases calcium absorption. K2 directs that calcium into bones (not arteries). They\'re always taken together. Winter: consider 5000 IU D3.' },
            { title: '💊 Zinc timing matters', body: 'Zinc competes with calcium for absorption. Take at dinner, away from dairy-heavy meals. Deficiency is common in athletes — impacts testosterone, immunity, wound healing.' },
            { title: '😴 Magnesium for recovery', body: 'Magnesium glycinate is the gentlest form (unlike oxide which is largely a laxative). Improves sleep quality, reduces muscle cramps, supports >300 enzymatic processes.' },
            { title: '🐟 Fish oil dosing', body: 'Target 750–1000mg of EPA+DHA combined — not total fish oil. Most 1g capsules contain only 300mg EPA+DHA. Check the label. Anti-inflammatory for chronic tendon issues (Achilles).' },
            { title: '⚡ Creatine basics', body: '5g daily. No loading phase needed. Timing doesn\'t matter — consistency does. Takes ~4 weeks to fully saturate. Do not cycle off. Benefits compound over time.' },
          ].map((note, i) => (
            <div key={i} className="note">
              <div style={{ fontWeight: 500, marginBottom: 6 }}>{note.title}</div>
              {note.body}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
