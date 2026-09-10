import { GarminActivity } from '@/lib/supabase'

interface ActivityFeedProps {
  activities: GarminActivity[]
}

const TYPE_ICON: Record<string, string> = {
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  soccer: '⚽',
  hiking: '🥾',
  walking: '🚶',
  strength: '🏋️',
  paddleboard: '🏄',
  surfing: '🏄',
  yoga: '🧘',
  other: '⚡',
}

function fmtDist(km: number | null): string {
  if (!km) return '—'
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`
}

function fmtDur(min: number | null): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">🏃</div>
        <div className="empty-title">No recent activities</div>
        <div>Run <code style={{ background: 'var(--s3)', padding: '2px 6px', borderRadius: 4 }}>garmin_sync.py --all</code> to sync from Garmin Connect.</div>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      {activities.slice(0, 5).map(act => {
        const date = act.date
          ? new Date(act.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—'
        const dist = fmtDist(act.distance_km)
        const time = fmtDur(act.duration_min)

        return (
          <div key={act.id} className="activity-item">
            <div className="activity-type-icon">{TYPE_ICON[act.activity_type] ?? '⚡'}</div>
            <div>
              <div className="activity-name">{act.name || act.activity_type}</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
                {date}
              </div>
            </div>
            <div className="activity-stats">
              <div>{dist}</div>
              <div>{time}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
