'use client'

// ---------------------------------------------------------------------------
// Attention-Explorer: echte Attention-Gewichte eines deutschen Sprachmodells
// (GPT-2-Architektur) erkunden. Die Gewichte sind vorberechnet (public/attention.json
// via scripts/gen-attention.py) – kein API gibt Attention live heraus.
//
// Kernidee: jede Wort-Position schaut über die früheren Wörter zurück und gewichtet
// sie. Klick auf ein Wort (= Query) zeigt seine echten Rückschau-Gewichte als Bögen.
// Wir zeigen zwei Sichten desselben Mechanismus: Zusammenhang (ein Wort → das frühere
// Wort, das dazugehört) und Reihenfolge (jedes Wort → das Wort direkt davor).
//
// Bedien-/Erklär-Strings laufen über i18n (DE+EN); die deutschen Beispielsätze
// selbst bleiben deutsch – es ist ein deutsches Modell.
// ---------------------------------------------------------------------------

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from '@/lib/i18n/use-translations'

type Head = { role: string; layer: number; head: number; label: string }
type SentenceHead = { role: string; matrix: number[][] }
type Sentence = {
  text: string
  words: string[]
  anchor: number
  repeat: boolean
  nextToken: { token: string; p: number }[]
  heads: SentenceHead[]
}
type AttnData = { model: string; heads: Head[]; sentences: Sentence[] }

const PUNCT = new Set([',', '.', '!', '?', ';', ':'])
const PRON = new Set(['es', 'er', 'sie', 'ihn', 'ihm', 'ihr'])
// Zwei Sichten in fester Reihenfolge: Zusammenhang (Bezug) zuerst, dann Reihenfolge (Vorwort).
const SHOWN_ROLES = ['relation', 'prev'] as const

export function AttentionExplorer({
  onSentenceChange,
}: {
  onSentenceChange?: (text: string | null) => void
} = {}) {
  const t = useTranslations()
  const [data, setData] = useState<AttnData | null>(null)
  const [si, setSi] = useState(0) // Satz-Index in visibleSentences (Default: „Das Kind…")
  const [role, setRole] = useState('relation')
  const [query, setQuery] = useState<number | null>(null)

  useEffect(() => {
    fetch('/attention.json')
      .then((r) => r.json())
      .then((d: AttnData) => {
        setData(d)
        const visible = d.sentences.filter((s) => !s.repeat)
        const star = visible.findIndex((s) => s.words.includes('es'))
        setSi(star >= 0 ? star : 0)
      })
      .catch(() => setData(null))
  }, [])

  // Der Wiederhol-Satz diente nur dem entfallenen Wiederhol-Kopf – hier ausgeblendet.
  const visibleSentences = useMemo(() => data?.sentences.filter((s) => !s.repeat) ?? [], [data])
  const sentence = visibleSentences[si] ?? null
  const matrix = useMemo(
    () => sentence?.heads.find((h) => h.role === role)?.matrix ?? null,
    [sentence, role],
  )

  // Genau zwei Sichten, in fester Reihenfolge (Zusammenhang vor Reihenfolge).
  const heads = useMemo(
    () =>
      SHOWN_ROLES.map((r) => (data?.heads ?? []).find((h) => h.role === r)).filter(
        (h): h is Head => Boolean(h),
      ),
    [data],
  )

  // Beim Satz-/Kopf-Wechsel automatisch das Wort mit dem stärksten Rückschau-Bogen
  // auswählen → sofort lebendig, ohne dass man erst klicken muss.
  useEffect(() => {
    if (!matrix || !sentence) return
    // Zusammenhang: mit „es" o. ä. starten, falls vorhanden – das ist das stärkste
    // Beispiel (es → das Kind) und passt zum Hinweistext. Sonst: stärkster Rückschau-Bogen.
    if (role === 'relation') {
      const pi = sentence.words.findIndex((w) => PRON.has(w.toLowerCase()))
      if (pi > 0) {
        setQuery(pi)
        return
      }
    }
    let best = matrix.length > 1 ? 1 : 0
    let bestV = -1
    for (let q = 1; q < matrix.length; q++) {
      for (let k = 0; k < q; k++) {
        if (matrix[q][k] > bestV) {
          bestV = matrix[q][k]
          best = q
        }
      }
    }
    setQuery(best)
  }, [matrix, role, sentence])

  // Den gewählten Satz nach oben (Seite) melden → der Mechanik-Toy zeigt dieselben Wörter.
  useEffect(() => {
    onSentenceChange?.(sentence?.text ?? null)
  }, [sentence, onSentenceChange])

  if (!data || !sentence || !matrix) {
    return <div className="h-[360px] animate-pulse rounded-lg bg-muted" aria-hidden />
  }

  const words = sentence.words
  const qRow = query != null ? matrix[query] : null

  // Rückschau-Gewichte des aktuellen Query-Wortes (nach Gewicht sortiert).
  const links =
    query != null && qRow
      ? words
        .map((w, k) => ({ w, k, weight: qRow[k] }))
        .filter((l) => l.k < query! && l.weight >= 0.02)
        .sort((a, b) => b.weight - a.weight)
      : []
  const top = links[0]

  return (
    <div className="space-y-5">
      {/* Satz-Auswahl */}
      <div className="flex flex-wrap gap-2">
        {visibleSentences.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSi(i)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${i === si ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
          >
            {shortLabel(s.text)}
          </button>
        ))}
      </div>

      {/* Zwei Sichten desselben Mechanismus */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t('attention.viz.lensIntro')}</p>
        <div className="flex flex-wrap gap-2">
          {heads.map((h) => (
            <button
              key={h.role}
              type="button"
              onClick={() => setRole(h.role)}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${h.role === role
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
                }`}
            >
              {t('attention.viz.head.' + h.role)}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{t('attention.viz.hint.' + role)}</p>
      </div>

      {/* Visualisierung: Satz als Wort-Reihe mit Rückschau-Bögen */}
      <AttentionRow
        words={words}
        query={query}
        weights={qRow}
        onPick={(k) => setQuery(k)}
      />

      {/* Erklär-Zeile zum aktuellen Query-Wort */}
      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        {query != null && top ? (
          <p>
            <span className="font-semibold text-primary">{words[query]}</span>
            {t('attention.viz.looksPre')}
            <span className="font-semibold">{top.w}</span>
            {t('attention.viz.looksPost')}
            <span className="text-muted-foreground"> ({Math.round(top.weight * 100)} %)</span>.
            {query === 0 && t('attention.viz.firstWord')}
          </p>
        ) : (
          <p className="text-muted-foreground">{t('attention.viz.tapHint')}</p>
        )}
      </div>

      {/* Gewichts-Balken (gleiche Bildsprache wie die Next-Token-Seite) */}
      {query != null && links.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground">
            {t('attention.viz.barsPre')}
            {words[query]}
            {t('attention.viz.barsPost')}
          </div>
          {links.map((l) => (
            <button
              key={l.k}
              type="button"
              onClick={() => setQuery(l.k)}
              className="flex w-full items-center gap-3 rounded px-1 py-0.5 text-left hover:bg-muted"
            >
              <span className="w-24 shrink-0 truncate text-right font-mono text-sm">{l.w}</span>
              <span className="relative h-5 flex-1 overflow-hidden rounded bg-muted">
                <span
                  className="absolute inset-y-0 left-0 rounded bg-primary"
                  style={{ width: `${Math.max(l.weight * 100, 1.5)}%` }}
                />
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                {Math.round(l.weight * 100)} %
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Wort-Reihe mit SVG-Bögen ----------------------------------------------
// Die Wörter liegen auf EINER Zeile (auf Mobile horizontal scrollbar), damit die
// Bögen sauber bleiben. Positionen werden nach dem Layout gemessen.
function AttentionRow({
  words,
  query,
  weights,
  onPick,
}: {
  words: string[]
  query: number | null
  weights: number[] | null
  onPick: (k: number) => void
}) {
  const t = useTranslations()
  const rowRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [geom, setGeom] = useState<{ cx: number[]; top: number; W: number; H: number } | null>(
    null,
  )

  useLayoutEffect(() => {
    const measure = () => {
      const row = rowRef.current
      if (!row) return
      const rb = row.getBoundingClientRect()
      const cx = words.map((_, i) => {
        const el = chipRefs.current[i]
        if (!el) return 0
        const b = el.getBoundingClientRect()
        return b.left - rb.left + b.width / 2
      })
      const first = chipRefs.current[0]
      const top = first ? first.getBoundingClientRect().top - rb.top : 0
      setGeom({ cx, top, W: row.scrollWidth, H: row.clientHeight })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (rowRef.current) ro.observe(rowRef.current)
    return () => ro.disconnect()
  }, [words])

  const arcs: { d: string; w: number; k: number }[] = []
  if (geom && query != null && weights) {
    for (let k = 0; k < query; k++) {
      const w = weights[k]
      if (w < 0.04) continue
      const x1 = geom.cx[k]
      const x2 = geom.cx[query]
      const y = geom.top
      const arch = Math.min(geom.top - 4, 18 + Math.abs(x2 - x1) * 0.32)
      const my = y - arch
      arcs.push({ d: `M ${x1} ${y} Q ${(x1 + x2) / 2} ${my} ${x2} ${y}`, w, k })
    }
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div ref={rowRef} className="relative w-max min-w-full pt-16">
        {geom && (
          <svg
            className="pointer-events-none absolute inset-0"
            width={geom.W}
            height={geom.H}
            aria-hidden
          >
            {arcs.map((a) => (
              <path
                key={a.k}
                d={a.d}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeOpacity={Math.max(a.w, 0.12)}
                strokeWidth={1 + a.w * 3}
                strokeLinecap="round"
              />
            ))}
          </svg>
        )}

        <div className="flex flex-nowrap items-end gap-1.5 whitespace-nowrap">
          {words.map((w, i) => {
            const isQuery = i === query
            const weight = !isQuery && query != null && weights && i < query ? weights[i] : 0
            const isPunct = PUNCT.has(w)
            return (
              <button
                key={i}
                ref={(el) => {
                  chipRefs.current[i] = el
                }}
                type="button"
                onClick={() => onPick(i)}
                aria-label={`${t('attention.viz.word')}${w}${isQuery ? t('attention.viz.selected') : ''}`}
                className={`rounded-md border px-2 py-1.5 font-mono text-sm transition-colors ${isQuery
                    ? 'border-primary ring-2 ring-primary'
                    : isPunct
                      ? 'border-transparent text-muted-foreground'
                      : 'border-border hover:bg-muted'
                  }`}
                style={
                  weight > 0.04
                    ? { backgroundColor: `hsl(var(--primary) / ${Math.min(weight, 0.85)})` }
                    : undefined
                }
              >
                {w}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// „Das Kind ass das Brot nicht, weil es satt war" -> „Das Kind ass das Brot …"
function shortLabel(text: string): string {
  const w = text.split(' ')
  return w.length <= 5 ? text : w.slice(0, 4).join(' ') + ' …'
}
