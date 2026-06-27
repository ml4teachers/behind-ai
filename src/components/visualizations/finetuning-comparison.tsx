'use client'

// ---------------------------------------------------------------------------
// Finetuning-Vergleich: dieselbe Frage an dasselbe Modell, zwei Nutzungsarten.
//   • Basismodell (nur Pretraining): setzt den Text als Dokument fort (Prefill-
//     Trick über /api/finetuning-simulate) -> driftet ab, beantwortet nichts.
//   • Assistent (nach Finetuning): normaler Chat -> antwortet direkt & strukturiert.
// Der Verhaltensunterschied IST die Lektion des Finetunings. Honest framing:
// ein echtes Basismodell ist per API kaum verfügbar, also reproduzieren wir
// sein typisches Verhalten durch reines Fortsetzen (siehe Route-Kommentar).
//
// Zwei unabhängige, parallele Fetches (jedes Panel füllt sich für sich).
// Interne Strings DE inline (Viz-Konvention, EN-Migration in Thread 9).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ChatBubbleIcon,
  FileTextIcon,
  PaperPlaneIcon,
  ReloadIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons'
import { useTranslations } from '@/lib/i18n/use-translations'
import { useMounted } from '@/lib/use-mounted'
import { useUIStore } from '@/lib/store'
import { defaultLocale } from '@/lib/i18n/config'
import { lookupFinetuning, pickOne, thinkingDelay } from '@/lib/fixtures'

type Mode = 'base' | 'assistant'

interface PanelState {
  query: string
  text: string
  loading: boolean
  error: string | null
}

const IDLE: PanelState = { query: '', text: '', loading: false, error: null }

// Beispielanfragen: je eine Frage und mehrere Anweisungen mit Formatvorgaben.
// Bewusst jugendfrei & schulnah; alle zeigen den Kontrast zuverlässig. Je Sprache
// eigene Beispiele, damit das Modell in der UI-Sprache antwortet (Schlüssel des
// Caches ist der exakte Anfragetext).
const EXAMPLES_DE = [
  'Wer war Marie Curie?',
  'Schreibe ein kurzes Gedicht über den Herbst.',
  'Erkläre Photosynthese in einem Satz.',
  'Gib mir drei Tipps gegen Lampenfieber.',
]
const EXAMPLES_EN = [
  'Who was Marie Curie?',
  'Write a short poem about autumn.',
  'Explain photosynthesis in one sentence.',
  'Give me three tips against stage fright.',
]

// Wir rendern kein Markdown, Gemini streut aber gelegentlich Markdown-Zeichen
// ein. Beim Assistenten: Aufzählungen zu Spiegelstrichen, dann Fett/Emphasis
// weg. Beim Basismodell: nur die Emphasis-Marker entfernen (literale „*…*"
// sähen sonst wie ein Bug aus statt wie roher Text).
function cleanBase(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .trim()
}

function cleanAssistant(s: string): string {
  return s
    .replace(/^\s*[*-]\s+/gm, '– ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .trim()
}

export function FinetuningComparison() {
  const t = useTranslations()
  const mounted = useMounted()
  const storeLocale = useUIStore((s) => s.locale)
  const locale = mounted ? storeLocale : defaultLocale
  const EXAMPLES = locale === 'en' ? EXAMPLES_EN : EXAMPLES_DE
  const [input, setInput] = useState(EXAMPLES_DE[0])
  const [base, setBase] = useState<PanelState>(IDLE)
  const [assistant, setAssistant] = useState<PanelState>(IDLE)

  const fetchMode = useCallback(
    async (query: string, mode: Mode, set: (s: PanelState) => void) => {
      set({ query, text: '', loading: true, error: null })
      try {
        const res = await fetch('/api/finetuning-simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, mode, locale }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          throw new Error(data.error || `Fehler ${res.status}`)
        }
        const raw = data.response || ''
        const text = mode === 'assistant' ? cleanAssistant(raw) : cleanBase(raw)
        set({ query, text, loading: false, error: text ? null : null })
      } catch (err) {
        set({
          query,
          text: '',
          loading: false,
          error: err instanceof Error ? err.message : 'Unbekannter Fehler',
        })
      }
    },
    [locale],
  )

  // Eine Musterlösung (gecachte echte Antwort) in einem Panel anzeigen – mit
  // derselben modusabhängigen Bereinigung wie der Live-Pfad.
  const serveCached = useCallback(
    async (query: string, mode: Mode, texts: string[], set: (s: PanelState) => void) => {
      set({ query, text: '', loading: true, error: null })
      await thinkingDelay()
      const raw = pickOne(texts)
      const text = mode === 'assistant' ? cleanAssistant(raw) : cleanBase(raw)
      set({ query, text, loading: false, error: null })
    },
    [],
  )

  const run = useCallback(
    (query: string) => {
      const q = query.trim()
      if (!q) return

      // Vorgegebenes Beispiel -> echte Musterlösungen aus dem Cache (kein API-Aufruf).
      const cached = lookupFinetuning(q)
      if (cached && cached.base.length && cached.assistant.length) {
        serveCached(q, 'base', cached.base, setBase)
        serveCached(q, 'assistant', cached.assistant, setAssistant)
        return
      }

      // Freie Eingabe -> echtes Modell, beide Modi parallel.
      fetchMode(q, 'base', setBase)
      fetchMode(q, 'assistant', setAssistant)
    },
    [fetchMode, serveCached],
  )

  // Beim ersten Laden (sobald die echte Sprache feststeht) die Standard-Frage.
  useEffect(() => {
    if (!mounted) return
    const first = (storeLocale === 'en' ? EXAMPLES_EN : EXAMPLES_DE)[0]
    setInput(first)
    run(first)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  const busy = base.loading || assistant.loading

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
            placeholder={t('finetuningComp.placeholder')}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={busy}
          />
          <Button onClick={() => run(input)} disabled={busy || !input.trim()} className="gap-2 sm:w-auto">
            <PaperPlaneIcon className="h-4 w-4" />
            {t('finetuningComp.askBoth')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <Button
              key={ex}
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal py-1 text-left text-xs"
              disabled={busy}
              onClick={() => {
                setInput(ex)
                run(ex)
              }}
            >
              {ex}
            </Button>
          ))}
        </div>
      </div>

      {/* Zwei Panels */}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel
          icon={<FileTextIcon className="h-4 w-4" />}
          title={t('finetuningComp.baseTitle')}
          tag={t('finetuningComp.baseTag')}
          accent={false}
          state={base}
          onRetry={() => fetchMode(base.query || input, 'base', setBase)}
          renderText={(s) => (
            <p className="whitespace-pre-line text-sm leading-relaxed">
              <span className="text-foreground">{s.query}</span>
              {'\n'}
              <span className="text-muted-foreground">{s.text}</span>
            </p>
          )}
          note={t('finetuningComp.baseNote')}
          loadingLabel={t('finetuningComp.loading')}
          retryLabel={t('finetuningComp.retry')}
          idleLabel={t('finetuningComp.idle')}
        />

        <Panel
          icon={<ChatBubbleIcon className="h-4 w-4" />}
          title={t('finetuningComp.assistantTitle')}
          tag={t('finetuningComp.assistantTag')}
          accent
          state={assistant}
          onRetry={() => fetchMode(assistant.query || input, 'assistant', setAssistant)}
          renderText={(s) => (
            <div className="space-y-2 text-sm leading-relaxed">
              <div className="text-xs text-muted-foreground">{t('finetuningComp.userLabel')} {s.query}</div>
              <p className="whitespace-pre-line">{s.text}</p>
            </div>
          )}
          note={t('finetuningComp.assistantNote')}
          loadingLabel={t('finetuningComp.loading')}
          retryLabel={t('finetuningComp.retry')}
          idleLabel={t('finetuningComp.idle')}
        />
      </div>
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
  renderText: (s: PanelState) => React.ReactNode
  note: string
  loadingLabel: string
  retryLabel: string
  idleLabel: string
}

function Panel({ icon, title, tag, accent, state, onRetry, renderText, note, loadingLabel, retryLabel, idleLabel }: PanelProps) {
  return (
    <div className="flex flex-col rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <span className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <span className={`text-sm font-semibold ${accent ? 'text-primary' : 'text-foreground'}`}>
          {title}
        </span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {tag}
        </span>
      </div>

      <div className="flex min-h-[200px] max-h-[22rem] flex-1 flex-col overflow-y-auto px-4 py-3">
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
              <ReloadIcon className="h-3 w-3" />
              {retryLabel}
            </Button>
          </div>
        ) : state.text ? (
          <div className="flex-1">{renderText(state)}</div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            {idleLabel}
          </div>
        )}
      </div>

      <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}
