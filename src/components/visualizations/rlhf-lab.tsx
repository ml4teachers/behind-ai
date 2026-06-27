'use client'

// ---------------------------------------------------------------------------
// RLHF-Labor: Bring dem Modell deinen Geschmack bei.
//
// Vier Stationen, ein durchgehender Faden – alles echt gerechnet, kein Skript:
//   1. Bewerten   – du wählst bei Antwort-Paaren die bessere (echte Klicks).
//   2. Lernen     – aus deinen Klicks trainiert live ein echtes Belohnungs-
//                   modell (Bradley-Terry, reward-model.ts). Loss fällt,
//                   Gewichte wachsen = „dein Geschmack als Zahlen".
//   3. Bewähren   – es bewertet NEUE Paare, die es nie sah, und trifft meist
//                   deine Wahl (Verallgemeinerung – die Stärke von RLHF).
//   4. Überlisten – das Sprachmodell jagt nur noch hohe Belohnung und findet
//                   einen „Blender": top im Stil, faktisch falsch. Reward
//                   Hacking – die Brücke zu verifizierbaren Belohnungen (RLVR).
//
// Das Belohnungsmodell sieht NUR fünf Stil-Merkmale, nicht die Wahrheit –
// genau daraus entsteht das Hacking von selbst. Interne Strings DE inline
// (Viz-Konvention; EN-Migration → Thread 9).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckIcon, Cross2Icon, ReloadIcon, ThickArrowRightIcon } from '@radix-ui/react-icons'
import { useMounted } from '@/lib/use-mounted'
import { useTranslations } from '@/lib/i18n/use-translations'
import { useUIStore } from '@/lib/store'
import { defaultLocale } from '@/lib/i18n/config'
import {
  TRAITS,
  traitMeta,
  type CurvePoint,
  type Trajectory,
  reward,
  trainReward,
} from '@/lib/rlhf/reward-model'
import {
  type Answer,
  type LabelRound,
  generalizeRounds,
  hackCandidates,
  HACK_CORRECT,
  hackPrompt,
  labelRounds,
  LABEL_ROUND_COUNT,
} from '@/lib/rlhf/data'

type Stage = 'label' | 'train' | 'generalize' | 'hack'
const TRAIN_MS = 1400
const TICK_MS = 50

export function RlhfLab() {
  const t = useTranslations()
  const mounted = useMounted()
  const storeLocale = useUIStore((s) => s.locale)
  const locale = mounted ? storeLocale : defaultLocale
  // Inhalt (Fragen/Antworten) in der UI-Sprache; traits/help bleiben gleich.
  const LABEL_ROUNDS = useMemo(() => labelRounds(locale), [locale])
  const GENERALIZE_ROUNDS = useMemo(() => generalizeRounds(locale), [locale])
  const HACK = useMemo(
    () => ({ prompt: hackPrompt(locale), candidates: hackCandidates(locale) }),
    [locale],
  )

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
        <RewardModelPanel weights={weights} loss={playedLoss} animating={stage === 'train' && !trainingDone} locale={locale} t={t} />
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
          rounds={GENERALIZE_ROUNDS}
          labelCount={LABEL_ROUND_COUNT}
          weights={weights}
          picks={genPicks}
          onPick={(i, side) => setGenPicks((p) => ({ ...p, [i]: side }))}
          onNext={() => setStage('hack')}
          t={t}
        />
      )}

      {stage === 'hack' && (
        <HackStage
          prompt={HACK.prompt}
          candidates={HACK.candidates}
          weights={weights}
          hacked={hacked}
          onHack={() => setHacked(true)}
          onReset={reset}
          t={t}
        />
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
  locale,
  t,
}: {
  weights: number[]
  loss: CurvePoint[]
  animating: boolean
  locale: string
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
        <WeightBars weights={weights} locale={locale} />
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

function WeightBars({ weights, locale }: { weights: number[]; locale: string }) {
  const maxAbs = Math.max(0.4, ...weights.map((w) => Math.abs(w)))
  const meta = traitMeta(locale)
  return (
    <div className="space-y-2">
      {TRAITS.map((trait, i) => {
        const w = weights[i]
        const frac = Math.min(1, Math.abs(w) / maxAbs)
        const positive = w >= 0
        return (
          <div key={trait} className="flex items-center gap-2">
            <span className="w-24 shrink-0 truncate text-right text-xs text-muted-foreground" title={meta[trait].hint}>
              {meta[trait].label}
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
  rounds,
  labelCount,
  weights,
  picks,
  onPick,
  onNext,
  t,
}: {
  rounds: LabelRound[]
  labelCount: number
  weights: number[]
  picks: Record<number, 'a' | 'b'>
  onPick: (i: number, side: 'a' | 'b') => void
  onNext: () => void
  t: (k: string) => string
}) {
  const rmPick = (r: LabelRound): 'a' | 'b' => (reward(weights, r.a.traits) >= reward(weights, r.b.traits) ? 'a' : 'b')
  const answered = rounds.every((_, i) => picks[i])
  const agree = rounds.filter((r, i) => picks[i] && picks[i] === rmPick(r)).length

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{t('rlhfLab.genHeading')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('rlhfLab.genHint')}
        </p>
      </div>

      <div className="space-y-3">
        {rounds.map((round, i) => {
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
                            {t('rlhfLab.genRewardModel')}
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
              {agree} {t('rlhfLab.labelOf')} {rounds.length}
            </span>{' '}
            {t('rlhfLab.genAgree')} {labelCount} {t('rlhfLab.genAgreeSuffix')}
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
// Kuratierte Auswahl statt abstraktem Scatter: Du tippst zuerst, welche Antwort
// die höchste Belohnung holt – dann decken sich Belohnungs-Balken und Wahrheits-
// marken (✓/✗) auf. So wird die „versteckte" Hilfe-Dimension zur verdeckten
// Spalte, die sich aufdeckt, und der Blender sichtbar, der die Belohnung kapert.
//
// WICHTIG (Invariante): Reward Hacking greift nur, wenn der Belohnungs-Gewinner
// ZWINGEND faktisch falsch ist – bei JEDEM Bewertungs-Muster des Nutzers. Es gibt nur
// 2^6 = 64 mögliche Muster (6 Paare × {a,b}); dieses Set ist gegen ALLE 64 durchgerechnet,
// Gewinner stets falsch. Nötig, weil „schwache Antworten bevorzugen" NEGATIVE Stil-Gewichte
// trainiert – dann gewinnen knappe statt flashy Antworten, und reine Pareto-Dominanz
// (nur für ≥0-Gewichte gültig) reicht NICHT (so kippte eine frühere Fassung: die knappe
// korrekte „Canberra." gewann bei Anti-Stil-Geschmack).
//
// Tragende Idee: nur EINE korrekte Antwort zeigen (idx 1, reiche Canberra), und zwar eine
// „mittige": nach oben gedeckt vom falsche-Autorität-Blender (idx 12), nach unten von den
// knappen falschen (idx 4 „Sydney.", idx 6 „Hmm") – so kann sie in KEINER Geschmacks-
// Richtung die Spitze holen (sie landet je nach Geschmack auf Platz 3–4). Jede ZWEITE
// korrekte Antwort (idx 0, 5 …) ragt in irgendeiner Richtung heraus und gewinnt in einigen
// der 64 Fälle → Lektion kaputt. Regeln: keine weitere korrekte Antwort ungeprüft ins Set
// (immer alle 64 testen, siehe /tmp-Harness in der Memory), idx-12-Traits nicht abschwächen.
// Indizes verweisen in HACK_CANDIDATES.
const HACK_SHOWN = [1, 12, 2, 3, 6, 4]

function HackStage({
  prompt,
  candidates,
  weights,
  hacked,
  onHack,
  onReset,
  t,
}: {
  prompt: string
  candidates: Answer[]
  weights: number[]
  hacked: boolean
  onHack: () => void
  onReset: () => void
  t: (k: string) => string
}) {
  const choices = useMemo(
    () =>
      HACK_SHOWN.map((idx) => {
        const ans = candidates[idx]
        return { ans, r: reward(weights, ans.traits), correct: ans.help >= 0.5 }
      }),
    [weights, candidates],
  )
  const pickIdx = useMemo(
    () => choices.reduce((best, c, i) => (c.r > choices[best].r ? i : best), 0),
    [choices],
  )
  const bestHelp = useMemo(
    () => choices.reduce((best, c) => (c.ans.help > best.ans.help ? c : best), choices[0]).ans,
    [choices],
  )
  const rMin = Math.min(...choices.map((c) => c.r))
  const rMax = Math.max(...choices.map((c) => c.r))
  const frac = (r: number) => 8 + 92 * ((r - rMin) / Math.max(0.001, rMax - rMin))

  const [guess, setGuess] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{t('rlhfLab.hackHeading')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('rlhfLab.hackIntro')}</p>
      </div>

      <div className="rounded-lg border bg-background/40 p-3">
        <p className="text-xs text-muted-foreground">{t('rlhfLab.hackQuestion')}</p>
        <p className="mt-0.5 font-medium">{prompt}</p>
      </div>

      {!hacked && <p className="text-sm font-medium">{t('rlhfLab.hackGuess')}</p>}

      <div className="space-y-2.5">
        {choices.map((c, i) => (
          <HackCard
            key={i}
            ans={c.ans}
            correct={c.correct}
            frac={frac(c.r)}
            revealed={hacked}
            isPick={i === pickIdx}
            isGuess={guess === i}
            onGuess={() => {
              if (hacked) return
              setGuess(i)
              onHack()
            }}
            t={t}
          />
        ))}
      </div>

      {!hacked ? (
        <button
          type="button"
          onClick={() => {
            setGuess(null)
            onHack()
          }}
          className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          {t('rlhfLab.hackChoose')}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-[hsl(var(--chart-3)/0.4)] bg-[hsl(var(--chart-3)/0.08)] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--chart-3))]">
              {t('rlhfLab.hackPickLabel')}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">
              {t('rlhfLab.hackPickNote')} <strong>{HACK_CORRECT}</strong>
              {t('rlhfLab.hackPickNoteSuffix')}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('rlhfLab.hackBetter')}{' '}
            <span className="font-medium text-[hsl(var(--chart-2))]">„{shorten(bestHelp.text)}"</span>{' '}
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

function HackCard({
  ans,
  correct,
  frac,
  revealed,
  isPick,
  isGuess,
  onGuess,
  t,
}: {
  ans: Answer
  correct: boolean
  frac: number
  revealed: boolean
  isPick: boolean
  isGuess: boolean
  onGuess: () => void
  t: (k: string) => string
}) {
  return (
    <button
      type="button"
      disabled={revealed}
      onClick={onGuess}
      className={cn(
        'group block w-full rounded-lg border p-3 text-left transition-colors',
        !revealed &&
          'cursor-pointer hover:border-primary hover:bg-primary/[0.03] focus-visible:border-primary focus-visible:outline-none',
        revealed && isPick && 'border-[hsl(var(--chart-3)/0.6)] bg-[hsl(var(--chart-3)/0.07)]',
        revealed && !isPick && 'border-border',
        revealed && isGuess && !isPick && 'ring-1 ring-primary/40',
      )}
    >
      <p className="text-sm leading-relaxed">{ans.text}</p>

      <div className="mt-2.5 flex items-center gap-2">
        <span className={cn('w-20 shrink-0 text-xs', revealed ? 'text-muted-foreground' : 'text-transparent')}>
          {t('rlhfLab.hackRewardLabel')}
        </span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out',
              isPick ? 'bg-[hsl(var(--chart-3))]' : 'bg-primary/70',
            )}
            style={{ width: revealed ? `${frac.toFixed(0)}%` : '0%' }}
          />
        </div>
        {!revealed && (
          <span className="shrink-0 text-xs text-muted-foreground/60 transition-colors group-hover:text-primary">
            {t('rlhfLab.hackGuessTap')}
          </span>
        )}
      </div>

      {revealed && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
              correct
                ? 'bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))]'
                : 'bg-[hsl(var(--chart-3)/0.15)] text-[hsl(var(--chart-3))]',
            )}
          >
            {correct ? <CheckIcon className="h-3 w-3" /> : <Cross2Icon className="h-3 w-3" />}
            {correct ? t('rlhfLab.hackTruthCorrect') : t('rlhfLab.hackTruthWrong')}
          </span>
          {isPick && (
            <span className="inline-flex items-center gap-1 rounded border border-[hsl(var(--chart-3)/0.6)] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--chart-3))]">
              {t('rlhfLab.hackModelPick')}
            </span>
          )}
          {isGuess && (
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
              {t('rlhfLab.hackYourGuess')}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

function shorten(text: string, n = 60): string {
  return text.length <= n ? text : text.slice(0, n).trimEnd() + ' …'
}
