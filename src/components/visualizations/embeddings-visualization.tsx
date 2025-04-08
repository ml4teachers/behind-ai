'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { InfoCircledIcon } from '@radix-ui/react-icons'

interface Term {
  term: string
  similarity: number
}

interface RogetEmbeddings {
  terms: string[]
  embeddings: number[][]
}

interface WordEmbeddingResult {
  word: string
  similarTerms: Term[]
  embedding: number[] | null
}

export function EmbeddingsVisualization() {
  const [inputText, setInputText] = useState('')
  const [wordResults, setWordResults] = useState<WordEmbeddingResult[]>([])
  const [rogetData, setRogetData] = useState<RogetEmbeddings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [comparisonWord, setComparisonWord] = useState('')
  const [comparisonEmbedding, setComparisonEmbedding] = useState<number[] | null>(null)
  const [isComparisonLoading, setIsComparisonLoading] = useState(false)

  // 1) Embeddings-Daten aus JSON laden
  useEffect(() => {
    const loadEmbeddings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/embeddings/terms')
        if (!response.ok) {
          throw new Error(`Failed to load embeddings: ${response.statusText}`)
        }
        const data = await response.json()

        // Grundlegende Validierungen
        if (!data.terms || !Array.isArray(data.terms) || data.terms.length === 0) {
          throw new Error('Invalid response: terms array is missing or empty')
        }
        if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
          throw new Error('Invalid response: embeddings array is missing or empty')
        }
        if (data.terms.length !== data.embeddings.length) {
          throw new Error(`Mismatch: terms (${data.terms.length}) vs. embeddings (${data.embeddings.length})`)
        }

        setRogetData(data)
      } catch (err) {
        console.error('Error loading embeddings:', err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setIsLoading(false)
      }
    }
    loadEmbeddings()
  }, [])

  // 2) Kosinus-Ähnlichkeit
  const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimensions')
    }
    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      mag1 += vec1[i] * vec1[i]
      mag2 += vec2[i] * vec2[i]
    }
    mag1 = Math.sqrt(mag1)
    mag2 = Math.sqrt(mag2)
    if (mag1 === 0 || mag2 === 0) return 0
    return dotProduct / (mag1 * mag2)
  }

  // 3) Ein einzelnes Wort embedden (via API)
  const getEmbedding = async (text: string): Promise<number[] | null> => {
    if (!text || text.trim().length === 0) {
        return null;
    }
    try {
        const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim().toLowerCase() })
        })
        if (!response.ok) {
        let errorMsg = `Failed to generate embedding for "${text}"`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
            errorMsg += `: ${errorData.error}`;
            } else {
             errorMsg += ` (Status: ${response.status})`
            }
        } catch (parseError) {
             errorMsg += ` (Status: ${response.status}, unparsable error response)`
        }
        console.error(errorMsg);
        return null;
        }
        const data = await response.json()
        if (!data.embedding || !Array.isArray(data.embedding)) {
            console.error(`Invalid embedding format received for "${text}"`);
            return null;
        }
        return data.embedding

    } catch (fetchError) {
        console.error(`Network or other error fetching embedding for "${text}":`, fetchError);
        return null;
    }
  }

  // 4) Bestimme 12 Begriffe (4 ähnlich, 4 unähnlich, 4 zufällig aus der Mitte)
  const findSimilarTerms = (inputEmbedding: number[]) => {
    if (!rogetData) return []
    const { terms, embeddings } = rogetData

    // Ähnlichkeit berechnen
    const similarities: Term[] = terms.map((term, index) => ({
      term,
      similarity: cosineSimilarity(inputEmbedding, embeddings[index])
    }))

    // Sortieren
    similarities.sort((a, b) => b.similarity - a.similarity)

    // Top 4, Bottom 4, 4 zufällige aus der Mitte
    const mostSimilar = similarities.slice(0, 4)
    const leastSimilar = similarities.slice(-4)
    const middleStart = Math.floor(similarities.length / 4)
    const middleEnd = Math.floor((similarities.length * 3) / 4)
    const middleRange = similarities.slice(middleStart, middleEnd)

    const randomMiddle: Term[] = []
    for (let i = 0; i < 4; i++) {
      if (middleRange.length === 0) break
      const randomIndex = Math.floor(Math.random() * middleRange.length)
      randomMiddle.push(middleRange[randomIndex])
      middleRange.splice(randomIndex, 1)
    }

    // Zusammenführen & mischen
    const combined = [...mostSimilar, ...leastSimilar, ...randomMiddle]
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[combined[i], combined[j]] = [combined[j], combined[i]]
    }
    return combined
  }

  // 5) Validierung
  const validateInput = (text: string): boolean => {
    const words = text.trim().split(/\s+/)
    if (words.length > 10) {
      setInputError('Bitte gib maximal 10 Wörter ein.')
      return false
    }
    setInputError(null)
    return true
  }

  // 6) Form abschicken
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = inputText.trim()
    const trimmedComparison = comparisonWord.trim()

    if (!trimmedInput) return
    if (!validateInput(trimmedInput)) return

    setIsLoading(true)
    setError(null)
    setWordResults([])
    setComparisonEmbedding(null)
    setIsComparisonLoading(trimmedComparison.length > 0)

    let tempComparisonEmbedding: number[] | null = null

    try {
       if (trimmedComparison) {
         tempComparisonEmbedding = await getEmbedding(trimmedComparison)
         if (tempComparisonEmbedding === null) {
            setError(`Konnte kein Embedding für das Vergleichswort "${trimmedComparison}" finden. Versuche ein anderes Wort.`)
         }
         setComparisonEmbedding(tempComparisonEmbedding)
         setIsComparisonLoading(false)
       } else {
         setIsComparisonLoading(false)
       }

      const words = trimmedInput.split(/\s+/).filter(w => w.length > 0)
      const partialResults: WordEmbeddingResult[] = []

      for (const word of words) {
        const wordLower = word.toLowerCase()
        const embedding = await getEmbedding(wordLower)

        if (embedding === null) {
            console.warn(`Skipping word "${word}" as no embedding could be generated.`)
            partialResults.push({ word: `${word} (Fehler)`, similarTerms: [], embedding: null })
            setWordResults([...partialResults])
            continue
        }

        const similarTerms = findSimilarTerms(embedding)
        partialResults.push({ word, similarTerms, embedding })

        setWordResults([...partialResults])
      }
    } catch (err) {
      console.error('Error in embedding comparison:', err)
      setError(`Fehler bei der Berechnung der Embeddings: ${err instanceof Error ? err.message : String(err)}`)
      setComparisonEmbedding(null)
      setIsComparisonLoading(false)
    } finally {
      setIsLoading(false)
       if (trimmedComparison && !tempComparisonEmbedding) {
          setIsComparisonLoading(false)
      }
    }
  }

  // 7) Anzeige & Layout
  const formatSimilarity = (value: number) => value.toFixed(3)

  const getSimilarityColor = (value: number) => {
    if (value < 0.2) return 'bg-blue-400'
    if (value < 0.4) return 'bg-green-400'
    if (value < 0.6) return 'bg-yellow-400'
    if (value < 0.8) return 'bg-orange-400'
    return 'bg-red-400'
  }

  const getComparisonSimilarity = (wordEmbedding: number[] | null): string => {
    if (!comparisonEmbedding || !wordEmbedding) return 'N/A'
    if (isComparisonLoading) return 'Lade...'

    try {
    const sim = cosineSimilarity(wordEmbedding, comparisonEmbedding)
    return formatSimilarity(sim)
    } catch (e) {
    console.error("Error calculating comparison similarity:", e)
    return 'Fehler'
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              validateInput(e.target.value)
            }}
            placeholder="Gib einen Satz mit max. 10 Wörtern ein..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading || isComparisonLoading}>
            {isLoading ? 'Berechne Satz...' : (isComparisonLoading ? 'Lade Vergleich...' : 'Berechnen')}
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <Input
            type="text"
            value={comparisonWord}
            onChange={(e) => setComparisonWord(e.target.value)}
            placeholder="Optional: Vergleichswort eingeben (z.B. Tier)"
            className="flex-grow"
            />
        </div>
        {inputError && <p className="text-red-500 text-sm">{inputError}</p>}
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* Intro-Box */}
      {wordResults.length === 0 && !isLoading && !error && (
        <div className="p-6 text-center text-gray-500 border border-dashed rounded-md">
          <p>Gib einen Satz (max. 10 Wörter) ein, um dessen Embedding zu berechnen.</p>
          <p className="text-sm mt-2">Für jedes Wort werden 12 Ähnlichkeitswerte angezeigt.</p>
        </div>
      )}

      {/* Ladeskelett wenn isLoading aber noch nicht alle Wörter fertig */}
      {isLoading && wordResults.length === 0 && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <Skeleton key={j} className="h-8" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info-Box */}
      {wordResults.length > 0 && (
        <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 flex gap-3 items-start">
          <InfoCircledIcon className="h-5 w-5 text-violet-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-violet-800 mb-1">Embeddings visualisiert</h4>
            <p className="text-sm text-violet-700">
              Jedes Wort wird in einen Vektor (eine Liste von Zahlen) umgewandelt, der seine Bedeutung in einem hochdimensionalen Raum repräsentiert.
              Wörter mit ähnlicher Bedeutung haben Vektoren, die in diesem Raum nahe beieinander liegen.
              Die 12 bunten Kästchen zeigen die Cosinus-Ähnlichkeit (ein Maß zwischen -1 und 1, hier meist 0 bis 1) zu verschiedenen vordefinierten Wörtern an (höher = ähnlicher).
              Wenn du ein Vergleichswort eingegeben hast, fahre mit der Maus über ein Kästchen, um die Ähnlichkeit des Satzwortes zu deinem Vergleichswort zu sehen.
            </p>
          </div>
        </div>
      )}

      {/* Ergebnisse */}
      <div className="space-y-8">
        {wordResults.map(({ word, similarTerms, embedding: wordEmbedding }, index) => (
          <div key={`${word}-${index}`}>
            <h3 className="text-lg font-semibold mb-2 break-all">{word}</h3>
            {wordEmbedding === null && <p className="text-sm text-orange-600">(Konnte kein Embedding für dieses Wort laden)</p>}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {similarTerms.map((term, termIndex) => (
                <TooltipProvider key={termIndex} delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`p-2 rounded text-white text-center text-xs font-mono truncate ${getSimilarityColor(term.similarity)}`}
                      >
                        {formatSimilarity(term.similarity)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ähnlichkeit zu "{term.term}": {formatSimilarity(term.similarity)}</p>
                      {comparisonWord && wordEmbedding && (
                         <p className="mt-1 pt-1 border-t border-gray-300">
                           Ähnlichkeit zu "{comparisonWord}": {getComparisonSimilarity(wordEmbedding)}
                         </p>
                      )}
                       {comparisonWord && !wordEmbedding && (
                         <p className="mt-1 pt-1 border-t border-gray-300 text-orange-500">Vergleich nicht möglich (Wort-Embedding fehlt)</p>
                       )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              {Array.from({ length: Math.max(0, 12 - similarTerms.length) }).map((_, i) => (
                 <div key={`placeholder-${i}`} className="p-2 rounded bg-gray-200 h-8"></div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}