import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AccentProvider } from '@/components/accent-provider'
import { AppShell } from '@/components/layout/app-shell'

const inter = Inter({ subsets: ['latin'] })

const SITE_TITLE = 'Behind AI – Wie funktionieren KI-Sprachmodelle?'
const SITE_DESC =
  'Interaktiv lernen, wie KI-Sprachmodelle funktionieren – mit Experimenten zum Ausprobieren und Selbermachen.'

export const metadata: Metadata = {
  metadataBase: new URL('https://behind-ai.ch'),
  title: SITE_TITLE,
  description: SITE_DESC,
  applicationName: 'Behind AI',
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: '/',
    siteName: 'Behind AI',
    locale: 'de_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccentProvider />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
