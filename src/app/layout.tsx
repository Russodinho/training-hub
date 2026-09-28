import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import MobileSubnav from '@/components/MobileSubnav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: "Matt's Training Hub",
  description: 'Personal triathlon training dashboard — 2026 season',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <Sidebar />
          <div className="app-content">
            <MobileSubnav />
            <main>{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
