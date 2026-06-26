'use client'

// ---------------------------------------------------------------------------
// Erklär-Karte für die Symbole im Neuron / Netz. Klickt man auf ein Neuron,
// öffnet sich unten diese Karte mit Text UND einer kleinen Grafik der
// Aktivierungsfunktion (harte Stufe Σ>θ, weiches tanh, Sigmoid σ, ReLU-Knick).
// ---------------------------------------------------------------------------

import { Cross2Icon } from '@radix-ui/react-icons'
import { useTranslations } from '@/lib/i18n/use-translations'

export type ExplainKey = 'sum' | 'tanh' | 'sigmoid' | 'relu'

export function ExplainCard({ which, onClose }: { which: ExplainKey; onClose: () => void }) {
  const t = useTranslations()
  const title = t(`act.${which}.title`)
  const body = t(`act.${which}.body`)
  const xLabel = t(`act.${which}.x`)
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-primary">{title}</h4>
        <button type="button" onClick={onClose} className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('act.close')}>
          <Cross2Icon />
        </button>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        <div className="shrink-0">
          <ActivationPlot kind={which} xLabel={xLabel} ariaLabel={t('act.aria.plot')} />
        </div>
      </div>
    </div>
  )
}

function ActivationPlot({ kind, xLabel, ariaLabel }: { kind: ExplainKey; xLabel: string; ariaLabel: string }) {
  const W = 216
  const H = 132
  const padL = 30
  const padR = 12
  const padT = 12
  const padB = 26
  const xMin = kind === 'sigmoid' ? -6 : -4
  const xMax = kind === 'sigmoid' ? 6 : 4
  // ReLU wächst unbeschränkt → eigener y-Bereich, damit der Knick + die Gerade passen.
  const yMin = kind === 'relu' ? -0.4 : kind === 'sum' || kind === 'sigmoid' ? -0.12 : -1.15
  const yMax = kind === 'relu' ? 4.4 : 1.15
  const fn =
    kind === 'tanh'
      ? Math.tanh
      : kind === 'sigmoid'
        ? (x: number) => 1 / (1 + Math.exp(-x))
        : kind === 'relu'
          ? (x: number) => Math.max(0, x)
          : (x: number) => (x > 0 ? 1 : 0)

  const px = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR)
  const py = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB)

  // Kurve abtasten (Stufe wird mit hoher Dichte fast senkrecht).
  const N = 160
  const path = Array.from({ length: N + 1 }, (_, i) => {
    const x = xMin + (i / N) * (xMax - xMin)
    return `${i === 0 ? 'M' : 'L'} ${px(x).toFixed(1)} ${py(fn(x)).toFixed(1)}`
  }).join(' ')

  const yTicks = kind === 'relu' ? [0, 2, 4] : kind === 'tanh' ? [-1, 0, 1] : [0, 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[132px] w-[216px]" role="img" aria-label={ariaLabel}>
      {/* Achsen */}
      <line x1={px(xMin)} y1={py(0)} x2={px(xMax)} y2={py(0)} stroke="hsl(var(--border))" strokeWidth={1} />
      <line x1={px(0)} y1={py(yMax)} x2={px(0)} y2={py(yMin)} stroke="hsl(var(--border))" strokeWidth={1} />
      {/* y-Ticks */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={px(0) - 3} y1={py(v)} x2={px(0) + 3} y2={py(v)} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
          <text x={px(xMin) - 4} y={py(v)} textAnchor="end" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 9 }}>
            {v}
          </text>
        </g>
      ))}
      {/* Kurve */}
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {/* x-Achsenname */}
      <text x={(px(xMin) + px(xMax)) / 2} y={H - 6} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
        {xLabel}
      </text>
    </svg>
  )
}
