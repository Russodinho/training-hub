interface StatCardProps {
  value: string | number
  label: string
  sub?: string
  accent?: string
}

export default function StatCard({ value, label, sub, accent }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-lbl">{label}</div>
      <div className="stat-card-val" style={accent ? { color: accent } : {}}>
        {value}
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}
