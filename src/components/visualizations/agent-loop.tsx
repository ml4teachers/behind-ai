'use client'

// ---------------------------------------------------------------------------
// Agenten-Schleife: dasselbe echte Modell (Gemini über Vertex), in eine Schleife
// gestellt und mit echten Werkzeugen daneben.
//
// Die Pointe der Seite wird hier sichtbar: das Modell TUT nichts. Es sagt nur
// Text voraus. Manchmal ist dieser Text ein Werkzeug-Aufruf – dann fängt das
// Gerüst (diese Komponente) ihn ab, führt das Werkzeug WIRKLICH aus und schreibt
// das Ergebnis zurück in den Kontext. Dann sagt das Modell wieder Text voraus.
// Schleife. Die „Handlungsfähigkeit" steckt im Gerüst, nicht im Modell.
//
// Echt:
//   • Das Modell entscheidet selbst, welches Werkzeug es mit welchen Argumenten
//     ruft (Gemini-Function-Calling, /api/agent-step liefert einen Zug).
//   • Die Werkzeuge laufen clientseitig (lib/agent/tools.ts) – transparent und
//     abschaltbar. `heute` liefert das echte heutige Datum (das ein eingefrorenes
//     Modell nicht von sich aus kennt), `rechner` rechnet exakt.
//
// Manipulationen: Werkzeug abschalten (Agent scheitert ehrlich), Schritt für
// Schritt durchklicken, den wachsenden Kontext einsehen.
//
// UI-Strings über i18n (agentLoop.*, DE+EN). Werkzeug-/Ergebnis-Bezeichner
// (heute/tage_bis/rechner, datum/tage/ergebnis) bleiben als feste Code-Identifier
// stehen – sie sind der Datenvertrag des Werkzeugs. Die Begründung des Modells
// kommt in der Sprache der Aufgabe (die Route weist das an). fetch-basiert.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  PaperPlaneIcon,
  GearIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  ReloadIcon,
  ResetIcon,
  TrackNextIcon,
  PlayIcon,
  LightningBoltIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'
import { useTranslations } from '@/lib/i18n/use-translations'
import { useMounted } from '@/lib/use-mounted'
import { useUIStore } from '@/lib/store'
import { defaultLocale } from '@/lib/i18n/config'
import { AGENT_TOOLS, getTool } from '@/lib/agent/tools'

type T = (key: string) => string

// Wie viele Schleifendurchläufe maximal (Sicherung gegen Endlosschleifen).
const MAX_STEPS = 8

// --- Gemini-Konversationsformat (clientseitig geführt) ----------------------
type Part = {
  text?: string
  functionCall?: { name: string; args?: Record<string, unknown> }
  functionResponse?: { name: string; response: Record<string, unknown> }
}
type Content = { role: 'user' | 'model'; parts: Part[] }
type ToolCall = { name: string; args: Record<string, unknown> }

// --- Anzeige-Einträge der Timeline -----------------------------------------
type Entry =
  | { kind: 'task'; text: string }
  | { kind: 'model'; thought: string; calls: ToolCall[] }
  | { kind: 'tool'; name: string; args: Record<string, unknown>; result: Record<string, unknown> }
  | { kind: 'final'; text: string }
  | { kind: 'note'; text: string }
  | { kind: 'error'; text: string }

type Phase = 'idle' | 'thinking' | 'paused' | 'done' | 'error'

function clean(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .trim()
}

// Argumente kompakt darstellen: {von:'…', bis:'…'} -> „von: …, bis: …".
function formatArgs(args: Record<string, unknown>): string {
  const keys = Object.keys(args)
  if (keys.length === 0) return ''
  return keys.map((k) => `${k}: ${String(args[k])}`).join(', ')
}

// Ergebnis kompakt darstellen, Zahlen gerundet. Die Schlüssel (datum/tage/…)
// bleiben verbatim stehen – sie sind der Datenvertrag des Werkzeugs.
function formatResult(result: Record<string, unknown>): string {
  return Object.entries(result)
    .map(([k, v]) => {
      if (typeof v === 'number') return `${k}: ${Number.isInteger(v) ? v : v.toFixed(2)}`
      return `${k}: ${String(v)}`
    })
    .join(', ')
}

export function AgentLoop() {
  const t = useTranslations()
  // Immer die aktuelle Übersetzungsfunktion – für Strings, die in der async-
  // Schleife entstehen (sonst könnten sie eine veraltete Sprache erwischen).
  const tRef = useRef<T>(t)
  tRef.current = t

  // Aktive UI-Sprache (vor dem Mount die Default-Sprache → Hydration-Schutz).
  // Sie steuert die Sprache der Modell-Begründung (die Route wählt das Prompt).
  const mounted = useMounted()
  const storeLocale = useUIStore((s) => s.locale)
  const locale = mounted ? storeLocale : defaultLocale
  const localeRef = useRef(locale)
  localeRef.current = locale

  const [input, setInput] = useState<string>(() => t('agentLoop.ex1'))
  const [entries, setEntries] = useState<Entry[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [mode, setMode] = useState<'auto' | 'step'>('auto')
  const [stepCount, setStepCount] = useState(0)
  const [enabled, setEnabled] = useState<Set<string>>(() => new Set(AGENT_TOOLS.map((tool) => tool.name)))
  // Werkzeugmenge, mit der der aktuell gezeigte Lauf gestartet wurde (für „geändert").
  const [ranWith, setRanWith] = useState<string>('')
  const [showContext, setShowContext] = useState(false)

  // Refs spiegeln den State, damit die async-Schleife immer aktuelle Werte liest.
  const contentsRef = useRef<Content[]>([])
  const enabledRef = useRef(enabled)
  const modeRef = useRef(mode)
  const stepRef = useRef(0)
  const didInit = useRef(false)
  enabledRef.current = enabled
  modeRef.current = mode

  const examples = [t('agentLoop.ex1'), t('agentLoop.ex2'), t('agentLoop.ex3')]

  const push = useCallback((e: Entry) => setEntries((prev) => [...prev, e]), [])

  // Einen Zug ausführen. Liefert true, wenn die (Auto-)Schleife weiterlaufen soll.
  const stepOnce = useCallback(async (): Promise<boolean> => {
    setPhase('thinking')
    try {
      const res = await fetch('/api/agent-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contentsRef.current,
          tools: [...enabledRef.current],
          locale: localeRef.current,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `Fehler ${res.status}`)

      const thought = clean(data.thought || '')
      const calls: ToolCall[] = Array.isArray(data.calls) ? data.calls : []

      // Keine Aufrufe mehr → Endantwort.
      if (calls.length === 0) {
        push({ kind: 'final', text: thought || tRef.current('agentLoop.noOutput') })
        setPhase('done')
        return false
      }

      // Modell-Zug anzeigen + in den Verlauf übernehmen.
      push({ kind: 'model', thought, calls })
      const modelParts: Part[] = []
      if (thought) modelParts.push({ text: thought })
      for (const c of calls) modelParts.push({ functionCall: { name: c.name, args: c.args } })
      contentsRef.current.push({ role: 'model', parts: modelParts })

      // Jeden Aufruf clientseitig ausführen, Ergebnis zurückgeben.
      const responseParts: Part[] = []
      for (const c of calls) {
        const tool = getTool(c.name)
        const available = tool && enabledRef.current.has(c.name)
        const result: Record<string, unknown> = available
          ? tool!.run(c.args)
          : { fehler: tRef.current('agentLoop.toolUnavailable') }
        push({ kind: 'tool', name: c.name, args: c.args, result })
        responseParts.push({ functionResponse: { name: c.name, response: result } })
      }
      contentsRef.current.push({ role: 'user', parts: responseParts })

      const n = stepRef.current + 1
      stepRef.current = n
      setStepCount(n)
      if (n >= MAX_STEPS) {
        push({ kind: 'note', text: tRef.current('agentLoop.maxSteps') })
        setPhase('done')
        return false
      }

      // Im Schritt-Modus anhalten; im Auto-Modus weiterlaufen.
      if (modeRef.current === 'step') {
        setPhase('paused')
        return false
      }
      return true
    } catch (err) {
      push({ kind: 'error', text: err instanceof Error ? err.message : 'Fehler' })
      setPhase('error')
      return false
    }
  }, [push])

  // Eine Aufgabe (neu) starten.
  const start = useCallback(
    async (rawTask: string) => {
      const task = rawTask.trim()
      if (!task) return
      contentsRef.current = [{ role: 'user', parts: [{ text: task }] }]
      stepRef.current = 0
      setStepCount(0)
      setEntries([{ kind: 'task', text: task }])
      setRanWith([...enabledRef.current].sort().join(','))

      if (modeRef.current === 'auto') {
        // Auto: bis zur Endantwort durchlaufen.
        // eslint-disable-next-line no-await-in-loop
        while (await stepOnce()) {
          /* weiter */
        }
      } else {
        // Schritt-Modus: bereit für den ersten „Nächster Schritt".
        setPhase('paused')
      }
    },
    [stepOnce],
  )

  // Auto-Run der Standardaufgabe, sobald die echte Sprache feststeht (nach Mount).
  // Vor dem Mount liefert t() die Default-Sprache (Hydration-Schutz); ein Start
  // davor liefe in der falschen Sprache (die Aufgabensprache steuert die Begründung).
  useEffect(() => {
    if (!mounted || didInit.current) return
    didInit.current = true
    const first = t('agentLoop.ex1')
    setInput(first)
    start(first)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  const busy = phase === 'thinking'
  const toolsChanged = phase !== 'idle' && ranWith !== [...enabled].sort().join(',')

  const toggleTool = (name: string) => {
    if (busy) return
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Aufgabe */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !busy && start(input)}
            placeholder={t('agentLoop.placeholder')}
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={busy}
          />
          <Button onClick={() => start(input)} disabled={busy || !input.trim()} className="gap-2 sm:w-auto">
            <PaperPlaneIcon className="h-4 w-4" />
            {t('agentLoop.ask')}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <Button
              key={ex}
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal py-1 text-left text-xs"
              disabled={busy}
              onClick={() => {
                setInput(ex)
                start(ex)
              }}
            >
              {ex}
            </Button>
          ))}
        </div>
      </div>

      {/* Werkzeug-Regal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">{t('agentLoop.toolsTitle')}</h3>
          <span className="text-xs text-muted-foreground">{t('agentLoop.toolsHint')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AGENT_TOOLS.map((tool) => {
            const on = enabled.has(tool.name)
            return (
              <button
                key={tool.name}
                type="button"
                onClick={() => toggleTool(tool.name)}
                disabled={busy}
                aria-pressed={on}
                title={t(`agentLoop.tool.${tool.name}.blurb`)}
                className={[
                  'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left text-xs transition-colors disabled:opacity-50',
                  on
                    ? 'border-primary/40 bg-primary/5 text-foreground'
                    : 'border-dashed bg-muted/30 text-muted-foreground line-through',
                ].join(' ')}
              >
                <GearIcon className={`h-3.5 w-3.5 shrink-0 ${on ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium no-underline">{t(`agentLoop.tool.${tool.name}.label`)}</span>
              </button>
            )
          })}
        </div>
        {toolsChanged && <p className="text-xs text-muted-foreground">{t('agentLoop.toolsChanged')}</p>}
      </div>

      {/* Steuerung */}
      <div className="flex flex-wrap items-center gap-2 border-y py-3">
        <div className="inline-flex overflow-hidden rounded-md border text-xs">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode('auto')}
            className={`flex items-center gap-1 px-3 py-1.5 ${mode === 'auto' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
          >
            <PlayIcon className="h-3 w-3" /> {t('agentLoop.modeAuto')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setMode('step')}
            className={`flex items-center gap-1 border-l px-3 py-1.5 ${mode === 'step' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
          >
            <TrackNextIcon className="h-3 w-3" /> {t('agentLoop.modeStep')}
          </button>
        </div>

        {mode === 'step' && (
          <Button
            size="sm"
            onClick={() => stepOnce()}
            disabled={busy || phase === 'done' || phase === 'error' || phase === 'idle'}
            className="gap-1.5"
          >
            <TrackNextIcon className="h-3.5 w-3.5" /> {t('agentLoop.nextStep')}
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => start(input)} disabled={busy} className="gap-1.5">
          <ResetIcon className="h-3.5 w-3.5" /> {t('agentLoop.restart')}
        </Button>

        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {stepCount > 0 ? `${stepCount} ${stepCount === 1 ? t('agentLoop.runOne') : t('agentLoop.runMany')}` : ''}
        </span>
      </div>

      {/* Timeline der Schleife */}
      <div className="space-y-2.5">
        {entries.map((e, i) => (
          <TimelineRow key={i} entry={e} onRetry={() => start(input)} t={t} />
        ))}
        {busy && (
          <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
            <ReloadIcon className="h-4 w-4 animate-spin" />
            <span>{t('agentLoop.thinking')}</span>
          </div>
        )}
        {phase === 'paused' && stepCount === 0 && (
          <p className="pl-1 text-sm text-muted-foreground">{t('agentLoop.readyHint')}</p>
        )}
      </div>

      {/* Legende */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> {t('agentLoop.legendModel')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GearIcon className="h-3.5 w-3.5" /> {t('agentLoop.legendTool')}
        </span>
      </div>

      {/* Kontext-Peek */}
      <div className="rounded-lg border bg-muted/20">
        <button
          type="button"
          onClick={() => setShowContext((s) => !s)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-muted/40"
        >
          {showContext ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          {t('agentLoop.contextTitle')}
        </button>
        {showContext && (
          <div className="space-y-2 border-t px-3 py-3">
            <p className="text-xs text-muted-foreground">
              {t('agentLoop.ctxExplain1')}
              <span className="font-medium text-primary">{t('agentLoop.labelModel')}</span>
              {t('agentLoop.ctxExplain2')}
            </p>
            <ContextDump entries={entries} t={t} />
          </div>
        )}
      </div>
    </div>
  )
}

// --- Eine Zeile der Timeline ------------------------------------------------
function TimelineRow({ entry, onRetry, t }: { entry: Entry; onRetry: () => void; t: T }) {
  if (entry.kind === 'task') {
    return (
      <div className="rounded-lg border bg-background px-4 py-2.5">
        <div className="mb-0.5 text-xs font-medium text-muted-foreground">{t('agentLoop.labelTask')}</div>
        <p className="text-sm">{entry.text}</p>
      </div>
    )
  }

  if (entry.kind === 'model') {
    return (
      <div className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-2.5">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <ChatBubbleIcon className="h-3.5 w-3.5" /> {t('agentLoop.labelModel')}
        </div>
        {entry.thought && <p className="text-sm leading-relaxed">{entry.thought}</p>}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {entry.calls.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-xs"
            >
              <LightningBoltIcon className="h-3 w-3 text-muted-foreground" />
              {c.name}({formatArgs(c.args)})
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (entry.kind === 'tool') {
    const failed = 'fehler' in entry.result
    return (
      <div className="ml-4 flex items-start gap-2 rounded-lg border bg-background px-4 py-2.5">
        <GearIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-muted-foreground">
            {t('agentLoop.labelTool')} <span className="font-mono text-foreground">{entry.name}</span>
          </div>
          <p className={`mt-0.5 font-mono text-sm ${failed ? 'text-destructive' : 'text-foreground'}`}>
            → {formatResult(entry.result)}
          </p>
        </div>
      </div>
    )
  }

  if (entry.kind === 'final') {
    return (
      <div className="rounded-lg border border-[hsl(var(--chart-2)/0.4)] bg-[hsl(var(--chart-2)/0.1)] px-4 py-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--chart-2))]">
          <CheckCircledIcon className="h-4 w-4" /> {t('agentLoop.labelFinal')}
        </div>
        <p className="text-sm leading-relaxed">{entry.text}</p>
      </div>
    )
  }

  if (entry.kind === 'note') {
    return <p className="px-1 text-xs text-muted-foreground">{entry.text}</p>
  }

  // error
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <ExclamationTriangleIcon className="h-4 w-4" /> {entry.text}
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <ReloadIcon className="h-3 w-3" /> {t('agentLoop.retry')}
      </Button>
    </div>
  )
}

// --- Roher Kontext-Strom (Demystifikation) ----------------------------------
function ContextDump({ entries, t }: { entries: Entry[]; t: T }) {
  const lines: Array<{ who: 'model' | 'frame'; text: string }> = []
  for (const e of entries) {
    if (e.kind === 'task') lines.push({ who: 'frame', text: `${t('agentLoop.labelTask')}: ${e.text}` })
    else if (e.kind === 'model') {
      if (e.thought) lines.push({ who: 'model', text: `${t('agentLoop.labelModel')}: ${e.thought}` })
      for (const c of e.calls)
        lines.push({ who: 'model', text: `${t('agentLoop.labelModel')} ${t('agentLoop.calls')}: ${c.name}(${formatArgs(c.args)})` })
    } else if (e.kind === 'tool') {
      lines.push({ who: 'frame', text: `${t('agentLoop.labelTool')} ${e.name} → ${formatResult(e.result)}` })
    } else if (e.kind === 'final') {
      lines.push({ who: 'model', text: `${t('agentLoop.labelModel')}: ${e.text}` })
    }
  }
  return (
    <div className="max-h-72 overflow-y-auto rounded-md border bg-background p-3 font-mono text-xs leading-relaxed">
      {lines.map((l, i) => (
        <div key={i} className={l.who === 'model' ? 'text-primary' : 'text-muted-foreground'}>
          {l.text}
        </div>
      ))}
    </div>
  )
}
