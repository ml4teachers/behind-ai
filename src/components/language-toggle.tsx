'use client'

import { Button } from '@/components/ui/button'
import { useUIStore } from '@/lib/store'
import { useMounted } from '@/lib/use-mounted'
import { useTranslations } from '@/lib/i18n/use-translations'
import { defaultLocale } from '@/lib/i18n/config'

export function LanguageToggle() {
  const locale = useUIStore((state) => state.locale)
  const setLocale = useUIStore((state) => state.setLocale)
  const mounted = useMounted()
  const t = useTranslations()
  const active = mounted ? locale : defaultLocale

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-9 font-semibold uppercase"
      aria-label={t('a11y.toggleLanguage')}
      onClick={() => setLocale(active === 'de' ? 'en' : 'de')}
    >
      {active}
    </Button>
  )
}
