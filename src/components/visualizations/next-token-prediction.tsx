'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Slider } from '@/components/ui/slider'
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRightIcon, ShuffleIcon, ReloadIcon } from "@radix-ui/react-icons"
import { useTranslations } from '@/lib/i18n/use-translations'

interface NextTokenPredictionProps {
  text: string
  useSimulation?: boolean
}

interface TokenProbability {
  token: string
  probability: number
}

// Temperatur auf eine gegebene Verteilung anwenden (rein clientseitig).
// Mathematisch entspricht das Logits/T -> Softmax; mit Wahrscheinlichkeiten p
// ist das p^(1/T), neu normiert. Die "Rest"-Tokens (Long Tail) behandeln wir
// als EINEN Bucket, damit auch der Long-Tail-Balken auf die Temperatur reagiert.
function applyTemperature(
  tokens: TokenProbability[],
  remaining: number,
  temperature: number,
): { tokens: TokenProbability[]; remaining: number } {
  if (tokens.length === 0) return { tokens, remaining }

  // T = 1: exakt das, was das Modell liefert.
  if (Math.abs(temperature - 1) < 1e-3) {
    return { tokens, remaining }
  }

  // T -> 0: greedy. Der grösste Bucket bekommt die gesamte Masse.
  // (topTokens kommen absteigend sortiert, tokens[0] ist also der grösste.)
  if (temperature <= 1e-3) {
    const restIsLargest = remaining > tokens[0].probability
    return {
      tokens: tokens.map((tk, i) => ({
        ...tk,
        probability: !restIsLargest && i === 0 ? 1 : 0,
      })),
      remaining: restIsLargest ? 1 : 0,
    }
  }

  const invT = 1 / temperature
  const weighted = tokens.map((tk) => Math.pow(tk.probability, invT))
  const weightedRest = Math.pow(Math.max(remaining, 0), invT)
  const z = weighted.reduce((a, b) => a + b, 0) + weightedRest
  if (z === 0) return { tokens, remaining }
  return {
    tokens: tokens.map((tk, i) => ({ ...tk, probability: weighted[i] / z })),
    remaining: weightedRest / z,
  }
}

export function NextTokenPrediction({ text, useSimulation = false }: NextTokenPredictionProps) {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topTokens, setTopTokens] = useState<TokenProbability[]>([])
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [remainingProbability, setRemainingProbability] = useState(0)
  const [currentText, setCurrentText] = useState(text)
  const [predictionHistory, setPredictionHistory] = useState<string[]>([])
  const [apiNotice, setApiNotice] = useState<string | null>(null)
  const [temperature, setTemperature] = useState(1)

  // Temperatur-angepasste Verteilung für Anzeige & Sampling.
  const { tokens: displayTokens, remaining: displayRemaining } = useMemo(
    () => applyTemperature(topTokens, remainingProbability, temperature),
    [topTokens, remainingProbability, temperature],
  )

  const fetchNextTokenPrediction = async (inputText: string) => {
    setLoading(true)
    setError(null)
    setSelectedToken(null)

    try {
      // Direkt simulierte Daten liefern, wenn Simulationsmodus aktiv ist
      if (useSimulation) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Verzögerung für besseres UX

        // Simulierte Daten basierend auf Eingabetext generieren
        const simulatedResponse = getSimulatedPredictions(inputText);

        setTopTokens(simulatedResponse.topTokens);
        setRemainingProbability(simulatedResponse.remainingProbability);
        setApiNotice(t('nextTokenPred.simMode'));
        setLoading(false);
        return;
      }

      const response = await fetch('/api/predict-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      })


      if (!response.ok) {
        throw new Error(`${t('nextTokenPred.apiFailed')} ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // API-Hinweis setzen, falls vorhanden
      if (data.apiNotice) {
        setApiNotice(data.apiNotice);
      } else {
        setApiNotice(null);
      }

      setTopTokens(data.topTokens || []);

      setRemainingProbability(data.remainingProbability || 0);

      // Wenn keine Tokens zurückgegeben wurden, aber auch kein Fehler vorliegt,
      // zeigen wir eine entsprechende Nachricht an
      if (!data.topTokens || data.topTokens.length === 0) {
        setApiNotice(t('nextTokenPred.noProbs'));
      }
    } catch (err) {
      console.error("Fehler in fetchNextTokenPrediction:", err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  // Funktion für simulierte Daten
  const getSimulatedPredictions = (text: string) => {
    const lowercaseText = text.toLowerCase();

    let topTokens;
    if (lowercaseText.includes('sonne scheint')) {
      topTokens = [
        { token: ' hell', probability: 0.32 },
        { token: ' heute', probability: 0.24 },
        { token: ' am', probability: 0.14 },
        { token: ' durch', probability: 0.08 },
        { token: ' und', probability: 0.06 },
        { token: ' auf', probability: 0.05 },
      ];
    } else if (lowercaseText.includes('künstliche intelligenz')) {
      topTokens = [
        { token: ' ist', probability: 0.28 },
        { token: ' kann', probability: 0.22 },
        { token: ' hat', probability: 0.12 },
        { token: ' wird', probability: 0.09 },
        { token: ' und', probability: 0.07 },
        { token: ' revolutioniert', probability: 0.04 },
      ];
    } else if (lowercaseText.includes('schüler lernen')) {
      topTokens = [
        { token: ' mit', probability: 0.26 },
        { token: ' in', probability: 0.18 },
        { token: ' durch', probability: 0.14 },
        { token: ' besser', probability: 0.11 },
        { token: ' schneller', probability: 0.08 },
        { token: ' gemeinsam', probability: 0.05 },
      ];
    } else {
      // Fallback für andere Texte
      topTokens = [
        { token: ' und', probability: 0.18 },
        { token: ' ist', probability: 0.15 },
        { token: ' in', probability: 0.12 },
        { token: ' der', probability: 0.09 },
        { token: ' mit', probability: 0.07 },
        { token: ' die', probability: 0.06 },
      ];
    }

    // Summe der Wahrscheinlichkeiten berechnen
    const sum = topTokens.reduce((acc, token) => acc + token.probability, 0);
    const remainingProbability = Math.max(0, 1 - sum);

    return {
      topTokens,
      remainingProbability,
    };
  }

  // Initial und bei Text-Änderungen Vorhersage laden
  useEffect(() => {
    setCurrentText(text)
    setPredictionHistory([])
    fetchNextTokenPrediction(text)
  }, [text, useSimulation]);

  // Zufälligen Token basierend auf der (temperatur-angepassten) Verteilung
  // auswählen. Gesampelt wird über die sichtbaren Top-Tokens.
  const selectRandomToken = () => {
    if (displayTokens.length === 0) return

    const total = displayTokens.reduce((acc, t) => acc + t.probability, 0)
    if (total <= 0) {
      selectToken(displayTokens[0].token)
      return
    }

    const random = Math.random() * total
    let cumulativeProbability = 0
    for (const tokenData of displayTokens) {
      cumulativeProbability += tokenData.probability
      if (random <= cumulativeProbability) {
        selectToken(tokenData.token)
        return
      }
    }

    // Fallback: letztes Token, falls Rundung alle Schwellen knapp verfehlt.
    selectToken(displayTokens[displayTokens.length - 1].token)
  }

  // Token auswählen und zum Text hinzufügen
  const selectToken = (token: string) => {
    setSelectedToken(token)

    // Kurz warten, damit Animation sichtbar ist
    setTimeout(() => {
      const newText = currentText + token
      setCurrentText(newText)
      setPredictionHistory([...predictionHistory, token])

      // Neue Vorhersage für den ergänzten Text
      fetchNextTokenPrediction(newText)
    }, 800)
  }

  // Zurücksetzen auf original Text
  const resetToOriginal = () => {
    setCurrentText(text)
    setPredictionHistory([])
    fetchNextTokenPrediction(text)
  }

  const temperatureHint =
    temperature <= 0.3
      ? t('nextTokenPred.tempLow')
      : temperature >= 1.4
        ? t('nextTokenPred.tempHigh')
        : t('nextTokenPred.tempMid')

  return (
    <div className="w-full h-full flex flex-col">
      {/* Der aktuelle Text und Generierungs-Historie */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
        <div className="font-medium mb-1 text-sm text-muted-foreground">{t('nextTokenPred.currentText')}</div>
        <p className="font-medium">
          {text}
          {predictionHistory.map((token, i) => (
            <span key={i} className="font-bold text-[hsl(var(--chart-2))]">{token}</span>
          ))}
        </p>

        {predictionHistory.length > 0 && (
          <div className="mt-2 pt-2 border-t flex gap-2 items-center flex-wrap">
            <span className="text-xs text-muted-foreground">{t('nextTokenPred.tokenChain')}</span>
            {predictionHistory.map((token, i) => (
              <span key={i} className="px-2 py-0.5 bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))] text-xs rounded">
                {token.replace(/ /g, '␣')}
              </span>
            ))}

            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs h-7"
              onClick={resetToOriginal}
            >
              {t('nextTokenPred.reset')}
            </Button>
          </div>
        )}
      </div>

      {/* Loading-Zustand */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p>{t('nextTokenPred.computing')}</p>
          <div className="w-full max-w-md space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </div>
      )}

      {/* Fehlerzustand */}
      {!loading && error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-destructive text-center p-6 bg-destructive/10 rounded-lg">
            <p className="font-bold mb-2">{t('nextTokenPred.errorTitle')}</p>
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => fetchNextTokenPrediction(currentText)}
            >
              <ReloadIcon className="mr-2 h-4 w-4" />
              {t('nextTokenPred.retry')}
            </Button>
          </div>
        </div>
      )}

      {/* Erfolgsfall - Wahrscheinlichkeiten und Auswahlmöglichkeiten */}
      {!loading && !error && displayTokens.length > 0 && (
        <div className="flex-1 flex flex-col">
          {/* API-Hinweis, falls vorhanden */}
          {apiNotice && (
            <div className="mb-4 p-2 bg-[hsl(var(--chart-3)/0.12)] border border-[hsl(var(--chart-3)/0.45)] rounded text-sm text-foreground">
              <strong>{t('nextTokenPred.hint')}</strong> {apiNotice}
            </div>
          )}

          {/* Temperatur-Regler: formt die Verteilung live um */}
          <div className="mb-4 rounded-lg border bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">{t('nextTokenPred.temperature')}</label>
              <span className="font-mono text-sm tabular-nums">{temperature.toFixed(1)}</span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0}
              max={2}
              step={0.1}
              aria-label="Temperatur"
            />
            <p className="mt-2 text-xs text-muted-foreground">{temperatureHint}</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="font-medium">{t('nextTokenPred.topProbs')}</h3>

              <Button
                variant="secondary"
                size="sm"
                onClick={selectRandomToken}
                disabled={!!selectedToken}
                className="flex items-center gap-1"
              >
                <ShuffleIcon className="w-3 h-3" />
                <span>{t('nextTokenPred.randomToken')}</span>
              </Button>
            </div>

            <div className="space-y-1.5 mb-2">
              {displayTokens.map((token, index) => {
                const pct = token.probability * 100
                const isSelected = selectedToken === token.token
                return (
                  <motion.button
                    key={`${token.token}-${index}`}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => selectToken(token.token)}
                    disabled={!!selectedToken}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-[hsl(var(--chart-2)/0.12)] ring-1 ring-[hsl(var(--chart-2)/0.4)]'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="w-32 shrink-0 truncate font-mono text-sm font-semibold">
                      {token.token.replace(/ /g, '␣')}
                    </span>
                    <span className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                      <span
                        className="absolute inset-y-0 left-0 rounded bg-primary transition-[width] duration-300"
                        style={{ width: `${Math.max(pct, 1.5)}%` }}
                      />
                    </span>
                    <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                      {pct.toFixed(1)}%
                    </span>
                  </motion.button>
                )
              })}

              {/* Long Tail – alle übrigen Tokens als ein Balken */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayTokens.length * 0.05 }}
                className="flex items-center gap-3 px-2 py-1.5 opacity-70"
              >
                <span className="w-32 shrink-0 truncate font-mono text-sm text-muted-foreground">
                  …
                </span>
                <span className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                  <span
                    className="absolute inset-y-0 left-0 rounded bg-muted-foreground/40"
                    style={{ width: `${Math.max(displayRemaining * 100, 1.5)}%` }}
                  />
                </span>
                <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {(displayRemaining * 100).toFixed(1)}%
                </span>
              </motion.div>
            </div>

            <p className="mb-6 px-2 text-xs text-muted-foreground">
              {t('nextTokenPred.longTailNote')}
            </p>
          </div>

          {/* Ausgewählter Token */}
          <AnimatePresence>
            {selectedToken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 text-center"
              >
                <p className="mb-2">{t('nextTokenPred.selectedToken')}</p>
                <div className="text-xl font-bold bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))] px-4 py-2 rounded-lg inline-block">
                  {selectedToken.replace(/ /g, '␣')}
                </div>
                <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <span>{t('nextTokenPred.addToText')}</span>
                  <ChevronRightIcon className="animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Fallback, wenn keine Tokens geladen wurden */}
      {!loading && !error && displayTokens.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 bg-muted rounded-lg max-w-md">
            <p className="mb-4 text-foreground">
              {apiNotice || t('nextTokenPred.noTokens')}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => fetchNextTokenPrediction(currentText)}
                className="flex items-center gap-1"
              >
                <ReloadIcon className="w-3 h-3" />
                {t('nextTokenPred.retry')}
              </Button>
              {!useSimulation && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const simulated = getSimulatedPredictions(currentText);
                    setTopTokens(simulated.topTokens);
                    setRemainingProbability(simulated.remainingProbability);
                    setApiNotice(t('nextTokenPred.usingSim'));
                  }}
                >
                  {t('nextTokenPred.useSimulation')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
