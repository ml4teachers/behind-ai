'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from '@/components/ui/progress'
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronRightIcon, ShuffleIcon, ReloadIcon } from "@radix-ui/react-icons"

interface NextTokenPredictionProps {
  text: string
  useSimulation?: boolean
}

interface TokenProbability {
  token: string
  probability: number
}

export function NextTokenPrediction({ text, useSimulation = false }: NextTokenPredictionProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topTokens, setTopTokens] = useState<TokenProbability[]>([])
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [remainingProbability, setRemainingProbability] = useState(0)
  const [currentText, setCurrentText] = useState(text)
  const [predictionHistory, setPredictionHistory] = useState<string[]>([])
  const [apiNotice, setApiNotice] = useState<string | null>(null)

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
        setApiNotice("Simulationsmodus aktiv - keine echte API verwendet");
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
        throw new Error(`API-Anfrage fehlgeschlagen: ${response.status}`);
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
        setApiNotice("Keine Token-Wahrscheinlichkeiten vom Modell erhalten. Versuche es mit einem anderen Text.");
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

  // Zufälligen Token basierend auf Wahrscheinlichkeiten auswählen
  const selectRandomToken = () => {
    if (topTokens.length === 0) return
    
    // Zufallszahl zwischen 0 und 1 generieren
    const random = Math.random()
    let cumulativeProbability = 0
    
    // Durch die Tokens iterieren und basierend auf Wahrscheinlichkeit auswählen
    for (const tokenData of topTokens) {
      cumulativeProbability += tokenData.probability
      if (random <= cumulativeProbability) {
        selectToken(tokenData.token)
        return
      }
    }
    
    // Fallback: ersten Token nehmen, falls alle anderen nicht ausgewählt wurden
    selectToken(topTokens[0].token)
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

  return (
    <div className="w-full h-full flex flex-col">
      {/* Der aktuelle Text und Generierungs-Historie */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="font-medium mb-1 text-sm text-gray-600">Aktueller Text:</div>
        <p className="font-medium">
          {text}
          {predictionHistory.map((token, i) => (
            <span key={i} className="text-green-600 font-bold">{token}</span>
          ))}
        </p>
        
        {predictionHistory.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex gap-2 items-center flex-wrap">
            <span className="text-xs text-gray-500">Token-Kette:</span>
            {predictionHistory.map((token, i) => (
              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                {token.replace(/ /g, '␣')}
              </span>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="ml-auto text-xs h-7"
              onClick={resetToOriginal}
            >
              Zurücksetzen
            </Button>
          </div>
        )}
      </div>
      
      {/* Loading-Zustand */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <p>Berechne Wahrscheinlichkeiten für den nächsten Token...</p>
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
          <div className="text-red-500 text-center p-6 bg-red-50 rounded-lg">
            <p className="font-bold mb-2">Fehler bei der Token-Vorhersage:</p>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => fetchNextTokenPrediction(currentText)}
            >
              <ReloadIcon className="mr-2 h-4 w-4" />
              Erneut versuchen
            </Button>
          </div>
        </div>
      )}
      
      {/* Erfolgsfall - Wahrscheinlichkeiten und Auswahlmöglichkeiten */}
      {!loading && !error && topTokens.length > 0 && (
        <div className="flex-1 flex flex-col">
          {/* API-Hinweis, falls vorhanden */}
          {apiNotice && (
            <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              <strong>Hinweis:</strong> {apiNotice}
            </div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="font-medium">Top Wahrscheinlichkeiten für den nächsten Token</h3>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={selectRandomToken}
                disabled={!!selectedToken}
                className="flex items-center gap-1"
              >
                <ShuffleIcon className="w-3 h-3" />
                <span>Zufälliger Token</span>
              </Button>
            </div>
            
            <div className="space-y-2 mb-6">
              {topTokens.map((token, index) => (
                <motion.div
                  key={`${token.token}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-2 ${
                    selectedToken === token.token ? 'bg-green-50 rounded-lg p-2 ring-1 ring-green-200' : ''
                  }`}
                >
                  <div className="w-16 text-right font-mono text-sm">
                    {(token.probability * 100).toFixed(1)}%
                  </div>
                  
                  <Progress 
                    value={token.probability * 100} 
                    className={`h-6 ${
                      selectedToken === token.token ? 'bg-green-100' : ''
                    }`}
                  />
                  
                  <div className="font-semibold min-w-20 px-2">
                    &quot;{token.token.replace(/ /g, '␣')}&quot;
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectToken(token.token)}
                    disabled={!!selectedToken}
                    className="ml-auto"
                  >
                    Wählen
                  </Button>
                </motion.div>
              ))}
              
              {/* Visualisierung der "Long Tail" - alle anderen möglichen Tokens */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: topTokens.length * 0.1 }}
                className="flex items-center gap-2 opacity-70"
              >
                <div className="w-16 text-right font-mono text-sm text-gray-500">
                  {(remainingProbability * 100).toFixed(1)}%
                </div>
                
                <Progress 
                  value={remainingProbability * 100} 
                  className="h-6 bg-gray-100"
                />
                
                <div className="font-medium text-gray-600 px-2">
                  Tausende weitere mögliche Tokens...
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Ausgewählter Token */}
          <AnimatePresence>
            {selectedToken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4 text-center"
              >
                <p className="mb-2">Ausgewählter nächster Token:</p>
                <div className="text-xl font-bold bg-green-100 px-4 py-2 rounded-lg inline-block">
                  {selectedToken.replace(/ /g, '␣')}
                </div>
                <div className="mt-4 text-sm text-gray-600 flex items-center justify-center gap-2">
                  <span>Füge Token zum Text hinzu</span>
                  <ChevronRightIcon className="animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Fallback, wenn keine Tokens geladen wurden */}
      {!loading && !error && topTokens.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md">
            <p className="mb-4 text-gray-700">
              {apiNotice || "Keine Token-Vorhersagen vom Modell erhalten."}
            </p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => fetchNextTokenPrediction(currentText)}
                className="flex items-center gap-1"
              >
                <ReloadIcon className="w-3 h-3" />
                Erneut versuchen
              </Button>
              {!useSimulation && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const simulated = getSimulatedPredictions(currentText);
                    setTopTokens(simulated.topTokens);
                    setRemainingProbability(simulated.remainingProbability);
                    setApiNotice("Verwende simulierte Daten statt API-Ergebnissen");
                  }}
                >
                  Simulation verwenden
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}