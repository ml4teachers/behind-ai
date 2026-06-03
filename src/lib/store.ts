'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultLocale, type Locale } from './i18n/config'

interface UIState {
  /** Aktive Sprache. Ändert die URL NICHT (alle Links bleiben gleich). */
  locale: Locale
  setLocale: (locale: Locale) => void

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

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: 'behind-ai-ui' },
  ),
)
