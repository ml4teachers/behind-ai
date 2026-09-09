'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ExternalLink,
  FileText,
  BookOpen,
  PlayCircle,
  MousePointerClick,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n/config'
import { useActiveLocale, useTranslations } from '@/lib/i18n/use-translations'
import { GlossaryText } from '@/components/glossary/glossary-text'
import {
  glossaryTerms,
  CATEGORY_ORDER,
  type GlossaryTerm,
  type GlossaryLink,
} from '@/lib/glossary/terms'
import { normalize } from '@/lib/glossary/search'

function wikipediaHref(term: GlossaryTerm, locale: 'de' | 'en'): { href: string; lang: string } | null {
  const wiki = term.wikipedia
  if (!wiki) return null
  const lang = wiki[locale] ? locale : wiki.de ? 'de' : wiki.en ? 'en' : null
  if (!lang) return null
  const title = wiki[lang as 'de' | 'en']!
  return { href: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`, lang }
}

function LinkIcon({ kind }: { kind: GlossaryLink['kind'] }) {
  const cls = 'h-3.5 w-3.5 shrink-0'
  if (kind === 'video') return <PlayCircle className={cls} />
  if (kind === 'interactive') return <MousePointerClick className={cls} />
  if (kind === 'wikipedia') return <BookOpen className={cls} />
  return <FileText className={cls} />
}

function ExternalChip({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
    >
      {icon}
      <span>{label}</span>
      <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
    </a>
  )
}

function TermEntry({ term, locale, t }: { term: GlossaryTerm; locale: 'de' | 'en'; t: (k: string) => string }) {
  const wiki = wikipediaHref(term, locale)
  const hasExternal = wiki || (term.links && term.links.length > 0)
  return (
    <div id={term.id} className="scroll-mt-48 border-t py-5 first:border-t-0 sm:scroll-mt-40">
      <h3 className="text-lg font-semibold tracking-tight">{term.term[locale]}</h3>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">
        <GlossaryText excludeId={term.id}>{term.long[locale]}</GlossaryText>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {term.page && (
          <Link
            href={term.page}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('glossary.explainOn')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        {hasExternal && (
          <span className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
            {wiki && <ExternalChip href={wiki.href} label={t('glossary.wikipedia')} icon={<BookOpen className="h-3.5 w-3.5 shrink-0" />} />}
            {term.links?.map((l) => (
              <ExternalChip key={l.href} href={l.href} label={l.label} icon={<LinkIcon kind={l.kind} />} />
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

export default function GlossaryPage() {
  const t = useTranslations()
  const locale = useActiveLocale()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return glossaryTerms
    const tokens = q.split(/\s+/).filter(Boolean)
    const other: Locale = locale === 'de' ? 'en' : 'de'
    return glossaryTerms.filter((term) => {
      // Der fremdsprachige Begriff zählt mit: Wer „gradient descent" tippt,
      // soll „Gradientenabstieg" finden (und umgekehrt).
      const hay = normalize(
        [
          term.term[locale],
          ...term.aliases[locale],
          term.short[locale],
          term.long[locale],
          term.term[other],
          ...term.aliases[other],
        ].join(' '),
      )
      return tokens.every((tok) => hay.includes(tok))
    })
  }, [query, locale])

  const groups = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        cat,
        terms: filtered.filter((term) => term.category === cat),
      })).filter((g) => g.terms.length > 0),
    [filtered],
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('glossary.title')}</h1>
        <p className="text-lg text-muted-foreground">
          <GlossaryText>{t('glossary.subtitle')}</GlossaryText>
        </p>
      </header>

      {/* Filter + Kategorie-Sprungleiste */}
      <div className="sticky top-14 z-20 -mx-4 space-y-3 border-b bg-background/90 px-4 pb-3 pt-1 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('glossary.filterPlaceholder')}
            aria-label={t('glossary.filterPlaceholder')}
            className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        {query.trim() === '' && (
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_ORDER.map((cat) => (
              <a
                key={cat}
                href={`#cat-${cat}`}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {t(`glossary.category.${cat}`)}
              </a>
            ))}
          </div>
        )}
      </div>

      {groups.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">{t('glossary.empty')}</p>
      )}

      {groups.map(({ cat, terms }) => (
        <section key={cat} id={`cat-${cat}`} className="scroll-mt-48 space-y-1 sm:scroll-mt-40">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
            {t(`glossary.category.${cat}`)}
          </h2>
          <div className="rounded-xl border bg-card px-4 sm:px-6">
            {terms.map((term) => (
              <TermEntry key={term.id} term={term} locale={locale} t={t} />
            ))}
          </div>
        </section>
      ))}

      <nav className="border-t pt-6">
        <Link href="/">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('glossary.backBtn')}
          </Button>
        </Link>
      </nav>
    </div>
  )
}
