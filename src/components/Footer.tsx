export default function Footer() {
  return (
    <footer style={{
      borderTop: '0.5px solid var(--border)',
      padding: '16px 24px',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10,
      color: 'var(--dim)',
      textAlign: 'center',
      letterSpacing: '0.04em',
    }}>
      Built with Next.js · Data from Garmin, Google Sheets, Cronometer
    </footer>
  )
}
