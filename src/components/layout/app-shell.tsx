'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Navigation } from '@/components/nav/navigation'
import { SiteHeader } from '@/components/layout/site-header'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlossaryScopeProvider } from '@/components/glossary/glossary-scope'
import { useUIStore } from '@/lib/store'
import { useMounted } from '@/lib/use-mounted'

export function AppShell({ children }: { children: React.ReactNode }) {
  const mounted = useMounted()
  const pathname = usePathname()
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Vor dem Mount immer offen rendern (= Server-Default), danach gespeicherter Wert.
  const open = mounted ? sidebarOpen : true

  // Vollbild-Routen ohne Site-Chrome: Referatsfolien + Publikums-Live-Seite.
  // (TooltipProvider bleibt, damit eingebettete Visualisierungen funktionieren.)
  if (pathname === '/slides' || pathname === '/live') {
    return (
      <TooltipProvider delayDuration={300}>
        <GlossaryScopeProvider key={pathname}>{children}</GlossaryScopeProvider>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        onToggleSidebar={toggleSidebar}
        onOpenMobileNav={() => setMobileOpen(true)}
      />

      <div className="flex flex-1">
        {/* Desktop: ausblendbare Sidebar */}
        <aside
          className={cn(
            'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-hidden border-r border-border transition-[width] duration-200 ease-out md:block',
            open ? 'w-64' : 'w-0',
          )}
        >
          <div className="h-full w-64 overflow-y-auto p-3">
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

        <main className="min-w-0 flex-1 bg-background">
          {/* Glossar-Scope pro Seite zurücksetzen (Remount via key=pathname) */}
          <GlossaryScopeProvider key={pathname}>{children}</GlossaryScopeProvider>
        </main>
      </div>
    </div>
    </TooltipProvider>
  )
}
