'use client'

import Link from 'next/link'
import { Menu, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useTranslations } from '@/lib/i18n/use-translations'

interface SiteHeaderProps {
  onToggleSidebar: () => void
  onOpenMobileNav: () => void
}

export function SiteHeader({ onToggleSidebar, onOpenMobileNav }: SiteHeaderProps) {
  const t = useTranslations()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur md:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        aria-label={t('a11y.toggleSidebar')}
        onClick={onToggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={t('a11y.toggleSidebar')}
        onClick={onOpenMobileNav}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          {t('brand.name')}
        </span>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {t('brand.tagline')}
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-0.5">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
