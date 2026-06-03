'use client'

import { useUIStore } from '@/lib/store'
import { useMounted } from '@/lib/use-mounted'
import { accentByName, defaultAccent } from '@/lib/accents'

/**
 * Injiziert die aktive Akzentfarbe als CSS-Variablen — getrennt für Light
 * (`:root`) und Dark (`.dark`), damit beide Modi den passenden Ton bekommen.
 * Vor dem Mount wird der Default (sky) gerendert, identisch zu globals.css:
 * so gibt es weder Hydration-Mismatch noch Farb-Flackern.
 */
export function AccentProvider() {
  const accent = useUIStore((state) => state.accent)
  const mounted = useMounted()
  const a = accentByName[mounted ? accent : defaultAccent] ?? accentByName[defaultAccent]

  const css =
    `:root{--primary:${a.light.primary};--primary-foreground:${a.light.foreground};--ring:${a.light.primary};}` +
    `.dark{--primary:${a.dark.primary};--primary-foreground:${a.dark.foreground};--ring:${a.dark.primary};}`

  return <style id="accent-vars" dangerouslySetInnerHTML={{ __html: css }} />
}
