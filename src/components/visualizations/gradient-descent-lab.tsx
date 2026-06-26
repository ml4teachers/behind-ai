'use client'

// ---------------------------------------------------------------------------
// „Wie lernt ein Netz?" – Gradientenabstieg zum Anfassen. Zwei Sichten:
//   1D: eine Verlustkurve über EINEM Gewicht. Ball, Tangente (= Steigung =
//       Gradient), ein Schritt = bergab. Lernrate zu gross → überschiesst/
//       divergiert, zu klein → kriecht.
//   2D: eine Verlust-Landschaft über zwei Gewichten (zwei Täler). Der Ball
//       rollt ins Tal; verschiedene Starts → verschiedene Täler (lokales Min).
// Der Clou: erklärt rückwirkend den Lernraten-Regler und „Neu starten" auf der
// MLP-Seite. Strings via i18n (gd.*), wie die Geschwisterseiten.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { PlayIcon, PauseIcon, ReloadIcon, TrackNextIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useTranslations } from '@/lib/i18n/use-translations'
import {
  D2D_MAX,
  D2D_MIN,
  D2D_NEW_RANGE,
  LR1D,
  LR2D,
  MIN_DEEP,
  MIN_SHALLOW,
  W1D_NEW_RANGE,
  W1D_START,
  grad1d,
  grad2d,
  loss1d,
  loss2d,
  whichBasin,
} from '@/lib/perceptron/gradient'

type View = '1d' | '2d'
type Status = 'idle' | 'running' | 'diverged' | 'settled'
type T = (key: string) => string

// === Theme-Farben aus CSS-Variablen (wie mlp-lab) ==========================
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

// === 1D: feste Kurvenstützpunkte + y-Bereich (deterministisch) =============
const X1_MIN = -2.9
const X1_MAX = 2.9
const CURVE_1D: [number, number][] = Array.from({ length: 161 }, (_, i) => {
  const w = X1_MIN + (i / 160) * (X1_MAX - X1_MIN)
  return [w, loss1d(w)]
})
const Y1_LO = Math.min(...CURVE_1D.map((p) => p[1])) - 0.5
const Y1_HI = Math.max(...CURVE_1D.map((p) => p[1])) + 0.4
const DIVERGE_1D = 2.95 // |w| darüber → divergiert
const SETTLE_1D = 0.0025 // |Steigung| darunter → im Minimum
const DIVERGE_2D = 3.4
const SETTLE_2D = 0.004

const S = 300 // 2D-Canvas
const GRID2D = 120
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function GradientDescentLab() {
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)
  const [view, setView] = useState<View>('1d')
  const [w, setW] = useState(W1D_START)
  const [pos, setPos] = useState<[number, number]>([-2.4, 0.9])
  const [trail, setTrail] = useState<[number, number][]>([])
  const [lr1d, setLr1d] = useState(LR1D.default)
  const [lr2d, setLr2d] = useState(LR2D.default)
  const [status, setStatus] = useState<Status>('idle')

  const viewRef = useRef(view)
  const wRef = useRef(w)
  const posRef = useRef(pos)
  const trailRef = useRef<[number, number][]>([])
  const lr1dRef = useRef(lr1d)
  const lr2dRef = useRef(lr2d)
  const runningRef = useRef(false)
  const rafRef = useRef(0)
  const lastUiRef = useRef(0)
  viewRef.current = view
  lr1dRef.current = lr1d
  lr2dRef.current = lr2d

  useEffect(() => setMounted(true), [])
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const stop = useCallback(() => {
    runningRef.current = false
    cancelAnimationFrame(rafRef.current)
  }, [])

  const syncUi = useCallback(() => {
    if (viewRef.current === '1d') setW(wRef.current)
    else {
      setPos([...posRef.current])
      setTrail([...trailRef.current])
    }
  }, [])

  // Ein Abstiegs-Schritt. Gibt 'go' | 'diverged' | 'settled' zurück.
  const stepOnce = useCallback((): 'go' | 'diverged' | 'settled' => {
    if (viewRef.current === '1d') {
      const next = wRef.current - lr1dRef.current * grad1d(wRef.current)
      wRef.current = next
      if (!Number.isFinite(next) || Math.abs(next) > DIVERGE_1D) return 'diverged'
      if (Math.abs(grad1d(next)) < SETTLE_1D) return 'settled'
      return 'go'
    }
    const [a, b] = posRef.current
    const [ga, gb] = grad2d(a, b)
    const na = a - lr2dRef.current * ga
    const nb = b - lr2dRef.current * gb
    posRef.current = [na, nb]
    trailRef.current.push([na, nb])
    if (trailRef.current.length > 500) trailRef.current.shift()
    if (!Number.isFinite(na) || !Number.isFinite(nb) || Math.hypot(na, nb) > DIVERGE_2D) return 'diverged'
    const [ga2, gb2] = grad2d(na, nb)
    if (Math.hypot(ga2, gb2) < SETTLE_2D) return 'settled'
    return 'go'
  }, [])

  const loop = useCallback(() => {
    if (!runningRef.current) return
    const r = stepOnce()
    const now = performance.now()
    if (r !== 'go' || now - lastUiRef.current > 55) {
      lastUiRef.current = now
      syncUi()
    }
    if (r === 'diverged') {
      stop()
      setStatus('diverged')
      return
    }
    if (r === 'settled') {
      stop()
      setStatus('settled')
      return
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [stepOnce, syncUi, stop])

  const play = () => {
    if (status === 'diverged' || status === 'settled') return
    runningRef.current = true
    setStatus('running')
    lastUiRef.current = 0
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(loop)
  }
  const pause = () => {
    stop()
    setStatus('idle')
  }
  const singleStep = () => {
    if (status === 'diverged' || status === 'settled') return
    stop()
    const r = stepOnce()
    syncUi()
    setStatus(r === 'diverged' ? 'diverged' : r === 'settled' ? 'settled' : 'idle')
  }

  const resetTo = useCallback(
    (nextW: number, nextPos: [number, number]) => {
      stop()
      wRef.current = nextW
      posRef.current = nextPos
      trailRef.current = []
      setW(nextW)
      setPos(nextPos)
      setTrail([])
      setStatus('idle')
    },
    [stop],
  )

  // „Neuer Start": würfelt einen Startpunkt (nur im Handler – nie beim Render).
  const newStart = () => {
    if (viewRef.current === '1d') {
      const [lo, hi] = W1D_NEW_RANGE
      resetTo(lo + Math.random() * (hi - lo), posRef.current)
    } else {
      const [lo, hi] = D2D_NEW_RANGE
      resetTo(wRef.current, [lo + Math.random() * (hi - lo), lo + Math.random() * (hi - lo)])
    }
  }

  const switchView = (v: View) => {
    stop()
    setStatus('idle')
    setView(v)
  }

  // Manuelles Setzen aus den Plots.
  const pickW = (nw: number) => resetTo(clamp(nw, X1_MIN, X1_MAX), posRef.current)
  const pickPos = (a: number, b: number) =>
    resetTo(wRef.current, [clamp(a, D2D_MIN, D2D_MAX), clamp(b, D2D_MIN, D2D_MAX)])

  if (!mounted) {
    return <div className="min-h-[560px] animate-pulse rounded-lg bg-muted/40" aria-hidden="true" />
  }

  const running = status === 'running'
  const lr = view === '1d' ? lr1d : lr2d
  const setLr = view === '1d' ? setLr1d : setLr2d
  const lrCfg = view === '1d' ? LR1D : LR2D

  return (
    <div className="space-y-5">
      {/* ---- Umschalter ---- */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border p-0.5">
          <Chip active={view === '1d'} onClick={() => switchView('1d')}>
            {t('gd.view1d')}
          </Chip>
          <Chip active={view === '2d'} onClick={() => switchView('2d')}>
            {t('gd.view2d')}
          </Chip>
        </div>
        <p className="text-xs text-muted-foreground">{t(view === '1d' ? 'gd.view1d.hint' : 'gd.view2d.hint')}</p>
      </div>

      {/* ---- Plot ---- */}
      <div className="rounded-lg border bg-background/40 p-4">
        {view === '1d' ? (
          <OneD w={w} lr={lr1d} status={status} onPickW={pickW} t={t} />
        ) : (
          <TwoD pos={pos} trail={trail} status={status} onPickPos={pickPos} t={t} />
        )}
      </div>

      {/* ---- Ablesungen ---- */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg border bg-background/40 px-4 py-3 font-mono text-xs tabular-nums">
        {view === '1d' ? (
          <>
            <Read label={t('gd.read.weight')} value={fmt(w)} />
            <Read label={t('gd.read.slope')} value={fmt(grad1d(w))} accent />
            <Read label={t('gd.read.loss')} value={loss1d(w).toFixed(3)} />
            <Read label={t('gd.read.delta')} value={fmt(-lr1d * grad1d(w))} />
          </>
        ) : (
          <>
            <Read label={t('gd.read.pos')} value={`(${fmt(pos[0])}, ${fmt(pos[1])})`} />
            <Read label={t('gd.read.loss')} value={loss2d(pos[0], pos[1]).toFixed(3)} />
          </>
        )}
      </div>

      {/* ---- Steuerung ---- */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {running ? (
          <Button onClick={pause} variant="secondary" className="gap-1.5">
            <PauseIcon /> {t('gd.pause')}
          </Button>
        ) : (
          <Button onClick={play} disabled={status === 'diverged' || status === 'settled'} className="gap-1.5">
            <PlayIcon /> {t('gd.play')}
          </Button>
        )}
        <Button onClick={singleStep} variant="outline" disabled={running || status === 'diverged' || status === 'settled'} className="gap-1.5">
          <TrackNextIcon /> {t('gd.step')}
        </Button>
        <Button onClick={newStart} variant="outline" className="gap-1.5">
          <ReloadIcon /> {t('gd.restart')}
        </Button>
        <div className="flex min-w-[200px] flex-1 items-center gap-2">
          <span className="shrink-0 text-xs text-muted-foreground">{t('gd.learnRate')}</span>
          <Slider
            value={[lr]}
            onValueChange={([v]) => {
              setLr(v)
              if (status === 'diverged' || status === 'settled') setStatus('idle')
            }}
            min={lrCfg.min}
            max={lrCfg.max}
            step={lrCfg.step}
            aria-label={t('gd.learnRate')}
            className="flex-1"
          />
          <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums">{lr.toFixed(2)}</span>
        </div>
      </div>

      {/* ---- Status ---- */}
      <StatusBox view={view} status={status} pos={pos} t={t} />

      {/* ---- Der Clou: Brücke zur MLP-Seite ---- */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <p className="mb-1 font-semibold text-primary">{t('gd.cohesion.title')}</p>
        <p className="text-muted-foreground">
          {t('gd.cohesion.lr')} {t('gd.cohesion.restart')}{' '}
          <Link href="/mlp" className="font-medium text-primary underline-offset-2 hover:underline">
            {t('gd.cohesion.link')}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

// === 1D-Plot ================================================================
function OneD({ w, lr, status, onPickW, t }: { w: number; lr: number; status: Status; onPickW: (w: number) => void; t: T }) {
  const W = 460
  const H = 240
  const pL = 40
  const pR = 14
  const pT = 14
  const pB = 30
  const px = (x: number) => pL + ((x - X1_MIN) / (X1_MAX - X1_MIN)) * (W - pL - pR)
  const py = (L: number) => pT + (1 - (L - Y1_LO) / (Y1_HI - Y1_LO)) * (H - pT - pB)
  const draggingRef = useRef(false)

  const wv = clamp(w, X1_MIN, X1_MAX)
  const Lw = loss1d(wv)
  const g = grad1d(wv)
  const path = CURVE_1D.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p[0]).toFixed(1)} ${py(p[1]).toFixed(1)}`).join(' ')

  // Tangente: feste Pixellänge in Steigungsrichtung.
  const e = 0.001
  let dx = px(wv + e) - px(wv)
  let dy = py(loss1d(wv) + g * e) - py(loss1d(wv))
  const norm = Math.hypot(dx, dy) || 1
  dx = (dx / norm) * 40
  dy = (dy / norm) * 40

  // Nächster Schritt (Geist-Ball + Pfeil), solange nicht fertig.
  const wNext = clamp(wv - lr * g, X1_MIN, X1_MAX)
  const showNext = status !== 'diverged' && status !== 'settled' && Math.abs(wNext - wv) > 0.02

  const fromEvt = (ev: PointerEvent<SVGSVGElement>) => {
    const r = ev.currentTarget.getBoundingClientRect()
    const xPix = ((ev.clientX - r.left) / r.width) * W
    return X1_MIN + ((xPix - pL) / (W - pL - pR)) * (X1_MAX - X1_MIN)
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-none select-none"
      role="img"
      aria-label={t('gd.view1d')}
      style={{ cursor: 'ew-resize' }}
      onPointerDown={(ev) => {
        draggingRef.current = true
        ev.currentTarget.setPointerCapture(ev.pointerId)
        onPickW(fromEvt(ev))
      }}
      onPointerMove={(ev) => {
        if (draggingRef.current) onPickW(fromEvt(ev))
      }}
      onPointerUp={(ev) => {
        draggingRef.current = false
        ev.currentTarget.releasePointerCapture(ev.pointerId)
      }}
    >
      {/* Achsen */}
      <line x1={pL} y1={py(Y1_LO)} x2={W - pR} y2={py(Y1_LO)} stroke="hsl(var(--border))" strokeWidth={1} />
      <line x1={pL} y1={pT} x2={pL} y2={py(Y1_LO)} stroke="hsl(var(--border))" strokeWidth={1} />
      <text x={(pL + W - pR) / 2} y={H - 4} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
        {t('gd.read.weight')} w
      </text>
      <text transform={`translate(11 ${(pT + py(Y1_LO)) / 2}) rotate(-90)`} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>
        {t('gd.read.loss')}
      </text>

      {/* Verlustkurve */}
      <path d={path} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={0.85} />

      {/* Lot auf die w-Achse */}
      <line x1={px(wv)} y1={py(Lw)} x2={px(wv)} y2={py(Y1_LO)} stroke="hsl(var(--primary)/0.4)" strokeWidth={1} strokeDasharray="3 3" />

      {/* Tangente = Steigung = Gradient */}
      <line x1={px(wv) - dx} y1={py(Lw) - dy} x2={px(wv) + dx} y2={py(Lw) + dy} stroke="hsl(var(--chart-2))" strokeWidth={2.5} strokeLinecap="round" />

      {/* Nächster Schritt */}
      {showNext && (
        <>
          <path
            d={`M ${px(wv)} ${py(Lw)} Q ${(px(wv) + px(wNext)) / 2} ${py(Lw) + 16} ${px(wNext)} ${py(loss1d(wNext))}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={1.6}
            strokeDasharray="4 3"
            markerEnd="url(#gd-arrow)"
          />
          <circle cx={px(wNext)} cy={py(loss1d(wNext))} r={6} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} opacity={0.7} />
        </>
      )}
      <defs>
        <marker id="gd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="hsl(var(--primary))" />
        </marker>
      </defs>

      {/* Ball */}
      <circle cx={px(wv)} cy={py(Lw)} r={9} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
    </svg>
  )
}

// === 2D-Plot (Canvas-Heatmap + Overlay) ====================================
function TwoD({ pos, trail, status, onPickPos, t }: { pos: [number, number]; trail: [number, number][]; status: Status; onPickPos: (a: number, b: number) => void; t: T }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sx = (a: number) => ((a - D2D_MIN) / (D2D_MAX - D2D_MIN)) * S
  const sy = (b: number) => ((D2D_MAX - b) / (D2D_MAX - D2D_MIN)) * S

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const low = readRgb('--chart-1') // Tal = kühl
    const high = readRgb('--chart-3') // Berg = warm
    const N = GRID2D
    const vals = new Float32Array(N * N)
    let lo = Infinity
    let hi = -Infinity
    for (let gy = 0; gy < N; gy++) {
      for (let gx = 0; gx < N; gx++) {
        const a = D2D_MIN + (gx / (N - 1)) * (D2D_MAX - D2D_MIN)
        const b = D2D_MAX - (gy / (N - 1)) * (D2D_MAX - D2D_MIN)
        const L = loss2d(a, b)
        vals[gy * N + gx] = L
        if (L < lo) lo = L
        if (L > hi) hi = L
      }
    }
    const off = document.createElement('canvas')
    off.width = N
    off.height = N
    const octx = off.getContext('2d')
    if (!octx) return
    const img = octx.createImageData(N, N)
    const BANDS = 7
    for (let i = 0; i < N * N; i++) {
      let n = (vals[i] - lo) / (hi - lo || 1)
      n = Math.round(clamp(n, 0, 1) * BANDS) / BANDS // gebändert → Höhenlinien-Effekt
      const idx = i * 4
      img.data[idx] = Math.round(low[0] + (high[0] - low[0]) * n)
      img.data[idx + 1] = Math.round(low[1] + (high[1] - low[1]) * n)
      img.data[idx + 2] = Math.round(low[2] + (high[2] - low[2]) * n)
      img.data[idx + 3] = 150
    }
    octx.putImageData(img, 0, 0)
    ctx.clearRect(0, 0, S, S)
    ctx.imageSmoothingEnabled = false // harte Bandkanten
    ctx.drawImage(off, 0, 0, N, N, 0, 0, S, S)
  }, [])

  useEffect(() => {
    draw()
    const obs = new MutationObserver(() => draw())
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [draw])

  const pickFromEvt = (ev: PointerEvent<SVGSVGElement>) => {
    const r = ev.currentTarget.getBoundingClientRect()
    const a = D2D_MIN + ((ev.clientX - r.left) / r.width) * (D2D_MAX - D2D_MIN)
    const b = D2D_MAX - ((ev.clientY - r.top) / r.height) * (D2D_MAX - D2D_MIN)
    onPickPos(a, b)
  }

  const diverged = status === 'diverged'
  const ballA = clamp(pos[0], D2D_MIN, D2D_MAX)
  const ballB = clamp(pos[1], D2D_MIN, D2D_MAX)

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="relative aspect-square w-full overflow-hidden rounded-md border">
        <canvas ref={canvasRef} width={S} height={S} className="absolute inset-0 h-full w-full" />
        <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none" role="img" aria-label={t('gd.view2d')} onPointerDown={pickFromEvt}>
          {/* Talsohlen markieren */}
          {([[MIN_DEEP, t('gd.deep')], [MIN_SHALLOW, t('gd.shallow')]] as const).map(([m, lbl], i) => (
            <g key={i}>
              <circle cx={sx(m[0])} cy={sy(m[1])} r={4} fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth={1.5} />
              <text x={sx(m[0])} y={sy(m[1]) - 8} textAnchor="middle" className="fill-foreground" style={{ fontSize: 9, fontWeight: 600 }}>
                {lbl}
              </text>
            </g>
          ))}
          {/* Spur */}
          {trail.length > 1 && (
            <polyline points={trail.map((p) => `${sx(clamp(p[0], D2D_MIN, D2D_MAX)).toFixed(1)},${sy(clamp(p[1], D2D_MIN, D2D_MAX)).toFixed(1)}`).join(' ')} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinejoin="round" opacity={0.7} />
          )}
          {/* Ball */}
          <circle cx={sx(ballA)} cy={sy(ballB)} r={8} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} opacity={diverged ? 0.4 : 1} />
        </svg>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">{t('gd.2d.clickHint')}</p>
    </div>
  )
}

// === Status-Box =============================================================
function StatusBox({ view, status, pos, t }: { view: View; status: Status; pos: [number, number]; t: T }) {
  if (status === 'diverged') {
    return (
      <div className="rounded-lg border border-[hsl(var(--chart-8)/0.5)] bg-[hsl(var(--chart-8)/0.1)] p-4 text-sm">
        <span className="font-semibold text-[hsl(var(--chart-8))]">{t('gd.status.diverged.title')} </span>
        {t('gd.status.diverged.body')}
      </div>
    )
  }
  if (status === 'settled') {
    const msg = view === '1d' ? t('gd.status.settled1d') : whichBasin(pos[0], pos[1]) === 'deep' ? t('gd.status.settledDeep') : t('gd.status.settledShallow')
    return (
      <div className="rounded-lg border border-[hsl(var(--chart-2)/0.4)] bg-[hsl(var(--chart-2)/0.08)] p-4 text-sm">
        <span className="font-semibold text-[hsl(var(--chart-2))]">✓ </span>
        {msg}
      </div>
    )
  }
  return <p className="text-sm text-muted-foreground">{t(view === '1d' ? 'gd.status.idle1d' : 'gd.status.idle2d')}</p>
}

// === kleine Bausteine =======================================================
const fmt = (v: number): string => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2)

function Read({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
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
