import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navigation } from '../components/nav/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Behind ChatGPT - Wie funktionieren LLMs?',
  description: 'Lerne auf einfache Weise, wie KI-Sprachmodelle funktionieren',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <div className="flex flex-1 relative">
            <Navigation />
            <main className="flex-1 p-6 md:p-8 lg:p-10 bg-gray-50 w-full">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}