'use client'

import { Palette } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useUIStore } from '@/lib/store'
import { useMounted } from '@/lib/use-mounted'
import { useTranslations } from '@/lib/i18n/use-translations'
import { accents, defaultAccent, type AccentName } from '@/lib/accents'

/**
 * Akzentfarben-Picker im Header. Setzt `accent` im UI-Store (persistiert);
 * AccentProvider übersetzt die Wahl in die CSS-Variablen. Vor dem Mount wird
 * der Default angezeigt (kein Hydration-Mismatch).
 */
export function AccentToggle() {
  const accent = useUIStore((state) => state.accent)
  const setAccent = useUIStore((state) => state.setAccent)
  const mounted = useMounted()
  const t = useTranslations()
  const value = mounted ? accent : defaultAccent

  return (
    <Select value={value} onValueChange={(v) => setAccent(v as AccentName)}>
      <SelectTrigger
        aria-label={t('a11y.toggleAccent')}
        className="h-9 w-9 justify-center rounded-md border-0 bg-transparent p-0 shadow-none hover:bg-accent hover:text-accent-foreground [&>svg:last-child]:hidden"
      >
        <Palette className="h-5 w-5 text-primary" />
      </SelectTrigger>
      <SelectContent align="end">
        {accents.map((a) => (
          <SelectItem key={a.name} value={a.name}>
            <span className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-border"
                style={{ backgroundColor: `hsl(${a.light.primary})` }}
              />
              {a.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
