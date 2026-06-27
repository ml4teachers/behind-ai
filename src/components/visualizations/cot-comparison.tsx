'use client'

// ---------------------------------------------------------------------------
// Chain-of-Thought-Vergleich: dasselbe echte Modell, dieselbe Aufgabe, zwei Modi.
//   • „Sofort antworten" (mode 'direct')      → gibt nur das Ergebnis aus.
//   • „Schritt für Schritt" (mode 'cot')      → schreibt den Rechenweg aus.
// Bei Mehrschritt-Arithmetik liegt der Sofort-Modus zuverlässig daneben, der
// Schritt-für-Schritt-Modus trifft. Ein echter JS-Prüfer rechnet jede Aufgabe
// nach und fällt das Urteil ✓/✗ – der Falsch→Richtig-Flip IST die Lektion:
// Mitdenken ist nichts Magisches, sondern weitere vorhergesagte Tokens, die das
// Modell sich selbst als Kontext gibt; mehr Tokens = mehr Rechenschritte.
//
// Zwei unabhängige, parallele Fetches (wie finetuning-comparison.tsx).
// Interne Strings DE inline (Viz-Konvention; EN-Migration → Thread 9).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  LightningBoltIcon,
  ListBulletIcon,
  PaperPlaneIcon,
  ReloadIcon,
} from '@radix-ui/react-icons'
import { useTranslations } from '@/lib/i18n/use-translations'
import { useMounted } from '@/lib/use-mounted'
import { useUIStore } from '@/lib/store'
import { defaultLocale } from '@/lib/i18n/config'
import { ARITH_PROBLEMS, DEFAULT_ARITH } from '@/lib/reasoning/problems'
import { evalArith, isCorrect, parseAnswer } from '@/lib/reasoning/verify'
import { lookupCot, pickOne, thinkingDelay } from '@/lib/fixtures'

// Aufgabenstellung in der UI-Sprache (steuert die Ausgabesprache des Modells).
const calcPrompt = (expr: string, locale: string) =>
  locale === 'en' ? `Calculate: ${expr}` : `Berechne: ${expr}`

type Mode = 'direct' | 'cot'
type Verdict = 'correct' | 'wrong' | null

interface PanelState {
  answer: string
  text: string
  loading: boolean
  error: string | null
  verdict: Verdict
}

const IDLE: PanelState = { answer: '', text: '', loading: false, error: null, verdict: null }

// Gelegentlich streut Gemini Markdown-Zeichen ein, die wir nicht rendern.
function clean(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .trim()
}

function shorten(s: string, n = 48): string {
  const one = s.replace(/\s+/g, ' ').trim()
  return one.length <= n ? one : one.slice(0, n).trimEnd() + ' …'
}

export function CotComparison() {
  const t = useTranslations()
  const mounted = useMounted()
  const storeLocale = useUIStore((s) => s.locale)
  const locale = mounted ? storeLocale : defaultLocale
  const [input, setInput] = useState(DEFAULT_ARITH.expr)
  const [direct, setDirect] = useState<PanelState>(IDLE)
  const [cot, setCot] = useState<PanelState>(IDLE)

  const fetchMode = useCallback(
    async (prompt: string, mode: Mode, truth: number | null, set: (s: PanelState) => void) => {
      set({ ...IDLE, loading: true })
      try {
        const res = await fetch('/api/reasoning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode, temperature: mode === 'direct' ? 0.6 : 0.4, locale }),
        })
        const data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || `Fehler ${res.status}`)
        const text = clean(data.text || '')
        const answer = parseAnswer(text)
        const verdict: Verdict = truth === null ? null : isCorrect(answer, truth) ? 'correct' : 'wrong'
        set({ answer, text, loading: false, error: text ? null : 'Keine Ausgabe – bitte nochmal.', verdict })
      } catch (err) {
        set({ ...IDLE, error: err instanceof Error ? err.message : 'Unbekannter Fehler' })
      }
    },
    [locale],
  )

  // Eine Musterlösung (gecachter echter Lauf) in einem Panel anzeigen – läuft
  // durch dieselbe clean→parse→Urteil-Kette wie eine Live-Antwort.
  const serveCached = useCallback(
    async (texts: string[], truth: number | null, set: (s: PanelState) => void) => {
      set({ ...IDLE, loading: true })
      await thinkingDelay()
      const text = clean(pickOne(texts))
      const answer = parseAnswer(text)
      const verdict: Verdict = truth === null ? null : isCorrect(answer, truth) ? 'correct' : 'wrong'
      set({ answer, text, loading: false, error: text ? null : 'Keine Ausgabe – bitte nochmal.', verdict })
    },
    [],
  )

  const run = useCallback(
    (raw: string, knownTruth?: number) => {
      const q = raw.trim()
      if (!q) return
      const truth = knownTruth ?? evalArith(q)
      // Reiner Rechenausdruck → als „Berechne: …"/„Calculate: …" stellen; sonst wörtlich.
      const prompt = truth !== null ? calcPrompt(q, locale) : q

      // Vorgegebene Aufgabe -> echte Musterläufe aus dem Cache (kein API-Aufruf).
      // Schlüssel ist der volle Prompt → DE/EN landen auf getrennten Einträgen.
      const cached = lookupCot(prompt)
      if (cached && cached.direct.length && cached.cot.length) {
        serveCached(cached.direct, truth, setDirect)
        serveCached(cached.cot, truth, setCot)
        return
      }

      // Freie Eingabe -> echtes Modell, beide Modi parallel.
      fetchMode(prompt, 'direct', truth, setDirect)
      fetchMode(prompt, 'cot', truth, setCot)
    },
    [fetchMode, serveCached, locale],
  )

  // Beim ersten Laden (sobald die echte Sprache feststeht) die Standard-Aufgabe.
  useEffect(() => {
    if (!mounted) return
    run(DEFAULT_ARITH.expr, DEFAULT_ARITH.answer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  const busy = direct.loading || cot.loading
  const truthOfInput = evalArith(input.trim())

  return (
    <div className="space-y-5">
      {/* Eingabe */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !busy && run(input)}
            placeholder={t('cotComp.placeholder')}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={busy}
          />
          <Button onClick={() => run(input)} disabled={busy || !input.trim()} className="gap-2 sm:w-auto">
            <PaperPlaneIcon className="h-4 w-4" />
            {t('cotComp.askBoth')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ARITH_PROBLEMS.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              size="sm"
              className="h-auto py-1 font-mono text-xs"
              disabled={busy}
              onClick={() => {
                setInput(p.expr)
                run(p.expr, p.answer)
              }}
            >
              {p.expr}
            </Button>
          ))}
        </div>
      </div>

      {/* Zwei Panels */}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          icon={<LightningBoltIcon className="h-4 w-4" />}
          title={t('cotComp.directTitle')}
          tag={t('cotComp.directTag')}
          accent={false}
          state={direct}
          onRetry={() => run(input)}
          note={t('cotComp.directNote')}
          loadingLabel={t('cotComp.loading')}
          retryLabel={t('cotComp.retry')}
          resultLabel={t('cotComp.resultLabel')}
          correctLabel={t('cotComp.correct')}
          wrongLabel={t('cotComp.wrong')}
        />
        <Panel
          icon={<ListBulletIcon className="h-4 w-4" />}
          title={t('cotComp.cotTitle')}
          tag={t('cotComp.cotTag')}
          accent
          state={cot}
          onRetry={() => run(input)}
          note={t('cotComp.cotNote')}
          loadingLabel={t('cotComp.loading')}
          retryLabel={t('cotComp.retry')}
          resultLabel={t('cotComp.resultLabel')}
          correctLabel={t('cotComp.correct')}
          wrongLabel={t('cotComp.wrong')}
        />
      </div>

      {truthOfInput === null && !busy && (
        <p className="text-xs text-muted-foreground">
          {t('cotComp.freeTaskHint')}
        </p>
      )}
    </div>
  )
}

interface PanelProps {
  icon: React.ReactNode
  title: string
  tag: string
  accent: boolean
  state: PanelState
  onRetry: () => void
  note: string
  loadingLabel: string
  retryLabel: string
  resultLabel: string
  correctLabel: string
  wrongLabel: string
}

function Panel({ icon, title, tag, accent, state, onRetry, note, loadingLabel, retryLabel, resultLabel, correctLabel, wrongLabel }: PanelProps) {
  const { verdict } = state
  return (
    <div className="flex flex-col rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <span className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <span className={`text-sm font-semibold ${accent ? 'text-primary' : 'text-foreground'}`}>{title}</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
      </div>

      <div className="flex min-h-[200px] flex-1 flex-col gap-3 px-4 py-3">
        {state.loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
            <ReloadIcon className="h-4 w-4 animate-spin" />
            <span>{loadingLabel}</span>
          </div>
        ) : state.error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>{state.error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
              <ReloadIcon className="h-3 w-3" /> {retryLabel}
            </Button>
          </div>
        ) : (
          <>
            {/* Result + verdict */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{resultLabel}</span>
              <span className="font-mono text-base font-semibold">{shorten(state.answer) || '–'}</span>
              {verdict && <VerdictBadge verdict={verdict} correctLabel={correctLabel} wrongLabel={wrongLabel} />}
            </div>
            {/* Working / output */}
            <div className="max-h-56 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {state.text}
            </div>
          </>
        )}
      </div>

      <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

function VerdictBadge({ verdict, correctLabel, wrongLabel }: { verdict: 'correct' | 'wrong'; correctLabel: string; wrongLabel: string }) {
  if (verdict === 'correct') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--chart-2)/0.15)] px-2 py-0.5 text-xs font-semibold text-[hsl(var(--chart-2))]">
        <CheckIcon className="h-3.5 w-3.5" /> {correctLabel}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
      <Cross2Icon className="h-3.5 w-3.5" /> {wrongLabel}
    </span>
  )
}
