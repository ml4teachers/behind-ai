'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  WordDistribution,
  type WordCountItem,
} from '@/components/live/word-distribution'

// ---------------------------------------------------------------------------
// Publikumsseite fürs Referat: "Ihr seid jetzt das Sprachmodell."
// Minimalistisch und mobile-first – ~350 Lehrpersonen öffnen das gleichzeitig
// auf dem Smartphone. Die Seite pollt den Zustand und zeigt je nach Phase:
// Warten -> Wort eingeben -> eingereicht -> Verteilung -> nächste Runde.
// Gesteuert wird alles vom Presenter aus /slides.
// ---------------------------------------------------------------------------

interface LiveStateResponse {
  active: boolean
  session: string
  prompt: string
  round: number
  revealed: boolean
  results?: WordCountItem[]
}

const POLL_MS = 2000

function submittedKey(session: string, round: number) {
  return `live-sub:${session}:${round}`
}

export default function LivePage() {
  const [state, setState] = useState<LiveStateResponse | null>(null)
  const [word, setWord] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [failures, setFailures] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/live/state', { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as LiveStateResponse
      setState(data)
      setFailures(0)
      // Habe ich in dieser Runde schon geantwortet? (Reload-sicher)
      if (data.active) {
        setSubmitted(
          window.localStorage.getItem(submittedKey(data.session, data.round)),
        )
      } else {
        setSubmitted(null)
      }
    } catch {
      setFailures((f) => f + 1)
    }
  }, [])

  useEffect(() => {
    poll()
    const interval = window.setInterval(poll, POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') poll()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [poll])

  // Neue Runde -> Eingabefeld leeren und fokussieren.
  const roundKey = state ? `${state.session}:${state.round}` : ''
  useEffect(() => {
    setWord('')
    if (state?.active && !state.revealed) {
      inputRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey])

  const send = async () => {
    if (!state || !word.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/live/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: state.session,
          round: state.round,
          word,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; word?: string }
      if (data.ok && data.word) {
        window.localStorage.setItem(
          submittedKey(state.session, state.round),
          data.word,
        )
        setSubmitted(data.word)
      }
    } catch {
      // Senden fehlgeschlagen -> Feld bleibt gefüllt, nochmals versuchen.
    } finally {
      setSending(false)
    }
  }

  const phase = !state
    ? 'loading'
    : !state.active
      ? 'idle'
      : state.revealed
        ? 'revealed'
        : submitted
          ? 'waiting'
          : 'input'

  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 py-6">
      <header className="mb-6 text-center">
        <p className="font-mono text-sm text-muted-foreground">behind-ai.ch/live</p>
        <h1 className="mt-1 text-xl font-bold">Du bist das Sprachmodell</h1>
      </header>

      <main className="flex flex-1 flex-col justify-center pb-16">
        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground"
            >
              Verbinden …
            </motion.p>
          )}

          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 h-3 w-3 animate-pulse rounded-full bg-primary" />
              <p className="text-lg font-medium">Gleich geht&rsquo;s los.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Lass diese Seite offen – sobald das Experiment startet,
                erscheint hier deine Aufgabe.
              </p>
            </motion.div>
          )}

          {phase === 'input' && state && (
            <motion.div
              key={`input-${roundKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 rounded-xl border bg-muted/40 p-4">
                <p className="text-lg leading-relaxed">
                  {state.prompt}
                  <span className="ml-1 inline-block h-5 w-2 animate-pulse rounded-sm bg-primary align-middle" />
                </p>
              </div>
              <label
                htmlFor="live-word"
                className="mb-2 block text-sm font-medium"
              >
                Welches Wort kommt als Nächstes? (ein Wort)
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id="live-word"
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') send()
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  enterKeyHint="send"
                  maxLength={30}
                  className="h-12 min-w-0 flex-1 rounded-lg border bg-background px-4 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Dein Wort …"
                />
                <Button
                  size="lg"
                  className="h-12 px-5"
                  onClick={send}
                  disabled={!word.trim() || sending}
                >
                  {sending ? '…' : 'Senden'}
                </Button>
              </div>
            </motion.div>
          )}

          {phase === 'waiting' && state && (
            <motion.div
              key={`waiting-${roundKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="mb-4 rounded-xl border bg-muted/40 p-4 text-left">
                <p className="text-lg leading-relaxed">
                  {state.prompt}{' '}
                  <span className="rounded bg-[hsl(var(--chart-2)/0.15)] px-1 font-semibold text-[hsl(var(--chart-2))]">
                    {submitted}
                  </span>
                </p>
              </div>
              <p className="font-medium">Dein Wort ist eingereicht.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Warten auf die Auszählung im Saal …
              </p>
            </motion.div>
          )}

          {phase === 'revealed' && state && (
            <motion.div
              key={`revealed-${roundKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 rounded-xl border bg-muted/40 p-4">
                <p className="text-lg leading-relaxed">{state.prompt} …</p>
              </div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Die Vorhersage des Saals:
              </p>
              <WordDistribution
                results={state.results ?? []}
                highlight={submitted ?? undefined}
                compact
                maxBars={8}
              />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Gleich geht&rsquo;s weiter …
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {failures >= 3 && (
          <p className="mt-6 text-center text-xs text-destructive">
            Verbindung unterbrochen – wird automatisch neu versucht.
          </p>
        )}
      </main>

      <footer className="pt-4 text-center text-xs text-muted-foreground">
        Ein Experiment aus dem Referat «KI verstehen» · behind-ai.ch
      </footer>
    </div>
  )
}
