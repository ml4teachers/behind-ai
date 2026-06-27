'use client'

import { useEffect, useId, useLayoutEffect, useMemo } from 'react'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useActiveLocale } from '@/lib/i18n/use-translations'
import { getMatcher, getTerm } from '@/lib/glossary/terms'
import { useGlossaryScope } from './glossary-scope'

// useLayoutEffect warnt im SSR – auf dem Server auf useEffect ausweichen.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Segment = { type: 'text'; text: string } | { type: 'term'; id: string; text: string }

/**
 * Verlinkt erkannte Glossar-Begriffe im übergebenen Text dezent (gepunktet)
 * auf /glossary#<id>, mit Tooltip-Kurzdefinition. Akzeptiert NUR String-Kinder
 * (sonst werden die Kinder unverändert ausgegeben – nie in bestehende JSX
 * hinein-tokenisieren). Pro Block wird je Begriff nur das erste Vorkommen
 * verlinkt; die seiten-weite 1×-Regel übernimmt der GlossaryScope.
 */
export function GlossaryText({
  children,
  excludeId,
}: {
  children: React.ReactNode
  /** Begriff, der nicht verlinkt werden soll (z.B. der Eintrag selbst). */
  excludeId?: string
}) {
  const locale = useActiveLocale()
  const scope = useGlossaryScope()
  const blockId = useId()

  const text = typeof children === 'string' ? children : null

  const segments = useMemo<Segment[]>(() => {
    if (text === null) return []
    const matcher = getMatcher(locale)
    if (!matcher) return [{ type: 'text', text }]

    const result: Segment[] = []
    const seen = new Set<string>()
    let last = 0
    for (const match of text.matchAll(matcher.regex)) {
      const surface = match[0]
      const start = match.index ?? 0
      const id = matcher.lookup.get(surface.toLowerCase())
      // Nur erstes Vorkommen je Begriff im Block; ausgeschlossene überspringen.
      if (!id || id === excludeId || seen.has(id)) continue
      seen.add(id)
      if (start > last) result.push({ type: 'text', text: text.slice(last, start) })
      result.push({ type: 'term', id, text: surface })
      last = start + surface.length
    }
    if (last < text.length) result.push({ type: 'text', text: text.slice(last) })
    return result.length ? result : [{ type: 'text', text }]
  }, [text, locale, excludeId])

  const termIds = useMemo(
    () => segments.filter((s): s is Extract<Segment, { type: 'term' }> => s.type === 'term').map((s) => s.id),
    [segments],
  )

  const { claim, release } = scope
  useIsomorphicLayoutEffect(() => {
    if (termIds.length === 0) return
    claim(blockId, termIds)
    return () => release(blockId)
  }, [claim, release, blockId, termIds])

  if (text === null) return <>{children}</>

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') return seg.text
        if (!scope.owns(blockId, seg.id)) return seg.text
        const term = getTerm(seg.id)
        if (!term) return seg.text
        return (
          <GlossaryTermLink key={i} id={seg.id} short={term.short[locale]}>
            {seg.text}
          </GlossaryTermLink>
        )
      })}
    </>
  )
}

function GlossaryTermLink({
  id,
  short,
  children,
}: {
  id: string
  short: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/glossary#${id}`}
          className="underline decoration-dotted decoration-primary/40 underline-offset-2 transition-colors hover:text-foreground hover:decoration-primary"
        >
          {children}
        </Link>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-pretty leading-snug">{short}</TooltipContent>
    </Tooltip>
  )
}
