'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  WordDistribution,
  type WordCountItem,
} from '@/components/live/word-distribution'
import type { LiveState } from '@/lib/live/store'

// ---------------------------------------------------------------------------
// Steuerung des Live-Publikumsexperiments aus dem Foliensatz heraus.
//
// Ablauf pro Runde: Start (Satzanfang) -> Publikum tippt -> «Auszählen»
// (deckt die Verteilung auf, auch auf den Smartphones) -> Klick auf ein Wort
// übernimmt es in den Satz und startet die nächste Runde.
//
// Autorisierung: LIVE_ADMIN_TOKEN als Header, einmalig abgefragt und in
// localStorage gemerkt. Lokal (ohne Env-Variable) ist keine Eingabe nötig.
// ---------------------------------------------------------------------------

const TOKEN_STORAGE_KEY = 'live-admin-token'
const POLL_MS = 2000

interface StatusResponse {
  ok?: boolean
  state?: LiveState
  results?: WordCountItem[]
  error?: string
}

export function PresenterPanel({ defaultPrompt }: { defaultPrompt: string }) {
  const [token, setToken] = useState('')
  const [needsToken, setNeedsToken] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [state, setState] = useState<LiveState | null>(null)
  const [results, setResults] = useState<WordCountItem[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Satzanfang der laufenden Session, um übernommene Wörter hervorzuheben.
  const basePromptRef = useRef<string>('')

  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '')
  }, [])

  const control = useCallback(
    async (payload: Record<string, string>): Promise<StatusResponse | null> => {
      try {
        const res = await fetch('/api/live/control', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-live-token': token } : {}),
          },
          body: JSON.stringify(payload),
        })
        if (res.status === 401) {
          setNeedsToken(true)
          return null
        }
        const data = (await res.json()) as StatusResponse
        if (!res.ok) {
          setError(data.error ?? `Fehler ${res.status}`)
          return null
        }
        setNeedsToken(false)
        setError(null)
        return data
      } catch {
        setError('Verbindung fehlgeschlagen')
        return null
      }
    },
    [token],
  )

  // Zustand + Live-Auszählung laufend abholen.
  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      const data = await control({ action: 'status' })
      if (!cancelled && data?.state) {
        setState(data.state)
        setResults(data.results ?? [])
      }
    }
    tick()
    const interval = window.setInterval(tick, POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [control])

  const run = async (payload: Record<string, string>) => {
    setBusy(true)
    const data = await control(payload)
    if (data?.state) {
      setState(data.state)
      setResults(data.results ?? [])
    }
    setBusy(false)
    return data
  }

  const start = async () => {
    basePromptRef.current = prompt.trim()
    await run({ action: 'start', prompt: prompt.trim() })
  }

  const saveToken = () => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, tokenInput.trim())
    setToken(tokenInput.trim())
    setNeedsToken(false)
  }

  const totalAnswers = results.reduce((acc, r) => acc + r.count, 0)
  const active = state?.active ?? false

  // Übernommene Wörter (nach dem Satzanfang) hervorheben.
  const base = basePromptRef.current
  const accepted =
    active && base && state && state.prompt.startsWith(base)
      ? state.prompt.slice(base.length)
      : ''
  const shownBase = accepted ? base : (state?.prompt ?? '')

  if (needsToken) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-xl border bg-card p-6">
        <p className="font-medium">Presenter-Token erforderlich</p>
        <p className="text-sm text-muted-foreground">
          Wert von <code className="font-mono">LIVE_ADMIN_TOKEN</code> eingeben
          (wird auf diesem Gerät gespeichert).
        </p>
        <div className="flex gap-2">
          <Input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveToken()}
            placeholder="Token"
          />
          <Button onClick={saveToken} disabled={!tokenInput.trim()}>
            Speichern
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!active && (
        <div className="space-y-3 rounded-xl border bg-card p-5">
          <label className="block text-sm font-medium text-muted-foreground">
            Satzanfang
          </label>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="text-lg"
          />
          <Button size="lg" onClick={start} disabled={busy || !prompt.trim()}>
            Experiment starten
          </Button>
        </div>
      )}

      {active && state && (
        <>
          {/* Der wachsende Satz */}
          <div className="rounded-xl border bg-muted/40 p-5">
            <p className="text-2xl leading-relaxed md:text-4xl">
              {shownBase}
              {accepted && (
                <span className="font-semibold text-[hsl(var(--chart-2))]">
                  {accepted}
                </span>
              )}
              {!state.revealed && (
                <span className="ml-2 inline-block h-7 w-3 animate-pulse rounded-sm bg-primary align-middle md:h-9" />
              )}
            </p>
          </div>

          {!state.revealed && (
            <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5">
              <div>
                <div className="text-4xl font-bold tabular-nums md:text-6xl">
                  {totalAnswers}
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalAnswers === 1 ? 'Antwort' : 'Antworten'} für Runde{' '}
                  {state.round + 1}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="lg" onClick={() => run({ action: 'reveal' })} disabled={busy}>
                  Auszählen
                </Button>
              </div>
            </div>
          )}

          {state.revealed && (
            <div className="space-y-3 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Die Vorhersage des Saals ({totalAnswers}{' '}
                  {totalAnswers === 1 ? 'Antwort' : 'Antworten'}) – Wort
                  anklicken, um es zu übernehmen:
                </p>
              </div>
              <WordDistribution
                results={results}
                onSelect={(word) => run({ action: 'accept', word })}
                maxBars={8}
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => run({ action: 'stop' })}
              disabled={busy}
            >
              Experiment beenden
            </Button>
          </div>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
