'use client'

// ---------------------------------------------------------------------------
// Perzeptron-Labor – interaktiv à la TensorFlow Playground, aber für EIN Neuron.
// Links der Knoten-Graph (Eingänge → Neuron, Kantendicke/-farbe = Gewicht),
// rechts die Entscheidungsfläche (zwei Halbebenen + Trennlinie, die vier
// Beispiel-Ecken). Unten: die „Rechnung" für den gewählten Fall, die Regler
// (ganzzahlige Gewichte, Schwelle) und Schritt/Trainieren nach der
// Perzeptron-Lernregel. Als Knoten-Graph gebaut, damit später das MLP nur eine
// zweite Schicht ist.
//
// Interne Strings DE inline (Viz-Konvention). Modell in Refs; Auto-Training
// über requestAnimationFrame mit Zeit-Gate (ein Lernschritt alle STEP_MS).
// ---------------------------------------------------------------------------

import { type MouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, ReloadIcon, MagnifyingGlassIcon, UpdateIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMounted } from '@/lib/use-mounted'
import { useTranslations } from '@/lib/i18n/use-translations'
import {
  type DataPoint,
  type Neuron,
  countCorrect,
  fires,
  nextMistake,
  preActivation,
  trainPoint,
} from '@/lib/perceptron/model'
import {
  PRESETS,
  POINTS_PRESET,
  type Preset,
  getPreset,
  separablePoints,
  entangledPoints,
} from '@/lib/perceptron/presets'
import { ExplainCard, type ExplainKey } from '@/components/visualizations/activation-explainer'

const STEP_MS = 600 // Tempo eines sichtbaren Lernschritts (lesbar mitlaufen)
const STEP_MS_PTS = 130 // Punkte-Modus: viele kleine Schritte → Linie zügig einschwenken
const MAX_UPDATES = 60 // harte Sicherheitskappe (Logik/Alltag: 4 Ecken)
const STALL = 10 // so viele Schritte ohne Verbesserung → „nicht trennbar" (XOR)
const MAX_UPDATES_PTS = 300 // Punkte-Modus: mehr Daten, mehr Schritte erlaubt
const STALL_PTS = 40 // Punkte-Modus: längeres Plateau, bevor „nicht trennbar"
const W_MIN = -3
const W_MAX = 3
const T_MIN = -4
const T_MAX = 4

// Domäne der Entscheidungsfläche (etwas Rand um das Einheitsquadrat).
const DMIN = -0.35
const DMAX = 1.35

// Ganze Zahlen ohne Nachkomma, reelle (Punkte-Modus) mit einer Stelle.
const fmtNum = (v: number): string => (Number.isInteger(v) ? `${v}` : v.toFixed(1))
const round2 = (v: number): number => Math.round(v * 100) / 100
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

// Was bei einem Lernschritt passiert ist (für die „Warum"-Erklärung).
interface StepInfo {
  point: DataPoint
  output: 0 | 1
  target: 0 | 1
  e: number
  before: Neuron
  after: Neuron
}

// Ein geprüfter, noch NICHT korrigierter Fall (Zwischenschritt „Fehler").
interface PendingInfo {
  point: DataPoint
  output: 0 | 1
  target: 0 | 1
}

type Translate = (key: string) => string

// Löst die i18n-Keys eines Presets in die aktive Sprache auf. Reine Symbole
// ('A','B','0','1') sind keine Keys → t() reicht sie unverändert durch.
const localizePreset = (p: Preset, t: Translate): Preset => ({
  ...p,
  name: t(p.name),
  features: [t(p.features[0]), t(p.features[1])],
  valueLabels: [
    [t(p.valueLabels[0][0]), t(p.valueLabels[0][1])],
    [t(p.valueLabels[1][0]), t(p.valueLabels[1][1])],
  ],
  classes: [t(p.classes[0]), t(p.classes[1])],
  blurb: t(p.blurb),
})

export function PerceptronLab() {
  const mounted = useMounted()
  const t = useTranslations()

  const [presetKey, setPresetKey] = useState(PRESETS[0].key)
  const [points, setPoints] = useState<DataPoint[]>(() => separablePoints())
  const [brush, setBrush] = useState<0 | 1>(1)

  const isPoints = presetKey === 'points'
  const preset = localizePreset(isPoints ? POINTS_PRESET : getPreset(presetKey), t)
  const data = isPoints ? points : preset.points

  const [neuron, setNeuron] = useState<Neuron>(preset.init)
  const [selectedId, setSelectedId] = useState(data[0]?.id ?? '')
  const [running, setRunning] = useState(false)
  const [updates, setUpdates] = useState(0)
  const [stuck, setStuck] = useState(false)
  const [lastStep, setLastStep] = useState<StepInfo | null>(null)
  const [phase, setPhase] = useState<'idle' | 'checked'>('idle')
  const [pending, setPending] = useState<PendingInfo | null>(null)
  const [explain, setExplain] = useState<ExplainKey | null>(null)

  // Refs für die rAF-Schleife (lesen stets den neuesten Stand).
  const neuronRef = useRef(neuron)
  const dataRef = useRef(data)
  const runningRef = useRef(false)
  const cursorRef = useRef(0)
  const updatesRef = useRef(0)
  const bestRef = useRef(0)
  const stallRef = useRef(0)
  const rafRef = useRef(0)
  const lastStepRef = useRef(0)
  const phaseRef = useRef<'idle' | 'checked'>('idle')
  const pendingIndexRef = useRef(0)
  const pointsModeRef = useRef(false)
  const idCounterRef = useRef(1000)
  neuronRef.current = neuron
  dataRef.current = data
  pointsModeRef.current = isPoints

  const correct = countCorrect(neuron, data)
  const separated = data.length > 0 && correct === data.length
  const selected = data.find((p) => p.id === selectedId) ?? data[0]

  const stopLoop = useCallback(() => {
    runningRef.current = false
    setRunning(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  // Ein halber Schritt: erst PRÜFEN (Fehler zeigen, Gewichte unverändert),
  // beim nächsten Aufruf KORRIGIEREN (Lernregel anwenden). So sieht man den
  // Fehler, bevor er repariert wird.
  const advance = useCallback((): 'checked' | 'corrected' | 'separated' | 'stuck' => {
    const n = neuronRef.current
    const d = dataRef.current
    if (phaseRef.current === 'idle') {
      // PRÜFEN: nächsten falschen Fall suchen und zeigen (noch nicht ändern).
      if (countCorrect(n, d) === d.length) return 'separated'
      const i = nextMistake(n, d, cursorRef.current)
      if (i === -1) return 'separated'
      const p = d[i]
      pendingIndexRef.current = i
      phaseRef.current = 'checked'
      setPhase('checked')
      setPending({ point: p, output: fires(n, p.x), target: p.label })
      setLastStep(null)
      setSelectedId(p.id)
      return 'checked'
    }
    // KORRIGIEREN: Lernregel auf den geprüften Fall anwenden.
    const i = pendingIndexRef.current
    const p = d[i]
    const output = fires(n, p.x)
    const res = trainPoint(n, p)
    neuronRef.current = res.neuron
    cursorRef.current = (i + 1) % d.length
    updatesRef.current += 1
    phaseRef.current = 'idle'
    setNeuron(res.neuron)
    setUpdates(updatesRef.current)
    setPhase('idle')
    setPending(null)
    setLastStep({ point: p, output, target: p.label, e: res.error, before: n, after: res.neuron })
    setSelectedId(p.id)
    const c = countCorrect(res.neuron, d)
    if (c === d.length) return 'separated'
    if (c > bestRef.current) {
      bestRef.current = c
      stallRef.current = 0
    } else {
      stallRef.current += 1
    }
    const maxU = pointsModeRef.current ? MAX_UPDATES_PTS : MAX_UPDATES
    const maxStall = pointsModeRef.current ? STALL_PTS : STALL
    return updatesRef.current >= maxU || stallRef.current >= maxStall ? 'stuck' : 'corrected'
  }, [])

  // Punkte-Modus: ein voller Korrektur-Schritt pro Tick (kein Prüf-Halt) – die
  // Trennlinie soll flott einschwenken, nicht jeden Punkt einzeln vorrechnen.
  const fastUpdate = useCallback((): 'corrected' | 'separated' | 'stuck' => {
    const n = neuronRef.current
    const d = dataRef.current
    if (countCorrect(n, d) === d.length) return 'separated'
    const i = nextMistake(n, d, cursorRef.current)
    if (i === -1) return 'separated'
    const res = trainPoint(n, d[i])
    neuronRef.current = res.neuron
    cursorRef.current = (i + 1) % d.length
    updatesRef.current += 1
    setNeuron(res.neuron)
    setUpdates(updatesRef.current)
    const c = countCorrect(res.neuron, d)
    if (c === d.length) return 'separated'
    if (c > bestRef.current) {
      bestRef.current = c
      stallRef.current = 0
    } else {
      stallRef.current += 1
    }
    const maxU = pointsModeRef.current ? MAX_UPDATES_PTS : MAX_UPDATES
    const maxStall = pointsModeRef.current ? STALL_PTS : STALL
    return updatesRef.current >= maxU || stallRef.current >= maxStall ? 'stuck' : 'corrected'
  }, [])

  const loop = useCallback(() => {
    if (!runningRef.current) return
    const now = performance.now()
    const stepMs = pointsModeRef.current ? STEP_MS_PTS : STEP_MS
    if (now - lastStepRef.current >= stepMs) {
      lastStepRef.current = now
      const r = pointsModeRef.current ? fastUpdate() : advance()
      if (r === 'separated') {
        stopLoop()
        return
      }
      if (r === 'stuck') {
        setStuck(true)
        stopLoop()
        return
      }
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [advance, fastUpdate, stopLoop])

  const play = () => {
    if (separated) return
    setStuck(false)
    setLastStep(null)
    setPending(null)
    setPhase('idle')
    phaseRef.current = 'idle'
    bestRef.current = countCorrect(neuronRef.current, dataRef.current)
    stallRef.current = 0
    runningRef.current = true
    setRunning(true)
    lastStepRef.current = performance.now() - STEP_MS // erster Schritt sofort
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }

  const stepClick = () => {
    if (separated) return
    const r = advance()
    if (r === 'stuck') setStuck(true)
  }

  const resetStepState = () => {
    phaseRef.current = 'idle'
    setPhase('idle')
    setPending(null)
    setLastStep(null)
    setStuck(false)
    bestRef.current = 0
    stallRef.current = 0
  }

  const selectPreset = (key: string) => {
    stopLoop()
    setPresetKey(key)
    cursorRef.current = 0
    updatesRef.current = 0
    setUpdates(0)
    resetStepState()
    const init = key === 'points' ? POINTS_PRESET.init : getPreset(key).init
    setNeuron(init)
    neuronRef.current = init
    setSelectedId(key === 'points' ? points[0]?.id ?? '' : getPreset(key).points[0].id)
  }

  const reset = () => {
    stopLoop()
    setNeuron(preset.init)
    neuronRef.current = preset.init
    cursorRef.current = 0
    updatesRef.current = 0
    setUpdates(0)
    resetStepState()
  }

  const setWeight = (idx: number, value: number) => {
    stopLoop()
    resetStepState()
    setNeuron((n) => ({ ...n, w: n.w.map((wi, i) => (i === idx ? value : wi)) }))
  }
  const setThreshold = (theta: number) => {
    stopLoop()
    resetStepState()
    setNeuron((n) => ({ ...n, b: -theta }))
  }

  // --- Punkte-Modus: eigene Daten setzen / entfernen / laden ---
  const addPoint = (x1: number, x2: number) => {
    stopLoop()
    resetStepState()
    const id = `pt${idCounterRef.current++}`
    setPoints((prev) => [...prev, { id, x: [round2(x1), round2(x2)], label: brush }])
    setSelectedId(id)
  }
  const removePoint = (id: string) => {
    stopLoop()
    resetStepState()
    setPoints((prev) => prev.filter((p) => p.id !== id))
  }
  const loadPoints = (next: DataPoint[]) => {
    stopLoop()
    resetStepState()
    setNeuron(POINTS_PRESET.init)
    neuronRef.current = POINTS_PRESET.init
    cursorRef.current = 0
    updatesRef.current = 0
    setUpdates(0)
    setPoints(next)
    setSelectedId(next[0]?.id ?? '')
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  if (!mounted) {
    return <div className="min-h-[560px] animate-pulse rounded-lg bg-muted/40" aria-hidden="true" />
  }

  const theta = -neuron.b
  const everyday = PRESETS.filter((p) => p.group === 'everyday')
  const logic = PRESETS.filter((p) => p.group === 'logic')

  return (
    <div className="space-y-6">
      {/* ---- Beispiel wählen ---- */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('pl.group.everyday')}</span>
          <div className="inline-flex flex-wrap rounded-lg border p-0.5">
            {everyday.map((p) => (
              <PresetButton key={p.key} active={p.key === presetKey} onClick={() => selectPreset(p.key)}>
                {t(p.name)}
              </PresetButton>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('pl.group.logic')}</span>
          <div className="inline-flex rounded-lg border p-0.5">
            {logic.map((p) => (
              <PresetButton key={p.key} active={p.key === presetKey} onClick={() => selectPreset(p.key)}>
                {t(p.name)}
              </PresetButton>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('pl.group.custom')}</span>
          <div className="inline-flex rounded-lg border p-0.5">
            <PresetButton active={isPoints} onClick={() => selectPreset('points')}>
              {t('pp.points.name')}
            </PresetButton>
          </div>
        </div>
      </div>

      {/* ---- Neuron + Entscheidungsfläche ---- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col rounded-lg border bg-background/40 p-4">
          <h3 className="mb-1 text-sm font-semibold">{t('pl.neuron.title')}</h3>
          <p className="mb-2 text-xs text-muted-foreground">
            {isPoints ? t('pl.neuron.descPoints') : t('pl.neuron.descPick')}
          </p>
          {selected ? (
            <div className="flex flex-1 flex-col justify-center gap-3">
              <NeuronGraph neuron={neuron} point={selected} features={preset.features} classes={preset.classes} onExplain={() => setExplain('sum')} ariaLabel={t('pl.aria.neuron')} />
              {!isPoints && <Rechnung neuron={neuron} point={selected} preset={preset} />}
              <p className="text-center text-xs text-muted-foreground">{t('pl.neuron.explainHint')}</p>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-center text-sm text-muted-foreground">{t('pl.neuron.empty')}</p>
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-background/40 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">{t('pl.surface.title')}</h3>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {t('pl.correct')} {correct}/{data.length}
            </span>
          </div>
          <DecisionSurface
            neuron={neuron}
            data={data}
            features={preset.features}
            selectedId={selectedId}
            onSelect={setSelectedId}
            editable={isPoints}
            onAdd={addPoint}
            onRemove={removePoint}
            ariaLabel={t('pl.surface.title')}
          />
          <Legend classes={preset.classes} editable={isPoints} />
        </section>
      </div>

      {/* ---- Regler (Alltag/Logik) bzw. Punkte-Werkzeuge ---- */}
      {isPoints ? (
        <PointsControls
          brush={brush}
          setBrush={setBrush}
          neuron={neuron}
          classes={preset.classes}
          onSeparable={() => loadPoints(separablePoints())}
          onEntangled={() => loadPoints(entangledPoints())}
          onClear={() => loadPoints([])}
          t={t}
        />
      ) : (
        <div className="grid gap-x-8 gap-y-5 rounded-lg border bg-background/40 p-4 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">{t('pl.weights')}</p>
            <WeightSlider label={preset.features[0]} value={neuron.w[0]} onChange={(v) => setWeight(0, v)} />
            <WeightSlider label={preset.features[1]} value={neuron.w[1]} onChange={(v) => setWeight(1, v)} />
            <p className="text-xs text-muted-foreground">{t('pl.weights.hint')}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">{t('pl.threshold')}</p>
            <WeightSlider label="θ" value={theta} min={T_MIN} max={T_MAX} onChange={setThreshold} />
            <p className="text-xs text-muted-foreground">{t('pl.threshold.hint')}</p>
          </div>
        </div>
      )}

      {/* ---- Lernen ---- */}
      <div className="flex flex-wrap items-center gap-2">
        {running ? (
          <Button onClick={stopLoop} variant="secondary" className="gap-1.5">
            <PauseIcon /> {t('pl.pause')}
          </Button>
        ) : (
          <Button onClick={play} disabled={separated || data.length === 0} className="gap-1.5">
            <PlayIcon /> {t('pl.train')}
          </Button>
        )}
        <Button onClick={stepClick} disabled={separated || running || data.length === 0} variant="outline" className="gap-1.5">
          {phase === 'checked' ? (
            <>
              <UpdateIcon /> {t('pl.correctBtn')}
            </>
          ) : (
            <>
              <MagnifyingGlassIcon /> {t('pl.check')}
            </>
          )}
        </Button>
        <Button onClick={reset} variant="ghost" size="icon" aria-label={t('common.reset')} title={t('common.reset')}>
          <ReloadIcon />
        </Button>
        <span className="ml-1 font-mono text-xs tabular-nums text-muted-foreground">
          {updates} {t('pl.steps')}
        </span>
      </div>

      {/* ---- Status ---- */}
      {separated ? (
        <div className="rounded-lg border border-[hsl(var(--chart-2)/0.4)] bg-[hsl(var(--chart-2)/0.08)] p-4 text-sm">
          <span className="font-semibold text-[hsl(var(--chart-2))]">{t('pl.sep.title')}</span>
          {t('pl.sep.body')}
        </div>
      ) : stuck ? (
        <div className="rounded-lg border border-[hsl(var(--chart-8)/0.4)] bg-[hsl(var(--chart-8)/0.08)] p-4 text-sm">
          <span className="font-semibold text-[hsl(var(--chart-8))]">{t('pl.stuck.title')}</span>
          {t('pl.stuck.body1')}
          <em>{t('pl.stuck.em')}</em>
          {t('pl.stuck.body2')}
        </div>
      ) : pending ? (
        <CheckPanel pending={pending} preset={preset} isPoints={isPoints} t={t} />
      ) : lastStep ? (
        <LernschrittPanel step={lastStep} preset={preset} t={t} />
      ) : (
        <p className="text-sm text-muted-foreground">{preset.blurb}</p>
      )}

      {explain && <ExplainCard which={explain} onClose={() => setExplain(null)} />}
    </div>
  )
}

// === Knoten-Graph: Eingänge → Neuron → Ausgabe (liest links→rechts→unten) ===
function NeuronGraph({
  neuron,
  point,
  features,
  classes,
  onExplain,
  ariaLabel,
}: {
  neuron: Neuron
  point: DataPoint
  features: [string, string]
  classes: [string, string]
  onExplain?: () => void
  ariaLabel: string
}) {
  const W = 320
  const H = 196
  const inX = 104
  const in1Y = 60
  const in2Y = 138
  const outX = 230
  const outY = 99
  const r = 32
  const inR = 20
  const fired = fires(neuron, point.x) === 1
  const answer = fired ? classes[1] : classes[0]
  const answerColor = fired ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
  const pillW = Math.max(58, answer.length * 7.2 + 22)
  const pillY = outY + r + 16

  const edgeColor = (w: number) =>
    w === 0 ? 'hsl(var(--muted-foreground)/0.4)' : w > 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
  const edgeWidth = (w: number) => 1.4 + Math.min(Math.abs(w), 3) * 1.9
  const midX = (inX + outX) / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      {/* Kanten (Farbe/Dicke = Gewicht) */}
      <line x1={inX} y1={in1Y} x2={outX} y2={outY} stroke={edgeColor(neuron.w[0])} strokeWidth={edgeWidth(neuron.w[0])} strokeLinecap="round" />
      <line x1={inX} y1={in2Y} x2={outX} y2={outY} stroke={edgeColor(neuron.w[1])} strokeWidth={edgeWidth(neuron.w[1])} strokeLinecap="round" />
      <WeightTag x={midX} y={(in1Y + outY) / 2} value={neuron.w[0]} />
      <WeightTag x={midX} y={(in2Y + outY) / 2} value={neuron.w[1]} />

      {/* Eingänge: Bezeichnung oben, Wert im Knoten */}
      <InputNode cx={inX} cy={in1Y} value={point.x[0]} label={features[0]} r={inR} />
      <InputNode cx={inX} cy={in2Y} value={point.x[1]} label={features[1]} r={inR} />

      {/* Neuron – deckende Grundfläche zuerst, damit die Kanten nicht durchdrücken,
          dann der halbtransparente Tint (Mischung mit dem Hintergrund bleibt).
          Klickbar: öffnet die Erklärung zu Σ und θ. */}
      <g className={onExplain ? 'cursor-pointer' : undefined} onClick={onExplain}>
        <circle cx={outX} cy={outY} r={r} fill="hsl(var(--background))" />
        <circle
          cx={outX}
          cy={outY}
          r={r}
          fill={fired ? 'hsl(var(--chart-1)/0.18)' : 'hsl(var(--muted))'}
          stroke={fired ? 'hsl(var(--chart-1))' : 'hsl(var(--border))'}
          strokeWidth={fired ? 2.5 : 1.5}
        />
        <text x={outX} y={outY - 4} textAnchor="middle" className="fill-foreground" style={{ fontSize: 13, fontWeight: 600 }}>
          Σ &gt; θ
        </text>
        <text x={outX} y={outY + 12} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
          θ = {fmtNum(-neuron.b)}
        </text>
        {onExplain && (
          <>
            <circle cx={outX + r - 5} cy={outY - r + 5} r={7.5} fill="hsl(var(--primary))" />
            <text x={outX + r - 5} y={outY - r + 5} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--primary-foreground))" style={{ fontSize: 10, fontWeight: 700 }}>
              ?
            </text>
          </>
        )}
      </g>

      {/* Pfeil zur Ausgabe */}
      <line x1={outX} y1={outY + r} x2={outX} y2={pillY} stroke="hsl(var(--muted-foreground)/0.55)" strokeWidth={1.5} />
      <path d={`M ${outX - 4} ${pillY - 4.5} L ${outX} ${pillY} L ${outX + 4} ${pillY - 4.5}`} fill="none" stroke="hsl(var(--muted-foreground)/0.55)" strokeWidth={1.5} strokeLinejoin="round" />

      {/* Ausgabe-Pille (deutlich abgesetzt) */}
      <rect x={outX - pillW / 2} y={pillY} width={pillW} height={26} rx={13} fill={fired ? 'hsl(var(--chart-1)/0.12)' : 'hsl(var(--chart-3)/0.12)'} stroke={answerColor} strokeWidth={1.5} />
      <text x={outX} y={pillY + 13} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 700 }} fill={answerColor}>
        {answer}
      </text>
    </svg>
  )
}

function InputNode({ cx, cy, value, label, r = 20 }: { cx: number; cy: number; value: number; label: string; r?: number }) {
  return (
    <>
      <text x={cx} y={cy - r - 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
        {label}
      </text>
      <circle cx={cx} cy={cy} r={r} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: Number.isInteger(value) ? 15 : 13, fontWeight: 700 }}>
        {fmtNum(value)}
      </text>
    </>
  )
}

function WeightTag({ x, y, value }: { x: number; y: number; value: number }) {
  const label = value > 0 ? `+${fmtNum(value)}` : fmtNum(value)
  const w = Math.max(28, label.length * 6.5 + 10)
  return (
    <>
      <rect x={x - w / 2} y={y - 10} width={w} height={20} rx={5} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 11, fontWeight: 600 }}>
        {label}
      </text>
    </>
  )
}

// === Die „Rechnung" für den gewählten Fall =================================
function Rechnung({
  neuron,
  point,
  preset,
}: {
  neuron: Neuron
  point: DataPoint
  preset: { features: [string, string]; valueLabels: [[string, string], [string, string]]; classes: [string, string] }
}) {
  const t = useTranslations()
  const [x1, x2] = point.x
  const sum = neuron.w[0] * x1 + neuron.w[1] * x2
  const theta = -neuron.b
  const fired = sum > theta
  const term = (w: number, x: number) => `${w >= 0 ? '' : '−'}${Math.abs(w)}·${x}`
  return (
    <div className="mt-1 rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed">
      <div className="mb-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
        <span>{preset.features[0]} = {preset.valueLabels[0][x1]}</span>
        <span>{preset.features[1]} = {preset.valueLabels[1][x2]}</span>
      </div>
      <div className="tabular-nums">
        {term(neuron.w[0], x1)} + {term(neuron.w[1], x2)} = <span className="font-semibold">{sum}</span>
      </div>
      <div className="tabular-nums">
        {sum} {fired ? '>' : '≤'} {theta} {t('pl.calc.threshold')} →{' '}
        <span className={`font-semibold ${fired ? 'text-[hsl(var(--chart-1))]' : 'text-[hsl(var(--chart-3))]'}`}>
          {fired ? `${t('pl.calc.fires')}: ${preset.classes[1]}` : `${t('pl.calc.quiet')}: ${preset.classes[0]}`}
        </span>
      </div>
    </div>
  )
}

// === Zwischenschritt „Prüfen": den Fehler zeigen, BEVOR korrigiert wird ======
function CheckPanel({ pending, preset, isPoints, t }: { pending: PendingInfo; preset: Preset; isPoints: boolean; t: Translate }) {
  const { point, output, target } = pending
  const caseLabel = isPoints
    ? `(${point.x[0].toFixed(2)}, ${point.x[1].toFixed(2)})`
    : `[${preset.valueLabels[0][point.x[0]]}, ${preset.valueLabels[1][point.x[1]]}]`
  return (
    <div className="space-y-1.5 rounded-lg border border-[hsl(var(--chart-8)/0.4)] bg-[hsl(var(--chart-8)/0.06)] p-4 text-sm">
      <p>
        <span className="font-semibold text-[hsl(var(--chart-8))]">{t('pl.check.title')}</span>
        {isPoints ? t('pl.check.atPoint') : t('pl.check.atCase')}{' '}
        <span className="font-mono text-xs">{caseLabel}</span>{' '}
        {t('pl.check.computes')}{' '}
        <span className="font-semibold text-[hsl(var(--chart-8))]">{preset.classes[output]}</span> {t('pl.check.shouldBe')}{' '}
        <span className="font-semibold text-[hsl(var(--chart-2))]">{preset.classes[target]}</span>.
      </p>
      <p className="text-muted-foreground">
        {t('pl.check.hintPre')} <span className="font-medium text-foreground">{t('pl.check.hintCorrect')}</span>
        {t('pl.check.hintPost')}
      </p>
    </div>
  )
}

// === „Warum" eines Lernschritts: welches Beispiel war falsch, was ändert sich =
function LernschrittPanel({ step, preset, t }: { step: StepInfo; preset: Preset; t: Translate }) {
  const { before, after, e } = step
  const tooLow = e > 0
  const fmt = (v: number, signed: boolean) => (signed && v > 0 ? `+${v}` : `${v}`)
  const changes: { label: string; from: number; to: number; signed: boolean }[] = []
  before.w.forEach((wi, i) => {
    if (wi !== after.w[i]) changes.push({ label: preset.features[i], from: wi, to: after.w[i], signed: true })
  })
  changes.push({ label: t('pl.threshold'), from: -before.b, to: -after.b, signed: false })

  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
      <p>
        <span className="font-semibold text-primary">{t('pl.step.title')}</span>
        {t('pl.step.body1')}{tooLow ? t('pl.step.tooLow') : t('pl.step.tooHigh')}{t('pl.step.body2a')}
        {tooLow ? t('pl.step.up') : t('pl.step.down')}{t('pl.step.body2b')}{tooLow ? t('pl.step.down') : t('pl.step.up')}{t('pl.step.body2c')}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
        {changes.map((c) => (
          <span key={c.label}>
            {c.label}: <span className="text-muted-foreground">{fmt(c.from, c.signed)}</span> →{' '}
            <span className="font-semibold text-foreground">{fmt(c.to, c.signed)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// === Entscheidungsfläche: zwei Halbebenen + Trennlinie + vier Ecken ========
type Pt = { x: number; y: number }

function clipHalfPlane(poly: Pt[], a: number, b: number, c: number): Pt[] {
  if (poly.length === 0) return poly
  const inside = (p: Pt) => a * p.x + b * p.y + c >= 0
  const cross = (p: Pt, q: Pt): Pt => {
    const fp = a * p.x + b * p.y + c
    const fq = a * q.x + b * q.y + c
    const t = fp / (fp - fq)
    return { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) }
  }
  const out: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i]
    const prev = poly[(i + poly.length - 1) % poly.length]
    const ci = inside(cur)
    const pi = inside(prev)
    if (ci) {
      if (!pi) out.push(cross(prev, cur))
      out.push(cur)
    } else if (pi) {
      out.push(cross(prev, cur))
    }
  }
  return out
}

function DecisionSurface({
  neuron,
  data,
  features,
  selectedId,
  onSelect,
  editable = false,
  onAdd,
  onRemove,
  ariaLabel,
}: {
  neuron: Neuron
  data: DataPoint[]
  features: [string, string]
  selectedId: string
  onSelect: (id: string) => void
  editable?: boolean
  onAdd?: (x1: number, x2: number) => void
  onRemove?: (id: string) => void
  ariaLabel: string
}) {
  const S = 300
  const padL = 42
  const padR = 16
  const padT = 14
  const padB = 42
  const sx = (x: number) => padL + ((x - DMIN) / (DMAX - DMIN)) * (S - padL - padR)
  const sy = (y: number) => padT + ((DMAX - y) / (DMAX - DMIN)) * (S - padT - padB)

  // Klick ins leere Feld → Punkt setzen (nur im Punkte-Modus). Pixel → Domäne.
  const handleBg = (e: MouseEvent<SVGSVGElement>) => {
    if (!editable || !onAdd) return
    const r = e.currentTarget.getBoundingClientRect()
    const vbx = ((e.clientX - r.left) / r.width) * S
    const vby = ((e.clientY - r.top) / r.height) * S
    const x1 = clamp01(DMIN + ((vbx - padL) / (S - padL - padR)) * (DMAX - DMIN))
    const x2 = clamp01(DMAX - ((vby - padT) / (S - padT - padB)) * (DMAX - DMIN))
    onAdd(x1, x2)
  }

  const rect: Pt[] = [
    { x: DMIN, y: DMIN },
    { x: DMAX, y: DMIN },
    { x: DMAX, y: DMAX },
    { x: DMIN, y: DMAX },
  ]
  const [a, b, c] = [neuron.w[0], neuron.w[1], neuron.b]
  const noLine = a === 0 && b === 0
  const firesPoly = noLine ? (c > 0 ? rect : []) : clipHalfPlane(rect, a, b, c)
  const quietPoly = noLine ? (c > 0 ? [] : rect) : clipHalfPlane(rect, -a, -b, -c)
  const toPath = (poly: Pt[]) => poly.map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className={`aspect-square w-full select-none ${editable ? 'cursor-crosshair' : ''}`}
      onClick={editable ? handleBg : undefined}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Halbebenen */}
      {firesPoly.length > 2 && <polygon points={toPath(firesPoly)} fill="hsl(var(--chart-1)/0.14)" />}
      {quietPoly.length > 2 && <polygon points={toPath(quietPoly)} fill="hsl(var(--chart-3)/0.14)" />}

      {/* Hilfslinien bei 0 und 1 */}
      {[0, 1].map((v) => (
        <line key={`gx${v}`} x1={sx(v)} y1={sy(DMAX)} x2={sx(v)} y2={sy(DMIN)} stroke="hsl(var(--border)/0.7)" strokeWidth={1} strokeDasharray="2 3" />
      ))}
      {[0, 1].map((v) => (
        <line key={`gy${v}`} x1={sx(DMIN)} y1={sy(v)} x2={sx(DMAX)} y2={sy(v)} stroke="hsl(var(--border)/0.7)" strokeWidth={1} strokeDasharray="2 3" />
      ))}

      {/* Achsen unten (x1) + links (x2) */}
      <line x1={sx(DMIN)} y1={sy(DMIN)} x2={sx(DMAX)} y2={sy(DMIN)} stroke="hsl(var(--border))" strokeWidth={1.5} />
      <line x1={sx(DMIN)} y1={sy(DMIN)} x2={sx(DMIN)} y2={sy(DMAX)} stroke="hsl(var(--border))" strokeWidth={1.5} />

      {/* Tick-Beschriftung 0 / 1 */}
      {[0, 1].map((v) => (
        <text key={`tx${v}`} x={sx(v)} y={sy(DMIN) + 15} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9.5 }}>
          {v}
        </text>
      ))}
      {[0, 1].map((v) => (
        <text key={`ty${v}`} x={sx(DMIN) - 9} y={sy(v)} textAnchor="end" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 9.5 }}>
          {v}
        </text>
      ))}

      {/* Achsennamen: x1 unten (horizontal), x2 links (vertikal) */}
      <text x={(sx(DMIN) + sx(DMAX)) / 2} y={S - 3} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10, fontWeight: 500 }}>
        {features[0]}
      </text>
      <text transform={`translate(11 ${(sy(DMIN) + sy(DMAX)) / 2}) rotate(-90)`} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10, fontWeight: 500 }}>
        {features[1]}
      </text>

      {/* Trennlinie (als Rand der feuernden Halbebene) */}
      {!noLine &&
        (() => {
          // Schnittpunkte der Geraden a·x+b·y+c=0 mit dem Sichtfenster.
          const pts: Pt[] = []
          const edges: [Pt, Pt][] = [
            [rect[0], rect[1]],
            [rect[1], rect[2]],
            [rect[2], rect[3]],
            [rect[3], rect[0]],
          ]
          for (const [p, q] of edges) {
            const fp = a * p.x + b * p.y + c
            const fq = a * q.x + b * q.y + c
            if ((fp > 0) !== (fq > 0) && fp !== fq) {
              const t = fp / (fp - fq)
              pts.push({ x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) })
            }
          }
          if (pts.length < 2) return null
          return (
            <line
              x1={sx(pts[0].x)}
              y1={sy(pts[0].y)}
              x2={sx(pts[1].x)}
              y2={sy(pts[1].y)}
              stroke="hsl(var(--foreground)/0.55)"
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          )
        })()}

      {/* Datenpunkte (4 Ecken bzw. eigene Punkte) */}
      {data.map((p) => {
        const wrong = fires(neuron, p.x) !== p.label
        const sel = p.id === selectedId
        const fill = p.label === 1 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
        const rad = editable ? 8 : 10
        return (
          <g
            key={p.id}
            className="cursor-pointer"
            onClick={(e) => {
              if (editable) {
                e.stopPropagation()
                onRemove?.(p.id)
              } else {
                onSelect(p.id)
              }
            }}
          >
            {sel && <circle cx={sx(p.x[0])} cy={sy(p.x[1])} r={rad + 5} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />}
            <circle
              cx={sx(p.x[0])}
              cy={sy(p.x[1])}
              r={rad}
              fill={fill}
              stroke={wrong ? 'hsl(var(--chart-8))' : 'hsl(var(--background))'}
              strokeWidth={wrong ? 3 : 1.5}
            />
          </g>
        )
      })}
    </svg>
  )
}

// === kleine Bausteine ======================================================
function PresetButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

function WeightSlider({
  label,
  value,
  onChange,
  min = W_MIN,
  max = W_MAX,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 truncate text-xs text-muted-foreground" title={label}>
        {label}
      </span>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={1} aria-label={label} className="flex-1" />
      <span className="w-8 shrink-0 text-right font-mono text-sm tabular-nums">{value > 0 ? `+${value}` : value}</span>
    </div>
  )
}

function Legend({ classes, editable = false }: { classes: [string, string]; editable?: boolean }) {
  const t = useTranslations()
  return (
    <div className="mt-2 space-y-1">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: 'hsl(var(--chart-1))' }} /> {classes[1]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: 'hsl(var(--chart-3))' }} /> {classes[0]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: 'hsl(var(--chart-8))' }} /> {t('pl.legend.wrong')}
        </span>
      </div>
      {editable && (
        <p className="text-xs text-muted-foreground">{t('pl.legend.editHint')}</p>
      )}
    </div>
  )
}

// === Punkte-Modus: Werkzeugleiste (Pinsel, Beispiele, gelernte Gewichte) ====
function PointsControls({
  brush,
  setBrush,
  neuron,
  classes,
  onSeparable,
  onEntangled,
  onClear,
  t,
}: {
  brush: 0 | 1
  setBrush: (b: 0 | 1) => void
  neuron: Neuron
  classes: [string, string]
  onSeparable: () => void
  onEntangled: () => void
  onClear: () => void
  t: Translate
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-background/40 p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('pl.points.set')}</span>
        <div className="inline-flex rounded-lg border p-0.5">
          <BrushButton active={brush === 1} dot="hsl(var(--chart-1))" onClick={() => setBrush(1)}>
            {classes[1]}
          </BrushButton>
          <BrushButton active={brush === 0} dot="hsl(var(--chart-3))" onClick={() => setBrush(0)}>
            {classes[0]}
          </BrushButton>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('pl.points.example')}</span>
        <Button variant="outline" size="sm" className="h-7" onClick={onSeparable}>
          {t('pl.points.separable')}
        </Button>
        <Button variant="outline" size="sm" className="h-7" onClick={onEntangled}>
          {t('pl.points.entangled')}
        </Button>
        <Button variant="ghost" size="sm" className="h-7" onClick={onClear}>
          {t('pl.points.clear')}
        </Button>
      </div>
      <span className="font-mono text-xs text-muted-foreground sm:ml-auto">
        w = [{fmtNum(neuron.w[0])}, {fmtNum(neuron.w[1])}] · θ = {fmtNum(-neuron.b)}
      </span>
    </div>
  )
}

function BrushButton({
  active,
  dot,
  onClick,
  children,
}: {
  active: boolean
  dot: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
      {children}
    </button>
  )
}
