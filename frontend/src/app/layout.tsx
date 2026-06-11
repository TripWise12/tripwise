import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import ProgressBar from '@/components/ProgressBar'
import LuxuryLoader from '@/components/motion/LuxuryLoader'
import ScrollProgress from '@/components/motion/ScrollProgress'
import AuroraBackground from '@/components/motion/AuroraBackground'

export const metadata: Metadata = {
  title: 'TripWise — Intelligent Travel Planning',
  description: 'From "I want to travel" to fully planned trip in under 2 minutes.',
  openGraph: {
    title: 'TripWise — Intelligent Travel Planning',
    description: 'Plan your entire trip in 2 minutes with AI.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060912',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        {/* Luxury branded loading screen — fades out after 2.2s */}
        <LuxuryLoader />
        {/* Gold scroll-progress bar pinned to top of viewport */}
        <ScrollProgress />
        {/* Slow ambient aurora orbs — fixed behind all content */}
        <AuroraBackground />
        <ThemeProvider>
          <AuthProvider>
            <ProgressBar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
