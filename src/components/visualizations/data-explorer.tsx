'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Daten-Explorer: ein echter Querschnitt aus FineWeb (CommonCrawl-Webtexte,
// ins Deutsche übersetzt). Jeder Punkt = ein Dokument, platziert nach echter
// 2D-Projektion (UMAP), gefärbt nach Themengruppe.
//
//   Roh           → der ungefilterte Querschnitt; Punkt anklicken & lesen.
//   Deine Auswahl → was du selbst mit Behalten/Raus behalten hast.
//   Musterlösung  → was der echte Qualitätsfilter (FineWeb-Edu) behält (~6 %).
//
// Lernziel: Pretraining-Daten sind extrem heterogen und thematisch ungeplant –
// aber qualitativ hart gefiltert. Die Reduktion wird beim Wechsel der Ansicht
// sichtbar. Daten via scripts/gen-data-sample.mjs → public/data-sample.json.
//
// Interne Strings bleiben hier auf Deutsch (Konvention der Viz-Komponenten;
// volle i18n-Migration separat). Die Seiten-Copy läuft über i18n.
// ---------------------------------------------------------------------------

interface Doc {
  id: number
  g: string // Gruppen-Key
  edu: number // Bildungswert-Score 0..4 (Skala 0..5)
  x: number // 0..1
  y: number // 0..1
  text: string
}

interface GroupMeta {
  key: string
  label: string
}

interface SampleData {
  source: string
  threshold: number
  total: number
  survivors: number
  groups: GroupMeta[]
  docs: Doc[]
}

type View = 'raw' | 'mine' | 'curated'
type Decision = 'keep' | 'discard'

// Gruppen-Key → chart-Farbtoken (Light+Dark automatisch über CSS-Vars).
const GROUP_CHART: Record<string, number> = {
  sport: 1,
  tech: 2,
  health: 3,
  shopping: 4,
  home: 5,
  economy: 6,
  culture: 7,
  life: 8,
}
const colorOf = (g: string) => `hsl(var(--chart-${GROUP_CHART[g] ?? 1}))`

// Datenraum 0..1 → viewBox 0..100 mit Innenabstand.
const INSET = 4
const toVB = (n: number) => INSET + n * (100 - 2 * INSET)

export function DataExplorer() {
  const [data, setData] = useState<SampleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [view, setView] = useState<View>('raw')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [decisions, setDecisions] = useState<Map<number, Decision>>(new Map())
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/data-sample.json')
        if (!res.ok) throw new Error(`Datensatz konnte nicht geladen werden (${res.status})`)
        const json: SampleData = await res.json()
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const groupLabel = useMemo(() => {
    const m: Record<string, string> = {}
    data?.groups.forEach((g) => (m[g.key] = g.label))
    return m
  }, [data])

  const keptCount = useMemo(
    () => [...decisions.values()].filter((d) => d === 'keep').length,
    [decisions]
  )

  const selected = useMemo(
    () => (selectedId != null ? data?.docs.find((d) => d.id === selectedId) ?? null : null),
    [selectedId, data]
  )

  // Ist ein Punkt in der aktuellen Ansicht „aktiv" (voll sichtbar)?
  const isActive = useCallback(
    (d: Doc): boolean => {
      if (hiddenGroups.has(d.g)) return false
      if (view === 'raw') return true
      if (view === 'mine') return decisions.get(d.id) === 'keep'
      return d.edu >= (data?.threshold ?? 3) // curated
    },
    [view, decisions, hiddenGroups, data]
  )

  const decide = (id: number, decision: Decision) => {
    setDecisions((prev) => {
      const next = new Map(prev)
      if (next.get(id) === decision) next.delete(id) // nochmal klicken = aufheben
      else next.set(id, decision)
      return next
    })
  }

  const pickRandom = () => {
    if (!data) return
    const pool = data.docs.filter((d) => !hiddenGroups.has(d.g))
    if (!pool.length) return
    // Zufall ohne Date/Math.random-Verbot: Math.random ist im Browser erlaubt.
    const next = pool[Math.floor(Math.random() * pool.length)]
    setSelectedId(next.id)
  }

  const toggleGroup = (key: string) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const reset = () => {
    setDecisions(new Map())
    setSelectedId(null)
    setView('raw')
    setHiddenGroups(new Set())
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (loading || !data) {
    return <Skeleton className="aspect-[4/3] w-full sm:aspect-[16/10]" />
  }

  const VIEWS: { key: View; label: string; count: number }[] = [
    { key: 'raw', label: 'Roh', count: data.total },
    { key: 'mine', label: 'Deine Auswahl', count: keptCount },
    { key: 'curated', label: 'Musterlösung', count: data.survivors },
  ]

  const viewCaption =
    view === 'raw'
      ? 'Ein roher Querschnitt aus dem Web. Klick einen Punkt und lies, was wirklich drinsteht – Banales neben Wertvollem, kein Lehrplan.'
      : view === 'mine'
        ? keptCount === 0
          ? 'Öffne ein Dokument und entscheide „Behalten" oder „Raus". Was du behältst, bildet hier deinen eigenen Datensatz.'
          : `Dein Datensatz: ${keptCount} von ${data.total} Dokumenten behalten.`
        : `Was der echte Qualitätsfilter behält: nur Texte mit hohem Bildungswert – ${data.survivors} von ${data.total} (≈ 6 %). Den Rest wirft die Pipeline weg.`

  return (
    <div className="space-y-4">
      {/* Ansichts-Umschalter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border bg-muted/40 p-1 text-sm">
          {VIEWS.map((v) => {
            const activeView = view === v.key
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => setView(v.key)}
                aria-pressed={activeView}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                  activeView
                    ? 'bg-background font-medium text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    activeView ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {v.count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={pickRandom}>
            Zufälliges Dokument
          </Button>
          {(decisions.size > 0 || hiddenGroups.size > 0 || view !== 'raw') && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{viewCaption}</p>

      {/* Karte */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-background/40 sm:aspect-[16/10]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label="Karte von Trainingsdaten-Dokumenten, nach Thema gefärbt"
        >
          {data.docs.map((d) => {
            const active = isActive(d)
            const isSel = d.id === selectedId
            const isHov = d.id === hoveredId
            // Inaktive Punkte (in „Deine Auswahl" / „Musterlösung") klein & blass,
            // damit die wenigen aktiven klar herausstechen. In „Roh" sind alle aktiv.
            const r = isSel ? 1.8 : isHov ? 1.4 : active ? (view === 'raw' ? 0.85 : 1.05) : 0.4
            const op = isSel ? 1 : isHov ? 0.95 : active ? 0.82 : 0.06
            return (
              <circle
                key={d.id}
                cx={toVB(d.x)}
                cy={toVB(d.y)}
                r={r}
                fill={colorOf(d.g)}
                fillOpacity={op}
                stroke={isSel ? 'hsl(var(--foreground))' : 'none'}
                strokeWidth={isSel ? 0.6 : 0}
                vectorEffect="non-scaling-stroke"
                style={{ cursor: 'pointer', transition: 'r 160ms, fill-opacity 220ms' }}
                onClick={() => setSelectedId(d.id)}
                onMouseEnter={() => setHoveredId(d.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <title>{groupLabel[d.g]}</title>
              </circle>
            )
          })}
        </svg>
      </div>

      {/* Legende – Gruppe anklicken zum Aus-/Einblenden */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {data.groups.map((g) => {
          const hidden = hiddenGroups.has(g.key)
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => toggleGroup(g.key)}
              aria-pressed={!hidden}
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
              style={{ color: hidden ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}
              title={hidden ? `${g.label} einblenden` : `${g.label} ausblenden`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full transition-opacity"
                style={{ backgroundColor: colorOf(g.key), opacity: hidden ? 0.25 : 1 }}
              />
              <span className={hidden ? 'line-through opacity-60' : ''}>{g.label}</span>
            </button>
          )
        })}
      </div>

      {/* Dokument-Panel */}
      <DocPanel
        doc={selected}
        groupLabel={selected ? groupLabel[selected.g] : ''}
        groupColor={selected ? colorOf(selected.g) : ''}
        threshold={data.threshold}
        decision={selected ? decisions.get(selected.id) ?? null : null}
        onDecide={decide}
      />
    </div>
  )
}

// --- Dokument-Panel ---------------------------------------------------------
function DocPanel({
  doc,
  groupLabel,
  groupColor,
  threshold,
  decision,
  onDecide,
}: {
  doc: Doc | null
  groupLabel: string
  groupColor: string
  threshold: number
  decision: Decision | null
  onDecide: (id: number, d: Decision) => void
}) {
  if (!doc) {
    return (
      <p className="rounded-lg border border-dashed bg-card/40 p-4 text-center text-sm text-muted-foreground">
        Klick einen Punkt auf der Karte – dann erscheint hier ein echtes Dokument aus den Trainingsdaten.
      </p>
    )
  }

  const filterKeeps = doc.edu >= threshold
  const userKeeps = decision === 'keep'
  const agree = userKeeps === filterKeeps
  const revealed = decision !== null

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: groupColor }} />
        <span className="text-sm font-medium">{groupLabel}</span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-foreground/90">{doc.text}</p>

      {/* Entscheidung (optional) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted-foreground">Ins Training?</span>
        <button
          type="button"
          onClick={() => onDecide(doc.id, 'keep')}
          aria-pressed={decision === 'keep'}
          className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
            decision === 'keep'
              ? 'border-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))]'
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          ✓ Behalten
        </button>
        <button
          type="button"
          onClick={() => onDecide(doc.id, 'discard')}
          aria-pressed={decision === 'discard'}
          className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
            decision === 'discard'
              ? 'border-destructive bg-destructive/10 text-destructive'
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          ✗ Raus
        </button>
      </div>

      {/* Urteil des echten Filters – erst nach eigener Entscheidung */}
      {revealed && (
        <div className="mt-4 border-t pt-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm text-muted-foreground">Bildungswert (KI-Bewerter):</span>
            <span className="flex items-center gap-0.5" aria-label={`${doc.edu} von 5`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={i < doc.edu ? 'text-primary' : 'text-muted-foreground/30'}
                  aria-hidden="true"
                >
                  ★
                </span>
              ))}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{doc.edu}/5</span>
          </div>
          <p className="mt-1.5 text-sm">
            {filterKeeps ? (
              <span className="text-[hsl(var(--chart-2))]">Der echte Filter behält diesen Text.</span>
            ) : (
              <span className="text-destructive">Der echte Filter sortiert diesen Text aus.</span>
            )}{' '}
            <span className="text-muted-foreground">
              {agree ? 'Ihr seid euch einig.' : 'Der Filter entscheidet anders als du.'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
