'use client'

// ---------------------------------------------------------------------------
// Backpropagation als SANDBOX. Ein winziges 2→2→1-Netz mit SICHTBAREN Gewichten;
// jede Zahl wird live gerechnet und ist nachvollziehbar. Vier Phasen
// (Vorwärts → Fehler → Rückwärts → Anpassen) zeigen die echte Mathematik inkl.
// Kettenregel je Gewicht; Klick auf eine Kante hebt deren Herleitung hervor.
// Eingabe, Ziel und Lernrate sind verstellbar; „Schritt anwenden" verändert die
// Gewichte wirklich → man sieht das Netz dieses eine Beispiel lernen (y → Ziel).
// Strings via i18n (bp.*); Formeln (Zahlen/Operatoren) werden im Code gebaut.
// ---------------------------------------------------------------------------

import { useState, type ReactNode } from 'react'
import { ReloadIcon, ResetIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useTranslations } from '@/lib/i18n/use-translations'
import { BP_NET, forward, gradients, type Gradients, type MLP } from '@/lib/perceptron/mlp'

type Phase = 'forward' | 'error' | 'backward' | 'update'
type T = (k: string) => string
interface EdgeSel {
  layer: 'hidden' | 'out'
  j: number
  i: number
}

const PHASES: Phase[] = ['forward', 'error', 'backward', 'update']
const f2 = (v: number): string => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2)
const sub = ['₁', '₂', '₃']

const stepped = (net: MLP, g: Gradients, lr: number): MLP => ({
  W1: net.W1.map((row, j) => [row[0] - lr * g.gW1[j][0], row[1] - lr * g.gW1[j][1]]),
  b1: net.b1.map((b, j) => b - lr * g.gb1[j]),
  W2: net.W2.map((w, j) => w - lr * g.gW2[j]),
  b2: net.b2 - lr * g.gb2,
})

const rnd = (s: number) => (Math.random() * 2 - 1) * s
const randNet = (): MLP => ({
  W1: [[rnd(2), rnd(2)], [rnd(2), rnd(2)]],
  b1: [rnd(0.6), rnd(0.6)],
  W2: [rnd(2), rnd(2)],
  b2: rnd(0.6),
})

// Kanten-Gradient bzw. -Gewicht nachschlagen.
const wOf = (net: MLP, e: EdgeSel) => (e.layer === 'out' ? net.W2[e.j] : net.W1[e.j][e.i])
const gOf = (g: Gradients, e: EdgeSel) => (e.layer === 'out' ? g.gW2[e.j] : g.gW1[e.j][e.i])

export function BackpropLab() {
  const t = useTranslations()
  const [net, setNet] = useState<MLP>(BP_NET)
  const [x, setX] = useState<[number, number]>([0.8, 0.2])
  const [target, setTarget] = useState<0 | 1>(1)
  const [lr, setLr] = useState(1)
  const [phase, setPhase] = useState<Phase>('forward')
  const [sel, setSel] = useState<EdgeSel | null>(null)
  const [iter, setIter] = useState(0)

  const f = forward(net, x)
  const g = gradients(net, x, target)
  const err = f.y - target

  const applyStep = (times = 1) => {
    let n = net
    for (let k = 0; k < times; k++) n = stepped(n, gradients(n, x, target), lr)
    setNet(n)
    setIter((i) => i + times)
    setPhase('forward')
    setSel(null)
  }
  const newWeights = () => {
    setNet(randNet())
    setIter(0)
    setPhase('forward')
    setSel(null)
  }
  const reset = () => {
    setNet(BP_NET)
    setX([0.8, 0.2])
    setTarget(1)
    setIter(0)
    setPhase('forward')
    setSel(null)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* === Diagramm + Phasen === */}
        <div className="space-y-3">
          <div className="rounded-lg border bg-background/40 p-3">
            <BpDiagram net={net} f={f} g={g} phase={phase} sel={sel} onSelect={setSel} x={x} t={t} />
          </div>
          {/* Phasen-Reiter */}
          <div className="flex flex-wrap gap-1.5">
            {PHASES.map((p, idx) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhase(p)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                  phase === p ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="tabular-nums opacity-70">{idx + 1}.</span> {t(`bp.phase.${p}`)}
              </button>
            ))}
          </div>
          {/* Ablesung */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border bg-background/40 px-3 py-2 font-mono text-xs tabular-nums">
            <Read label={t('bp.read.iter')} value={String(iter)} />
            <Read label="y" value={f2(f.y)} />
            <Read label={t('bp.read.error')} value={f2(err)} accent={Math.abs(err) > 0.5} />
            <Read label={t('bp.read.target')} value={String(target)} />
          </div>
        </div>

        {/* === Rechnung === */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <MathPanel net={net} f={f} g={g} err={err} x={x} target={target} lr={lr} phase={phase} sel={sel} onClearSel={() => setSel(null)} t={t} />
        </div>
      </div>

      {/* === Sandbox-Steuerung === */}
      <div className="space-y-3 rounded-lg border bg-background/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => applyStep(1)} className="gap-1.5">
            <DoubleArrowRightIcon /> {t('bp.apply')}
          </Button>
          <Button onClick={() => applyStep(10)} variant="secondary" className="gap-1.5">
            {t('bp.apply10')}
          </Button>
          <Button onClick={newWeights} variant="outline" className="gap-1.5">
            <ReloadIcon /> {t('bp.newWeights')}
          </Button>
          <Button onClick={reset} variant="ghost" className="gap-1.5">
            <ResetIcon /> {t('bp.reset')}
          </Button>
        </div>
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Knob label={`${t('bp.input')} x₁`} value={x[0]} onChange={(v) => setX([v, x[1]])} min={0} max={1} step={0.05} />
          <Knob label={`${t('bp.input')} x₂`} value={x[1]} onChange={(v) => setX([x[0], v])} min={0} max={1} step={0.05} />
          <Knob label={t('bp.learnRate')} value={lr} onChange={setLr} min={0.1} max={3} step={0.1} />
          <div className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-xs text-muted-foreground">{t('bp.target')}</span>
            <div className="inline-flex rounded-lg border p-0.5">
              {[0, 1].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTarget(v as 0 | 1)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${target === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t('bp.hint')}</p>
      </div>
    </div>
  )
}

// === Diagramm (fest 2-2-1, ausgerichtet, klickbare Kanten) =================
function BpDiagram({
  net,
  f,
  g,
  phase,
  sel,
  onSelect,
  x,
  t,
}: {
  net: MLP
  f: { zh: number[]; h: number[]; z2: number; y: number }
  g: Gradients
  phase: Phase
  sel: EdgeSel | null
  onSelect: (e: EdgeSel | null) => void
  x: [number, number]
  t: T
}) {
  const W = 380
  const H = 232
  const inX = 48
  const hX = 192
  const outX = 322
  const rowY = [70, 152] // Eingaben UND versteckte Neuronen auf denselben Höhen
  const outY = 111
  const showGrad = phase === 'backward'

  const edges: EdgeSel[] = [
    { layer: 'hidden', j: 0, i: 0 },
    { layer: 'hidden', j: 0, i: 1 },
    { layer: 'hidden', j: 1, i: 0 },
    { layer: 'hidden', j: 1, i: 1 },
    { layer: 'out', j: 0, i: 0 },
    { layer: 'out', j: 1, i: 0 },
  ]
  const ends = (e: EdgeSel) =>
    e.layer === 'hidden'
      ? { x1: inX, y1: rowY[e.i], x2: hX, y2: rowY[e.j] }
      : { x1: hX, y1: rowY[e.j], x2: outX, y2: outY }
  // Label-Position: input→hidden bei t=0.34 (entzerrt die gekreuzten Kanten),
  // hidden→output mittig.
  const labelPos = (e: EdgeSel) => {
    const { x1, y1, x2, y2 } = ends(e)
    const tt = e.layer === 'hidden' ? 0.34 : 0.5
    return { lx: x1 + tt * (x2 - x1), ly: y1 + tt * (y2 - y1) }
  }
  const color = (v: number) => (v >= 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-3))')
  const wWidth = (v: number) => 1 + Math.min(Math.abs(v), 3) * 1.05
  const gWidth = (v: number) => 1 + Math.min(Math.abs(v), 1) * 5
  const isSel = (e: EdgeSel) => sel && sel.layer === e.layer && sel.j === e.j && sel.i === e.i

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[440px] select-none" role="img" aria-label={t('bp.aria')}>
      {/* Kanten */}
      {edges.map((e, idx) => {
        const { x1, y1, x2, y2 } = ends(e)
        const { lx, ly } = labelPos(e)
        const val = showGrad ? gOf(g, e) : wOf(net, e)
        const seld = isSel(e)
        return (
          <g key={idx} className="cursor-pointer" onClick={() => onSelect(seld ? null : e)}>
            {/* fette unsichtbare Trefferfläche */}
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={16} />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color(val)} strokeWidth={showGrad ? gWidth(val) : wWidth(val)} strokeLinecap="round" opacity={seld ? 1 : 0.9} />
            {/* Badge */}
            <g>
              <rect x={lx - 17} y={ly - 8} width={34} height={16} rx={4} fill="hsl(var(--background))" stroke={seld ? 'hsl(var(--primary))' : color(val)} strokeWidth={seld ? 2 : 1} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 9, fontWeight: 700 }} fill={seld ? 'hsl(var(--primary))' : color(val)}>
                {showGrad ? f2(val) : f2(val)}
              </text>
            </g>
          </g>
        )
      })}

      {/* Knoten */}
      {[0, 1].map((i) => (
        <Node key={`in${i}`} cx={inX} cy={rowY[i]} r={17} name={`x${sub[i]}`} value={f2(x[i])} tone="muted" />
      ))}
      {[0, 1].map((j) => (
        <Node key={`h${j}`} cx={hX} cy={rowY[j]} r={22} name={`h${sub[j]}`} value={f2(f.h[j])} sublabel="tanh" tone="primary" />
      ))}
      <Node cx={outX} cy={outY} r={23} name="y" value={f2(f.y)} sublabel="σ" tone="out" />
    </svg>
  )
}

function Node({
  cx,
  cy,
  r,
  name,
  value,
  sublabel,
  tone,
}: {
  cx: number
  cy: number
  r: number
  name: string
  value: string
  sublabel?: string
  tone: 'muted' | 'primary' | 'out'
}) {
  const fill = tone === 'muted' ? 'hsl(var(--muted))' : tone === 'primary' ? 'hsl(var(--primary)/0.12)' : 'hsl(var(--chart-1)/0.14)'
  const stroke = tone === 'muted' ? 'hsl(var(--border))' : tone === 'primary' ? 'hsl(var(--primary))' : 'hsl(var(--chart-1))'
  return (
    <g>
      <text x={cx} y={cy - r - 4} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9, fontWeight: 600 }}>
        {name}
      </text>
      <circle cx={cx} cy={cy} r={r} fill="hsl(var(--background))" />
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-foreground font-mono" style={{ fontSize: 10, fontWeight: 600 }}>
        {value}
      </text>
      {sublabel && (
        <text x={cx} y={cy + r + 9} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 8 }}>
          {sublabel}
        </text>
      )}
    </g>
  )
}

// === Rechnung (Phasen-Panel + Kanten-Fokus) ================================
function MathPanel({
  net,
  f,
  g,
  err,
  x,
  target,
  lr,
  phase,
  sel,
  onClearSel,
  t,
}: {
  net: MLP
  f: { zh: number[]; h: number[]; z2: number; y: number }
  g: Gradients
  err: number
  x: [number, number]
  target: 0 | 1
  lr: number
  phase: Phase
  sel: EdgeSel | null
  onClearSel: () => void
  t: T
}) {
  // Kanten-Fokus überlagert die Phase: zeigt die ganze Geschichte EINES Gewichts.
  if (sel) {
    const w = wOf(net, sel)
    const grad = gOf(g, sel)
    const nameSrc = sel.layer === 'out' ? `h${sub[sel.j]}` : `x${sub[sel.i]}`
    const nameDst = sel.layer === 'out' ? 'y' : `h${sub[sel.j]}`
    const srcVal = sel.layer === 'out' ? f.h[sel.j] : x[sel.i]
    const gradExpr =
      sel.layer === 'out'
        ? `e · ${nameSrc} = ${f2(err)} · ${f2(f.h[sel.j])} = ${f2(grad)}`
        : `δ${sub[sel.j]} · ${nameSrc} = ${f2(g.dh[sel.j])} · ${f2(x[sel.i])} = ${f2(grad)}`
    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-primary">
            {t('bp.focus.title')} {nameSrc} → {nameDst}
          </h4>
          <button type="button" onClick={onClearSel} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            {t('bp.focus.back')}
          </button>
        </div>
        <Eq label={t('bp.focus.weight')} expr={f2(w)} />
        <Eq label={t('bp.focus.contrib')} expr={`${nameSrc} · w = ${f2(srcVal)} · ${f2(w)} = ${f2(srcVal * w)}`} />
        <Eq label={t('bp.focus.grad')} expr={gradExpr} />
        <Eq label={t('bp.focus.update')} expr={`${f2(w)} − ${f2(lr)} · ${f2(grad)} = ${f2(w - lr * grad)}`} accent />
        <p className="text-xs leading-relaxed text-muted-foreground">{t('bp.focus.note')}</p>
      </div>
    )
  }

  if (phase === 'forward') {
    return (
      <Block title={t('bp.m.fwTitle')} note={t('bp.m.fwNote')}>
        {[0, 1].map((j) => (
          <Eq key={j} label={`h${sub[j]}`} expr={`tanh(${f2(net.W1[j][0])}·${f2(x[0])} + ${f2(net.W1[j][1])}·${f2(x[1])} + ${f2(net.b1[j])}) = tanh(${f2(f.zh[j])}) = ${f2(f.h[j])}`} />
        ))}
        <Eq label="y" expr={`σ(${f2(net.W2[0])}·${f2(f.h[0])} + ${f2(net.W2[1])}·${f2(f.h[1])} + ${f2(net.b2)}) = σ(${f2(f.z2)}) = ${f2(f.y)}`} accent />
      </Block>
    )
  }
  if (phase === 'error') {
    return (
      <Block title={t('bp.m.errTitle')} note={t('bp.m.errNote')}>
        <Eq label="e" expr={`y − ${t('bp.read.target')} = ${f2(f.y)} − ${target} = ${f2(err)}`} accent />
      </Block>
    )
  }
  if (phase === 'backward') {
    return (
      <Block title={t('bp.m.bwTitle')} note={t('bp.m.bwNote')}>
        {[0, 1].map((j) => (
          <Eq key={`o${j}`} label={`h${sub[j]} → y`} expr={`e · h${sub[j]} = ${f2(err)} · ${f2(f.h[j])} = ${f2(g.gW2[j])}`} />
        ))}
        {[0, 1].map((j) => (
          <Eq key={`d${j}`} label={`δ${sub[j]}`} expr={`e · w · (1−h${sub[j]}²) = ${f2(err)} · ${f2(net.W2[j])} · ${f2(1 - f.h[j] ** 2)} = ${f2(g.dh[j])}`} dim />
        ))}
        {[0, 1].map((j) =>
          [0, 1].map((i) => (
            <Eq key={`w${j}${i}`} label={`x${sub[i]} → h${sub[j]}`} expr={`δ${sub[j]} · x${sub[i]} = ${f2(g.dh[j])} · ${f2(x[i])} = ${f2(g.gW1[j][i])}`} />
          )),
        )}
      </Block>
    )
  }
  // update
  const rows: { name: string; old: number; grad: number }[] = [
    { name: 'h₁ → y', old: net.W2[0], grad: g.gW2[0] },
    { name: 'h₂ → y', old: net.W2[1], grad: g.gW2[1] },
    { name: 'x₁ → h₁', old: net.W1[0][0], grad: g.gW1[0][0] },
    { name: 'x₂ → h₁', old: net.W1[0][1], grad: g.gW1[0][1] },
    { name: 'x₁ → h₂', old: net.W1[1][0], grad: g.gW1[1][0] },
    { name: 'x₂ → h₂', old: net.W1[1][1], grad: g.gW1[1][1] },
  ]
  return (
    <Block title={t('bp.m.upTitle')} note={t('bp.m.upNote')}>
      {rows.map((r) => (
        <Eq key={r.name} label={r.name} expr={`${f2(r.old)} − ${f2(lr)}·${f2(r.grad)} = ${f2(r.old - lr * r.grad)}`} />
      ))}
    </Block>
  )
}

function Block({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5 text-sm">
      <h4 className="font-semibold text-primary">{title}</h4>
      <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Eq({ label, expr, accent, dim }: { label: string; expr: string; accent?: boolean; dim?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 ${dim ? 'opacity-70' : ''}`}>
      <span className="font-mono text-[11px] font-semibold text-muted-foreground">{label}</span>
      <code className={`font-mono text-[11px] leading-snug ${accent ? 'font-semibold text-[hsl(var(--chart-2))]' : 'text-foreground'}`}>{expr}</code>
    </div>
  )
}

// === kleine Bausteine =======================================================
function Read({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? 'font-semibold text-[hsl(var(--chart-8))]' : 'text-foreground'}>{value}</span>
    </span>
  )
}

function Knob({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} aria-label={label} className="flex-1" />
      <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums">{value.toFixed(2)}</span>
    </div>
  )
}
