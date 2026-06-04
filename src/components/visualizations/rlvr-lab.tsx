'use client'

// ---------------------------------------------------------------------------
// RLVR-Labor: eine Belohnung, die man nicht faken kann.
//
// Drei Akte, ein durchgehender Faden — Modell echt, Prüfer echt, RL echt:
//   1. Generieren  — das echte Modell denkt sich mehrere Lösungswege aus
//                    (N parallele CoT-Versuche bei Temperatur). Sie WIDERSPRECHEN
//                    sich, weil Buchstabenzählen aus Tokens heraus schwerfällt.
//   2. Prüfen      — ein winziges Stück Code zählt die Wahrheit und markiert
//                    jeden Versuch ✓/✗ (Belohnung 1/0). Unfakebar: kein Mensch,
//                    keine zweite KI — nur ein Abgleich mit der echten Zahl.
//   3. Verstärken  — REINFORCE (reinforce.ts) macht die geprüft-richtigen
//                    Versuche wahrscheinlicher. Umschalter „Prüfer ↔ Eindruck":
//                    mit dem Prüfer wird das Modell richtig, mit der Eindrucks-
//                    Belohnung (was am häufigsten/überzeugendsten klingt) sackt
//                    es auf die falsche Mehrheit ab — Reward Hacking, wie bei RLHF.
//
// Buchstabenzählen ist der anschauliche Stellvertreter: dieselbe Mechanik trägt
// bei Mathe/Code, wo „richtig" ebenfalls prüfbar ist (Rechen-Check, Testsuite).
// Interne Strings DE inline (Viz-Konvention; EN-Migration → Thread 9).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  Cross2Icon,
  MagicWandIcon,
  ReloadIcon,
  ThickArrowRightIcon,
} from '@radix-ui/react-icons'
import { useMounted } from '@/lib/use-mounted'
import { useTranslations } from '@/lib/i18n/use-translations'
import {
  DEFAULT_LETTER,
  LETTER_PROBLEMS,
  type LetterProblem,
  letterPrompt,
} from '@/lib/reasoning/problems'
import { extractNumber, parseAnswer } from '@/lib/reasoning/verify'
import {
  type CurvePoint,
  type RewardKey,
  type Trajectory,
  reinforce,
  toAnswerClasses,
} from '@/lib/reasoning/reinforce'

type Stage = 'generate' | 'verify' | 'reinforce'

interface Attempt {
  text: string
  answer: number | null
  error: boolean
}

const N_SAMPLES = 8
const TRAIN_MS = 1300
const TICK_MS = 40

function clean(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
}

export function RlvrLab() {
  const t = useTranslations()
  const mounted = useMounted()

  const [problem, setProblem] = useState<LetterProblem>(DEFAULT_LETTER)
  const [stage, setStage] = useState<Stage>('generate')
  const [attempts, setAttempts] = useState<Array<Attempt | null>>([])
  const [sampling, setSampling] = useState(false)

  // Reinforce-Animation (Trajektorie vorab gerechnet → Timer steuert die Anzeige).
  const [scheme, setScheme] = useState<RewardKey>('verifier')
  const trajRef = useRef<Record<RewardKey, Trajectory> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [play, setPlay] = useState(0)

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }
  useEffect(() => () => stopTimer(), [])

  const reset = useCallback((p: LetterProblem) => {
    stopTimer()
    trajRef.current = null
    setProblem(p)
    setStage('generate')
    setAttempts([])
    setSampling(false)
    setScheme('verifier')
    setPlay(0)
  }, [])

  // --- Akt 1: N echte CoT-Versuche parallel sampeln -------------------------
  const sample = useCallback(async (p: LetterProblem) => {
    stopTimer()
    trajRef.current = null
    setStage('generate')
    setScheme('verifier')
    setPlay(0)
    setSampling(true)
    setAttempts(new Array(N_SAMPLES).fill(null))

    await Promise.all(
      Array.from({ length: N_SAMPLES }, async (_, i) => {
        try {
          const res = await fetch('/api/reasoning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: letterPrompt(p),
              mode: 'sample',
              temperature: 1.0,
              maxOutputTokens: 220,
            }),
          })
          const data = await res.json()
          if (!res.ok || data.error) throw new Error(data.error)
          const text = clean(data.text || '')
          const answer = extractNumber(parseAnswer(text))
          setAttempts((prev) => {
            const next = [...prev]
            next[i] = { text, answer, error: false }
            return next
          })
        } catch {
          setAttempts((prev) => {
            const next = [...prev]
            next[i] = { text: '', answer: null, error: true }
            return next
          })
        }
      }),
    )
    setSampling(false)
  }, [])

  // --- Akt 3: REINFORCE-Trajektorien (Prüfer + Eindruck) vorab rechnen -------
  const classes = useMemo(() => {
    const answers = attempts.map((a) => (a ? a.answer : null))
    return toAnswerClasses(answers, problem.answer)
  }, [attempts, problem.answer])

  const startReinforce = () => {
    if (classes.length === 0) return
    trajRef.current = {
      verifier: reinforce(classes, 'verifier'),
      impression: reinforce(classes, 'impression'),
    }
    setScheme('verifier')
    setStage('reinforce')
    playTrajectory()
  }

  const playTrajectory = useCallback(() => {
    stopTimer()
    setPlay(0)
    let p = 0
    const step = TICK_MS / TRAIN_MS
    timerRef.current = setInterval(() => {
      p = Math.min(1, p + step)
      setPlay(p)
      if (p >= 1) stopTimer()
    }, TICK_MS)
  }, [])

  const switchScheme = (s: RewardKey) => {
    setScheme(s)
    playTrajectory()
  }

  if (!mounted) {
    return <div className="min-h-[440px] animate-pulse rounded-lg bg-muted/40" aria-hidden="true" />
  }

  const doneCount = attempts.filter((a) => a !== null).length
  const allDone = attempts.length > 0 && doneCount === attempts.length
  const traj = trajRef.current?.[scheme] ?? null

  return (
    <div className="space-y-6">
      <StageBar stage={stage} t={t} />

      {/* Aufgabe + Wort-Auswahl */}
      <div className="rounded-lg border bg-background/40 p-3">
        <p className="text-xs text-muted-foreground">{t('rlvrLab.taskLabel')}</p>
        <p className="mt-0.5 font-medium">{letterPrompt(problem)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LETTER_PROBLEMS.map((p) => (
            <Button
              key={p.id}
              variant={p.id === problem.id ? 'secondary' : 'outline'}
              size="sm"
              className="h-auto py-1 text-xs"
              disabled={sampling}
              onClick={() => reset(p)}
            >
              {p.word}
            </Button>
          ))}
        </div>
      </div>

      {/* Akt 1: Generieren */}
      {stage === 'generate' && attempts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            {t('rlvrLab.generateHint')}
          </p>
          <Button onClick={() => sample(problem)} className="gap-2">
            <MagicWandIcon className="h-4 w-4" /> {N_SAMPLES} {t('rlvrLab.generateBtn')}
          </Button>
        </div>
      )}

      {(stage === 'generate' || stage === 'verify') && attempts.length > 0 && (
        <AttemptGrid attempts={attempts} truth={problem.answer} reveal={stage === 'verify'} t={t} />
      )}

      {stage === 'generate' && attempts.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm text-muted-foreground">
            {allDone
              ? t('rlvrLab.contradicting')
              : `${t('rlvrLab.thinking')} (${doneCount}/${N_SAMPLES})`}
          </p>
          {allDone && (
            <Button onClick={() => setStage('verify')} className="gap-1.5">
              {t('rlvrLab.checkBtn')} <ThickArrowRightIcon />
            </Button>
          )}
        </div>
      )}

      {/* Akt 2: Prüfen */}
      {stage === 'verify' && (
        <VerifyPanel
          problem={problem}
          classes={classes}
          onNext={startReinforce}
          t={t}
        />
      )}

      {/* Akt 3: Verstärken */}
      {stage === 'reinforce' && traj && (
        <ReinforcePanel
          problem={problem}
          traj={traj}
          play={play}
          scheme={scheme}
          onScheme={switchScheme}
          onReset={() => reset(problem)}
          t={t}
        />
      )}
    </div>
  )
}

// === Fortschrittsleiste ======================================================
const STAGE_ORDER: Stage[] = ['generate', 'verify', 'reinforce']

function StageBar({ stage, t }: { stage: Stage; t: (k: string) => string }) {
  const STAGE_LABELS: Record<Stage, string> = {
    generate: t('rlvrLab.stageGenerate'),
    verify: t('rlvrLab.stageVerify'),
    reinforce: t('rlvrLab.stageReinforce'),
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

// === Versuchs-Karten (Akt 1 & 2) =============================================
function AttemptGrid({
  attempts,
  truth,
  reveal,
  t,
}: {
  attempts: Array<Attempt | null>
  truth: number
  reveal: boolean
  t: (k: string) => string
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {attempts.map((a, i) => (
        <AttemptCard key={i} index={i} attempt={a} truth={truth} reveal={reveal} t={t} />
      ))}
    </div>
  )
}

function AttemptCard({
  index,
  attempt,
  truth,
  reveal,
  t,
}: {
  index: number
  attempt: Attempt | null
  truth: number
  reveal: boolean
  t: (k: string) => string
}) {
  if (attempt === null) {
    return (
      <div className="flex min-h-[5.5rem] animate-pulse flex-col gap-2 rounded-lg border bg-background/40 p-3">
        <div className="h-2.5 w-2/3 rounded bg-muted" />
        <div className="h-2.5 w-1/2 rounded bg-muted" />
      </div>
    )
  }

  const correct = attempt.answer !== null && Math.abs(attempt.answer - truth) < 1e-6
  return (
    <div
      className={`flex min-h-[5.5rem] flex-col rounded-lg border bg-background/40 p-3 transition-colors ${
        reveal ? (correct ? 'border-[hsl(var(--chart-2)/0.5)]' : 'border-destructive/40') : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('rlvrLab.attemptLabel')} {index + 1}</span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <span className="font-mono text-sm font-semibold tabular-nums">
            {attempt.answer ?? '—'}
          </span>
          {reveal &&
            (correct ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[hsl(var(--chart-2)/0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--chart-2))]">
                <CheckIcon className="h-3 w-3" /> 1
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                <Cross2Icon className="h-3 w-3" /> 0
              </span>
            ))}
        </span>
      </div>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
        {attempt.error ? t('rlvrLab.attemptFailed') : attempt.text}
      </p>
    </div>
  )
}

// === Akt 2: Prüfen ===========================================================
function VerifyPanel({
  problem,
  classes,
  onNext,
  t,
}: {
  problem: LetterProblem
  classes: ReturnType<typeof toAnswerClasses>
  onNext: () => void
  t: (k: string) => string
}) {
  const correctCount = classes.filter((c) => c.correct).reduce((s, c) => s + c.count, 0)
  const total = classes.reduce((s, c) => s + c.count, 0)
  const hasCorrect = correctCount > 0

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">{t('rlvrLab.verifierTitle')}</p>
        <div className="mt-2">
          <HighlightedWord word={problem.word} letter={problem.letter} />
        </div>
        <p className="mt-2 text-sm">
          {t('rlvrLab.verifierNote')} <span className="font-semibold text-primary">{problem.letter}</span> {t('rlvrLab.verifierNoteMid')}{' '}
          <span className="font-mono font-semibold">{problem.answer}</span>. {t('rlvrLab.verifierNoteSuffix')}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        {hasCorrect ? (
          <>
            <span className="font-semibold text-foreground">
              {correctCount} {t('rlvrLab.verifyOf')} {total}
            </span>{' '}
            {t('rlvrLab.verifyVersuche')} {t('rlvrLab.verifyHasCorrect')}
          </>
        ) : (
          <>
            {t('rlvrLab.verifyNoCorrect')}
          </>
        )}
      </p>

      <Button onClick={onNext} disabled={!hasCorrect} className="gap-1.5">
        {t('rlvrLab.learnBtn')} <ThickArrowRightIcon />
      </Button>
    </div>
  )
}

function HighlightedWord({ word, letter }: { word: string; letter: string }) {
  const target = letter.toLowerCase()
  return (
    <p className="font-mono text-xl tracking-wide">
      {[...word].map((c, i) =>
        c.toLowerCase() === target ? (
          <span key={i} className="rounded bg-primary/20 px-0.5 font-semibold text-primary">
            {c}
          </span>
        ) : (
          <span key={i} className="text-muted-foreground">
            {c}
          </span>
        ),
      )}
    </p>
  )
}

// === Akt 3: Verstärken =======================================================
function ReinforcePanel({
  problem,
  traj,
  play,
  scheme,
  onScheme,
  onReset,
  t,
}: {
  problem: LetterProblem
  traj: Trajectory
  play: number
  scheme: RewardKey
  onScheme: (s: RewardKey) => void
  onReset: () => void
  t: (k: string) => string
}) {
  const frameIdx = Math.round(play * (traj.probFrames.length - 1))
  const probs = traj.probFrames[frameIdx]
  const accuracy = traj.accuracyCurve[frameIdx]?.y ?? 0
  const argmax = probs.reduce((best, p, i) => (p > probs[best] ? i : best), 0)
  const pickedClass = traj.classes[argmax]
  const done = play >= 1

  return (
    <div className="space-y-5">
      {/* Belohnungs-Umschalter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{t('rlvrLab.rewardLabel')}</span>
        <div className="inline-flex rounded-lg border p-0.5">
          <SchemeButton active={scheme === 'verifier'} onClick={() => onScheme('verifier')}>
            {t('rlvrLab.schemeVerifier')}
          </SchemeButton>
          <SchemeButton active={scheme === 'impression'} onClick={() => onScheme('impression')}>
            {t('rlvrLab.schemeImpression')}
          </SchemeButton>
        </div>
        <span className="text-xs text-muted-foreground">
          {scheme === 'verifier'
            ? t('rlvrLab.schemeVerifierHint')
            : t('rlvrLab.schemeImpressionHint')}
        </span>
      </div>

      <div className="grid gap-5 rounded-lg border bg-background/40 p-4 lg:grid-cols-[1fr_150px]">
        {/* Balken über die Antwort-Klassen */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">{t('rlvrLab.classTitle')}</h3>
          <ClassBars classes={traj.classes} probs={probs} argmax={argmax} />
        </div>
        {/* Treffer-Anzeige + Kurve */}
        <div>
          <h3 className="mb-1 text-sm font-semibold">{t('rlvrLab.accuracyTitle')}</h3>
          <p className="font-mono text-3xl font-bold tabular-nums text-primary">{Math.round(accuracy * 100)}%</p>
          <AccuracyMini points={traj.accuracyCurve.slice(0, frameIdx + 1)} />
        </div>
      </div>

      {/* Ergebnis-Banner */}
      {done && (
        <Banner
          scheme={scheme}
          problem={problem}
          pickedValue={pickedClass?.value}
          pickedCorrect={!!pickedClass?.correct}
          t={t}
        />
      )}

      <Button onClick={onReset} variant="ghost" size="sm" className="gap-1.5">
        <ReloadIcon /> {t('rlvrLab.newAttempts')}
      </Button>
    </div>
  )
}

function SchemeButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function ClassBars({
  classes,
  probs,
  argmax,
}: {
  classes: Trajectory['classes']
  probs: number[]
  argmax: number
}) {
  return (
    <div className="space-y-2">
      {classes.map((c, i) => {
        const pct = Math.round(probs[i] * 100)
        const isPick = i === argmax
        // Richtig = grün; eine falsche, aber dominante Wahl = Warnfarbe (Hack); sonst neutral.
        const fill = c.correct
          ? 'bg-[hsl(var(--chart-2))]'
          : isPick
            ? 'bg-[hsl(var(--chart-3))]'
            : 'bg-muted-foreground/30'
        return (
          <div key={c.value} className="flex items-center gap-2">
            <span className="flex w-12 shrink-0 items-center justify-end gap-1 font-mono text-sm tabular-nums">
              {c.value}
              {c.correct && <CheckIcon className="h-3 w-3 text-[hsl(var(--chart-2))]" />}
            </span>
            <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted/50">
              <div
                className={`absolute inset-y-0 left-0 rounded ${fill} transition-[width] duration-150`}
                style={{ width: `${Math.max(2, pct)}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

function AccuracyMini({ points }: { points: CurvePoint[] }) {
  const W = 150
  const H = 60
  const pad = 5
  const xMax = Math.max(1, points.length > 0 ? points[points.length - 1].x : 1)
  const sx = (x: number) => pad + (x / xMax) * (W - 2 * pad)
  const sy = (y: number) => pad + (1 - Math.min(1, y)) * (H - 2 * pad)
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 h-14 w-full" preserveAspectRatio="none" role="img" aria-label="Accuracy curve">
      {points.length > 1 && (
        <path d={line} className="stroke-primary" strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      )}
      {last && <circle cx={sx(last.x)} cy={sy(last.y)} r={3} className="fill-primary" />}
    </svg>
  )
}

function Banner({
  scheme,
  problem,
  pickedValue,
  pickedCorrect,
  t,
}: {
  scheme: RewardKey
  problem: LetterProblem
  pickedValue: number | undefined
  pickedCorrect: boolean
  t: (k: string) => string
}) {
  if (scheme === 'verifier') {
    return (
      <div className="rounded-lg border border-[hsl(var(--chart-2)/0.4)] bg-[hsl(var(--chart-2)/0.08)] p-4 text-sm">
        <p>
          {t('rlvrLab.bannerVerifier')}{' '}
          <span className="font-mono font-semibold">{problem.answer}</span>. {t('rlvrLab.bannerVerifierSuffix')}
        </p>
      </div>
    )
  }
  // impression
  return (
    <div className="rounded-lg border border-[hsl(var(--chart-3)/0.4)] bg-[hsl(var(--chart-3)/0.08)] p-4 text-sm">
      {pickedCorrect ? (
        <p>{t('rlvrLab.bannerImpLucky')}</p>
      ) : (
        <p>
          {t('rlvrLab.bannerImpHack')}{' '}
          <span className="font-mono font-semibold">{pickedValue}</span> {t('rlvrLab.bannerImpHackMid')}
        </p>
      )}
    </div>
  )
}
