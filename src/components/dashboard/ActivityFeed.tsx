import { StravaActivity } from '@/lib/supabase'
import { activityTypeIcon, formatDistance, formatTime } from '@/lib/strava'

interface ActivityFeedProps {
  activities: StravaActivity[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-icon">🏃</div>
        <div className="empty-title">No recent activities</div>
        <div>Connect Strava to see your activity feed.</div>
        <a href="/api/strava/auth" className="empty-cta">Connect Strava</a>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      {activities.slice(0, 5).map(act => {
        const date = act.start_date
          ? new Date(act.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—'
        const dist = act.distance ? formatDistance(act.distance, act.activity_type) : '—'
        const time = act.moving_time ? formatTime(act.moving_time) : '—'

        return (
          <div key={act.id} className="activity-item">
            <div className="activity-type-icon">{activityTypeIcon(act.activity_type)}</div>
            <div>
              <div className="activity-name">{act.name || act.activity_type}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--muted)' }}>
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
