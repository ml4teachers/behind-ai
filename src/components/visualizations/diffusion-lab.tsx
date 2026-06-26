'use client'

// ---------------------------------------------------------------------------
// Diffusion zum Anfassen – wie aus Chaos eine Form wird. Drei Phasen teilen
// sich EIN Mini-Modell (pro Zielform):
//   1. Verrauschen  – die Form Schritt für Schritt in Zufall auflösen.
//   2. Lernen       – ein winziges Netz lernt, das Rauschen vorherzusagen
//                     (Verlust fällt; die Probe ordnet sich; Entrausch-Feld).
//   3. Generieren   – von reinem Zufall aus rückwärts entrauschen → die Form
//                     taucht auf. Temperatur regelt Streuung vs. Schärfe.
// Theme-Canvas (readRgb) + rAF wie gradient-descent-lab; Engine in lib/diffusion.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { PlayIcon, PauseIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useTranslations } from '@/lib/i18n/use-translations'
import { Diffusion, SHAPE_IDS, T, VIEW, type Pt, type ShapeId } from '@/lib/diffusion/diffusion'

type Phase = 'noise' | 'train' | 'gen'
type Trans = (key: string) => string

// === Theme-Farben aus CSS-Variablen (wie gradient-descent-lab) =============
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
type Palette = { primary: [number, number, number]; muted: [number, number, number]; accent: [number, number, number]; bg: [number, number, number] }
function readPalette(): Palette {
  return {
    primary: readRgb('--primary'),
    muted: readRgb('--muted-foreground'),
    accent: readRgb('--chart-2'),
    bg: readRgb('--background'),
  }
}

const S = 520 // Canvas-Auflösung (intern)
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const toPx = (x: number, y: number): [number, number] => [((x + VIEW) / (2 * VIEW)) * S, ((VIEW - y) / (2 * VIEW)) * S]

function drawDots(ctx: CanvasRenderingContext2D, pts: Pt[], color: [number, number, number], r: number, alpha: number): void {
  ctx.fillStyle = rgba(color, alpha)
  for (const [x, y] of pts) {
    const [cx, cy] = toPx(x, y)
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 6.2832)
    ctx.fill()
  }
}

// Square-Canvas mit Theme-Beobachter; `paint` zeichnet einen Frame.
function useCanvas(paint: (ctx: CanvasRenderingContext2D, pal: Palette) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cb = useCallback(paint, deps)
  const redraw = useCallback(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!ctx) return
    cb(ctx, readPalette())
  }, [cb])
  useEffect(() => {
    redraw()
    const obs = new MutationObserver(redraw)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [redraw])
  return { ref, redraw }
}

// ===========================================================================
export function DiffusionLab() {
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)
  const [shape, setShape] = useState<ShapeId>('circle')
  const [phase, setPhase] = useState<Phase>('noise')
  useEffect(() => setMounted(true), [])

  const diff = useMemo(() => (mounted ? new Diffusion(shape) : null), [mounted, shape])

  if (!mounted || !diff) {
    return <div className="min-h-[640px] animate-pulse rounded-lg bg-muted/40" aria-hidden="true" />
  }

  return (
    <div className="space-y-5">
      {/* Zielform */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-lg border p-0.5">
          {SHAPE_IDS.map((s) => (
            <Chip key={s} active={shape === s} onClick={() => setShape(s)}>
              {t(`df.shape.${s}`)}
            </Chip>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t('df.shapeHint')}</p>
      </div>

      {/* Phasen-Stepper */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border p-0.5">
        {(['noise', 'train', 'gen'] as Phase[]).map((p, i) => (
          <button
            key={p}
            type="button"
            onClick={() => setPhase(p)}
            className={`rounded-md px-2 py-1.5 text-center text-sm font-medium transition-colors ${
              phase === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <span className="opacity-70">{i + 1}.</span> {t(`df.phase.${p}`)}
          </button>
        ))}
      </div>

      {/* Aktive Phase (alle gemountet, key=shape → Reset bei Formwechsel) */}
      <div key={shape}>
        <div className={phase === 'noise' ? '' : 'hidden'}>
          <NoisePhase diff={diff} active={phase === 'noise'} t={t} />
        </div>
        <div className={phase === 'train' ? '' : 'hidden'}>
          <TrainPhase diff={diff} active={phase === 'train'} onTrained={() => setPhase('gen')} t={t} />
        </div>
        <div className={phase === 'gen' ? '' : 'hidden'}>
          <GenPhase diff={diff} active={phase === 'gen'} t={t} />
        </div>
      </div>
    </div>
  )
}

// === Phase 1: Verrauschen ===================================================
function NoisePhase({ diff, active, t }: { diff: Diffusion; active: boolean; t: Trans }) {
  const [tau, setTau] = useState(0)
  const { ref, redraw } = useCanvas(
    (ctx, pal) => {
      ctx.clearRect(0, 0, S, S)
      drawDots(ctx, diff.forwardNoise(tau), pal.primary, 2.3, 0.85)
    },
    [diff, tau],
  )
  useEffect(() => {
    if (active) redraw()
  }, [active, redraw])

  const signal = Math.round(diff.signalFrac(tau) * 100)

  return (
    <div className="space-y-4">
      <Board canvasRef={ref} />
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-xs text-muted-foreground">{t('df.noise.level')}</span>
        <Slider
          value={[tau]}
          onValueChange={([v]) => setTau(v)}
          min={0}
          max={T}
          step={1}
          aria-label={t('df.noise.level')}
          className="flex-1"
        />
        <span className="w-20 shrink-0 whitespace-nowrap text-right font-mono text-xs tabular-nums">
          t = {tau}/{T}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg border bg-background/40 px-4 py-3 font-mono text-xs tabular-nums">
        <Read label={t('df.noise.signal')} value={`${signal}%`} accent />
        <Read label={t('df.noise.noise')} value={`${100 - signal}%`} />
      </div>
      <p className="text-sm text-muted-foreground">{tau === 0 ? t('df.noise.t0') : tau >= T ? t('df.noise.tT') : t('df.noise.mid')}</p>
    </div>
  )
}

// === Phase 2: Lernen ========================================================
const SPEEDS: Record<string, number> = { slow: 2, normal: 6, turbo: 18 }
const FIELD_GRID = 13
const FIELD_T = Math.round(T * 0.45)

function TrainPhase({ diff, active, onTrained, t }: { diff: Diffusion; active: boolean; onTrained: () => void; t: Trans }) {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(diff.step)
  const [loss, setLoss] = useState<number | null>(null)
  const [view, setView] = useState<'sample' | 'field'>('sample')
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'turbo'>('normal')

  const lossHistRef = useRef<number[]>([])
  const [lossHist, setLossHist] = useState<number[]>([])
  const sampleRef = useRef<Pt[]>(diff.sampleInit(220))
  const runningRef = useRef(false)
  const activeRef = useRef(active)
  const speedRef = useRef(speed)
  const viewRef = useRef(view)
  const rafRef = useRef(0)
  const lastUiRef = useRef(0)
  const lastSampleRef = useRef(0)
  activeRef.current = active
  speedRef.current = speed
  viewRef.current = view

  // Eine vollständige Probe (Zufall → Form) mit dem aktuellen Modell.
  const regenSample = useCallback(() => {
    let pts = diff.sampleInit(220)
    for (let tt = T; tt >= 1; tt--) pts = diff.sampleStep(pts, tt, 0.9)
    sampleRef.current = pts
  }, [diff])

  const { ref, redraw } = useCanvas(
    (ctx, pal) => {
      ctx.clearRect(0, 0, S, S)
      if (viewRef.current === 'field') {
        drawDots(ctx, diff.data, pal.muted, 1.6, 0.18)
        const field = diff.vectorField(FIELD_T, FIELD_GRID)
        ctx.strokeStyle = rgba(pal.accent, 0.9)
        ctx.lineWidth = 1.4
        const scale = 26
        for (const f of field) {
          const [x0, y0] = toPx(f.x, f.y)
          const len = Math.hypot(f.dx, f.dy) || 1
          const ux = (f.dx / len) * Math.min(len * scale, 18)
          const uy = (f.dy / len) * Math.min(len * scale, 18)
          ctx.beginPath()
          ctx.moveTo(x0, y0)
          ctx.lineTo(x0 + ux, y0 - uy)
          ctx.stroke()
          ctx.fillStyle = rgba(pal.accent, 0.9)
          ctx.beginPath()
          ctx.arc(x0 + ux, y0 - uy, 1.6, 0, 6.2832)
          ctx.fill()
        }
      } else {
        drawDots(ctx, diff.data, pal.muted, 1.6, 0.16)
        drawDots(ctx, sampleRef.current, pal.primary, 2.3, 0.85)
      }
    },
    [diff],
  )

  const stop = useCallback(() => {
    runningRef.current = false
    cancelAnimationFrame(rafRef.current)
  }, [])

  const loop = useCallback(() => {
    if (!runningRef.current || !activeRef.current) return
    const l = diff.trainSteps(SPEEDS[speedRef.current])
    const now = performance.now()
    if (now - lastSampleRef.current > 1100) {
      lastSampleRef.current = now
      if (viewRef.current === 'sample') regenSample()
    }
    if (now - lastUiRef.current > 90) {
      lastUiRef.current = now
      lossHistRef.current.push(l)
      if (lossHistRef.current.length > 160) lossHistRef.current.shift()
      setLossHist([...lossHistRef.current])
      setStep(diff.step)
      setLoss(l)
      redraw()
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [diff, regenSample, redraw])

  const play = () => {
    runningRef.current = true
    setRunning(true)
    lastUiRef.current = 0
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }
  const pause = () => {
    stop()
    setRunning(false)
  }

  // Stoppt, sobald die Phase verlassen wird (rAF nicht weiterlaufen lassen).
  useEffect(() => {
    if (!active) {
      stop()
      setRunning(false)
    } else {
      redraw()
    }
  }, [active, stop, redraw])
  useEffect(() => () => stop(), [stop])
  // Ansicht gewechselt → neu zeichnen (viewRef ist nach dem Render aktuell).
  useEffect(() => redraw(), [view, redraw])

  const enoughTrained = step >= 1500

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:flex-1">
          <Board canvasRef={ref} />
          <div className="mt-2 inline-flex rounded-lg border p-0.5 text-xs">
            <Chip active={view === 'sample'} onClick={() => { regenSample(); setView('sample') }}>
              {t('df.train.sample')}
            </Chip>
            <Chip active={view === 'field'} onClick={() => setView('field')}>
              {t('df.train.field')}
            </Chip>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 sm:w-44">
          <LossPlot hist={lossHist} t={t} />
          <div className="space-y-1 rounded-lg border bg-background/40 px-3 py-2 font-mono text-xs tabular-nums">
            <Read label={t('df.train.steps')} value={step.toLocaleString('de-CH')} />
            <Read label={t('df.train.loss')} value={loss === null ? '—' : loss.toFixed(3)} accent />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {running ? (
          <Button onClick={pause} variant="secondary" className="gap-1.5">
            <PauseIcon /> {t('df.pause')}
          </Button>
        ) : (
          <Button onClick={play} className="gap-1.5">
            <PlayIcon /> {step > 0 ? t('df.train.resume') : t('df.train.start')}
          </Button>
        )}
        <div className="inline-flex rounded-lg border p-0.5 text-xs">
          {(['slow', 'normal', 'turbo'] as const).map((s) => (
            <Chip key={s} active={speed === s} onClick={() => setSpeed(s)}>
              {t(`df.speed.${s}`)}
            </Chip>
          ))}
        </div>
        <Button
          onClick={onTrained}
          variant="outline"
          disabled={!enoughTrained}
          className="gap-1.5"
          title={enoughTrained ? undefined : t('df.train.needMore')}
        >
          {t('df.train.toGen')} <span aria-hidden="true">→</span>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {view === 'field' ? t('df.train.fieldHint') : step === 0 ? t('df.train.idle') : t('df.train.emerge')}
      </p>
    </div>
  )
}

// === Phase 3: Generieren ====================================================
function GenPhase({ diff, active, t }: { diff: Diffusion; active: boolean; t: Trans }) {
  const [temp, setTemp] = useState(0.9)
  const [running, setRunning] = useState(false)
  const [tNow, setTNow] = useState<number | null>(null)

  const ptsRef = useRef<Pt[]>([])
  const tRef = useRef<number>(0)
  const tempRef = useRef(temp)
  const runningRef = useRef(false)
  const activeRef = useRef(active)
  const rafRef = useRef(0)
  tempRef.current = temp
  activeRef.current = active

  const { ref, redraw } = useCanvas(
    (ctx, pal) => {
      // sanfte Spur: halbtransparenter Hintergrund statt hartem Clear
      ctx.fillStyle = rgba(pal.bg, runningRef.current ? 0.32 : 1)
      ctx.fillRect(0, 0, S, S)
      drawDots(ctx, diff.data, pal.muted, 1.5, 0.12) // Ziel als blasse Referenz
      drawDots(ctx, ptsRef.current, pal.primary, 2.4, 0.9)
    },
    [diff],
  )

  const stop = useCallback(() => {
    runningRef.current = false
    cancelAnimationFrame(rafRef.current)
  }, [])

  const loop = useCallback(() => {
    if (!runningRef.current || !activeRef.current) return
    const tt = tRef.current
    if (tt < 1) {
      stop()
      setRunning(false)
      setTNow(0)
      redraw()
      return
    }
    ptsRef.current = diff.sampleStep(ptsRef.current, tt, tempRef.current)
    tRef.current = tt - 1
    setTNow(tRef.current)
    redraw()
    rafRef.current = requestAnimationFrame(loop)
  }, [diff, stop, redraw])

  const start = () => {
    ptsRef.current = diff.sampleInit(360)
    tRef.current = T
    setTNow(T)
    runningRef.current = true
    setRunning(true)
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    if (!active) {
      stop()
      setRunning(false)
    } else {
      redraw()
    }
  }, [active, stop, redraw])
  useEffect(() => () => stop(), [stop])

  const trained = diff.step >= 1500
  const progress = tNow === null ? 0 : Math.round((1 - tNow / T) * 100)

  return (
    <div className="space-y-4">
      <Board canvasRef={ref} />

      {tNow !== null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-[width] duration-100" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {running ? (
          <Button onClick={() => { stop(); setRunning(false) }} variant="secondary" className="gap-1.5">
            <PauseIcon /> {t('df.pause')}
          </Button>
        ) : (
          <Button onClick={start} className="gap-1.5">
            <ReloadIcon /> {tNow === null ? t('df.gen.start') : t('df.gen.again')}
          </Button>
        )}
        <div className="flex min-w-[220px] flex-1 items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">{t('df.gen.temp')}</span>
          <Slider value={[temp]} onValueChange={([v]) => setTemp(v)} min={0.2} max={1.4} step={0.05} aria-label={t('df.gen.temp')} className="flex-1" />
          <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums">{temp.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {!trained ? t('df.gen.untrained') : tNow === null ? t('df.gen.idle') : tNow === 0 ? t('df.gen.done') : t('df.gen.running')}
      </p>
    </div>
  )
}

// === gemeinsame Bausteine ===================================================
function Board({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement | null> }) {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-background/40">
        <canvas ref={canvasRef} width={S} height={S} className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  )
}

function LossPlot({ hist, t }: { hist: number[]; t: Trans }) {
  const W = 176
  const H = 84
  const baseline = 2 // E||ε||² bei Nullvorhersage = Rateniveau
  const hi = baseline
  const lo = 0.5
  const px = (i: number) => (hist.length <= 1 ? 0 : (i / (hist.length - 1)) * W)
  const py = (v: number) => H - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * H
  const path = hist.map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ')
  return (
    <div className="rounded-lg border bg-background/40 p-2">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{t('df.train.lossCurve')}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('df.train.lossCurve')}>
        <line x1={0} y1={py(baseline)} x2={W} y2={py(baseline)} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
        {hist.length > 1 && <path d={path} fill="none" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  )
}

function Read({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? 'font-semibold text-[hsl(var(--chart-2))]' : 'text-foreground'}>{value}</span>
    </span>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
    >
      {children}
    </button>
  )
}
