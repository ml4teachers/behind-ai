'use client'

import { useUIStore } from '../store'
import { useMounted } from '../use-mounted'
import { defaultLocale } from './config'
import { messages } from './messages'

/**
 * Liefert eine `t(key)`-Funktion in der aktiven Sprache. Vor dem Mount wird
 * immer die Default-Sprache verwendet (verhindert Hydration-Mismatch), danach
 * die im Store gespeicherte. Unbekannte Keys fallen auf Deutsch zurück.
 */
export function useTranslations() {
  const locale = useUIStore((state) => state.locale)
  const mounted = useMounted()
  const active = mounted ? locale : defaultLocale

  return (key: string): string =>
    messages[active]?.[key] ?? messages[defaultLocale][key] ?? key
}
