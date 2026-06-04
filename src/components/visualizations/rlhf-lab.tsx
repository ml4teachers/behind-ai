'use client'

// ---------------------------------------------------------------------------
// RLHF-Labor: Bring dem Modell deinen Geschmack bei.
//
// Vier Stationen, ein durchgehender Faden — alles echt gerechnet, kein Skript:
//   1. Bewerten   — du wählst bei Antwort-Paaren die bessere (echte Klicks).
//   2. Lernen     — aus deinen Klicks trainiert live ein echtes Belohnungs-
//                   modell (Bradley-Terry, reward-model.ts). Loss fällt,
//                   Gewichte wachsen = „dein Geschmack als Zahlen".
//   3. Bewähren   — es bewertet NEUE Paare, die es nie sah, und trifft meist
//                   deine Wahl (Verallgemeinerung — die Stärke von RLHF).
//   4. Überlisten — das Sprachmodell jagt nur noch hohe Belohnung und findet
//                   einen „Blender": top im Stil, faktisch falsch. Reward
//                   Hacking — die Brücke zu verifizierbaren Belohnungen (RLVR).
//
// Das Belohnungsmodell sieht NUR fünf Stil-Merkmale, nicht die Wahrheit —
// genau daraus entsteht das Hacking von selbst. Interne Strings DE inline
// (Viz-Konvention; EN-Migration → Thread 9).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckIcon, ReloadIcon, ThickArrowRightIcon } from '@radix-ui/react-icons'
import { useMounted } from '@/lib/use-mounted'
import { useTranslations } from '@/lib/i18n/use-translations'
import {
  TRAITS,
  TRAIT_META,
  type CurvePoint,
  type Trajectory,
  reward,
  trainReward,
} from '@/lib/rlhf/reward-model'
import {
  type Answer,
  type LabelRound,
  GENERALIZE_ROUNDS,
  HACK_CANDIDATES,
  HACK_CORRECT,
  HACK_PROMPT,
  LABEL_ROUNDS,
} from '@/lib/rlhf/data'

type Stage = 'label' | 'train' | 'generalize' | 'hack'
const TRAIN_MS = 1400
const TICK_MS = 50

export function RlhfLab() {
  const t = useTranslations()
  const mounted = useMounted()

  const [stage, setStage] = useState<Stage>('label')
  const [labelIdx, setLabelIdx] = useState(0)
  const [pairs, setPairs] = useState<Array<[number[], number[]]>>([])

  // Training-Animation (Trajektorie vorab gerechnet → Frames steuern nur die Anzeige).
  // Abspielen per Timer statt requestAnimationFrame: läuft auch in inaktiven Tabs
  // garantiert zu Ende, sodass der „Weiter"-Knopf zuverlässig erscheint.
  const trajRef = useRef<Trajectory | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [play, setPlay] = useState(0) // 0..1 Abspiel-Fortschritt
  const [weights, setWeights] = useState<number[]>(() => new Array(TRAITS.length).fill(0))

  // Verallgemeinern
  const [genPicks, setGenPicks] = useState<Record<number, 'a' | 'b'>>({})

  // Hacking
  const [hacked, setHacked] = useState(false)

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  const reset = useCallback(() => {
    stopTimer()
    trajRef.current = null
    setStage('label')
    setLabelIdx(0)
    setPairs([])
    setPlay(0)
    setWeights(new Array(TRAITS.length).fill(0))
    setGenPicks({})
    setHacked(false)
  }, [])

  useEffect(() => () => stopTimer(), [])

  // --- Station 1: eine Antwort als „besser" wählen --------------------------
  const choose = (round: LabelRound, side: 'a' | 'b') => {
    const winner = side === 'a' ? round.a : round.b
    const loser = side === 'a' ? round.b : round.a
    const next: Array<[number[], number[]]> = [...pairs, [winner.traits, loser.traits]]
    setPairs(next)
    if (labelIdx + 1 < LABEL_ROUNDS.length) {
      setLabelIdx(labelIdx + 1)
    } else {
      startTraining(next)
    }
  }

  // --- Station 2: Belohnungsmodell trainieren (echtes SGD) -------------------
  const startTraining = (trainPairs: Array<[number[], number[]]>) => {
    const traj = trainReward(trainPairs) // Mathematik komplett, synchron, korrekt
    trajRef.current = traj
    setStage('train')
    setPlay(0)
    setWeights(new Array(TRAITS.length).fill(0))
    stopTimer()
    const lastFrame = traj.weightFrames.length - 1
    const step = TICK_MS / TRAIN_MS
    let p = 0
    timerRef.current = setInterval(() => {
      p = Math.min(1, p + step)
      setPlay(p)
      setWeights(traj.weightFrames[Math.round(p * lastFrame)])
      if (p >= 1) stopTimer()
    }, TICK_MS)
  }

  const traj = trajRef.current
  const playedLoss: CurvePoint[] = useMemo(() => {
    if (!traj) return []
    const upto = Math.round(play * (traj.loss.length - 1))
    return traj.loss.slice(0, upto + 1)
  }, [traj, play])
  const trainingDone = stage === 'train' && play >= 1

  if (!mounted) {
    return <div className="min-h-[460px] animate-pulse rounded-lg bg-muted/40" aria-hidden="true" />
  }

  return (
    <div className="space-y-6">
      <StageBar stage={stage} t={t} />

      {stage === 'label' && (
        <LabelStage round={LABEL_ROUNDS[labelIdx]} idx={labelIdx} total={LABEL_ROUNDS.length} onChoose={choose} t={t} />
      )}

      {(stage === 'train' || stage === 'generalize' || stage === 'hack') && (
        <RewardModelPanel weights={weights} loss={playedLoss} animating={stage === 'train' && !trainingDone} t={t} />
      )}

      {stage === 'train' && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {trainingDone
              ? t('rlhfLab.trainDone')
              : t('rlhfLab.trainRunning')}
          </p>
          {trainingDone && (
            <Button onClick={() => setStage('generalize')} className="gap-1.5">
              {t('rlhfLab.trainNext')} <ThickArrowRightIcon />
            </Button>
          )}
        </div>
      )}

      {stage === 'generalize' && (
        <GeneralizeStage
          weights={weights}
          picks={genPicks}
          onPick={(i, side) => setGenPicks((p) => ({ ...p, [i]: side }))}
          onNext={() => setStage('hack')}
          t={t}
        />
      )}

      {stage === 'hack' && (
        <HackStage weights={weights} hacked={hacked} onHack={() => setHacked(true)} onReset={reset} t={t} />
      )}
    </div>
  )
}

// === Fortschrittsleiste der vier Stationen ==================================
const STAGE_ORDER: Stage[] = ['label', 'train', 'generalize', 'hack']

function StageBar({ stage, t }: { stage: Stage; t: (k: string) => string }) {
  const STAGE_LABELS: Record<Stage, string> = {
    label: t('rlhfLab.stageLabel'),
    train: t('rlhfLab.stageTrain'),
    generalize: t('rlhfLab.stageGeneralize'),
    hack: t('rlhfLab.stageHack'),
  }
  const active = STAGE_ORDER.indexOf(stage)
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {STAGE_ORDER.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors ${
              i === active
                ? 'bg-primary text-primary-foreground'
                : i < active
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            <span className="tabular-nums">{i + 1}</span>
            {STAGE_LABELS[s]}
          </span>
          {i < STAGE_ORDER.length - 1 && <span className="text-muted-foreground/50">→</span>}
        </li>
      ))}
    </ol>
  )
}

// === Station 1: Bewerten =====================================================
function LabelStage({
  round,
  idx,
  total,
  onChoose,
  t,
}: {
  round: LabelRound
  idx: number
  total: number
  onChoose: (round: LabelRound, side: 'a' | 'b') => void
  t: (k: string) => string
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold">{t('rlhfLab.labelHeading')}</h3>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {t('rlhfLab.labelCompare')} {idx + 1} {t('rlhfLab.labelOf')} {total}
        </span>
      </div>

      <div className="rounded-lg border bg-background/40 p-3">
        <p className="text-xs text-muted-foreground">{t('rlhfLab.labelQuestion')}</p>
        <p className="mt-0.5 font-medium">{round.prompt}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(idx % 2 === 0 ? (['a', 'b'] as const) : (['b', 'a'] as const)).map((side) => {
          const ans = round[side]
          return (
            <button
              key={side}
              type="button"
              onClick={() => onChoose(round, side)}
              className="group flex flex-col rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-primary/[0.03] focus-visible:border-primary focus-visible:outline-none"
            >
              <p className="flex-1 text-sm leading-relaxed">{ans.text}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                <CheckIcon className="h-4 w-4" /> {t('rlhfLab.labelChooseThis')}
              </span>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('rlhfLab.labelHint')}
      </p>
    </div>
  )
}

// === Belohnungsmodell-Panel: Lernkurve + gelernte Gewichte ===================
function RewardModelPanel({
  weights,
  loss,
  animating,
  t,
}: {
  weights: number[]
  loss: CurvePoint[]
  animating: boolean
  t: (k: string) => string
}) {
  return (
    <div className="grid gap-5 rounded-lg border bg-background/40 p-4 lg:grid-cols-[160px_1fr]">
      <div>
        <h3 className="mb-2 text-sm font-semibold">
          {t('rlhfLab.lossTitle')} <span className="font-normal text-muted-foreground">(Loss)</span>
        </h3>
        <LossMini points={loss} />
        <p className="mt-2 text-xs text-muted-foreground">
          {animating ? t('rlhfLab.lossFalling') : t('rlhfLab.lossLearning')}
        </p>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold">{t('rlhfLab.weightTitle')}</h3>
        <WeightBars weights={weights} />
        <p className="mt-3 text-xs text-muted-foreground">
          {t('rlhfLab.weightNote')}
        </p>
      </div>
    </div>
  )
}

function LossMini({ points }: { points: CurvePoint[] }) {
  const W = 150
  const H = 90
  const pad = 6
  const xMax = Math.max(1, points.length > 0 ? points[points.length - 1].x : 1)
  const yMax = Math.max(0.1, points.length > 0 ? points[0].y * 1.05 : 1)
  const sx = (x: number) => pad + (x / xMax) * (W - 2 * pad)
  const sy = (y: number) => pad + (1 - Math.min(y, yMax) / yMax) * (H - 2 * pad)
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ')
  const area =
    points.length > 1
      ? `${line} L ${sx(points[points.length - 1].x).toFixed(1)} ${H - pad} L ${sx(points[0].x).toFixed(1)} ${H - pad} Z`
      : ''
  const last = points[points.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none" role="img" aria-label="Learning curve">
      {area && <path d={area} className="fill-primary/10" />}
      {points.length > 1 && (
        <path d={line} className="stroke-primary" strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      )}
      {last && <circle cx={sx(last.x)} cy={sy(last.y)} r={3} className="fill-primary" />}
    </svg>
  )
}

function WeightBars({ weights }: { weights: number[] }) {
  const maxAbs = Math.max(0.4, ...weights.map((w) => Math.abs(w)))
  return (
    <div className="space-y-2">
      {TRAITS.map((trait, i) => {
        const w = weights[i]
        const frac = Math.min(1, Math.abs(w) / maxAbs)
        const positive = w >= 0
        return (
          <div key={trait} className="flex items-center gap-2">
            <span className="w-24 shrink-0 truncate text-right text-xs text-muted-foreground" title={TRAIT_META[trait].hint}>
              {TRAIT_META[trait].label}
            </span>
            <div className="relative h-4 flex-1">
              {/* Mittellinie */}
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
              <span
                className={`absolute inset-y-0 rounded ${positive ? 'bg-primary' : 'bg-[hsl(var(--chart-3))]'} transition-[width] duration-150`}
                style={
                  positive
                    ? { left: '50%', width: `${(frac * 50).toFixed(1)}%` }
                    : { right: '50%', width: `${(frac * 50).toFixed(1)}%` }
                }
              />
            </div>
            <span
              className={`w-10 shrink-0 text-right font-mono text-xs tabular-nums ${
                positive ? 'text-primary' : 'text-[hsl(var(--chart-3))]'
              }`}
            >
              {w >= 0 ? '+' : ''}
              {w.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// === Station 3: Verallgemeinern ==============================================
function GeneralizeStage({
  weights,
  picks,
  onPick,
  onNext,
  t,
}: {
  weights: number[]
  picks: Record<number, 'a' | 'b'>
  onPick: (i: number, side: 'a' | 'b') => void
  onNext: () => void
  t: (k: string) => string
}) {
  const rmPick = (r: LabelRound): 'a' | 'b' => (reward(weights, r.a.traits) >= reward(weights, r.b.traits) ? 'a' : 'b')
  const answered = GENERALIZE_ROUNDS.every((_, i) => picks[i])
  const agree = GENERALIZE_ROUNDS.filter((r, i) => picks[i] && picks[i] === rmPick(r)).length

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{t('rlhfLab.genHeading')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('rlhfLab.genHint')}
        </p>
      </div>

      <div className="space-y-3">
        {GENERALIZE_ROUNDS.map((round, i) => {
          const picked = picks[i]
          const modelPick = rmPick(round)
          return (
            <div key={i} className="rounded-lg border bg-background/40 p-3">
              <p className="mb-2 text-sm font-medium">{round.prompt}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(i % 2 === 0 ? (['b', 'a'] as const) : (['a', 'b'] as const)).map((side) => {
                  const ans = round[side]
                  const isPicked = picked === side
                  const isModel = picked && modelPick === side
                  return (
                    <button
                      key={side}
                      type="button"
                      disabled={!!picked}
                      onClick={() => onPick(i, side)}
                      className={`flex flex-col rounded-md border p-3 text-left text-sm leading-relaxed transition-colors ${
                        picked
                          ? isPicked
                            ? 'border-primary bg-primary/[0.04]'
                            : 'border-border opacity-60'
                          : 'hover:border-primary hover:bg-primary/[0.03]'
                      }`}
                    >
                      <span className="flex-1">{ans.text}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {isPicked && (
                          <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                            <CheckIcon className="h-3 w-3" /> {t('rlhfLab.genYourChoice')}
                          </span>
                        )}
                        {isModel && (
                          <span className="inline-flex items-center gap-1 rounded bg-[hsl(var(--chart-2)/0.15)] px-1.5 py-0.5 text-xs font-medium text-[hsl(var(--chart-2))]">
                            Belohnungsmodell
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {answered && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-[hsl(var(--chart-2)/0.08)] p-3">
          <p className="flex-1 text-sm">
            <span className="font-semibold text-[hsl(var(--chart-2))]">
              {agree} {t('rlhfLab.labelOf')} {GENERALIZE_ROUNDS.length}
            </span>{' '}
            {t('rlhfLab.genAgree')} {LABEL_ROUNDS.length} {t('rlhfLab.genAgreeSuffix')}
          </p>
          <Button onClick={onNext} className="gap-1.5">
            {t('rlhfLab.genNext')} <ThickArrowRightIcon />
          </Button>
        </div>
      )}
    </div>
  )
}

// === Station 4: Überlisten (Reward Hacking) ==================================
function HackStage({
  weights,
  hacked,
  onHack,
  onReset,
  t,
}: {
  weights: number[]
  hacked: boolean
  onHack: () => void
  onReset: () => void
  t: (k: string) => string
}) {
  const scored = useMemo(
    () => HACK_CANDIDATES.map((a) => ({ ans: a, r: reward(weights, a.traits) })),
    [weights],
  )
  const pick = useMemo(() => scored.reduce((best, c) => (c.r > best.r ? c : best), scored[0]), [scored])
  const bestHelp = useMemo(
    () => HACK_CANDIDATES.reduce((best, a) => (a.help > best.help ? a : best), HACK_CANDIDATES[0]),
    [],
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{t('rlhfLab.hackHeading')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('rlhfLab.hackIntro')}
        </p>
      </div>

      <div className="rounded-lg border bg-background/40 p-3">
        <p className="text-xs text-muted-foreground">{t('rlhfLab.hackQuestion')}</p>
        <p className="mt-0.5 font-medium">{HACK_PROMPT}</p>
      </div>

      <HackScatter scored={scored} pick={pick} revealed={hacked} t={t} />

      {!hacked ? (
        <Button onClick={onHack} className="gap-1.5">
          {t('rlhfLab.hackChoose')} <ThickArrowRightIcon />
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-[hsl(var(--chart-3)/0.4)] bg-[hsl(var(--chart-3)/0.08)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--chart-3))]">
              {t('rlhfLab.hackPickLabel')}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{pick.ans.text}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('rlhfLab.hackPickNote')} <strong>{HACK_CORRECT}</strong>. {t('rlhfLab.hackPickNoteSuffix')}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('rlhfLab.hackBetter')} <span className="font-medium text-[hsl(var(--chart-2))]">„{shorten(bestHelp.text)}"</span>{' '}
            {t('rlhfLab.hackBetterSuffix')}
          </p>
          <Button onClick={onReset} variant="ghost" size="sm" className="gap-1.5">
            <ReloadIcon /> {t('rlhfLab.hackReset')}
          </Button>
        </div>
      )}
    </div>
  )
}

function HackScatter({
  scored,
  pick,
  revealed,
  t,
}: {
  scored: Array<{ ans: Answer; r: number }>
  pick: { ans: Answer; r: number }
  revealed: boolean
  t: (k: string) => string
}) {
  const W = 320
  const H = 200
  const pad = 30
  const rs = scored.map((s) => s.r)
  const rMin = Math.min(...rs)
  const rMax = Math.max(...rs)
  const sx = (r: number) => pad + ((r - rMin) / Math.max(0.001, rMax - rMin)) * (W - 1.4 * pad)
  const sy = (help: number) => pad / 2 + (1 - help) * (H - 1.4 * pad)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-xl" role="img" aria-label={t('rlhfLab.svgLabel')}>
        {/* Achsen */}
        <line x1={pad} y1={H - pad} x2={W - 4} y2={H - pad} className="stroke-border" strokeWidth={1} />
        <line x1={pad} y1={6} x2={pad} y2={H - pad} className="stroke-border" strokeWidth={1} />
        <text x={W - 4} y={H - pad + 14} textAnchor="end" className="fill-muted-foreground" style={{ fontSize: 9 }}>
          {t('rlhfLab.scatterAxisX')}
        </text>
        <text x={pad - 6} y={12} textAnchor="start" className="fill-muted-foreground" style={{ fontSize: 9 }}>
          {t('rlhfLab.scatterAxisY')}
        </text>

        {/* Punkte */}
        {scored.map((s, i) => {
          const isPick = revealed && s === pick
          return (
            <circle
              key={i}
              cx={sx(s.r)}
              cy={sy(s.ans.help)}
              r={isPick ? 6 : 4}
              className={
                isPick
                  ? 'fill-[hsl(var(--chart-3))]'
                  : s.ans.help >= 0.7
                    ? 'fill-[hsl(var(--chart-2))]'
                    : 'fill-muted-foreground/50'
              }
            >
              {isPick && (
                <animate attributeName="r" from="4" to="6" dur="0.4s" />
              )}
            </circle>
          )
        })}

        {/* Markierung der Policy-Wahl */}
        {revealed && (
          <g>
            <circle cx={sx(pick.r)} cy={sy(pick.ans.help)} r={9} className="fill-none stroke-[hsl(var(--chart-3))]" strokeWidth={1.5} />
            <text
              x={Math.min(sx(pick.r) + 7, W - 2)}
              y={sy(pick.ans.help) - 13}
              textAnchor="end"
              className="fill-[hsl(var(--chart-3))]"
              style={{ fontSize: 9, fontWeight: 700 }}
            >
              {t('rlhfLab.scatterChosen')}
            </text>
          </g>
        )}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-2))]" /> {t('rlhfLab.legendHelpful')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/50" /> {t('rlhfLab.legendWeak')}
        </span>
        {revealed && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--chart-3))]" /> {t('rlhfLab.legendChosen')}
          </span>
        )}
      </div>
    </div>
  )
}

function shorten(text: string, n = 60): string {
  return text.length <= n ? text : text.slice(0, n).trimEnd() + ' …'
}
