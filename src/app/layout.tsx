import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AppShell } from '@/components/layout/app-shell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Behind AI – Wie funktionieren KI-Sprachmodelle?',
  description:
    'Interaktiv lernen, wie KI-Sprachmodelle funktionieren – mit echten Modell-Experimenten statt langer Texte.',
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
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
