'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, ShieldAlert, Check, ArrowRight } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/use-translations'

// ---------------------------------------------------------------------------
// Nachrichten-Check: „Was steckt in deiner Anfrage?" Der Eye-Opener.
// Ruft die echte sensible-Daten-Erkennung (Gemini/Vertex, /api/data-flow-simulate)
// und zeigt: eine harmlose Nachricht enthält schnell Schützenswertes — und das
// geht beim Cloud-Einsatz an den Anbieter. KEIN Magie-Wrapper: die anonymisierte
// Fassung ist „so entschärfst du es SELBST", nicht eine automatische Zwischenstufe.
// DE inline (→ Thread 9).
// ---------------------------------------------------------------------------

type SensitivePart = { text: string; category: string; reason: string }
type Analysis = { sensitiveParts: SensitivePart[]; anonymizedText: string; fallback?: boolean }

const EXAMPLES = [
  'Schreib eine Förderplanung für Lena Müller aus der 3b, die in Mathe eine 2.5 hat und sich zu Hause schwer konzentrieren kann.',
  'Formuliere eine Rückmeldung an die Eltern von Tim Berger (tim.berger@example.ch) zu seiner Lese-Rechtschreib-Schwäche.',
  'Erkläre den Wasserkreislauf einfach und anschaulich für eine 5. Klasse.',
]

// CATEGORY_LABELS built inside component via useTranslations()

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightedOriginal({ text, parts }: { text: string; parts: SensitivePart[] }) {
  const uniq = Array.from(new Set(parts.map((p) => p.text).filter(Boolean)))
  if (!uniq.length) return <>{text}</>
  const re = new RegExp('(' + uniq.map(escapeRegExp).join('|') + ')', 'g')
  return (
    <>
      {text.split(re).map((seg, i) =>
        uniq.includes(seg) ? (
          <mark key={i} className="rounded bg-destructive/15 px-0.5 text-destructive">
            {seg}
          </mark>
        ) : (
          <span key={i}>{seg}</span>
        )
      )}
    </>
  )
}

function HighlightedAnon({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((seg, i) =>
        /^\[[^\]]+\]$/.test(seg) ? (
          <mark
            key={i}
            className="rounded bg-[hsl(var(--chart-2)/0.18)] px-0.5 text-[hsl(var(--chart-2))]"
          >
            {seg}
          </mark>
        ) : (
          <span key={i}>{seg}</span>
        )
      )}
    </>
  )
}

export function MessageCheck() {
  const t = useTranslations()
  const CATEGORY_LABELS: Record<string, string> = {
    name: t('msgCheck.catName'),
    ort: t('msgCheck.catOrt'),
    datum: t('msgCheck.catDatum'),
    kontakt: t('msgCheck.catKontakt'),
    gesundheit: t('msgCheck.catGesundheit'),
    noten: t('msgCheck.catNoten'),
    persoenlich: t('msgCheck.catPersoenlich'),
    andere: t('msgCheck.catAndere'),
  }
  const [input, setInput] = useState(EXAMPLES[0])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAnon, setShowAnon] = useState(false)

  async function check() {
    if (!input.trim()) return
    setLoading(true)
    setShowAnon(false)
    try {
      const res = await fetch('/api/data-flow-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: input }),
      })
      const data = (await res.json()) as Analysis
      setAnalysis(data)
    } catch {
      setAnalysis({ sensitiveParts: [], anonymizedText: input, fallback: true })
    } finally {
      setLoading(false)
    }
  }

  const count = analysis?.sensitiveParts.length ?? 0
  const categories = analysis
    ? Array.from(new Set(analysis.sensitiveParts.map((p) => CATEGORY_LABELS[p.category] || p.category)))
    : []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setAnalysis(null)
          }}
          rows={3}
          maxLength={400}
          className="w-full resize-none rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={t('msgCheck.placeholder')}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('msgCheck.examplesLabel')}</span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(ex)
                setAnalysis(null)
              }}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button onClick={check} disabled={loading || !input.trim()}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('msgCheck.checking')}
            </>
          ) : (
            t('msgCheck.checkBtn')
          )}
        </Button>
      </div>

      {analysis?.fallback && (
        <p className="flex items-center gap-2 text-sm text-[hsl(var(--chart-3))]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t('msgCheck.fallback')}
        </p>
      )}

      {analysis && count > 0 && (
        <div className="space-y-3 rounded-xl border border-l-4 border-l-destructive bg-card p-4">
          <div className="flex items-center gap-2 text-base font-semibold text-destructive">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            {count} {count === 1 ? t('msgCheck.foundSingular') : t('msgCheck.foundPlural')}
          </div>
          <p className="text-sm leading-relaxed">
            <HighlightedOriginal text={input} parts={analysis.sensitiveParts} />
          </p>
          <p className="text-sm text-muted-foreground">
            {t('msgCheck.detected')} {categories.join(', ')}. {t('msgCheck.detectedSuffix')}
          </p>
          <div className="border-t pt-3">
            <button
              onClick={() => setShowAnon((s) => !s)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {showAnon ? t('msgCheck.hideAnon') : t('msgCheck.showAnon')}
            </button>
            {showAnon && (
              <div className="mt-2 space-y-1">
                <p className="rounded-lg bg-muted/50 p-2.5 text-sm leading-relaxed">
                  <HighlightedAnon text={analysis.anonymizedText} />
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('msgCheck.anonNote')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {analysis && count === 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-l-4 border-l-[hsl(var(--chart-2))] bg-card p-4">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--chart-2))]" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t('msgCheck.okTitle')}</span>{' '}
            {t('msgCheck.okNote')}
          </p>
        </div>
      )}
    </div>
  )
}
