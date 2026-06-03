'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslations } from '@/lib/i18n/use-translations'
import { Loader2 } from 'lucide-react'

interface TokenProbability {
  token: string
  probability: number
}

/** Leerraum als sichtbares Symbol darstellen (Tokens tragen oft ein führendes " "). */
const visible = (token: string) => token.replace(/ /g, '␣')

/**
 * Kompakte, eigenständige Next-Token-Demo für die Startseite.
 *
 * Bewusst leichter als die volle `NextTokenPrediction`-Visualisierung: nur
 * semantische Theme-Tokens (dark-mode-korrekt), keine Animationen. Ruft die
 * echte `/api/predict-next`-Route; bei Nichterreichbarkeit liefert die Route
 * Beispiel-Daten (apiNotice) – die Demo bleibt also immer spielbar.
 */
export function NextTokenMini() {
  const t = useTranslations()

  const [base, setBase] = useState(t('home.demo.seed'))
  const [appended, setAppended] = useState<string[]>([])
  const [tokens, setTokens] = useState<TokenProbability[]>([])
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  const predict = async (fullText: string) => {
    if (!fullText.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/predict-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText }),
      })
      const data = await res.json()
      setTokens(Array.isArray(data.topTokens) ? data.topTokens : [])
      setRemaining(typeof data.remainingProbability === 'number' ? data.remainingProbability : 0)
      setIsFallback(Boolean(data.apiNotice))
      setHasResult(true)
    } catch {
      setTokens([])
      setRemaining(0)
      setIsFallback(true)
      setHasResult(true)
    } finally {
      setLoading(false)
    }
  }

  // Erste Vorhersage: Kette zurücksetzen, dann für den Basistext rechnen.
  const handlePredict = () => {
    setAppended([])
    predict(base)
  }

  // Token anhängen und für den verlängerten Text neu vorhersagen.
  const handleAppend = (token: string) => {
    const next = [...appended, token]
    setAppended(next)
    predict(base + next.join(''))
  }

  const handleReset = () => {
    setAppended([])
    setTokens([])
    setHasResult(false)
    setIsFallback(false)
  }

  // Beim Tippen die laufende Kette/Ergebnisse verwerfen.
  const handleBaseChange = (value: string) => {
    setBase(value)
    if (hasResult || appended.length > 0) {
      setAppended([])
      setHasResult(false)
      setTokens([])
      setIsFallback(false)
    }
  }

  const useExample = (text: string) => {
    setBase(text)
    setAppended([])
    predict(text)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      {/* Eingabe */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={base}
          onChange={(e) => handleBaseChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
          placeholder={t('home.demo.placeholder')}
          aria-label={t('home.demo.placeholder')}
          className="flex-1"
        />
        <Button onClick={handlePredict} disabled={loading || !base.trim()}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {loading ? t('home.demo.loading') : t('home.demo.predict')}
        </Button>
      </div>

      {/* Beispiel-Chips */}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => useExample(t('home.demo.example1'))}>
          {t('home.demo.example1')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => useExample(t('home.demo.example2'))}>
          {t('home.demo.example2')}
        </Button>
      </div>

      {/* Ergebnis */}
      {hasResult && (
        <div className="mt-4">
          {/* Aktueller Text inkl. angehängter Tokens */}
          <div className="mb-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('home.demo.currentText')}
            </div>
            <p className="leading-relaxed">
              <span className="text-foreground">{base}</span>
              {appended.map((token, i) => (
                <span key={i} className="font-semibold text-primary">
                  {token}
                </span>
              ))}
            </p>
          </div>

          {isFallback && (
            <p className="mb-3 text-xs text-muted-foreground">{t('home.demo.fallbackNotice')}</p>
          )}

          {/* Token-Balken — klickbar zum Anhängen */}
          <div className="space-y-1.5">
            {tokens.map((tok, i) => {
              const pct = Math.round(tok.probability * 100)
              return (
                <button
                  key={`${tok.token}-${i}`}
                  type="button"
                  onClick={() => handleAppend(tok.token)}
                  disabled={loading}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="w-20 shrink-0 truncate font-mono text-sm font-medium">
                    {visible(tok.token)}
                  </span>
                  <span className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                    <span
                      className="absolute inset-y-0 left-0 rounded bg-primary transition-[width] duration-300"
                      style={{ width: `${Math.max(tok.probability * 100, 1.5)}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {pct}%
                  </span>
                </button>
              )
            })}

            {/* Long-Tail: alle übrigen Tokens */}
            {remaining > 0.0001 && (
              <div className="flex items-center gap-3 px-2 py-1.5 opacity-70">
                <span className="w-20 shrink-0 truncate font-mono text-xs text-muted-foreground">
                  …
                </span>
                <span className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                  <span
                    className="absolute inset-y-0 left-0 rounded bg-muted-foreground/40"
                    style={{ width: `${Math.max(remaining * 100, 1.5)}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {Math.round(remaining * 100)}%
                </span>
              </div>
            )}
          </div>

          {appended.length > 0 && (
            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                {t('home.demo.reset')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
