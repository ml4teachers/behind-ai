'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Navigation } from '@/components/nav/navigation'
import { SiteHeader } from '@/components/layout/site-header'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/lib/store'
import { useMounted } from '@/lib/use-mounted'

export function AppShell({ children }: { children: React.ReactNode }) {
  const mounted = useMounted()
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Vor dem Mount immer offen rendern (= Server-Default), danach gespeicherter Wert.
  const open = mounted ? sidebarOpen : true

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        onToggleSidebar={toggleSidebar}
        onOpenMobileNav={() => setMobileOpen(true)}
      />

      <div className="flex flex-1">
        {/* Desktop: ausblendbare Sidebar */}
        <aside
          className={cn(
            'hidden shrink-0 overflow-hidden border-r border-border transition-[width] duration-200 ease-out md:block',
            open ? 'w-64' : 'w-0',
          )}
        >
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] w-64 overflow-y-auto p-3">
            <Navigation />
          </div>
        </aside>

        {/* Mobile: Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="max-h-screen overflow-y-auto p-3 pt-6">
              <Navigation onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 bg-background">{children}</main>
      </div>
    </div>
  )
}
