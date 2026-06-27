'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useActiveLocale, useTranslations } from '@/lib/i18n/use-translations'
import { buildSearchIndex, searchItems, type SearchItem } from '@/lib/glossary/search'

const MAX_RESULTS = 8

function useSiteSearch(onNavigate?: () => void) {
  const router = useRouter()
  const t = useTranslations()
  const locale = useActiveLocale()
  // Index nur bei Sprachwechsel neu bauen (Titel kommen aus t()).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const index = useMemo(() => buildSearchIndex(t, locale), [locale])

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)

  // Treffer ranken, dann gruppiert anzeigen (Seiten zuerst, dann Begriffe).
  const results = useMemo(() => {
    const ranked = searchItems(index, query).slice(0, MAX_RESULTS)
    const pages = ranked.filter((r) => r.kind === 'page')
    const terms = ranked.filter((r) => r.kind === 'term')
    return [...pages, ...terms]
  }, [index, query])

  useEffect(() => setSelected(0), [query])

  const go = useCallback(
    (item?: SearchItem) => {
      if (!item) return
      router.push(item.href)
      setQuery('')
      onNavigate?.()
    },
    [router, onNavigate],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        go(results[selected])
      }
    },
    [results, selected, go],
  )

  return { t, query, setQuery, results, selected, setSelected, go, onKeyDown }
}

function ResultList({
  results,
  selected,
  setSelected,
  go,
  t,
  query,
  listId,
}: {
  results: SearchItem[]
  selected: number
  setSelected: (i: number) => void
  go: (item?: SearchItem) => void
  t: (key: string) => string
  query: string
  listId: string
}) {
  if (query.trim() === '') return null
  if (results.length === 0) {
    return <div className="px-3 py-6 text-center text-sm text-muted-foreground">{t('search.empty')}</div>
  }
  let lastKind: SearchItem['kind'] | null = null
  return (
    <ul role="listbox" id={listId} className="max-h-[60vh] overflow-y-auto py-1">
      {results.map((item, i) => {
        const showHeader = item.kind !== lastKind
        lastKind = item.kind
        const active = i === selected
        return (
          <li key={`${item.kind}-${item.id}`}>
            {showHeader && (
              <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                {item.kind === 'page' ? t('search.pages') : t('search.terms')}
              </div>
            )}
            <button
              type="button"
              role="option"
              aria-selected={active}
              id={`${listId}-opt-${i}`}
              // onMouseDown statt onClick: feuert vor dem Blur des Inputs.
              onMouseDown={(e) => {
                e.preventDefault()
                go(item)
              }}
              onMouseEnter={() => setSelected(i)}
              className={cn(
                'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm',
                active ? 'bg-muted text-foreground' : 'text-foreground/90 hover:bg-muted/60',
              )}
            >
              {item.kind === 'page' ? (
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1 truncate">{item.title}</span>
              {item.subtitle && (
                <span className="shrink-0 text-xs text-muted-foreground">{item.subtitle}</span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function SiteSearch() {
  // --- Desktop: Inline-Feld mit Dropdown ---
  const desktop = useSiteSearch()
  const [focused, setFocused] = useState(false)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showDropdown = focused && desktop.query.trim() !== ''

  // --- Mobile: Icon → Dialog-Overlay ---
  const [open, setOpen] = useState(false)
  const mobile = useSiteSearch(() => setOpen(false))

  return (
    <>
      {/* Desktop */}
      <div className="relative hidden md:block md:w-56 lg:w-72">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={desktop.query}
          onChange={(e) => desktop.setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              desktop.setQuery('')
              ;(e.target as HTMLInputElement).blur()
              return
            }
            desktop.onKeyDown(e)
          }}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current)
            setFocused(true)
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 120)
          }}
          placeholder={desktop.t('search.placeholder')}
          aria-label={desktop.t('a11y.search')}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="site-search-desktop-list"
          aria-activedescendant={
            showDropdown && desktop.results.length ? `site-search-desktop-list-opt-${desktop.selected}` : undefined
          }
          className="h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border bg-popover shadow-md">
            <ResultList
              results={desktop.results}
              selected={desktop.selected}
              setSelected={desktop.setSelected}
              go={desktop.go}
              t={desktop.t}
              query={desktop.query}
              listId="site-search-desktop-list"
            />
          </div>
        )}
      </div>

      {/* Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={mobile.t('a11y.openSearch')}
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="top-[12%] max-w-lg translate-y-0 gap-0 p-0">
          <DialogTitle className="sr-only">{mobile.t('search.hint')}</DialogTitle>
          <div className="relative border-b">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input
              autoFocus
              type="search"
              value={mobile.query}
              onChange={(e) => mobile.setQuery(e.target.value)}
              onKeyDown={mobile.onKeyDown}
              placeholder={mobile.t('search.placeholder')}
              aria-label={mobile.t('a11y.search')}
              className="h-12 w-full bg-transparent pl-9 pr-10 text-base placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
          <ResultList
            results={mobile.results}
            selected={mobile.selected}
            setSelected={mobile.setSelected}
            go={mobile.go}
            t={mobile.t}
            query={mobile.query}
            listId="site-search-mobile-list"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
