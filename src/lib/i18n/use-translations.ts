'use client'

import { useUIStore } from '../store'
import { useMounted } from '../use-mounted'
import { defaultLocale, type Locale } from './config'
import { messages } from './messages'

/**
 * Aktive Sprache des UI. Vor dem Mount IMMER die Default-Sprache (verhindert
 * Hydration-Mismatch), danach die im Store gespeicherte. Wer Text *und* etwas
 * Sprachabhängiges (z.B. die Glossar-Begriffserkennung) gleichzeitig nutzt,
 * muss dieselbe Quelle verwenden, damit Text und Logik aus derselben Sprache
 * stammen.
 */
export function useActiveLocale(): Locale {
  const locale = useUIStore((state) => state.locale)
  const mounted = useMounted()
  return mounted ? locale : defaultLocale
}

/**
 * Liefert eine `t(key)`-Funktion in der aktiven Sprache. Unbekannte Keys fallen
 * auf Deutsch zurück.
 */
export function useTranslations() {
  const active = useActiveLocale()

  return (key: string): string =>
    messages[active]?.[key] ?? messages[defaultLocale][key] ?? key
}
