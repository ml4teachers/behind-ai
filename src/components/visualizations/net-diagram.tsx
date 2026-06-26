'use client'

// ---------------------------------------------------------------------------
// Geteiltes Knoten-Diagramm eines kleinen Netzes 2 → H → 1. Genutzt vom
// MLP-Labor (gewichtsgefärbte Kanten, klickbar für die Aktivierungs-Erklärung)
// UND von der Backprop-Vertiefung (gleiche Netz-Optik, aber Knoten leuchten im
// Vorwärtspass und Kanten tragen im Rückwärtspass ihren Gradienten als Badge).
// Damit sieht das Netz auf beiden Seiten identisch aus.
// ---------------------------------------------------------------------------

import type { Activation, MLP } from '@/lib/perceptron/mlp'
import type { ExplainKey } from '@/components/visualizations/activation-explainer'

/** Optionaler Override für eine Kante (Backprop-Sicht). */
export interface EdgeStyle {
  color?: string
  width?: number
  /** Kurzer Text an der Kantenmitte (z. B. der Gradient „+0.42"). */
  badge?: string
  badgeColor?: string
}

/** Schicht-Beschriftungen – vom Aufrufer aus seinem eigenen i18n-Namespace
 *  gefüllt (mlp-lab: ml.*, Backprop: gd.*). So bleibt das Diagramm namespace-frei. */
export interface NetLabels {
  /** „Eingabe" */
  input: string
  /** „versteckt" – die Anzahl (H) hängt das Diagramm selbst an. */
  hidden: string
  /** „Ausgabe" */
  output: string
  /** Wort für die aria-Beschreibung, ergibt „<aria> 2-H-1". */
  aria: string
}

export interface NetworkDiagramProps {
  net: MLP
  labels: NetLabels
  /** Versteckte Aktivierung – bestimmt Beschriftung (tanh/ReLU) und Erklär-Key. */
  activation?: Activation
  /** MLP-Labor: Klick auf ein Neuron öffnet die tanh-/ReLU-/σ-Erklärung. */
  onExplain?: (k: ExplainKey) => void
  /** Backprop: Kanten-Override. `i` ist bei 'out' egal. undefined = Default. */
  edge?: (layer: 'hidden' | 'out', j: number, i: number) => EdgeStyle | undefined
  /** Backprop: 0…1 Leucht-Intensität eines Knotens (Vorwärtspass). */
  glow?: (layer: 'in' | 'hidden' | 'out', idx: number) => number
  /** Backprop: zeigt die konkreten Eingabewerte statt „x1/x2". */
  inputValues?: number[]
}

const fmt = (v: number): string => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2)

export function NetworkDiagram({ net, labels, activation = 'tanh', onExplain, edge, glow, inputValues }: NetworkDiagramProps) {
  const H = net.W1.length
  const hiddenLabel = activation === 'relu' ? 'ReLU' : 'tanh'
  const hiddenKey: ExplainKey = activation === 'relu' ? 'relu' : 'tanh'
  const W = 300
  const Ht = 228
  const inX = 42
  const hX = 150
  const outX = 260
  const inY = [86, 162]
  const outY = 124
  const outR = 21
  const cy0 = 116
  const gap = H <= 2 ? 70 : H <= 4 ? 48 : H <= 6 ? 30 : 22
  const hY = Array.from({ length: H }, (_, j) => cy0 + (j - (H - 1) / 2) * gap)
  const hr = H <= 3 ? 19 : H <= 5 ? 14 : 11

  const edgeColor = (w: number) =>
    w === 0 ? 'hsl(var(--muted-foreground)/0.4)' : w > 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))'
  const edgeWidth = (w: number) => 0.8 + Math.min(Math.abs(w), 3) * 1.2

  // Leucht-Halo hinter einem Knoten (Vorwärtspass).
  const Glow = ({ x, y, r, layer, idx }: { x: number; y: number; r: number; layer: 'in' | 'hidden' | 'out'; idx: number }) => {
    const g = glow?.(layer, idx) ?? 0
    if (g <= 0.01) return null
    return <circle cx={x} cy={y} r={r + 7} fill="hsl(var(--chart-2))" opacity={0.4 * g} />
  }

  // Eine Kante zeichnen – Default aus dem Gewicht, optional vom Override.
  const Edge = ({ x1, y1, x2, y2, w, layer, j, i }: { x1: number; y1: number; x2: number; y2: number; w: number; layer: 'hidden' | 'out'; j: number; i: number }) => {
    const ov = edge?.(layer, j, i)
    const color = ov?.color ?? edgeColor(w)
    const width = ov?.width ?? edgeWidth(w)
    return (
      <>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
        {ov?.badge && (
          <g>
            <rect x={(x1 + x2) / 2 - 15} y={(y1 + y2) / 2 - 8} width={30} height={14} rx={3} fill="hsl(var(--background))" stroke={ov.badgeColor ?? color} strokeWidth={1} opacity={0.95} />
            <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 8.5, fontWeight: 700 }} fill={ov.badgeColor ?? color}>
              {ov.badge}
            </text>
          </g>
        )}
      </>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${Ht}`} className="mx-auto h-auto w-full max-w-[420px]" role="img" aria-label={`${labels.aria} 2-${H}-1`}>
      {/* Kanten zuerst (liegen unter den Knoten) */}
      {hY.map((hy, j) => [0, 1].map((i) => <Edge key={`e${i}${j}`} x1={inX} y1={inY[i]} x2={hX} y2={hy} w={net.W1[j][i]} layer="hidden" j={j} i={i} />))}
      {hY.map((hy, j) => (
        <Edge key={`o${j}`} x1={hX} y1={hy} x2={outX} y2={outY} w={net.W2[j]} layer="out" j={j} i={0} />
      ))}

      {/* Eingänge */}
      {[0, 1].map((i) => (
        <g key={`in${i}`}>
          <Glow x={inX} y={inY[i]} r={15} layer="in" idx={i} />
          <circle cx={inX} cy={inY[i]} r={15} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1.5} />
          <text x={inX} y={inY[i]} textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: inputValues ? 9 : 10, fontWeight: 600 }}>
            {inputValues ? inputValues[i]?.toFixed(1) : `x${i + 1}`}
          </text>
        </g>
      ))}

      {/* Versteckte Neuronen – klickbar → tanh-/ReLU-Erklärung */}
      {hY.map((hy, j) => (
        <g key={`h${j}`} className={onExplain ? 'cursor-pointer' : undefined} onClick={() => onExplain?.(hiddenKey)}>
          <Glow x={hX} y={hy} r={hr} layer="hidden" idx={j} />
          <circle cx={hX} cy={hy} r={hr} fill="hsl(var(--background))" />
          <circle cx={hX} cy={hy} r={hr} fill="hsl(var(--primary)/0.12)" stroke="hsl(var(--primary))" strokeWidth={1.5} />
          {H <= 4 && (
            <text x={hX} y={hy} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: H <= 3 ? 9 : 7, fontWeight: 600 }}>
              {hiddenLabel}
            </text>
          )}
        </g>
      ))}

      {/* Ausgabe – klickbar → Sigmoid-Erklärung */}
      <g className={onExplain ? 'cursor-pointer' : undefined} onClick={() => onExplain?.('sigmoid')}>
        <Glow x={outX} y={outY} r={outR} layer="out" idx={0} />
        <circle cx={outX} cy={outY} r={outR} fill="hsl(var(--background))" />
        <circle cx={outX} cy={outY} r={outR} fill="hsl(var(--chart-1)/0.14)" stroke="hsl(var(--chart-1))" strokeWidth={1.5} />
        <text x={outX} y={outY} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 9, fontWeight: 600 }}>
          Σ→σ
        </text>
        {onExplain && (
          <>
            <circle cx={outX + outR - 5} cy={outY - outR + 5} r={7} fill="hsl(var(--primary))" />
            <text x={outX + outR - 5} y={outY - outR + 5} textAnchor="middle" dominantBaseline="central" fill="hsl(var(--primary-foreground))" style={{ fontSize: 9, fontWeight: 700 }}>
              ?
            </text>
          </>
        )}
      </g>

      <text x={inX} y={Ht - 7} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
        {labels.input}
      </text>
      <text x={hX} y={Ht - 7} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
        {labels.hidden} ({H})
      </text>
      <text x={outX} y={Ht - 7} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
        {labels.output}
      </text>
    </svg>
  )
}

/** Signiertes Format „+0.42 / −0.96" für Gradienten-Badges und -Ablesungen. */
export { fmt as fmtGrad }
