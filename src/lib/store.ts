'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultLocale, type Locale } from './i18n/config'
import { defaultAccent, type AccentName } from './accents'

interface UIState {
  /** Aktive Sprache. Ändert die URL NICHT (alle Links bleiben gleich). */
  locale: Locale
  setLocale: (locale: Locale) => void

  /** Akzentfarbe (--primary). Im Header umschaltbar, in localStorage gemerkt. */
  accent: AccentName
  setAccent: (accent: AccentName) => void

  /** Desktop-Sidebar sichtbar? Wird in localStorage gemerkt. */
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => set({ locale }),

      accent: defaultAccent,
      setAccent: (accent) => set({ accent }),

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: 'behind-ai-ui' },
  ),
)
