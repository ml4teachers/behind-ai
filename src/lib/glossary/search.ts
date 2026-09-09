import type { Locale } from '@/lib/i18n/config'
import { messages } from '@/lib/i18n/messages'
import {
  homeLink,
  glossaryLink,
  resourcesLink,
  impressumLink,
  navSections,
} from '@/components/nav/nav-items'
import { glossaryTerms } from './terms'

export interface SearchItem {
  kind: 'page' | 'term'
  id: string
  href: string
  title: string
  subtitle: string
  /** vorbereitete, normalisierte Suchfläche (Titel + Aliasse/Sektion + Kurzdef) */
  haystack: string
}

/** lowercase + Diakritika entfernen (ä→a), damit Umlaute beim Suchen egal sind. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/**
 * Baut den Suchindex aus Navigations-Seiten + Glossarbegriffen. Da Seitentitel
 * über `t()` aus der aktiven Sprache kommen, muss der Index bei Sprachwechsel
 * neu gebaut werden (Aufrufer memoisiert über `locale`).
 */
export function buildSearchIndex(t: (key: string) => string, locale: Locale): SearchItem[] {
  const items: SearchItem[] = []
  const seenHref = new Set<string>()

  // Seitentitel der jeweils *anderen* Sprache landen mit in der Suchfläche:
  // Wer auf Deutsch „bias" tippt, meint die Seite „Verzerrung"; wer auf
  // Englisch „hallucinations" tippt, die Seite „Halluzinationen".
  const otherLocale: Locale = locale === 'de' ? 'en' : 'de'
  const otherTitle = (key: string) => messages[otherLocale]?.[key] ?? ''

  const addPage = (href: string, title: string, subtitle: string, alias = '') => {
    if (seenHref.has(href)) return
    seenHref.add(href)
    items.push({
      kind: 'page',
      id: href,
      href,
      title,
      subtitle,
      haystack: normalize(`${title} ${subtitle} ${alias}`),
    })
  }

  addPage(homeLink.href, t(homeLink.key), '', otherTitle(homeLink.key))
  for (const section of navSections) {
    const sectionLabel = t(section.key)
    for (const link of section.links) addPage(link.href, t(link.key), sectionLabel, otherTitle(link.key))
  }
  addPage(glossaryLink.href, t(glossaryLink.key), '', otherTitle(glossaryLink.key))
  addPage(resourcesLink.href, t(resourcesLink.key), '', otherTitle(resourcesLink.key))
  addPage(impressumLink.href, t(impressumLink.key), '', otherTitle(impressumLink.key))

  for (const term of glossaryTerms) {
    const title = term.term[locale]
    items.push({
      kind: 'term',
      id: term.id,
      href: `/glossary#${term.id}`,
      title,
      subtitle: t(`glossary.category.${term.category}`),
      // Auch der fremdsprachige Begriff ist Suchfläche („gradient descent" → Gradientenabstieg).
      haystack: normalize(
        [title, ...term.aliases[locale], term.short[locale], term.term[otherLocale], ...term.aliases[otherLocale]].join(' '),
      ),
    })
  }

  return items
}

/** Bewertet & sortiert Treffer für eine Anfrage (Tier-Ranking, kein Fuzzy-Lib). */
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  const q = normalize(query)
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)

  const scored: { item: SearchItem; score: number }[] = []
  for (const item of items) {
    const title = normalize(item.title)
    let score = 0
    if (title === q) score = 100
    else if (title.startsWith(q)) score = 80
    else if (title.includes(q)) score = 60
    else if (item.haystack.includes(q)) score = 45
    else if (tokens.length > 1 && tokens.every((tok) => item.haystack.includes(tok))) score = 30
    if (score === 0) continue
    // Seiten leicht bevorzugen (Navigationsziel ist meist gemeint).
    if (item.kind === 'page') score += 5
    scored.push({ item, score })
  }

  scored.sort((a, b) => b.score - a.score || a.item.title.length - b.item.title.length)
  return scored.map((s) => s.item)
}
