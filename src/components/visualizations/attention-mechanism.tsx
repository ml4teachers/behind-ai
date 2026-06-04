'use client'

// ---------------------------------------------------------------------------
// Mechanik-Spielzeug (Vertiefung): wie ENTSTEHEN die Attention-Gewichte?
// Reine, live gerechnete Mathematik – Query·Key → Softmax → gewichtete Summe.
//
// Jedes Wort hat einen Vektor (hier 2D, zum Anfassen). Die Anfrage (Query) ist
// ziehbar. Relevanz = Skalarprodukt(Query, Key); Softmax macht daraus Gewichte
// (zusammen 100 %); die Ausgabe ist die gewichtete Mischung der Werte (Values).
// In echten Modellen kommen Q/K/V aus GELERNTEN Projektionen der Embeddings –
// trainiert wie auf der Training-Seite. Hier sind sie der Anschaulichkeit halber fest.
//
// Beschriftungen laufen über i18n (DE+EN).
// ---------------------------------------------------------------------------

import { useMemo, useRef, useState } from 'react'
import { useTranslations } from '@/lib/i18n/use-translations'

type Tok = { word: string; x: number; y: number; chart: number }

// Vier feste Plätze in 2D: zwei lose Cluster (oben-links / unten-rechts), damit
// „nah = ähnlich = mehr Gewicht" sichtbar wird. Die Positionen sind SCHEMATISCH
// (zur Anschauung erfunden, nicht die echten Embeddings) – Hinweis steht unter der Pipeline.
const SLOTS = [
  { x: 28, y: 30, chart: 1 },
  { x: 40, y: 22, chart: 2 },
  { x: 74, y: 64, chart: 3 },
  { x: 64, y: 78, chart: 4 },
] as const

// Je Satz vier Schlüsselwörter; die ersten zwei bilden ein Cluster, die letzten zwei das andere.
// Über den Satztext gewählt (kommt vom Explorer oben). Deutsch in beiden Sprachen – wie die Sätze.
type Layout = { match: string; words: [string, string, string, string] }
const LAYOUTS: Layout[] = [
  { match: 'Der Hund bellte laut, weil die Katze weglief', words: ['Hund', 'Katze', 'bellte', 'weglief'] },
  { match: 'Die Lehrerin schrieb die Aufgabe an die Tafel', words: ['Aufgabe', 'Tafel', 'Lehrerin', 'schrieb'] },
  { match: 'Das Kind ass das Brot nicht, weil es satt war', words: ['Kind', 'Brot', 'ass', 'satt'] },
  { match: 'Am Morgen trank der Mann seinen Kaffee', words: ['Mann', 'Kaffee', 'trank', 'Morgen'] },
]
const DEFAULT_WORDS = LAYOUTS[0].words

const C = (n: number) => `hsl(var(--chart-${n}))`
const softmax = (xs: number[]) => {
  const m = Math.max(...xs)
  const e = xs.map((x) => Math.exp(x - m))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / z)
}

export function AttentionMechanism({ sentenceText }: { sentenceText?: string | null }) {
  const t = useTranslations()
  const svgRef = useRef<SVGSVGElement>(null)
  const [q, setQ] = useState({ x: 50, y: 48 })
  const dragging = useRef(false) // Ref statt State: der Move-Handler liest den Wert sofort

  // Die vier Schlüsselwörter des oben gewählten Satzes auf die festen Plätze legen.
  const tokens = useMemo<Tok[]>(() => {
    const words = LAYOUTS.find((l) => l.match === sentenceText)?.words ?? DEFAULT_WORDS
    return words.map((word, i) => ({ word, ...SLOTS[i] }))
  }, [sentenceText])

  // Skalarprodukt(Query, Key), beide als Vektoren vom Zentrum (50,50) aus.
  // Durch 28 geteilt, damit die Zahlen handlich bleiben (entspricht der
  // 1/√d-Skalierung im echten Mechanismus, hier nur zur Lesbarkeit).
  const scores = tokens.map((tok) => ((q.x - 50) * (tok.x - 50) + (q.y - 50) * (tok.y - 50)) / 28)
  const weights = softmax(scores)
  const out = {
    x: tokens.reduce((s, tok, i) => s + weights[i] * tok.x, 0),
    y: tokens.reduce((s, tok, i) => s + weights[i] * tok.y, 0),
  }

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return null
    const r = svg.getBoundingClientRect()
    return {
      x: Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(6, Math.min(94, ((e.clientY - r.top) / r.height) * 100)),
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* Canvas */}
      <div>
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="aspect-square w-full touch-none select-none rounded-lg border bg-card"
          onPointerMove={(e) => {
            if (!dragging.current) return
            const p = toSvg(e)
            if (p) setQ(p)
          }}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => (dragging.current = false)}
        >
          {/* Linien Query → Wörter, Dicke ∝ Gewicht */}
          {tokens.map((tok, i) => (
            <line
              key={i}
              x1={q.x}
              y1={q.y}
              x2={tok.x}
              y2={tok.y}
              stroke={C(tok.chart)}
              strokeWidth={0.4 + weights[i] * 6}
              strokeOpacity={0.25 + weights[i] * 0.6}
              strokeLinecap="round"
            />
          ))}
          {/* Ausgabe = gewichtete Mischung (gestrichelte Kontur; Beschriftung in der Caption) */}
          <circle cx={out.x} cy={out.y} r={3.4} fill="none" stroke="hsl(var(--foreground))" strokeWidth={0.7} strokeDasharray="2 1.5" />
          {/* Wort-Punkte */}
          {tokens.map((tok, i) => (
            <g key={i}>
              <circle cx={tok.x} cy={tok.y} r={2.2 + weights[i] * 3} fill={C(tok.chart)} />
              <text x={tok.x} y={tok.y - 4.5} textAnchor="middle" className="fill-foreground" style={{ fontSize: 4 }}>
                {tok.word}
              </text>
            </g>
          ))}
          {/* Query (ziehbar) */}
          <circle
            cx={q.x}
            cy={q.y}
            r={3}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth={0.8}
            className="cursor-grab"
            onPointerDown={(e) => {
              dragging.current = true
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {
                /* setPointerCapture kann bei synthetischen Events fehlen – egal */
              }
            }}
          />
          <text x={q.x} y={q.y + 7} textAnchor="middle" className="fill-primary" style={{ fontSize: 4, fontWeight: 700 }}>
            {t('attention.viz.query')}
          </text>
        </svg>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('attention.viz.dragPre')}
          <span className="font-medium text-primary">{t('attention.viz.query')}</span>
          {t('attention.viz.dragPost')}
        </p>
      </div>

      {/* Rechen-Pipeline */}
      <div className="space-y-2">
        <div className="text-sm font-medium">{t('attention.viz.pipeline')}</div>
        <div className="space-y-1.5">
          {tokens.map((tok, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C(tok.chart) }} />
              <span className="w-16 shrink-0 font-mono">{tok.word}</span>
              <span className="w-16 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {scores[i] >= 0 ? '+' : ''}
                {scores[i].toFixed(1)}
              </span>
              <span className="relative h-4 flex-1 overflow-hidden rounded bg-muted">
                <span
                  className="absolute inset-y-0 left-0 rounded"
                  style={{ width: `${Math.max(weights[i] * 100, 1)}%`, backgroundColor: C(tok.chart) }}
                />
              </span>
              <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums">
                {Math.round(weights[i] * 100)} %
              </span>
            </div>
          ))}
        </div>
        <p className="pt-1 text-xs text-muted-foreground">
          {t('attention.viz.notePre')}
          <em>{t('attention.viz.noteEm')}</em>
          {t('attention.viz.notePost')}
        </p>
      </div>
    </div>
  )
}
