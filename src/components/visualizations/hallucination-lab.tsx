'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Sparkles, Search } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/use-translations'
import { useMounted } from '@/lib/use-mounted'
import { useUIStore } from '@/lib/store'
import { defaultLocale } from '@/lib/i18n/config'
import {
  lookupHallucinate,
  lookupLogprobs,
  pickOne,
  thinkingDelay,
} from '@/lib/fixtures'

// ---------------------------------------------------------------------------
// Halluzinations-Labor – zwei Teile:
//   1) Erfindungs-Maschine: frag das ECHTE Modell nach etwas Ausgedachtem.
//      Es antwortet detailliert und selbstsicher – obwohl es das nicht geben
//      kann. „Auflösen" deckt auf: alles frei erfunden.
//   2) Blick in die Wahrscheinlichkeiten (echte Logprobs via /api/predict-next):
//      Bei einem Faktum ragt ein Balken heraus; bei einer Frage, die das Modell
//      nicht wissen kann, sind die Balken flach – trotzdem wählt es eines und
//      schreibt es als sicheren Satz. Brücke zur Next-Token-Seite.
//
// Tokensparen: Die VORGEGEBENEN Beispiele (Chips, Presets) servieren echte,
// vorab geerntete Musterlösungen aus @/lib/fixtures – kein Modell-Aufruf nötig.
// Nur eine FREIE Eingabe fragt noch live das Modell.
// ---------------------------------------------------------------------------

type CuratedId = 'novel' | 'physicist' | 'treaty' | 'effect'

type LpToken = { token: string; probability: number }
type LpData = { topTokens: LpToken[]; remaining: number }

export function HallucinationLab() {
  const t = useTranslations()
  const mounted = useMounted()
  const storeLocale = useUIStore((s) => s.locale)
  const locale = mounted ? storeLocale : defaultLocale

  const CURATED: { id: CuratedId; label: string; q: string }[] = [
    { id: 'novel', label: t('hl.chip.novel'), q: t('hl.q.novel') },
    { id: 'physicist', label: t('hl.chip.physicist'), q: t('hl.q.physicist') },
    { id: 'treaty', label: t('hl.chip.treaty'), q: t('hl.q.treaty') },
    { id: 'effect', label: t('hl.chip.effect'), q: t('hl.q.effect') },
  ]

  // --- Teil 1: Erfindungs-Maschine -----------------------------------------
  const [activeId, setActiveId] = useState<CuratedId | null>('novel')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [source, setSource] = useState<'curated' | 'free'>('curated')
  const [loading, setLoading] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [freeInput, setFreeInput] = useState('')

  const ask = useCallback(
    async (q: string, src: 'curated' | 'free', id: CuratedId | null) => {
      setLoading(true)
      setRevealed(false)
      setAnswer(null)
      setNotice(null)
      setSource(src)
      setActiveId(id)
      setQuestion(q)

      // Vorgegebenes Beispiel -> echte Musterlösung aus dem Cache (kein API-Aufruf).
      const cached = src === 'curated' ? lookupHallucinate(q) : null
      if (cached && cached.length) {
        await thinkingDelay()
        setAnswer(pickOne(cached))
        setLoading(false)
        return
      }

      // Freie Eingabe (oder unbekanntes Beispiel) -> echtes Modell (in UI-Sprache).
      try {
        const res = await fetch('/api/hallucinate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: q, locale }),
        })
        if (!res.ok) throw new Error(String(res.status))
        const data = await res.json()
        if (!data.text) throw new Error('leer')
        setAnswer(data.text)
      } catch {
        setNotice(t('hl.errorFree'))
      } finally {
        setLoading(false)
      }
    },
    [t, locale],
  )

  // Sofort spielbar: sobald die echte Sprache feststeht (und bei Sprachwechsel),
  // das erste Beispiel in der aktuellen Sprache erfinden lassen. Vor dem Mount
  // läge die Default-Sprache vor → es würden die falschsprachigen Daten geladen.
  useEffect(() => {
    if (!mounted) return
    ask(CURATED[0].q, 'curated', CURATED[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, locale])

  const submitFree = (e: React.FormEvent) => {
    e.preventDefault()
    const q = freeInput.trim()
    if (q.length < 3) return
    ask(q, 'free', null)
  }

  return (
    <div className="space-y-10">
      {/* ===================== Teil 1: Erfindungs-Maschine ==================== */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('hl.part1.title')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('hl.part1.hint')}</p>
        </div>

        {/* Kuratierte Chips */}
        <div className="flex flex-wrap gap-2">
          {CURATED.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => ask(c.q, 'curated', c.id)}
              disabled={loading}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
                source === 'curated' && activeId === c.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Freie Eingabe */}
        <form onSubmit={submitFree} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={freeInput}
            onChange={(e) => setFreeInput(e.target.value)}
            placeholder={t('hl.freePlaceholder')}
            maxLength={140}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" variant="secondary" disabled={loading || freeInput.trim().length < 3}>
            <Search className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {t('hl.ask')}
          </Button>
        </form>

        {/* Antwort */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {question || t('hl.part1.title')}
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-1">
              <p className="leading-relaxed text-foreground">{answer}</p>
            </div>
          )}

          {notice && !loading && (
            <p className="mt-2 text-xs text-muted-foreground">{notice}</p>
          )}
        </div>

        {/* Auflösen / Einordnung */}
        {!loading && answer && (
          <div>
            {source === 'curated' ? (
              !revealed ? (
                <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
                  {t('hl.revealBtn')}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 rounded-lg border border-[hsl(var(--chart-3)/0.5)] bg-[hsl(var(--chart-3)/0.12)] p-4"
                >
                  <AlertTriangle
                    className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--chart-3))]"
                    aria-hidden="true"
                  />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-foreground">{t('hl.reveal.title')}</p>
                    <p className="text-muted-foreground">{t('hl.reveal.body')}</p>
                  </div>
                </motion.div>
              )
            ) : (
              <div className="flex gap-3 rounded-lg border bg-muted/40 p-4">
                <Search className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{t('hl.freeNote')}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===================== Teil 2: Wahrscheinlichkeiten ================== */}
      <LogprobPeek />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Teil 2: echte Erst-Token-Verteilung für zwei Fälle – „weiss" vs. „rät".
// ---------------------------------------------------------------------------
function LogprobPeek() {
  const t = useTranslations()
  const mounted = useMounted()
  const storeLocale = useUIStore((s) => s.locale)
  const locale = mounted ? storeLocale : defaultLocale
  const PRESETS: { id: 'known' | 'guess'; label: string; prompt: string; verdict: string }[] = [
    { id: 'known', label: t('hl.lp.known.label'), prompt: t('hl.lp.known.prompt'), verdict: t('hl.lp.known.verdict') },
    { id: 'guess', label: t('hl.lp.guess.label'), prompt: t('hl.lp.guess.prompt'), verdict: t('hl.lp.guess.verdict') },
  ]

  const [id, setId] = useState<'known' | 'guess'>('known')
  const [data, setData] = useState<LpData | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (preset: typeof PRESETS[number]) => {
    setLoading(true)
    setData(null)

    // Vorgegebenes Preset -> echte, vorab geerntete Verteilung (kein API-Aufruf).
    const cached = lookupLogprobs(preset.prompt)
    if (cached) {
      await thinkingDelay()
      setData({ topTokens: cached.topTokens.slice(0, 5), remaining: cached.remainingProbability })
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/predict-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: preset.prompt }),
      })
      const d = await res.json()
      setData({
        topTokens: (d.topTokens ?? []).slice(0, 5),
        remaining: d.remainingProbability ?? 0,
      })
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Erst nach dem Mount laden, wenn die echte Sprache feststeht (und bei
  // Sprachwechsel neu) – sonst würde die Default-Sprache geladen und die Balken
  // zeigten die falsche Sprache. Bei Sprachwechsel zurück auf das erste Preset.
  useEffect(() => {
    if (!mounted) return
    setId('known')
    load(PRESETS[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, locale])

  const active = PRESETS.find((p) => p.id === id)!
  const topProb = data?.topTokens[0]?.probability ?? 0

  return (
    <section className="space-y-4 border-t pt-8">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{t('hl.part2.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('hl.part2.hint')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setId(p.id)
              load(p)
            }}
            disabled={loading}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
              id === p.id ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-3 font-mono text-sm">
          {active.prompt} <span className="text-muted-foreground">▮</span>
        </p>

        {loading ? (
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : data && data.topTokens.length > 0 ? (
          <div className="space-y-1.5">
            {data.topTokens.map((tk, i) => {
              const pct = tk.probability * 100
              return (
                <div key={`${tk.token}-${i}`} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate font-mono text-sm font-semibold">
                    {tk.token.replace(/ /g, '␣')}
                  </span>
                  <span className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                    <span
                      className={`absolute inset-y-0 left-0 rounded transition-[width] duration-500 ${
                        i === 0 ? 'bg-primary' : 'bg-primary/40'
                      }`}
                      style={{ width: `${Math.max(pct, 1.5)}%` }}
                    />
                  </span>
                  <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              )
            })}
            <div className="flex items-center gap-3 opacity-70">
              <span className="w-28 shrink-0 truncate font-mono text-sm text-muted-foreground">…</span>
              <span className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                <span
                  className="absolute inset-y-0 left-0 rounded bg-muted-foreground/40"
                  style={{ width: `${Math.max(data.remaining * 100, 1.5)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                {(data.remaining * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('hl.lp.unavailable')}</p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!loading && data && data.topTokens.length > 0 && (
          <motion.p
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            <span className="font-semibold text-foreground">
              {id === 'known'
                ? `${(topProb * 100).toFixed(0)}% – ${t('hl.lp.knownTag')}`
                : t('hl.lp.guessTag')}
            </span>{' '}
            {active.verdict}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}
