'use client'

// ---------------------------------------------------------------------------
// Live-Training eines winzigen, echten Sprachmodells (model.ts / trainer.ts).
// Hauptansichten erzählen eine Geschichte: der Fehler fällt, die Vorhersage
// wird spitz (wie auf der Next-Token-Seite), aus Zufall werden echte Wörter.
// „Mehr Einblicke" öffnet zwei Vertiefungen für Interessierte: die gelernten
// Zeichen-Embeddings (Brücke zur Embeddings-Seite) und ein konkretes
// Trainingsbeispiel (vorhersagen & korrigieren an einem Fall).
//
// Modell in Refs; Training über requestAnimationFrame mit Schritt-Budget pro
// Frame (Tempo bremst bewusst). Offen — Play läuft weiter, „+50"/„+500" machen
// kleine Schritte. Nur gedrosselte Snapshots in den React-State.
// Interne Strings DE inline (Viz-Konvention, EN-Migration in Thread 9).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { PlayIcon, PauseIcon, ReloadIcon, ShuffleIcon, PlusIcon, CheckIcon } from '@radix-ui/react-icons'
import { useMounted } from '@/lib/use-mounted'
import { type Corpus, CORPORA, corpusWords, buildCustomCorpus } from '@/lib/mini-llm/corpora'
import { type Distribution, type EmbeddingPoint, type ExampleProbe, Trainer } from '@/lib/mini-llm/trainer'

// Schritte pro Frame je Tempo (Bruchwerte via Akkumulator → echte Zeitlupe).
const SPF: Record<Speed, number> = { slow: 0.25, normal: 6, turbo: 60 }
const INCREMENT_SPF = 6 // „+N" läuft tempo-unabhängig zügig
const EVAL_EVERY = 100
const UI_MS = 90
const SAMPLE_N = 8

type Speed = 'slow' | 'normal' | 'turbo'
const SPEED_LABEL: Record<Speed, string> = { slow: 'Zeitlupe', normal: 'Normal', turbo: 'Turbo' }
const INCREMENTS = [50, 500] as const
const VOWELS = new Set('aeiouäöü'.split(''))

const DEFAULT_CUSTOM =
  'apfel banane birne kirsche pflaume traube erdbeere himbeere brombeere zitrone orange mandarine ananas melone pfirsich aprikose kiwi mango feige dattel walnuss haselnuss mandel karotte gurke tomate kartoffel zwiebel paprika kürbis spinat salat brokkoli erbse bohne linse pilz kohl rettich spargel'

interface CurvePoint {
  x: number
  y: number
}
interface Example {
  context: string
  target: string
}

// Das am besten lernbare Beispiel im Korpus suchen: ein 3-Zeichen-Kontext, auf
// den im Korpus fast immer dasselbe nächste Zeichen folgt → der p(richtig)-
// Balken kann sichtbar hochgehen.
function deriveExample(words: string[]): Example {
  const stat: Record<string, Record<string, number>> = {}
  for (const w of words) {
    for (let i = 3; i < w.length; i++) {
      const ctx = w.slice(i - 3, i)
      const ch = w[i]
      ;(stat[ctx] ??= {})[ch] = (stat[ctx][ch] ?? 0) + 1
    }
  }
  let best: Example = { context: '', target: '' }
  let bestScore = -1
  for (const [ctx, chars] of Object.entries(stat)) {
    let total = 0
    let topCh = ''
    let topN = 0
    for (const [ch, n] of Object.entries(chars)) {
      total += n
      if (n > topN) {
        topN = n
        topCh = ch
      }
    }
    const score = topN * (topN / total) // Häufigkeit × Reinheit
    if (total >= 2 && score > bestScore) {
      bestScore = score
      best = { context: ctx, target: topCh }
    }
  }
  if (best.target) return best
  // Fallback: erstes brauchbares Wort
  const w = words.find((x) => x.length >= 2) ?? words[0] ?? 'der'
  const ctxLen = Math.min(3, w.length - 1)
  return { context: w.slice(0, ctxLen), target: w[ctxLen] ?? '' }
}

export function MiniTraining() {
  const mounted = useMounted()

  const trainerRef = useRef<Trainer | null>(null)
  const rafRef = useRef<number>(0)
  const runningRef = useRef(false)
  const speedRef = useRef<Speed>('normal')
  const prefixRef = useRef('')
  const tempRef = useRef(0.9)
  const showMoreRef = useRef(false)
  const exampleRef = useRef<Example>({ context: '', target: '' })
  const targetRef = useRef<number | null>(null)
  const accumRef = useRef(0)
  const curveRef = useRef<CurvePoint[]>([])
  const lastUiRef = useRef(0)

  const [corpusKey, setCorpusKey] = useState('woerter')
  const [customCorpus, setCustomCorpus] = useState<Corpus | null>(null)
  const [customText, setCustomText] = useState(DEFAULT_CUSTOM)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState<Speed>('normal')
  const [step, setStep] = useState(0)
  const [currentLoss, setCurrentLoss] = useState(0)
  const [uniformLoss, setUniformLoss] = useState(0)
  const [lossCurve, setLossCurve] = useState<CurvePoint[]>([])
  const [samples, setSamples] = useState<string[]>([])
  const [temperature, setTemperature] = useState(0.9)
  const [prefix, setPrefix] = useState('')
  const [dist, setDist] = useState<Distribution>({ top: [], rest: 0 })
  const [showData, setShowData] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [embPts, setEmbPts] = useState<EmbeddingPoint[]>([])
  const [probe, setProbe] = useState<ExampleProbe | null>(null)
  const [example, setExample] = useState<Example>({ context: '', target: '' })

  const corpus: Corpus =
    corpusKey === 'eigene'
      ? customCorpus ?? { key: 'eigene', label: 'Eigene', text: '', prefixes: [''] }
      : CORPORA.find((c) => c.key === corpusKey) ?? CORPORA[0]
  const words = useMemo(() => corpusWords(corpus), [corpus])
  const wordSet = useMemo(() => new Set(words), [words])

  const pushUi = useCallback((tr: Trainer) => {
    setStep(tr.step)
    setCurrentLoss(tr.evaluate())
    setLossCurve([...curveRef.current])
    setSamples(tr.samples(SAMPLE_N, tempRef.current))
    setDist(tr.distribution(prefixRef.current))
    if (showMoreRef.current) {
      setEmbPts(tr.embedding2D())
      setProbe(tr.probeExample(exampleRef.current.context, exampleRef.current.target))
    }
  }, [])

  // Frisches, untrainiertes Modell auf einem Korpus aufsetzen.
  const initTrainer = useCallback(
    (c: Corpus) => {
      cancelAnimationFrame(rafRef.current)
      runningRef.current = false
      targetRef.current = null
      accumRef.current = 0
      const tr = new Trainer(c)
      trainerRef.current = tr
      const ex = deriveExample(corpusWords(c))
      exampleRef.current = ex
      curveRef.current = [{ x: 0, y: tr.evaluate() }]
      prefixRef.current = ''
      setRunning(false)
      setStep(0)
      setUniformLoss(tr.uniformLoss())
      setCurrentLoss(curveRef.current[0].y)
      setLossCurve([...curveRef.current])
      setSamples(tr.samples(SAMPLE_N, tempRef.current))
      setPrefix('')
      setDist(tr.distribution(''))
      setExample(ex)
      if (showMoreRef.current) {
        setEmbPts(tr.embedding2D())
        setProbe(tr.probeExample(ex.context, ex.target))
      }
      return tr
    },
    [],
  )

  const loop = useCallback(() => {
    const tr = trainerRef.current
    if (!tr || !runningRef.current) return
    const target = targetRef.current
    accumRef.current += target == null ? SPF[speedRef.current] : INCREMENT_SPF
    let n = Math.floor(accumRef.current)
    accumRef.current -= n
    if (target != null) n = Math.min(n, target - tr.step)
    const before = tr.step
    if (n > 0) tr.runSteps(n)
    if (Math.floor(tr.step / EVAL_EVERY) > Math.floor(before / EVAL_EVERY)) {
      curveRef.current.push({ x: tr.step, y: tr.evaluate() })
    }
    const reachedTarget = target != null && tr.step >= target
    const now = performance.now()
    if (now - lastUiRef.current > UI_MS || reachedTarget) {
      lastUiRef.current = now
      pushUi(tr)
    }
    if (reachedTarget) {
      runningRef.current = false
      targetRef.current = null
      accumRef.current = 0
      setRunning(false)
      if (curveRef.current[curveRef.current.length - 1]?.x !== tr.step) {
        curveRef.current.push({ x: tr.step, y: tr.evaluate() })
      }
      pushUi(tr)
      return
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [pushUi])

  useEffect(() => {
    if (mounted) initTrainer(CORPORA[0])
    return () => cancelAnimationFrame(rafRef.current)
  }, [mounted, initTrainer])

  const startLoop = (target: number | null) => {
    if (!trainerRef.current) return
    targetRef.current = target
    accumRef.current = 0
    runningRef.current = true
    setRunning(true)
    lastUiRef.current = performance.now()
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }
  const play = () => startLoop(null)
  const trainMore = (k: number) => startLoop((trainerRef.current?.step ?? 0) + k)

  const pause = () => {
    runningRef.current = false
    targetRef.current = null
    setRunning(false)
    cancelAnimationFrame(rafRef.current)
  }

  const reset = () => initTrainer(corpus)

  const selectCorpus = (key: string) => {
    if (key === corpusKey && key !== 'eigene') return
    setCorpusKey(key)
    if (key === 'eigene') {
      const c = customCorpus ?? buildCustomCorpus(customText)
      setCustomCorpus(c)
      if (corpusWords(c).length >= 2) initTrainer(c)
    } else {
      initTrainer(CORPORA.find((c) => c.key === key) ?? CORPORA[0])
    }
  }

  const applyCustom = () => {
    const c = buildCustomCorpus(customText)
    if (corpusWords(c).length < 2) return
    setCorpusKey('eigene')
    setCustomCorpus(c)
    initTrainer(c)
  }

  const selectSpeed = (s: Speed) => {
    setSpeed(s)
    speedRef.current = s
  }
  const selectPrefix = (p: string) => {
    setPrefix(p)
    prefixRef.current = p
    const tr = trainerRef.current
    if (tr) setDist(tr.distribution(p))
  }
  const changeTemperature = (t: number) => {
    setTemperature(t)
    tempRef.current = t
    const tr = trainerRef.current
    if (tr) setSamples(tr.samples(SAMPLE_N, t))
  }
  const resample = () => {
    const tr = trainerRef.current
    if (tr) setSamples(tr.samples(SAMPLE_N, tempRef.current))
  }
  const toggleMore = () => {
    const next = !showMore
    setShowMore(next)
    showMoreRef.current = next
    const tr = trainerRef.current
    if (next && tr) {
      setEmbPts(tr.embedding2D())
      setProbe(tr.probeExample(exampleRef.current.context, exampleRef.current.target))
    }
  }

  if (!mounted) {
    return <div className="min-h-[460px] animate-pulse rounded-lg bg-muted/40" aria-hidden="true" />
  }

  const status = running
    ? 'Lernt … es dreht bei jedem Schritt an seinen Stellschrauben.'
    : step > 0
      ? 'Pausiert — du kannst weitertrainieren.'
      : 'Noch untrainiert: reiner Zufall. Drück „Trainieren" oder „+500".'
  const learned = uniformLoss > 0 ? Math.max(0, Math.min(1, (uniformLoss - currentLoss) / (uniformLoss - 0.8))) : 0
  const novelCount = samples.filter((w) => w && !wordSet.has(w)).length
  const tempHint =
    temperature <= 0.5 ? 'brav: meist häufige Wörter' : temperature >= 1.2 ? 'wild: auch seltene Buchstaben' : 'ausgewogen'

  return (
    <div className="space-y-6">
      {/* ---- Steuerung ---- */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Lerndaten:</span>
            <div className="inline-flex rounded-lg border p-0.5">
              {[...CORPORA, { key: 'eigene', label: 'Eigene' }].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => selectCorpus(c.key)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    c.key === corpusKey
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-sm text-muted-foreground">Tempo:</span>
            <div className="inline-flex rounded-lg border p-0.5">
              {(['slow', 'normal', 'turbo'] as Speed[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => selectSpeed(s)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    s === speed ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {SPEED_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Eigene Lerndaten */}
        {corpusKey === 'eigene' && (
          <div className="rounded-lg border bg-background/40 p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Gib eigene Wörter ein (durch Leerzeichen getrennt) — das Modell lernt nur daraus. Probier Tiernamen,
              Städte oder Fantasiewörter.
            </p>
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              className="font-mono text-sm"
              placeholder="apfel banane kirsche …"
            />
            <div className="mt-2 flex items-center gap-2">
              <Button onClick={applyCustom} size="sm">
                Übernehmen &amp; neu starten
              </Button>
              <span className="text-xs text-muted-foreground">
                {buildCustomCorpus(customText).text.split(' ').filter(Boolean).length} Wörter
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {running ? (
            <Button onClick={pause} variant="secondary" className="gap-1.5">
              <PauseIcon /> Pause
            </Button>
          ) : (
            <Button onClick={play} className="gap-1.5">
              <PlayIcon /> {step > 0 ? 'Weiter' : 'Trainieren'}
            </Button>
          )}
          {INCREMENTS.map((n) => (
            <Button key={n} onClick={() => trainMore(n)} variant="outline" className="gap-1 tabular-nums">
              <PlusIcon className="h-3.5 w-3.5" />
              {n}
            </Button>
          ))}
          <Button onClick={reset} variant="ghost" size="icon" aria-label="Zurücksetzen" title="Zurücksetzen">
            <ReloadIcon />
          </Button>
        </div>
      </div>

      {/* ---- Fortschritt + Status ---- */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${Math.round(learned * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{status}</span>
          <span className="tabular-nums">Schritt {step.toLocaleString('de-CH')}</span>
        </div>
      </div>

      {/* ---- Textproben (der Aha-Moment) ---- */}
      <section className="rounded-lg border bg-background/40 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Was das Modell gerade schreibt</h3>
          <div className="flex items-center gap-1">
            <Button onClick={() => setShowData((v) => !v)} variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              {showData ? 'Lerndaten ausblenden' : 'Lerndaten ansehen'}
            </Button>
            <Button onClick={resample} variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              <ShuffleIcon className="h-3 w-3" /> Neu würfeln
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {samples.map((w, i) => {
            const novel = w && !wordSet.has(w)
            return (
              <span
                key={i}
                className={`rounded-md px-2.5 py-1 font-mono text-sm lowercase tabular-nums ${
                  novel ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'
                }`}
              >
                {w || '·'}
              </span>
            )
          })}
        </div>

        {/* Temperatur */}
        <div className="mt-4 flex items-center gap-3">
          <span className="shrink-0 text-xs text-muted-foreground">Temperatur</span>
          <Slider
            value={[temperature]}
            onValueChange={([v]) => changeTemperature(v)}
            min={0.3}
            max={1.5}
            step={0.1}
            aria-label="Temperatur"
            className="max-w-[200px]"
          />
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {temperature.toFixed(1)} · {tempHint}
          </span>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Frisch aus dem Modell gezogen — Zeichen für Zeichen.{' '}
          {novelCount > 0 ? (
            <>
              <span className="text-primary">Blau</span> = nicht in den Lerndaten, also selbst zusammengesetzt.
            </>
          ) : (
            'Anfangs Kauderwelsch, dann tauchen echte Wörter auf.'
          )}
        </p>

        {showData && (
          <div className="mt-3 border-t pt-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Das Modell hat nur diese {words.length.toLocaleString('de-CH')} {corpus.label} gesehen:
            </p>
            <div className="flex max-h-40 flex-wrap gap-x-2 gap-y-1 overflow-y-auto rounded-md bg-muted/40 p-2">
              {words.map((w, i) => (
                <span key={i} className="font-mono text-xs lowercase text-muted-foreground">
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---- Loss + Verteilung ---- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border bg-background/40 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Fehler (Loss)</h3>
            <span className="font-mono text-sm tabular-nums text-primary">{currentLoss.toFixed(2)}</span>
          </div>
          <LossCurve points={lossCurve} xMax={Math.max(2000, step)} uniformLoss={uniformLoss} />
          <p className="mt-2 text-xs text-muted-foreground">
            Der Fehler misst, wie schlecht das nächste Zeichen vorhergesagt wird. Beim blossen Raten läge er bei{' '}
            {uniformLoss.toFixed(2)} und sinkt, während das Modell lernt.
          </p>
        </section>

        <section className="rounded-lg border bg-background/40 p-4">
          <h3 className="mb-2 text-sm font-semibold">Vorhersage fürs nächste Zeichen</h3>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {corpus.prefixes.map((p) => (
              <button
                key={p || '∅'}
                type="button"
                onClick={() => selectPrefix(p)}
                className={`rounded-md border px-2 py-0.5 font-mono text-xs transition-colors ${
                  p === prefix ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {p === '' ? 'Wortanfang' : `nach „${p}"`}
              </button>
            ))}
          </div>
          <DistributionBars dist={dist} />
          <p className="mt-2 text-xs text-muted-foreground">
            Dieselbe Idee wie auf der Next-Token-Seite — nur fürs nächste <em>Zeichen</em>. Anfangs flach (alles gleich
            wahrscheinlich), nach dem Training spitz.
          </p>
        </section>
      </div>

      {/* ---- Mehr Einblicke (für Interessierte) ---- */}
      <div className="rounded-lg border bg-background/40">
        <button
          type="button"
          onClick={toggleMore}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          <span>Mehr Einblicke {showMore ? '' : '— für Interessierte'}</span>
          <span className="text-muted-foreground">{showMore ? '–' : '+'}</span>
        </button>
        {showMore && (
          <div className="grid gap-5 border-t p-4 lg:grid-cols-2">
            {/* Zeichen-Embeddings */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">Die Embeddings der Buchstaben</h3>
              <EmbeddingMap points={embPts} />
              <p className="mt-2 text-xs text-muted-foreground">
                Jeder Buchstabe bekommt eine eigene Zahlenliste — hier in 2D. Während des Trainings ordnen sie sich;{' '}
                <span className="text-[hsl(var(--chart-2))]">Vokale</span> wandern oft zusammen. Genau das sind
                Embeddings, eine Station vorher.
              </p>
            </div>
            {/* Ein Trainingsbeispiel */}
            <div>
              <h3 className="mb-2 text-sm font-semibold">Ein Trainingsbeispiel</h3>
              <ExamplePanel probe={probe} example={example} />
              <p className="mt-2 text-xs text-muted-foreground">
                So lernt das Modell: aus „{example.context}" soll „{example.target}" werden. Es vergleicht seine
                Vorhersage mit der Wahrheit und rückt die Wahrscheinlichkeit Schritt für Schritt höher.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Loss-Kurve als schlichtes SVG ------------------------------------------
function LossCurve({ points, xMax, uniformLoss }: { points: CurvePoint[]; xMax: number; uniformLoss: number }) {
  const W = 320
  const Hgt = 120
  const pad = 6
  const yMax = Math.max(uniformLoss * 1.08, 0.5)
  const sx = (x: number) => pad + (x / xMax) * (W - 2 * pad)
  const sy = (y: number) => pad + (1 - Math.min(y, yMax) / yMax) * (Hgt - 2 * pad)
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ')
  const area =
    points.length > 1
      ? `${line} L ${sx(points[points.length - 1].x).toFixed(1)} ${Hgt - pad} L ${sx(points[0].x).toFixed(1)} ${Hgt - pad} Z`
      : ''
  const last = points[points.length - 1]
  const yRate = sy(uniformLoss)

  return (
    <svg viewBox={`0 0 ${W} ${Hgt}`} className="h-32 w-full" preserveAspectRatio="none" role="img" aria-label="Lernkurve">
      <line
        x1={pad}
        x2={W - pad}
        y1={yRate}
        y2={yRate}
        className="stroke-muted-foreground/40"
        strokeWidth={1}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
      />
      {area && <path d={area} className="fill-primary/10" />}
      {points.length > 1 && (
        <path
          d={line}
          className="stroke-primary"
          strokeWidth={2}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      )}
      {last && <circle cx={sx(last.x)} cy={sy(last.y)} r={3} className="fill-primary" />}
    </svg>
  )
}

// --- Verteilungs-Balken (Bildsprache der Next-Token-Seite) ------------------
function DistributionBars({ dist }: { dist: Distribution }) {
  const label = (ch: string) => (ch === '.' ? 'Ende' : ch === ' ' ? '␣' : ch)
  return (
    <div className="space-y-1">
      {dist.top.map((d, i) => {
        const pct = d.p * 100
        return (
          <div key={`${d.char}-${i}`} className="flex items-center gap-2">
            <span className="w-10 shrink-0 truncate font-mono text-xs font-semibold">{label(d.char)}</span>
            <span className="relative h-4 flex-1 overflow-hidden rounded bg-muted">
              <span
                className="absolute inset-y-0 left-0 rounded bg-primary transition-[width] duration-200"
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {pct.toFixed(0)}%
            </span>
          </div>
        )
      })}
      {dist.rest > 0.0001 && (
        <div className="flex items-center gap-2 opacity-70">
          <span className="w-10 shrink-0 truncate font-mono text-xs text-muted-foreground">…</span>
          <span className="relative h-4 flex-1 overflow-hidden rounded bg-muted">
            <span
              className="absolute inset-y-0 left-0 rounded bg-muted-foreground/40"
              style={{ width: `${Math.max(dist.rest * 100, 1)}%` }}
            />
          </span>
          <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
            {(dist.rest * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}

// --- 2D-Karte der gelernten Zeichen-Embeddings ------------------------------
function EmbeddingMap({ points }: { points: EmbeddingPoint[] }) {
  const S = 160
  const pad = 14
  const sx = (x: number) => pad + ((x + 1) / 2) * (S - 2 * pad)
  const sy = (y: number) => pad + ((1 - y) / 2) * (S - 2 * pad)
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="h-44 w-full" role="img" aria-label="Zeichen-Embeddings">
      {points.map((p) =>
        p.char === '.' ? null : (
          <text
            key={p.char}
            x={sx(p.x)}
            y={sy(p.y)}
            textAnchor="middle"
            dominantBaseline="central"
            className={`font-mono ${VOWELS.has(p.char) ? 'fill-[hsl(var(--chart-2))]' : 'fill-primary'}`}
            style={{ fontSize: 9, fontWeight: 600 }}
          >
            {p.char}
          </text>
        ),
      )}
    </svg>
  )
}

// --- Ein konkretes Trainingsbeispiel: Vorhersage vs. Wahrheit ---------------
function ExamplePanel({ probe, example }: { probe: ExampleProbe | null; example: Example }) {
  const pct = probe ? probe.pTarget * 100 : 0
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 font-mono text-sm">
        <span className="rounded bg-muted px-2 py-1">{example.context || '∅'}</span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded bg-[hsl(var(--chart-2)/0.15)] px-2 py-1 font-semibold text-[hsl(var(--chart-2))]">
          {example.target || '?'}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          tippt auf{' '}
          <span className={`font-semibold ${probe?.correct ? 'text-[hsl(var(--chart-2))]' : 'text-foreground'}`}>
            „{probe?.topChar ?? '…'}"
          </span>
          {probe?.correct && <CheckIcon className="ml-0.5 inline h-3.5 w-3.5 text-[hsl(var(--chart-2))]" />}
        </span>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>
            Wahrscheinlichkeit für „{example.target}"
          </span>
          <span className="font-mono tabular-nums">{pct.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded bg-muted">
          <div
            className="h-full rounded bg-[hsl(var(--chart-2))] transition-[width] duration-200"
            style={{ width: `${Math.max(pct, 1)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
