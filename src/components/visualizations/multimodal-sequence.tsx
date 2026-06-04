'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/lib/i18n/use-translations'

// ---------------------------------------------------------------------------
// „Wie ein Sprachmodell ein Bild liest" — die 2D→1D-Verwandlung.
//
// Ein Sprachmodell verarbeitet eine Reihe: ein Stück nach dem anderen,
// eindimensional. Ein Bild ist aber eine Fläche. Diese Visualisierung zeigt
// den Mechanismus, mit dem die Fläche in die Reihe kommt:
//   1) das Bild wird in Kacheln zerlegt (Fläche)
//   2) die Kacheln werden zu EINER Reihe ausgerollt (2D → 1D)
//   3) jede Kachel wird zu Zahlen und steht im selben Strom wie die Text-Tokens
//
// Alles clientseitig: Die Szenen werden auf ein Canvas gezeichnet, die Kacheln
// sind echte Ausschnitte daraus, der „Vektor" je Kachel ist aus ihren Farben
// gerechnet. Bewusst KEINE genauen Token-Zahlen und KEIN Anbieter-Vergleich —
// es geht nur um das Prinzip. Eine Kachel ist anklickbar → ihre Zahlen
// werden sichtbar (Vertiefung „Mehr Einblicke"). DE inline (→ Thread 9).
// ---------------------------------------------------------------------------

const BOX = 256 // interne Zeichenfläche (px), quadratisch
const FIT = 260 // Zielbreite des Rasters auf dem Bildschirm (px)

// Die drei Farbkanäle je Kachel (Reihenfolge = vec-Index). Bewusst nur R/G/B:
// eindeutig, jeder Balken in seiner eigenen Farbe, zusammen die Durchschnittsfarbe.
// Labels are provided via i18n keys 'multimodalSeq.axisRed/Green/Blue'
// AXES built inside component via useTranslations()

type Scene = { id: string; label: string; draw: (ctx: CanvasRenderingContext2D) => void }

const SCENE_DRAWS: Array<{ id: string; draw: (ctx: CanvasRenderingContext2D) => void }> = [
  {
    id: 'sunset',
    draw: (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, BOX)
      g.addColorStop(0, '#3b2f6b')
      g.addColorStop(0.5, '#e06a3a')
      g.addColorStop(0.82, '#f4b15a')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, BOX, BOX)
      ctx.fillStyle = '#fff4c2'
      ctx.beginPath()
      ctx.arc(BOX * 0.52, BOX * 0.6, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#241a33'
      ctx.beginPath()
      ctx.moveTo(0, BOX)
      ctx.lineTo(0, BOX * 0.8)
      ctx.quadraticCurveTo(BOX * 0.5, BOX * 0.66, BOX, BOX * 0.82)
      ctx.lineTo(BOX, BOX)
      ctx.closePath()
      ctx.fill()
    },
  },
  {
    id: 'meadow',
    draw: (ctx) => {
      const sky = ctx.createLinearGradient(0, 0, 0, BOX * 0.6)
      sky.addColorStop(0, '#6aa9f4')
      sky.addColorStop(1, '#cfe7ff')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, BOX, BOX)
      ctx.fillStyle = '#ffe27a'
      ctx.beginPath()
      ctx.arc(BOX * 0.78, BOX * 0.24, 24, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      for (const [cx, cy, r] of [
        [70, 70, 16],
        [92, 62, 20],
        [114, 72, 15],
      ] as const) {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }
      const grass = ctx.createLinearGradient(0, BOX * 0.58, 0, BOX)
      grass.addColorStop(0, '#6db83f')
      grass.addColorStop(1, '#357a26')
      ctx.fillStyle = grass
      ctx.fillRect(0, BOX * 0.6, BOX, BOX * 0.4)
      ctx.fillStyle = '#6b4423'
      ctx.fillRect(BOX * 0.34, BOX * 0.5, 12, 60)
      ctx.fillStyle = '#2f7d2a'
      ctx.beginPath()
      ctx.arc(BOX * 0.36, BOX * 0.46, 34, 0, Math.PI * 2)
      ctx.fill()
    },
  },
  {
    id: 'sea',
    draw: (ctx) => {
      const sky = ctx.createLinearGradient(0, 0, 0, BOX * 0.5)
      sky.addColorStop(0, '#5fb0e6')
      sky.addColorStop(1, '#c4e6f7')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, BOX, BOX * 0.5)
      ctx.fillStyle = '#fff1b8'
      ctx.beginPath()
      ctx.arc(BOX * 0.3, BOX * 0.2, 22, 0, Math.PI * 2)
      ctx.fill()
      const sea = ctx.createLinearGradient(0, BOX * 0.5, 0, BOX * 0.82)
      sea.addColorStop(0, '#2f74ad')
      sea.addColorStop(1, '#173f63')
      ctx.fillStyle = sea
      ctx.fillRect(0, BOX * 0.5, BOX, BOX * 0.32)
      const sand = ctx.createLinearGradient(0, BOX * 0.82, 0, BOX)
      sand.addColorStop(0, '#ecd9a4')
      sand.addColorStop(1, '#d6bd80')
      ctx.fillStyle = sand
      ctx.fillRect(0, BOX * 0.82, BOX, BOX * 0.18)
    },
  },
]

const GRID_NS = [4, 8, 12] as const

const TEXT_TOKENS = ['Was', 'ist', 'auf', 'dem', 'Bild', '?']

type Tile = { row: number; col: number; vec: number[] }

export function MultimodalSequence() {
  const t = useTranslations()

  const SCENES: Scene[] = SCENE_DRAWS.map((s) => ({
    ...s,
    label: t(`multimodalSeq.scene${s.id.charAt(0).toUpperCase() + s.id.slice(1)}` as 'multimodalSeq.sceneSunset' | 'multimodalSeq.sceneMeadow' | 'multimodalSeq.sceneSea'),
  }))

  const GRIDS = [
    { n: 4 as const, label: `${t('multimodalSeq.gridCoarse')} (4×4)` },
    { n: 8 as const, label: `${t('multimodalSeq.gridMedium')} (8×8)` },
    { n: 12 as const, label: `${t('multimodalSeq.gridFine')} (12×12)` },
  ]

  const STEPS = [
    { title: t('multimodalSeq.step1Title'), hint: t('multimodalSeq.step1Hint') },
    { title: t('multimodalSeq.step2Title'), hint: t('multimodalSeq.step2Hint') },
    { title: t('multimodalSeq.step3Title'), hint: t('multimodalSeq.step3Hint') },
  ]

  const AXES = [
    { key: t('multimodalSeq.axisRed'), cls: 'bg-red-500' },
    { key: t('multimodalSeq.axisGreen'), cls: 'bg-green-500' },
    { key: t('multimodalSeq.axisBlue'), cls: 'bg-blue-500' },
  ]

  const [sceneId, setSceneId] = useState(SCENE_DRAWS[0].id)
  const [n, setN] = useState(4)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [data, setData] = useState<{ url: string; tiles: Tile[] } | null>(null)

  // Szene zeichnen, in Kacheln schneiden und je Kachel einen einfachen
  // „Vektor" aus den Durchschnittsfarben rechnen. Bei Wechsel: Auswahl lösen.
  useEffect(() => {
    const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0]
    const canvas = document.createElement('canvas')
    canvas.width = BOX
    canvas.height = BOX
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    scene.draw(ctx)
    const url = canvas.toDataURL()
    const img = ctx.getImageData(0, 0, BOX, BOX).data
    const cell = BOX / n
    const tiles: Tile[] = []
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        let r = 0
        let g = 0
        let b = 0
        let count = 0
        const x0 = Math.floor(col * cell)
        const y0 = Math.floor(row * cell)
        const x1 = Math.floor((col + 1) * cell)
        const y1 = Math.floor((row + 1) * cell)
        for (let y = y0; y < y1; y += 2) {
          for (let x = x0; x < x1; x += 2) {
            const i = (y * BOX + x) * 4
            r += img[i]
            g += img[i + 1]
            b += img[i + 2]
            count++
          }
        }
        r /= count
        g /= count
        b /= count
        tiles.push({
          row,
          col,
          vec: [r / 255, g / 255, b / 255].map((v) => Math.max(0.05, Math.min(1, v))),
        })
      }
    }
    setData({ url, tiles })
    setSelected(null)
  }, [sceneId, n])

  const ts = useMemo(() => Math.max(16, Math.floor(FIT / n)), [n])
  const tiles = data?.tiles ?? []
  const sel = selected != null ? tiles[selected] : null

  // Hintergrund-Slice für eine Kachel bei gegebener Anzeigegrösse.
  const bg = (tile: Tile, size: number) => ({
    width: size,
    height: size,
    backgroundImage: `url(${data!.url})`,
    backgroundSize: `${size * n}px ${size * n}px`,
    backgroundPosition: `-${tile.col * size}px -${tile.row * size}px`,
  })

  return (
    <div className="space-y-5">
      {/* Steuerung: Szene + Körnigkeit */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {SCENES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSceneId(s.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                sceneId === s.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t('multimodalSeq.sceneLabel')}</span>
          {GRIDS.map((gr) => (
            <button
              key={gr.n}
              onClick={() => setN(gr.n)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                n === gr.n
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {gr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bühne */}
      <div className="min-h-[19rem] rounded-lg border bg-muted/30 p-4 sm:p-6">
        {!data ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            {t('multimodalSeq.drawing')}
          </div>
        ) : step < 2 ? (
          <div className="space-y-4">
            {/* Schritt 0 (Raster) und 1 (Reihe) teilen dieselben Kacheln —
                framer animiert den Umbau (gemeinsame layout-Elemente). */}
            <motion.div
              layout
              className={cn(
                'mx-auto',
                step === 0
                  ? 'grid w-fit overflow-hidden rounded-md'
                  : 'flex w-full gap-2 overflow-x-auto px-0.5 py-1',
              )}
              style={step === 0 ? { gridTemplateColumns: `repeat(${n}, ${ts}px)` } : undefined}
            >
              {tiles.map((tile, i) => (
                <motion.button
                  layout
                  key={`${sceneId}-${n}-${i}`}
                  type="button"
                  aria-label={`${t('multimodalSeq.tileAria')} ${tile.col + 1}, ${tile.row + 1}`}
                  onClick={step === 1 ? () => setSelected((s) => (s === i ? null : i)) : undefined}
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  className={cn('flex flex-shrink-0 flex-col items-center', step === 1 && 'cursor-pointer')}
                >
                  <span
                    aria-hidden
                    style={{
                      ...bg(tile, ts),
                      boxShadow:
                        selected === i
                          ? 'inset 0 0 0 2px hsl(var(--primary))'
                          : step === 0
                            ? 'inset 0 0 0 0.5px hsl(var(--background) / 0.7)'
                            : 'inset 0 0 0 1px hsl(var(--background))',
                      borderRadius: step === 0 ? 0 : 4,
                    }}
                  />
                  {step === 1 && (
                    <span className="mt-1.5 flex h-9 items-end gap-[2px]" style={{ width: ts }}>
                      {tile.vec.map((v, j) => (
                        <span
                          key={j}
                          className={cn('flex-1 rounded-[1px]', AXES[j].cls)}
                          style={{ height: `${Math.round(v * 100)}%` }}
                        />
                      ))}
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Schritt 1: Hinweis zum Reinschauen ODER der Inspektor */}
            {step === 1 &&
              (sel ? (
                <div className="flex items-start gap-4 rounded-lg border bg-background p-3">
                  <div className="flex-shrink-0 text-center">
                    <span
                      aria-hidden
                      className="block"
                      style={{ ...bg(sel, 64), borderRadius: 6, boxShadow: 'inset 0 0 0 2px hsl(var(--primary))' }}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t('multimodalSeq.tileAria')} {sel.col + 1}·{sel.row + 1}
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs text-muted-foreground">{t('multimodalSeq.tileNumbers')}</p>
                    {AXES.map((a, j) => (
                      <div key={a.key} className="flex items-center gap-2">
                        <span className="w-20 flex-shrink-0 text-xs text-muted-foreground">{a.key}</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-[1px] bg-secondary">
                          <div
                            className={cn('h-full', a.cls)}
                            style={{ width: `${Math.round(sel.vec[j] * 100)}%` }}
                          />
                        </div>
                        <span className="w-8 flex-shrink-0 text-right text-xs tabular-nums">
                          {sel.vec[j].toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  {tiles.length} {t('multimodalSeq.tileInspectHint')}
                </p>
              ))}
          </div>
        ) : (
          <SequenceView url={data.url} tiles={tiles} n={n} t={t} />
        )}
      </div>

      {/* Schritt-Erklärung + Stepper */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex gap-1.5 pt-1">
            {STEPS.map((s, i) => (
              <span
                key={s.title}
                aria-hidden
                className={cn('h-1.5 w-6 rounded-full transition-colors', i === step ? 'bg-primary' : 'bg-border')}
              />
            ))}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {step + 1}. {STEPS[step].title}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{STEPS[step].hint}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <span aria-hidden>←</span> {t('multimodalSeq.back')}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              {step === 0 ? t('multimodalSeq.unroll') : t('multimodalSeq.next')} <span aria-hidden>→</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setStep(0)}>
              {t('multimodalSeq.restart')}
            </Button>
          )}
        </div>
      </div>

      {/* ---- Mehr Einblicke (für Interessierte) ---- */}
      <div className="rounded-lg border bg-background/40">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          <span>{t('multimodalSeq.moreTitle')} {showMore ? '' : t('multimodalSeq.moreSuffix')}</span>
          <span className="text-muted-foreground">{showMore ? '–' : '+'}</span>
        </button>
        {showMore && (
          <div className="space-y-3 border-t p-4 text-sm leading-relaxed text-muted-foreground">
            <p>{t('multimodalSeq.moreP1')}</p>
            <p>{t('multimodalSeq.moreP2')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Schritt 2: die Bild-Kacheln als kompakte Reihe zwischen Wort-Tokens.
function SequenceView({ url, tiles, n, t }: { url: string; tiles: Tile[]; n: number; t: (k: string) => string }) {
  const small = 22
  const shown = tiles.slice(0, Math.min(tiles.length, 14))
  const truncated = tiles.length > shown.length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-muted-foreground">{t('multimodalSeq.streamLabel')}</span>
        {shown.map((tile, i) => (
          <span
            key={i}
            className="flex-shrink-0"
            style={{
              width: small,
              height: small,
              borderRadius: 4,
              backgroundImage: `url(${url})`,
              backgroundSize: `${small * n}px ${small * n}px`,
              backgroundPosition: `-${tile.col * small}px -${tile.row * small}px`,
              boxShadow: 'inset 0 0 0 1px hsl(var(--background))',
            }}
            title={`${t('multimodalSeq.tileAria')} ${i + 1}`}
          />
        ))}
        {truncated && <span className="px-1 text-muted-foreground">…</span>}
        {TEXT_TOKENS.map((tok, i) => (
          <span key={i} className="rounded bg-primary/10 px-2 py-1 text-sm text-primary">
            {tok}
          </span>
        ))}
        <span className="rounded border border-dashed border-muted-foreground/50 px-2 py-1 text-sm text-muted-foreground">
          {t('multimodalSeq.nextPiece')}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('multimodalSeq.streamNote')}
      </p>
    </div>
  )
}
