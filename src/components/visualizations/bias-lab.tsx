'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Eraser, RotateCcw } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/use-translations'
import { useMounted } from '@/lib/use-mounted'
import { useUIStore } from '@/lib/store'
import { defaultLocale } from '@/lib/i18n/config'

// ---------------------------------------------------------------------------
// Verzerrungs-Labor – Berufe auf einer Geschlechter-Achse.
//
// Teil 1 „Die Landkarte hat eine Schlagseite": Vorberechnete Berufswörter
//   liegen auf einer Achse weiblich ↔ männlich. Die Achse ist EINE Richtung im
//   Embedding-Raum: mean(männliche Seedwörter) − mean(weibliche Seedwörter).
//   Projiziert man ein Wort darauf, sieht man, ob es im Training eher neben
//   typisch männlichen oder weiblichen Wörtern stand. Tipp ein eigenes Wort ein
//   (live via /api/embeddings) – es fällt an seine Stelle. Neutrale Objekte
//   (Tisch, Apfel) liegen bei 0: der Bezug kommt aus der BEDEUTUNG, nicht aus
//   der Wortendung (das männlich-geformte „Krankenpfleger" liegt links).
//
// Teil 2 „Lässt sich das wegrechnen?": Ein Klick rechnet die Geschlechts-
//   Richtung aus jedem Vektor heraus. Auf der Achse steht dann alles in der
//   Mitte – aber die nächsten Berufe bleiben fast dieselben. Die Verzerrung
//   sitzt nicht in einer Stellschraube, sondern verteilt im ganzen Vektor.
//
// Tokensparen: Die vorberechneten Berufe stehen in public/bias-map.<locale>.json
//   (kein Modell-Aufruf). Nur eine FREIE Eingabe ruft /api/embeddings live.
// ---------------------------------------------------------------------------

interface BiasWord {
  term: string
  lean: number
  vec: number[]
}
interface BiasData {
  model: string
  dim: number
  axis: number[]
  center: number
  span: number
  words: BiasWord[]
  anchors: { term: string; lean: number }[]
}

interface Row {
  id: string
  term: string
  lean: number
  vec: number[] | null // null = Anker (Objekt) ohne Nachbar-Berechnung
  kind: 'word' | 'anchor' | 'user'
}

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
// Geschlechts-Komponente aus einem Vektor herausrechnen (axis ist Einheitslänge).
function removeAxis(v: number[], axis: number[]): number[] {
  const p = dot(v, axis)
  return unit(v.map((x, i) => x - p * axis[i]))
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

export function BiasLab() {
  const t = useTranslations()
  const mounted = useMounted()
  const storeLocale = useUIStore((s) => s.locale)
  const locale = mounted ? storeLocale : defaultLocale

  const [data, setData] = useState<BiasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Referenzdaten in der UI-Sprache laden (statische Datei, kein API-Call).
  useEffect(() => {
    if (!mounted) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setData(null)
    ;(async () => {
      try {
        const res = await fetch(`/bias-map.${locale}.json`)
        if (!res.ok) throw new Error(String(res.status))
        const json: BiasData = await res.json()
        if (!cancelled) {
          // Vektoren auf Einheitslänge bringen (Rundung in der Datei korrigieren).
          json.words = json.words.map((w) => ({ ...w, vec: unit(w.vec) }))
          json.axis = unit(json.axis)
          setData(json)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mounted, locale])

  if (loading || !data) {
    return error ? (
      <p className="text-sm text-destructive">{t('bias.lab.errLoad')}</p>
    ) : (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <AxisExplorer data={data} locale={locale} t={t} />
      <DebiasDemo data={data} t={t} />
    </div>
  )
}

// ===========================================================================
// Teil 1 – die Achse + Live-Eingabe
// ===========================================================================
type TFn = (key: string) => string

function AxisExplorer({ data, locale, t }: { data: BiasData; locale: string; t: TFn }) {
  const [userRows, setUserRows] = useState<Row[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [embedErr, setEmbedErr] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  // Beim Sprachwechsel die eigenen Wörter leeren.
  useEffect(() => {
    setUserRows([])
    setSelected(null)
    setEmbedErr(null)
  }, [locale])

  const EXAMPLES = [
    t('bias.lab.ex1'),
    t('bias.lab.ex2'),
    t('bias.lab.ex3'),
    t('bias.lab.ex4'),
  ]

  // Alle Zeilen: vorberechnete Berufe + Anker + Nutzer-Wörter, nach lean sortiert.
  const rows: Row[] = useMemo(() => {
    const base: Row[] = [
      ...data.words.map((w) => ({ id: `w:${w.term}`, term: w.term, lean: w.lean, vec: w.vec, kind: 'word' as const })),
      ...data.anchors.map((a) => ({ id: `a:${a.term}`, term: a.term, lean: a.lean, vec: null, kind: 'anchor' as const })),
      ...userRows,
    ]
    return base.sort((p, q) => q.lean - p.lean)
  }, [data, userRows])

  const leanToPct = (lean: number) => 50 + (clamp(lean, -data.span, data.span) / data.span) * 45

  const addWord = useCallback(
    async (raw: string) => {
      const term = raw.trim().replace(/\s+/g, ' ')
      if (!term || pending) return
      // Schon vorhanden? Dann nur auswählen.
      const existing = rows.find((r) => r.term.toLowerCase() === term.toLowerCase())
      if (existing) {
        setSelected(existing.id)
        setInput('')
        return
      }
      setPending(true)
      setEmbedErr(null)
      try {
        const res = await fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: term }),
        })
        if (!res.ok) throw new Error(String(res.status))
        const json = await res.json()
        if (!json.embedding || !Array.isArray(json.embedding)) throw new Error('leer')
        const vec = unit(json.embedding)
        const lean = dot(vec, data.axis) - data.center
        const id = `u:${term}:${Date.now()}`
        setUserRows((prev) => [...prev, { id, term, lean, vec, kind: 'user' }])
        setSelected(id)
        setInput('')
      } catch {
        setEmbedErr(term)
      } finally {
        setPending(false)
      }
    },
    [pending, rows, data],
  )

  const selectedRow = rows.find((r) => r.id === selected) ?? null

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{t('bias.lab.s1.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('bias.lab.s1.hint')}</p>
      </div>

      {/* Eingabe + Beispiele */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addWord(input)
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('bias.lab.inputPlaceholder')}
          maxLength={30}
          className="flex-grow"
        />
        <Button type="submit" disabled={pending || !input.trim()}>
          {pending ? t('bias.lab.embeddingBtn') : t('bias.lab.embedBtn')}
        </Button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('bias.lab.examplesLabel')}</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => addWord(ex)}
            disabled={pending}
            className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
        {userRows.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setUserRows([])
              setSelected(null)
            }}
            className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            {t('bias.lab.resetBtn')}
          </button>
        )}
      </div>

      {embedErr && (
        <p className="text-sm text-destructive">
          „{embedErr}" {t('bias.lab.errEmbed')}
        </p>
      )}

      {/* Achse */}
      <div className="rounded-lg border bg-background/40 p-3 sm:p-4">
        {/* Achsen-Beschriftung (über der Spur ausgerichtet) */}
        <div className="mb-2 flex text-xs font-medium text-muted-foreground">
          <div className="w-24 shrink-0 sm:w-32" aria-hidden="true" />
          <div className="flex flex-1 justify-between">
            <span>← {t('bias.lab.axisFemale')}</span>
            <span>{t('bias.lab.axisNeutral')}</span>
            <span>{t('bias.lab.axisMale')} →</span>
          </div>
        </div>

        <ul>
          <AnimatePresence initial={false}>
            {rows.map((r) => {
              const pct = leanToPct(r.lean)
              const isSel = r.id === selected
              const isUser = r.kind === 'user'
              const isAnchor = r.kind === 'anchor'
              const onRight = r.lean >= 0
              return (
                <motion.li
                  key={r.id}
                  layout
                  initial={isUser ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex h-7 items-center gap-2"
                >
                  {/* Beschriftung in fester Spalte = das fokussierbare Bedienelement
                      pro Zeile (ein Tab-Stopp, ein Name). Der Punkt unten ist nur
                      eine Maus-Bequemlichkeit (aria-hidden). */}
                  <button
                    type="button"
                    onClick={() => setSelected((cur) => (cur === r.id ? null : r.id))}
                    className={`w-24 shrink-0 truncate rounded text-right text-[11px] leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:w-32 ${
                      isUser
                        ? 'font-semibold text-primary'
                        : isAnchor
                          ? 'italic text-muted-foreground/70'
                          : isSel
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label={`${r.term}: ${r.lean >= 0 ? '+' : ''}${r.lean.toFixed(3)}`}
                  >
                    {r.term}
                  </button>
                  {/* Spur mit Mittellinie, Balken und Punkt */}
                  <div className="relative h-full flex-1">
                    <div
                      className="pointer-events-none absolute inset-y-0 w-px bg-border"
                      style={{ left: '50%' }}
                      aria-hidden="true"
                    />
                    <span
                      className={`absolute top-1/2 h-px -translate-y-1/2 ${
                        isUser || isSel ? 'bg-primary/60' : isAnchor ? 'bg-muted-foreground/20' : 'bg-muted-foreground/30'
                      }`}
                      style={
                        onRight
                          ? { left: '50%', width: `${pct - 50}%` }
                          : { left: `${pct}%`, width: `${50 - pct}%` }
                      }
                      aria-hidden="true"
                    />
                    <span
                      onClick={() => setSelected((cur) => (cur === r.id ? null : r.id))}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer p-1"
                      style={{ left: `${pct}%`, zIndex: isSel ? 30 : isUser ? 20 : 10 }}
                      aria-hidden="true"
                    >
                      <span
                        className={`block rounded-full ring-2 ring-offset-1 ring-offset-background transition-transform ${
                          isUser
                            ? 'bg-primary ring-primary'
                            : isAnchor
                              ? 'bg-muted-foreground/40 ring-transparent'
                              : 'bg-foreground ring-transparent'
                        } ${isSel ? 'scale-150' : ''}`}
                        style={{ width: 9, height: 9 }}
                      />
                    </span>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </div>

      {/* Auswahl-Detail */}
      <AnimatePresence mode="wait">
        {selectedRow && (
          <motion.p
            key={selectedRow.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            <span className="font-semibold text-foreground">{selectedRow.term}</span>{' '}
            {selectedRow.kind === 'anchor'
              ? t('bias.lab.detailAnchor')
              : Math.abs(selectedRow.lean) < 0.012
                ? t('bias.lab.detailNeutral')
                : selectedRow.lean > 0
                  ? t('bias.lab.detailMale')
                  : t('bias.lab.detailFemale')}{' '}
            <span className="font-mono text-xs">
              ({selectedRow.lean >= 0 ? '+' : ''}
              {selectedRow.lean.toFixed(3)})
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted-foreground">{t('bias.lab.neutralNote')}</p>
    </section>
  )
}

// ===========================================================================
// Teil 2 – „lässt sich das wegrechnen?" (Debias-Beweis)
// ===========================================================================
function DebiasDemo({ data, t }: { data: BiasData; t: TFn }) {
  // Probe-Auswahl: die zwei stärksten je Seite (aus den echten Daten).
  const probes = useMemo(() => {
    const sorted = [...data.words].sort((a, b) => a.lean - b.lean)
    return [sorted[0], sorted[1], sorted[sorted.length - 2], sorted[sorted.length - 1]].filter(Boolean)
  }, [data])

  const [probeTerm, setProbeTerm] = useState(probes[0]?.term ?? '')
  const [debiased, setDebiased] = useState(false)

  const probe = data.words.find((w) => w.term === probeTerm) ?? probes[0]

  // Debiaste Vektoren (Geschlechts-Richtung entfernt) – memoisiert.
  const debVecs = useMemo(() => {
    const m = new Map<string, number[]>()
    for (const w of data.words) m.set(w.term, removeAxis(w.vec, data.axis))
    return m
  }, [data])

  const neighbors = useCallback(
    (deb: boolean): { term: string; sim: number }[] => {
      if (!probe) return []
      const pv = deb ? debVecs.get(probe.term)! : probe.vec
      return data.words
        .filter((w) => w.term !== probe.term)
        .map((w) => ({ term: w.term, sim: dot(pv, deb ? debVecs.get(w.term)! : w.vec) }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 4)
    },
    [probe, data, debVecs],
  )

  const normalNb = useMemo(() => neighbors(false), [neighbors])
  const shownNb = useMemo(() => neighbors(debiased), [neighbors, debiased])

  // Wie viele Nachbarn blieben nach dem Herausrechnen dieselben?
  const normalSet = useMemo(() => new Set(normalNb.map((n) => n.term)), [normalNb])
  const stayed = shownNb.filter((n) => normalSet.has(n.term)).length

  const leanNow = debiased ? 0 : probe?.lean ?? 0
  const leanPct = 50 + (clamp(leanNow, -data.span, data.span) / data.span) * 45

  return (
    <section className="space-y-4 border-t pt-8">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{t('bias.lab.s2.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('bias.lab.s2.hint')}</p>
      </div>

      {/* Probe-Auswahl */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('bias.lab.probeLabel')}</span>
        {probes.map((p) => (
          <button
            key={p.term}
            type="button"
            onClick={() => setProbeTerm(p.term)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              p.term === probe?.term ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            {p.term}
          </button>
        ))}
      </div>

      {/* Mini-Achse für die Probe */}
      <div className="rounded-lg border bg-background/40 p-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>← {t('bias.lab.axisFemale')}</span>
          <span>{t('bias.lab.axisMale')} →</span>
        </div>
        <div className="relative h-7">
          <div className="pointer-events-none absolute inset-y-0 w-px bg-border" style={{ left: '50%' }} aria-hidden="true" />
          {/* Balken von der Mitte zum Punkt */}
          <motion.span
            className="absolute top-1/2 h-px -translate-y-1/2 bg-primary/60"
            animate={{
              left: leanNow >= 0 ? '50%' : `${leanPct}%`,
              width: `${Math.abs(leanPct - 50)}%`,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            aria-hidden="true"
          />
          {/* Punkt (am lean-Wert verankert) + Label rechts daneben */}
          <motion.span
            animate={{ left: `${leanPct}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${leanPct}%` }}
          >
            <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="absolute left-full top-1/2 ml-1.5 -translate-y-1/2 whitespace-nowrap text-[11px] font-semibold text-primary">
              {probe?.term}
            </span>
          </motion.span>
        </div>
        <div className="mt-1 text-right font-mono text-xs text-muted-foreground">
          lean: {debiased ? '0.000' : `${(probe?.lean ?? 0) >= 0 ? '+' : ''}${(probe?.lean ?? 0).toFixed(3)}`}
        </div>
      </div>

      <Button
        variant={debiased ? 'secondary' : 'default'}
        size="sm"
        onClick={() => setDebiased((v) => !v)}
      >
        <Eraser className="mr-1.5 h-4 w-4" aria-hidden="true" />
        {debiased ? t('bias.lab.debiasUndo') : t('bias.lab.debiasBtn')}
      </Button>

      {/* Nachbarn */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 text-sm">
          <span className="font-semibold">{t('bias.lab.neighborsLabel')}</span>{' '}
          <span className="text-muted-foreground">
            {debiased ? t('bias.lab.neighborsAfter') : t('bias.lab.neighborsBefore')}
          </span>
        </div>
        <ul className="space-y-1.5">
          {shownNb.map((n, i) => {
            const pct = clamp(((n.sim - 0.4) / 0.6) * 100, 6, 100)
            const kept = debiased && normalSet.has(n.term)
            return (
              <li key={`${n.term}-${i}`} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-sm">{n.term}</span>
                <span className="relative h-2 flex-grow overflow-hidden rounded-full bg-muted">
                  <span
                    className={`absolute inset-y-0 left-0 rounded-full ${kept ? 'bg-primary' : 'bg-primary/50'}`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {n.sim.toFixed(3)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Pointe nach dem Herausrechnen */}
      <AnimatePresence>
        {debiased && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 rounded-lg border border-[hsl(var(--chart-3)/0.5)] bg-[hsl(var(--chart-3)/0.12)] p-4"
          >
            <Eraser className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--chart-3))]" aria-hidden="true" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">
                {stayed} {t('bias.lab.stayedOf')} {shownNb.length} {t('bias.lab.stayedSame')}
              </p>
              <p className="text-muted-foreground">{t('bias.lab.punch')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
