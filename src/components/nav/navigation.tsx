'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n/use-translations'
import { homeLink, navSections, resourcesLink, type NavLink } from './nav-items'

export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const t = useTranslations()

  const renderLink = (link: NavLink) => {
    const active = pathname === link.href
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'block rounded-md px-3 py-2 text-sm transition-colors',
          active
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {t(link.key)}
      </Link>
    )
  }

  return (
    <nav className="flex flex-col gap-1">
      {renderLink(homeLink)}

      {navSections.map((section) => (
        <div key={section.key} className="mt-5 first:mt-3">
          <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
            {t(section.key)}
          </div>
          <div className="flex flex-col gap-0.5">
            {section.links.map(renderLink)}
          </div>
        </div>
      ))}

      <div className="mt-5 border-t border-border pt-3">
        {renderLink(resourcesLink)}
      </div>
    </nav>
  )
}
