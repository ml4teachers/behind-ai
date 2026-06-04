'use client'

// ---------------------------------------------------------------------------
// RAG-Explorer: echtes Retrieval über eine kleine, erfundene Wissensbasis +
// echte Generierung. Drei Schritte werden sichtbar:
//   1. Abrufen (Retrieval): die Frage wird live eingebettet (/api/embeddings,
//      gemini-embedding-2), dann per Cosinus-Ähnlichkeit gegen alle Dokumente
//      sortiert. Die k ähnlichsten kommen in den Kontext – mit sichtbaren Werten.
//   2. Anreichern (Augmentation): diese Dokumente werden vor die Frage gestellt.
//   3. Antworten (Generation): dasselbe Modell antwortet einmal OHNE und einmal
//      MIT diesem Kontext (/api/rag-answer, Gemini über Vertex AI).
//
// Pointe: Retrieval ist blosse Ähnlichkeitssuche. Man sieht die Werte, kann
// Dokumente aus der Wissensbasis nehmen (dann findet die Suche sie nicht mehr)
// und an einer themenfremden Frage sehen, wie ein gut geerdetes Modell ehrlich
// sagt, dass die Unterlagen nichts hergeben.
//
// Interne Strings DE inline (Viz-Konvention; EN-Migration in Thread 9). Die
// Seiten-Copy läuft über i18n.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n/use-translations'
import {
  MagnifyingGlassIcon,
  FileTextIcon,
  ChatBubbleIcon,
  PaperPlaneIcon,
  ReloadIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  EyeNoneIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons'
import { rankDocs, unit, type RagDoc, type RagDocsFile, type ScoredDoc } from '@/lib/rag/retrieval'

// Wie viele Dokumente in den Kontext wandern.
const TOP_K = 3

// Beispielfragen bewusst OHNE Schulname – der Bezug („die Schule") steht in der
// Wissensbasis. So treibt das Thema die Suche, nicht der oft genannte Name; die
// letzte Frage ist absichtlich themenfremd (zeigt: die Unterlagen geben nichts her).
const EXAMPLES = [
  'Wer leitet die Schule?',
  'Wann hat die Bibliothek offen?',
  'Worum geht es in der Projektwoche?',
  'Welche Instrumente gibt es im Musikzimmer?',
  'Wer hat die Fussball-WM 2022 gewonnen?',
]
const DEFAULT_QUESTION = EXAMPLES[0]

// Wir rendern kein Markdown; Gemini streut aber gelegentlich Markdown-Zeichen
// ein. Aufzählungen zu Spiegelstrichen, dann Fett/Emphasis/Code weg.
function clean(s: string): string {
  return s
    .replace(/^\s*[*-]\s+/gm, '– ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .trim()
}

// Cosinus-Wert (hier grob 0.45–0.85) auf eine sichtbare Balkenbreite abbilden.
// Absolute Skala (nicht relativ zum Set): so zeigt eine themenfremde Frage, bei
// der nichts gut passt, durchgehend kurze Balken.
const SIM_LO = 0.45
const SIM_HI = 0.8
const barPct = (sim: number) =>
  Math.max(3, Math.min(100, ((sim - SIM_LO) / (SIM_HI - SIM_LO)) * 100))

interface PanelState {
  text: string
  loading: boolean
  error: string | null
}
const IDLE: PanelState = { text: '', loading: false, error: null }

export function RagExplorer() {
  const t = useTranslations()
  const [docs, setDocs] = useState<RagDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [input, setInput] = useState(DEFAULT_QUESTION)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  // Letzte eingebettete Frage (Text + Einheitsvektor) – daraus wird das Ranking
  // bei jedem Render frisch berechnet (auch nach dem Aus-/Einblenden von Docs).
  const [lastQuery, setLastQuery] = useState<{ text: string; vec: number[] } | null>(null)
  const [embedding, setEmbedding] = useState(false)
  const [retrievalError, setRetrievalError] = useState<string | null>(null)

  const [plain, setPlain] = useState<PanelState>(IDLE)
  const [rag, setRag] = useState<PanelState>(IDLE)
  // Welche Dokumente sind in die aktuell gezeigte RAG-Antwort geflossen.
  const [answeredWith, setAnsweredWith] = useState<{ ids: string[]; excl: string } | null>(null)

  const didInit = useRef(false)

  // Wissensbasis laden (statische Datei, kein API-Call).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/rag-docs.json')
        if (!res.ok) throw new Error(`Wissensbasis konnte nicht geladen werden (${res.status})`)
        const data: RagDocsFile = await res.json()
        if (cancelled) return
        // Vektoren nach dem Runden im Build neu normieren -> sauberer Cosinus.
        setDocs(data.docs.map((d) => ({ ...d, vec: unit(d.vec) })))
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Eine Antwort holen (mit oder ohne Kontext).
  const fetchAnswer = useCallback(
    async (question: string, context: string, set: (s: PanelState) => void) => {
      set({ text: '', loading: true, error: null })
      try {
        const res = await fetch('/api/rag-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, context }),
        })
        const data = await res.json()
        if (!res.ok || data.error) throw new Error(data.error || `Fehler ${res.status}`)
        const text = clean(data.answer || '')
        set({ text, loading: false, error: text ? null : 'Keine Ausgabe – bitte nochmal versuchen.' })
      } catch (err) {
        set({ text: '', loading: false, error: err instanceof Error ? err.message : 'Unbekannter Fehler' })
      }
    },
    [],
  )

  // Eine Frage durch die ganze Pipeline schicken.
  const run = useCallback(
    async (rawQuestion: string, currentDocs: RagDoc[], currentExcluded: Set<string>) => {
      const question = rawQuestion.trim()
      if (!question || currentDocs.length === 0) return

      // Schritt „Antwort ohne Kontext" braucht kein Retrieval -> sofort starten.
      fetchAnswer(question, '', setPlain)

      // Schritt „Abrufen": Frage einbetten, dann gegen die aktiven Dokumente ranken.
      setEmbedding(true)
      setRetrievalError(null)
      setRag({ text: '', loading: true, error: null })
      try {
        const res = await fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: question }),
        })
        const data = await res.json()
        if (!res.ok || !data.embedding) throw new Error(data.error || `Fehler ${res.status}`)
        const vec = unit(data.embedding as number[])
        setLastQuery({ text: question, vec })

        const active = currentDocs.filter((d) => !currentExcluded.has(d.id))
        const top = rankDocs(vec, active).slice(0, TOP_K)
        const context = top.map((s) => `${s.doc.title}\n${s.doc.text}`).join('\n\n')
        setAnsweredWith({ ids: top.map((s) => s.doc.id), excl: [...currentExcluded].sort().join(',') })

        // Schritt „Antworten mit Kontext".
        await fetchAnswer(question, context, setRag)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
        setRetrievalError(msg)
        setRag({ text: '', loading: false, error: msg })
      } finally {
        setEmbedding(false)
      }
    },
    [fetchAnswer],
  )

  // Beim ersten Laden (sobald Docs da sind) die Standardfrage zeigen.
  useEffect(() => {
    if (docs.length === 0 || didInit.current) return
    didInit.current = true
    run(DEFAULT_QUESTION, docs, new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs])

  const submit = (q: string) => {
    if (embedding || loading) return
    run(q, docs, excluded)
  }

  const toggleDoc = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // --- Abgeleitet: aktuelles Ranking (neu berechnet, auch nach Toggle) --------
  const activeDocs = docs.filter((d) => !excluded.has(d.id))
  const ranked: ScoredDoc[] | null = lastQuery ? rankDocs(lastQuery.vec, activeDocs) : null
  const topIds = new Set((ranked ?? []).slice(0, TOP_K).map((s) => s.doc.id))
  const simById = new Map((ranked ?? []).map((s) => [s.doc.id, s.sim]))

  // Anzeigereihenfolge: nach Relevanz sortiert (sobald gesucht wurde), aus-
  // geblendete Dokumente nach unten. Vor der ersten Frage Originalreihenfolge.
  const orderedDocs: RagDoc[] = (() => {
    if (!ranked) return docs
    const inactive = docs.filter((d) => excluded.has(d.id))
    return [...ranked.map((s) => s.doc), ...inactive]
  })()

  // Wurde die Wissensbasis seit der gezeigten RAG-Antwort verändert (Docs aus-
  // oder eingeblendet)? Dann ist die Antwort nicht mehr auf dem aktuellen Stand.
  const currentExclKey = [...excluded].sort().join(',')
  const stale =
    !rag.loading && !!rag.text && answeredWith !== null && answeredWith.excl !== currentExclKey

  const busy = embedding || plain.loading || rag.loading
  const contextTitles = (ranked ?? [])
    .slice(0, TOP_K)
    .map((s) => s.doc.title)

  if (loadError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span>{loadError}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Eingabe */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(input)}
            placeholder={t('ragExplorer.placeholder')}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={loading}
          />
          <Button onClick={() => submit(input)} disabled={busy || loading || !input.trim()} className="gap-2 sm:w-auto">
            <PaperPlaneIcon className="h-4 w-4" />
            {t('ragExplorer.ask')}
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
                submit(ex)
              }}
            >
              {ex}
            </Button>
          ))}
        </div>
      </div>

      {/* Schritt 1 – Abrufen (Retrieval) */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
            {t('ragExplorer.retrievalTitle')}
          </h3>
          <span className="text-xs text-muted-foreground">
            {t('ragExplorer.knowledgeBase')} ({activeDocs.length} {t('ragExplorer.of')} {docs.length} {t('ragExplorer.active')})
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {lastQuery
            ? `${t('ragExplorer.retrievalHintAfter')} ${TOP_K} ${t('ragExplorer.retrievalHintAfterSuffix')}`
            : t('ragExplorer.retrievalHintBefore')}
        </p>

        <ul className="space-y-1.5">
          {orderedDocs.map((d) => {
            const isExcluded = excluded.has(d.id)
            const sim = simById.get(d.id)
            const inContext = topIds.has(d.id)
            return (
              <li
                key={d.id}
                className={[
                  'rounded-lg border px-3 py-2 transition-colors',
                  isExcluded
                    ? 'border-dashed bg-muted/30 opacity-60'
                    : inContext
                      ? 'border-primary/40 bg-primary/5'
                      : 'bg-background',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">{d.title}</span>
                      {inContext && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <CheckCircledIcon className="h-3 w-3" /> {t('ragExplorer.inContext')}
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-xs leading-relaxed ${isExcluded ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      {d.text}
                    </p>

                    {/* Ähnlichkeits-Balken (sobald gesucht wurde und Doc aktiv) */}
                    {!isExcluded && sim !== undefined && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={inContext ? 'h-full rounded-full bg-primary' : 'h-full rounded-full bg-muted-foreground/40'}
                            style={{ width: `${barPct(sim)}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                          {sim.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Toggle: Dokument aus der Wissensbasis nehmen / zurückgeben */}
                  <button
                    type="button"
                    onClick={() => toggleDoc(d.id)}
                    title={isExcluded ? t('ragExplorer.toggleInclude') : t('ragExplorer.toggleExclude')}
                    aria-label={isExcluded ? t('ragExplorer.toggleInclude') : t('ragExplorer.toggleExclude')}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {isExcluded ? <EyeNoneIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
        {retrievalError && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <ExclamationTriangleIcon className="h-3.5 w-3.5" /> {retrievalError}
          </p>
        )}
      </section>

      {/* Schritt 2 – Antworten (Generation) */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ChatBubbleIcon className="h-4 w-4 text-muted-foreground" />
          {t('ragExplorer.answerTitle')}
        </h3>

        {stale && (
          <p className="text-xs text-muted-foreground">
            {t('ragExplorer.stale')}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Panel
            icon={<ChatBubbleIcon className="h-4 w-4" />}
            title={t('ragExplorer.withoutTitle')}
            tag={t('ragExplorer.withoutTag')}
            accent={false}
            state={plain}
            onRetry={() => fetchAnswer((lastQuery?.text || input).trim(), '', setPlain)}
            loadingLabel={t('ragExplorer.loading')}
            retryLabel={t('ragExplorer.retry')}
            idleLabel={t('ragExplorer.idle')}
            footer={
              <span>{t('ragExplorer.withoutFooter')}</span>
            }
          />

          <Panel
            icon={<FileTextIcon className="h-4 w-4" />}
            title={t('ragExplorer.withTitle')}
            tag={t('ragExplorer.withTag')}
            accent
            state={rag}
            onRetry={() => submit(lastQuery?.text || input)}
            loadingLabel={t('ragExplorer.loading')}
            retryLabel={t('ragExplorer.retry')}
            idleLabel={t('ragExplorer.idle')}
            footer={
              contextTitles.length > 0 ? (
                <span>
                  {t('ragExplorer.withFooter')} <span className="text-foreground">{contextTitles.join(', ')}</span>. {t('ragExplorer.withFooterNote')}
                </span>
              ) : (
                <span>{t('ragExplorer.withFooterEmpty')}</span>
              )
            }
          />
        </div>
      </section>
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
  footer: React.ReactNode
  loadingLabel: string
  retryLabel: string
  idleLabel: string
}

function Panel({ icon, title, tag, accent, state, onRetry, footer, loadingLabel, retryLabel, idleLabel }: PanelProps) {
  return (
    <div className="flex flex-col rounded-lg border bg-background">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <span className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
        <span className={`text-sm font-semibold ${accent ? 'text-primary' : 'text-foreground'}`}>{title}</span>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
      </div>

      <div className="flex min-h-[160px] max-h-[22rem] flex-1 flex-col overflow-y-auto px-4 py-3">
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
          <p className="flex-1 whitespace-pre-line text-sm leading-relaxed">{state.text}</p>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            {idleLabel}
          </div>
        )}
      </div>

      <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">{footer}</p>
    </div>
  )
}
