export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '16px 28px',
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      color: 'var(--faint)',
      textAlign: 'center',
    }}>
      Built with Next.js · Data from Strava, Google Sheets, Cronometer
    </footer>
  )
}
