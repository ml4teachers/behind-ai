'use client'

// ---------------------------------------------------------------------------
// MLP-Labor à la TensorFlow Playground (für 2 Eingänge). Editierbares Punktfeld
// + Datensätze (XOR, Kreis, eigene), verstellbare versteckte Schicht (2…8),
// Lernrate, Live-Loss-Kurve. Links der Knoten-Graph, rechts die als CANVAS
// gerenderte (gekrümmte) Entscheidungsfläche. „Trainieren" = Backprop live.
//
// Interne Strings DE inline (Viz-Konvention).
// ---------------------------------------------------------------------------

import { type MouseEvent, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  type Activation,
  type MLP,
  circleData,
  classify,
  countCorrectMLP,
  forward,
  initMLP,
  noisyData,
  trainEpochs,
  xorData,
} from '@/lib/perceptron/mlp'
import type { DataPoint } from '@/lib/perceptron/model'
import { ExplainCard, type ExplainKey } from '@/components/visualizations/activation-explainer'
import { NetworkDiagram } from '@/components/visualizations/net-diagram'
import { useTranslations } from '@/lib/i18n/use-translations'

const EPOCHS_PER_FRAME = 25
const MAX_EPOCHS = 3500
const SOLVED_LOSS = 0.1
const STALL_EPOCHS = 2500 // ohne Genauigkeits-Verbesserung → Sackgasse, anhalten
const S = 300
const DMIN = -0.3
const DMAX = 1.3
const GRID = 60
const HIDDEN_OPTIONS = [2, 3, 4, 6, 8]
const LINE_VARS = ['--chart-4', '--chart-6', '--chart-5', '--chart-7', '--chart-2', '--chart-8', '--chart-4', '--chart-6']

const sx = (x: number) => ((x - DMIN) / (DMAX - DMIN)) * S
const sy = (y: number) => ((DMAX - y) / (DMAX - DMIN)) * S
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const round2 = (v: number) => Math.round(v * 100) / 100

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (h < 60) [r, g] = [c, x]
  else if (h < 120) [r, g] = [x, c]
  else if (h < 180) [g, b] = [c, x]
  else if (h < 240) [g, b] = [x, c]
  else if (h < 300) [r, b] = [x, c]
  else [r, b] = [c, x]
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}
function readRgb(varName: string): [number, number, number] {
  if (typeof window === 'undefined') return [128, 128, 128]
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  const m = v.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/)
  if (!m) return [128, 128, 128]
  return hslToRgb(+m[1], +m[2] / 100, +m[3] / 100)
}

interface LossPoint {
  x: number
  y: number
}

export function MlpLab() {
  const t = useTranslations()
  const [points, setPoints] = useState<DataPoint[]>(() => xorData().train)
  const [testPoints, setTestPoints] = useState<DataPoint[]>(() => xorData().test)
  const [datasetKey, setDatasetKey] = useState<'xor' | 'circle' | 'noisy' | 'custom'>('xor')
  const [hidden, setHidden] = useState(3)
  const [lr, setLr] = useState(1.2)
  const [activation, setActivation] = useState<Activation>('tanh')
  const [net, setNet] = useState<MLP>(() => initMLP(3))
  const [running, setRunning] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [loss, setLoss] = useState(0)
  const [history, setHistory] = useState<LossPoint[]>([])
  const [brush, setBrush] = useState<0 | 1>(1)
  const [showLines, setShowLines] = useState(true)
  const [explain, setExplain] = useState<ExplainKey | null>(null)
  const [mounted, setMounted] = useState(false)

  const netRef = useRef(net)
  const dataRef = useRef(points)
  const lrRef = useRef(lr)
  const actRef = useRef(activation)
  const runningRef = useRef(false)
  const rafRef = useRef(0)
  const epochRef = useRef(0)
  const histRef = useRef<LossPoint[]>([])
  const bestCorrectRef = useRef(-1)
  const sinceBestRef = useRef(0)
  const lastUiRef = useRef(0)
  const idRef = useRef(1)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  netRef.current = net
  dataRef.current = points
  lrRef.current = lr
  actRef.current = activation

  useEffect(() => setMounted(true), [])

  const correct = countCorrectMLP(net, points, activation)
  const allRight = points.length > 0 && correct === points.length
  // Überanpassung: zweite Genauigkeit auf einem ungesehenen Testsatz.
  const hasTest = testPoints.length > 0
  const testCorrect = countCorrectMLP(net, testPoints, activation)
  const trainPct = points.length ? correct / points.length : 0
  const testPct = testPoints.length ? testCorrect / testPoints.length : 0
  const gap = trainPct - testPct
  const converged = trainPct >= 0.85
  // Drei Lagen, an die sichtbaren Zahlen gekoppelt (nur mit Testsatz).
  const fitState: 'overfit' | 'generalizes' | 'mid' | 'training' = !converged
    ? 'training'
    : gap >= 0.15
      ? 'overfit'
      : gap <= 0.06
        ? 'generalizes'
        : 'mid'
  const pctStr = (v: number): string => `${Math.round(v * 100)} %`

  // --- Hintergrund neu shaden ---
  const draw = useCallback((n: MLP) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const blue = readRgb('--chart-1')
    const amber = readRgb('--chart-3')
    const off = document.createElement('canvas')
    off.width = GRID
    off.height = GRID
    const octx = off.getContext('2d')
    if (!octx) return
    const img = octx.createImageData(GRID, GRID)
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const x = DMIN + (gx / (GRID - 1)) * (DMAX - DMIN)
        const y = DMAX - (gy / (GRID - 1)) * (DMAX - DMIN)
        const o = forward(n, [x, y], actRef.current).y
        const idx = (gy * GRID + gx) * 4
        img.data[idx] = Math.round(amber[0] + (blue[0] - amber[0]) * o)
        img.data[idx + 1] = Math.round(amber[1] + (blue[1] - amber[1]) * o)
        img.data[idx + 2] = Math.round(amber[2] + (blue[2] - amber[2]) * o)
        img.data[idx + 3] = 135
      }
    }
    octx.putImageData(img, 0, 0)
    ctx.clearRect(0, 0, S, S)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(off, 0, 0, GRID, GRID, 0, 0, S, S)
  }, [])

  useEffect(() => {
    if (mounted) draw(net)
  }, [net, mounted, draw])
  useEffect(() => {
    if (!mounted) return
    const obs = new MutationObserver(() => draw(netRef.current))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [mounted, draw])

  const stop = useCallback(() => {
    runningRef.current = false
    setRunning(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const resetTraining = useCallback(() => {
    stop()
    epochRef.current = 0
    histRef.current = []
    bestCorrectRef.current = -1
    sinceBestRef.current = 0
    setEpoch(0)
    setLoss(0)
    setHistory([])
  }, [stop])

  const reinitNet = useCallback(
    (h: number, a: Activation) => {
      const n = initMLP(h, a)
      netRef.current = n
      setNet(n)
      resetTraining()
    },
    [resetTraining],
  )

  const loop = useCallback(() => {
    if (!runningRef.current) return
    const r = trainEpochs(netRef.current, dataRef.current, lrRef.current, EPOCHS_PER_FRAME, actRef.current)
    netRef.current = r.net
    epochRef.current += EPOCHS_PER_FRAME
    histRef.current.push({ x: epochRef.current, y: r.loss })
    if (histRef.current.length > 600) histRef.current.shift()
    const c = countCorrectMLP(r.net, dataRef.current, actRef.current)
    if (c > bestCorrectRef.current) {
      bestCorrectRef.current = c
      sinceBestRef.current = 0
    } else {
      sinceBestRef.current += EPOCHS_PER_FRAME
    }
    const now = performance.now()
    if (now - lastUiRef.current > 55) {
      lastUiRef.current = now
      setNet(r.net)
      setEpoch(epochRef.current)
      setLoss(r.loss)
      setHistory([...histRef.current])
    }
    const full = dataRef.current.length > 0 && c === dataRef.current.length
    const done = full && r.loss < SOLVED_LOSS
    const stalled = !full && sinceBestRef.current >= STALL_EPOCHS
    if (done || stalled || epochRef.current >= MAX_EPOCHS || dataRef.current.length === 0) {
      setNet(r.net)
      setEpoch(epochRef.current)
      setLoss(r.loss)
      setHistory([...histRef.current])
      stop()
      return
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [stop])

  const play = () => {
    if (points.length === 0) return
    runningRef.current = true
    setRunning(true)
    lastUiRef.current = 0
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }

  const loadDataset = (key: 'xor' | 'circle' | 'noisy' | 'empty') => {
    const ds = key === 'xor' ? xorData() : key === 'circle' ? circleData() : key === 'noisy' ? noisyData() : { train: [], test: [] }
    setPoints(ds.train)
    setTestPoints(ds.test)
    setDatasetKey(key === 'empty' ? 'custom' : key)
    reinitNet(hidden, activation)
  }
  const changeHidden = (h: number) => {
    setHidden(h)
    reinitNet(h, activation)
  }
  const changeLr = (v: number) => {
    setLr(v)
    lrRef.current = v
  }
  const changeActivation = (a: Activation) => {
    setActivation(a)
    actRef.current = a
    reinitNet(hidden, a)
  }
  const restart = () => reinitNet(hidden, activation)

  // Eigene Punkte setzen = „custom": kein fester Testsatz mehr (Überanpassung
  // nur mit den vorbereiteten Datensätzen sinnvoll messbar).
  const addPoint = (x: number, y: number) => {
    setPoints((prev) => [...prev, { id: `u${idRef.current++}`, x: [round2(x), round2(y)], label: brush }])
    setTestPoints([])
    setDatasetKey('custom')
    resetTraining()
  }
  const removePoint = (id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id))
    setTestPoints([])
    setDatasetKey('custom')
    resetTraining()
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  if (!mounted) {
    return <div className="min-h-[520px] animate-pulse rounded-lg bg-muted/40" aria-hidden="true" />
  }

  const handleAdd = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const vbx = ((e.clientX - r.left) / r.width) * S
    const vby = ((e.clientY - r.top) / r.height) * S
    addPoint(clamp01(DMIN + (vbx / S) * (DMAX - DMIN)), clamp01(DMAX - (vby / S) * (DMAX - DMIN)))
  }

  return (
    <div className="space-y-5">
      {/* ---- Netz | Entscheidungsfläche ---- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col rounded-lg border bg-background/40 p-4">
          <h3 className="mb-1 text-sm font-semibold">{t('ml.net.title')}</h3>
          <p className="mb-2 text-xs text-muted-foreground">
            {hidden} {t('ml.net.desc')}
          </p>
          <div className="flex flex-1 items-center justify-center">
            <NetworkDiagram
              net={net}
              activation={activation}
              onExplain={(k) => setExplain(k)}
              labels={{
                input: t('ml.diagram.input'),
                hidden: t('ml.diagram.hidden'),
                output: t('ml.diagram.output'),
                aria: t('ml.aria.net'),
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">{t('ml.net.explainHint')}</p>
        </section>

        <section className="rounded-lg border bg-background/40 p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">{t('pl.surface.title')}</h3>
            {hasTest ? (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {t('ml.acc.train')} {pctStr(trainPct)} ·{' '}
                <span className={fitState === 'overfit' ? 'font-semibold text-[hsl(var(--chart-8))]' : 'text-foreground'}>
                  {t('ml.acc.test')} {pctStr(testPct)}
                </span>
              </span>
            ) : (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {t('pl.correct')} {correct}/{points.length}
              </span>
            )}
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            <canvas ref={canvasRef} width={S} height={S} className="absolute inset-0 h-full w-full" />
            <svg
              viewBox={`0 0 ${S} ${S}`}
              className="absolute inset-0 h-full w-full cursor-crosshair select-none"
              onClick={handleAdd}
              role="img"
              aria-label={t('pl.surface.title')}
            >
              {[0, 1].map((v) => (
                <line key={`gx${v}`} x1={sx(v)} y1={sy(DMAX)} x2={sx(v)} y2={sy(DMIN)} stroke="hsl(var(--border)/0.6)" strokeWidth={1} strokeDasharray="2 3" />
              ))}
              {[0, 1].map((v) => (
                <line key={`gy${v}`} x1={sx(DMIN)} y1={sy(v)} x2={sx(DMAX)} y2={sy(v)} stroke="hsl(var(--border)/0.6)" strokeWidth={1} strokeDasharray="2 3" />
              ))}
              {showLines &&
                net.W1.map((row, j) => (
                  <HiddenLine key={`hl${j}`} a={row[0]} b={row[1]} c={net.b1[j]} color={`hsl(var(${LINE_VARS[j % LINE_VARS.length]}))`} />
                ))}
              <text x={sx(0.5)} y={S - 6} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
                {t('pp.points.feat0')}
              </text>
              <text transform={`translate(12 ${sy(0.5)}) rotate(-90)`} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
                {t('pp.points.feat1')}
              </text>
              {/* Testpunkte: hohle Ringe, nicht klickbar (Klicks gehen zum Hinzufügen durch) */}
              {testPoints.map((p) => {
                const wrong = classify(net, p.x, activation) !== p.label
                const color = p.label === 1 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
                return (
                  <circle
                    key={p.id}
                    cx={sx(p.x[0])}
                    cy={sy(p.x[1])}
                    r={6}
                    fill="hsl(var(--background)/0.5)"
                    stroke={wrong ? 'hsl(var(--chart-8))' : color}
                    strokeWidth={wrong ? 2.5 : 2}
                    style={{ pointerEvents: 'none' }}
                  />
                )
              })}
              {points.map((p) => {
                const wrong = classify(net, p.x, activation) !== p.label
                const fill = p.label === 1 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
                return (
                  <circle
                    key={p.id}
                    cx={sx(p.x[0])}
                    cy={sy(p.x[1])}
                    r={hasTest ? 7 : 8}
                    fill={fill}
                    stroke={wrong ? 'hsl(var(--chart-8))' : 'hsl(var(--background))'}
                    strokeWidth={wrong ? 3 : 1.5}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      removePoint(p.id)
                    }}
                  />
                )
              })}
            </svg>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: 'hsl(var(--chart-1))' }} /> {t('pp.points.class1')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: 'hsl(var(--chart-3))' }} /> {t('pp.points.class0')}
            </span>
            {hasTest && (
              <span className="flex items-center gap-2.5 border-l pl-3">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full bg-foreground/70" /> {t('ml.acc.train')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-foreground/70" /> {t('ml.acc.test')}
                </span>
              </span>
            )}
            <label className="ml-auto flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={showLines} onChange={(e) => setShowLines(e.target.checked)} className="accent-[hsl(var(--primary))]" />
              {t('ml.showLines')}
            </label>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('pl.legend.editHint')}</p>
        </section>
      </div>

      {/* ---- Werkzeuge ---- */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-background/40 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('ml.data')}</span>
          <div className="inline-flex rounded-lg border p-0.5">
            <ChipButton active={datasetKey === 'xor'} onClick={() => loadDataset('xor')}>XOR</ChipButton>
            <ChipButton active={datasetKey === 'circle'} onClick={() => loadDataset('circle')}>{t('ml.circle')}</ChipButton>
            <ChipButton active={datasetKey === 'noisy'} onClick={() => loadDataset('noisy')}>{t('ml.noisy')}</ChipButton>
            <ChipButton active={false} onClick={() => loadDataset('empty')}>{t('pl.points.clear')}</ChipButton>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('ml.activation')}</span>
          <div className="inline-flex rounded-lg border p-0.5">
            <ChipButton active={activation === 'tanh'} onClick={() => changeActivation('tanh')}>tanh</ChipButton>
            <ChipButton active={activation === 'relu'} onClick={() => changeActivation('relu')}>ReLU</ChipButton>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('ml.set')}</span>
          <div className="inline-flex rounded-lg border p-0.5">
            <BrushButton active={brush === 1} dot="hsl(var(--chart-1))" onClick={() => setBrush(1)}>B</BrushButton>
            <BrushButton active={brush === 0} dot="hsl(var(--chart-3))" onClick={() => setBrush(0)}>A</BrushButton>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('ml.hiddenNeurons')}</span>
          <div className="inline-flex rounded-lg border p-0.5">
            {HIDDEN_OPTIONS.map((h) => (
              <ChipButton key={h} active={hidden === h} onClick={() => changeHidden(h)}>
                {h}
              </ChipButton>
            ))}
          </div>
        </div>
        <div className="flex min-w-[180px] flex-1 items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">{t('ml.learnRate')}</span>
          <Slider value={[lr]} onValueChange={([v]) => changeLr(v)} min={0.1} max={3} step={0.1} aria-label={t('ml.learnRate')} className="flex-1" />
          <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums">{lr.toFixed(1)}</span>
        </div>
      </div>

      {/* ---- Lernen + Loss-Kurve ---- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {running ? (
          <Button onClick={stop} variant="secondary" className="gap-1.5">
            <PauseIcon /> {t('pl.pause')}
          </Button>
        ) : (
          <Button onClick={play} disabled={points.length === 0} className="gap-1.5">
            <PlayIcon /> {t('pl.train')}
          </Button>
        )}
        <Button onClick={restart} variant="outline" className="gap-1.5">
          <ReloadIcon /> {t('ml.restart')}
        </Button>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {epoch.toLocaleString('de-CH')} {t('ml.epochs')}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <LossCurve history={history} />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {t('ml.error')} {loss.toFixed(3)}
          </span>
        </div>
      </div>

      {/* ---- Status ---- */}
      {hasTest ? (
        fitState === 'overfit' ? (
          <div className="rounded-lg border border-[hsl(var(--chart-8)/0.4)] bg-[hsl(var(--chart-8)/0.08)] p-4 text-sm leading-relaxed">
            <span className="font-semibold text-[hsl(var(--chart-8))]">{t('ml.overfit.title')} </span>
            {t('ml.overfit.body').replace('{train}', pctStr(trainPct)).replace('{test}', pctStr(testPct))}
          </div>
        ) : fitState === 'generalizes' ? (
          <div className="rounded-lg border border-[hsl(var(--chart-2)/0.4)] bg-[hsl(var(--chart-2)/0.08)] p-4 text-sm leading-relaxed">
            <span className="font-semibold text-[hsl(var(--chart-2))]">{t('ml.generalizes.title')} </span>
            {t('ml.generalizes.body').replace('{train}', pctStr(trainPct)).replace('{test}', pctStr(testPct))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">{t('ml.fit.hint')}</p>
        )
      ) : allRight ? (
        <div className="rounded-lg border border-[hsl(var(--chart-2)/0.4)] bg-[hsl(var(--chart-2)/0.08)] p-4 text-sm">
          <span className="font-semibold text-[hsl(var(--chart-2))]">{t('pl.sep.title')}</span>
          {t('ml.sep.body')}
          <em>{t('ml.sep.em')}</em>
          {t('ml.sep.body2')}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('ml.hint.pre')}<span className="font-medium text-foreground">{t('ml.hint.train')}</span>
          {t('ml.hint.mid')}<span className="font-medium text-foreground">{t('ml.hint.more')}</span>
          {t('ml.hint.mid2')}<span className="font-medium text-foreground">{t('ml.hint.restart')}</span>
          {t('ml.hint.post')}
        </p>
      )}

      {explain && <ExplainCard which={explain} onClose={() => setExplain(null)} />}
    </div>
  )
}

// === Loss-Kurve ============================================================
function LossCurve({ history }: { history: LossPoint[] }) {
  const W = 168
  const H = 52
  const pad = 5
  if (history.length < 2) {
    return <div className="h-[52px] w-[168px] rounded border border-dashed border-border" aria-hidden="true" />
  }
  const xMax = Math.max(history[history.length - 1].x, 1)
  const yMax = Math.max(...history.map((p) => p.y), 0.05)
  const px = (x: number) => pad + (x / xMax) * (W - 2 * pad)
  const py = (y: number) => pad + (1 - y / yMax) * (H - 2 * pad)
  const d = history.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[52px] w-[168px] rounded border bg-background/60" role="img" aria-label="Loss-Kurve">
      <path d={d} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

// === Trennlinie eines versteckten Neurons (a·x + b·y + c = 0) ===============
function HiddenLine({ a, b, c, color }: { a: number; b: number; c: number; color: string }) {
  if (a === 0 && b === 0) return null
  const corners = [
    [DMIN, DMIN],
    [DMAX, DMIN],
    [DMAX, DMAX],
    [DMIN, DMAX],
  ]
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < 4; i++) {
    const [px, py] = corners[i]
    const [qx, qy] = corners[(i + 1) % 4]
    const fp = a * px + b * py + c
    const fq = a * qx + b * qy + c
    if (fp > 0 !== fq > 0 && fp !== fq) {
      const t = fp / (fp - fq)
      pts.push({ x: px + t * (qx - px), y: py + t * (qy - py) })
    }
  }
  if (pts.length < 2) return null
  return (
    <line x1={sx(pts[0].x)} y1={sy(pts[0].y)} x2={sx(pts[1].x)} y2={sy(pts[1].y)} stroke={color} strokeWidth={1.75} strokeDasharray="5 4" opacity={0.85} />
  )
}

// === kleine Bausteine ======================================================
function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
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

function BrushButton({ active, dot, onClick, children }: { active: boolean; dot: string; onClick: () => void; children: ReactNode }) {
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
