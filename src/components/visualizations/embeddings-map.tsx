'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// Bedeutungs-Landkarte: ~80 deutsche Alltagswörter, platziert nach echter
// Bedeutungs-Distanz (Embeddings via gemini-embedding-2). Nähe = ähnlich.
// Tippe ein Wort oder einen kurzen Satz -> jedes Wort wird live embedded und
// fällt an seinen Bedeutungs-Ort. Klick auf einen Punkt zeigt die nächsten
// Nachbarn mit echten Ähnlichkeitswerten.
//
// Interne Strings bleiben hier auf Deutsch (Konvention der Viz-Komponenten;
// volle i18n-Migration erfolgt separat). Die Seiten-Copy läuft über i18n.
// ---------------------------------------------------------------------------

interface MapWord {
  term: string
  category: string
  x: number
  y: number
  vec: number[]
}

interface MapData {
  model: string
  dim: number
  categories: string[]
  words: MapWord[]
}

interface Point {
  id: string
  term: string
  x: number
  y: number
  vec: number[]
  category: string | null // null = vom Nutzer hinzugefügt
}

interface Neighbor {
  point: Point
  sim: number
}

const CAT_COLOR: Record<string, string> = {
  tiere: 'var(--chart-1)',
  essen: 'var(--chart-2)',
  orte: 'var(--chart-3)',
  gefuehle: 'var(--chart-4)',
  berufe: 'var(--chart-5)',
  sport: 'var(--chart-6)',
  musik: 'var(--chart-7)',
  fahrzeuge: 'var(--chart-8)',
}

const CAT_LABEL: Record<string, string> = {
  tiere: 'Tiere',
  essen: 'Lebensmittel',
  orte: 'Länder & Städte',
  gefuehle: 'Gefühle',
  berufe: 'Berufe',
  sport: 'Sport',
  musik: 'Musik',
  fahrzeuge: 'Fahrzeuge',
}

const EXAMPLES = ['Pizza', 'Australien', 'Eifersucht', 'Astronaut', 'Roboter', 'Sushi']

// Eingabe begrenzen: ein Wort (oder kurzer Satz) wird als EIN Embedding gerechnet.
const MAX_INPUT = 30

// Punkt-Farbe: Kategorie-Chart-Token, oder Akzentfarbe für Nutzer-Wörter.
const colorOf = (category: string | null) =>
  category ? `hsl(${CAT_COLOR[category]})` : 'hsl(var(--primary))'

// Vektor auf Einheitslänge normieren -> Skalarprodukt = Kosinus-Ähnlichkeit.
function unit(v: number[]): number[] {
  let m = 0
  for (const x of v) m += x * x
  m = Math.sqrt(m)
  return m === 0 ? v : v.map((x) => x / m)
}
function dot(a: number[], b: number[]): number {
  let d = 0
  for (let i = 0; i < a.length; i++) d += a[i] * b[i]
  return d
}

// Datenraum [-1.1, 1.1] -> Prozentposition im Container (mit Innenabstand,
// y gespiegelt, damit +y oben liegt).
const INSET = 5
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const toPctX = (x: number) => INSET + ((clamp(x, -1.1, 1.1) + 1.1) / 2.2) * (100 - 2 * INSET)
const toPctY = (y: number) => INSET + ((1.1 - clamp(y, -1.1, 1.1)) / 2.2) * (100 - 2 * INSET)

export function EmbeddingsMap() {
  const [refPoints, setRefPoints] = useState<Point[]>([])
  const [addedPoints, setAddedPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set())
  const addedCounter = useRef(0)

  // Referenz-Embeddings laden (statische Datei, kein API-Call).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/embeddings-map.json')
        if (!res.ok) throw new Error(`Landkarte konnte nicht geladen werden (${res.status})`)
        const data: MapData = await res.json()
        if (cancelled) return
        setRefPoints(
          data.words.map((w) => ({
            id: `r:${w.term}`,
            term: w.term,
            x: w.x,
            y: w.y,
            vec: unit(w.vec),
            category: w.category,
          }))
        )
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

  const allPoints = [...refPoints, ...addedPoints]
  // Sichtbare Punkte (ausgeblendete Kategorien raus; Nutzer-Wörter immer sichtbar).
  const visiblePoints = [
    ...refPoints.filter((p) => !(p.category && hiddenCats.has(p.category))),
    ...addedPoints,
  ]
  const pointById = (id: string | null) => (id ? allPoints.find((p) => p.id === id) ?? null : null)

  // Nächste Nachbarn eines Punkts (echte Kosinus-Ähnlichkeit, ganzer Raum) —
  // nur unter den aktuell sichtbaren Kategorien.
  const neighborsOf = useCallback(
    (p: Point, k = 6): Neighbor[] =>
      visiblePoints
        .filter((q) => q.id !== p.id)
        .map((q) => ({ point: q, sim: dot(p.vec, q.vec) }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, k),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refPoints, addedPoints, hiddenCats]
  )

  const toggleCat = (cat: string) => {
    setHiddenCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
    // Ausgewählten Punkt abwählen, wenn seine Kategorie ausgeblendet wird.
    const sel = pointById(selectedId)
    if (sel?.category === cat && !hiddenCats.has(cat)) setSelectedId(null)
  }

  const selected = pointById(selectedId)
  const selectedNeighbors = selected ? neighborsOf(selected) : []
  const lineTargets = new Set(selectedNeighbors.slice(0, 3).map((n) => n.point.id))

  // Ein Wort live einbetten und auf der Karte platzieren.
  const embedWord = async (term: string): Promise<Point | null> => {
    const res = await fetch('/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: term }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.embedding || !Array.isArray(data.embedding)) return null
    const vec = unit(data.embedding)

    // Position = ähnlichkeitsgewichteter Schwerpunkt der nächsten Nachbarn,
    // damit das neue Wort wirklich bei seinen Nachbarn landet.
    const sims = refPoints
      .map((q) => ({ q, sim: dot(vec, q.vec) }))
      .sort((a, b) => b.sim - a.sim)
    const top = sims.slice(0, 8)
    const minSim = top[top.length - 1]?.sim ?? 0
    let wx = 0, wy = 0, wsum = 0
    for (const { q, sim } of top) {
      const w = Math.pow(Math.max(1e-3, sim - minSim + 0.05), 2)
      wx += w * q.x
      wy += w * q.y
      wsum += w
    }
    const id = `a:${addedCounter.current++}`
    return {
      id,
      term,
      x: wsum ? wx / wsum : 0,
      y: wsum ? wy / wsum : 0,
      vec,
      category: null,
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const term = input.trim().replace(/\s+/g, ' ')
    if (!term || pending) return

    // Steht der Begriff schon auf der Karte? Dann nur auswählen (nicht doppeln).
    const existing =
      refPoints.find((r) => r.term.toLowerCase() === term.toLowerCase()) ||
      addedPoints.find((a) => a.term.toLowerCase() === term.toLowerCase())
    if (existing) {
      if (existing.category) setHiddenCats((prev) => { const n = new Set(prev); n.delete(existing.category!); return n })
      setSelectedId(existing.id)
      setInput('')
      return
    }

    setPending(true)
    setError(null)
    try {
      // Die ganze Eingabe wird als EIN Vektor gerechnet — ob Wort oder Satz.
      const p = await embedWord(term)
      if (p) {
        setAddedPoints((prev) => [...prev, p])
        setSelectedId(p.id)
        setInput('')
      } else {
        setError(`Für „${term}“ konnte kein Embedding berechnet werden.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Embedding konnte nicht berechnet werden.')
    } finally {
      setPending(false)
    }
  }

  const reset = () => {
    setAddedPoints([])
    setSelectedId(null)
    addedCounter.current = 0
  }

  return (
    <div className="space-y-4">
      {/* Eingabe (Token-Brücke) */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Wort eingeben – z. B. Tiger, Vulkan, Glück …"
          maxLength={MAX_INPUT}
          className="flex-grow"
          disabled={loading}
        />
        <Button type="submit" disabled={pending || loading || !input.trim()}>
          {pending ? 'Bette ein …' : 'Auf die Karte'}
        </Button>
      </form>

      {/* Beispiele */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Beispiele:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInput(ex)}
            disabled={pending || loading}
            className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
        {addedPoints.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto rounded-full px-2.5 py-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Karte zurücksetzen
          </button>
        )}
      </div>

      {/* Legende – Kategorie anklicken zum Aus-/Einblenden */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {Object.keys(CAT_LABEL).map((cat) => {
          const hidden = hiddenCats.has(cat)
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCat(cat)}
              aria-pressed={!hidden}
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-foreground"
              style={{ color: hidden ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}
              title={hidden ? `${CAT_LABEL[cat]} einblenden` : `${CAT_LABEL[cat]} ausblenden`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full transition-opacity"
                style={{ backgroundColor: colorOf(cat), opacity: hidden ? 0.25 : 1 }}
              />
              <span className={hidden ? 'line-through opacity-60' : ''}>{CAT_LABEL[cat]}</span>
            </button>
          )
        })}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-background"
            style={{ backgroundColor: colorOf(null), ['--tw-ring-color' as string]: colorOf(null) }}
          />
          dein Wort
        </span>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Karte */}
      {loading ? (
        <Skeleton className="aspect-[4/3] w-full sm:aspect-[16/10]" />
      ) : (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-background/40 sm:aspect-[16/10]">
          {/* Verbindungslinien zu den 3 nächsten Nachbarn des ausgewählten Punkts */}
          {selected && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {selectedNeighbors.slice(0, 3).map((n) => (
                <line
                  key={n.point.id}
                  x1={toPctX(selected.x)}
                  y1={toPctY(selected.y)}
                  x2={toPctX(n.point.x)}
                  y2={toPctY(n.point.y)}
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.25}
                  strokeOpacity={0.5}
                  strokeDasharray="3 2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          )}

          {visiblePoints.map((p) => {
            const isSelected = p.id === selectedId
            const isHovered = p.id === hoveredId
            const isNeighbor = lineTargets.has(p.id)
            const isAdded = p.category === null
            const emphasized = isSelected || isHovered || isNeighbor || isAdded
            const color = colorOf(p.category)
            const label = p.term.length > 18 ? `${p.term.slice(0, 17)}…` : p.term
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  left: `${toPctX(p.x)}%`,
                  top: `${toPctY(p.y)}%`,
                  zIndex: isSelected ? 40 : emphasized ? 30 : 10,
                }}
                aria-label={`${p.term}${p.category ? ` (${CAT_LABEL[p.category]})` : ''}`}
              >
                <motion.span
                  initial={isAdded ? { scale: 0 } : false}
                  animate={{ scale: isSelected ? 1.6 : emphasized ? 1.35 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="block rounded-full"
                  style={{
                    width: 9,
                    height: 9,
                    backgroundColor: color,
                    boxShadow: isAdded
                      ? `0 0 0 3px hsl(var(--background)), 0 0 0 4.5px ${color}`
                      : isSelected
                        ? `0 0 0 2px hsl(var(--background)), 0 0 0 3.5px ${color}`
                        : undefined,
                  }}
                />
                <span
                  className={`whitespace-nowrap rounded px-1 text-[10px] leading-tight transition-colors sm:text-[11px] ${
                    emphasized ? 'inline-block' : 'hidden sm:inline-block'
                  }`}
                  style={{
                    color: emphasized ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    fontWeight: emphasized ? 600 : 400,
                    opacity: selected && !emphasized ? 0.4 : 1,
                    backgroundColor: emphasized ? 'hsl(var(--background))' : 'transparent',
                    // Ruhezustand: dezenter Halo in Hintergrundfarbe (kein Kästchen)
                    // → überlappende Labels bleiben lesbar, ohne die Karte zuzukleistern.
                    textShadow: emphasized
                      ? 'none'
                      : '0 0 3px hsl(var(--background)), 0 0 2px hsl(var(--background)), 0 0 2px hsl(var(--background))',
                  }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Nachbar-Panel */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: colorOf(selected.category) }}
              />
              <h4 className="text-sm font-semibold">
                Nächste Nachbarn von „{selected.term}“
              </h4>
              {selected.category && (
                <span className="text-xs text-muted-foreground">{CAT_LABEL[selected.category]}</span>
              )}
            </div>
            <ul className="space-y-1.5">
              {selectedNeighbors.map((n) => {
                // Balkenbreite: 0.5..1.0 -> 0..100 % (Alltagswörter liegen meist über 0.5).
                const pct = clamp(((n.sim - 0.5) / 0.5) * 100, 4, 100)
                return (
                  <li key={n.point.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedId(n.point.id)}
                      onMouseEnter={() => setHoveredId(n.point.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="w-28 shrink-0 truncate text-left text-sm hover:underline"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      {n.point.term}
                    </button>
                    <div className="h-2 flex-grow overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: colorOf(n.point.category) }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">
                      {n.sim.toFixed(3)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Tipp ein Wort ein oder klick einen Punkt – dann erscheinen hier die nächsten Nachbarn mit
            ihrer Ähnlichkeit.
          </p>
        )}
      </AnimatePresence>
    </div>
  )
}
