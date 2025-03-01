'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from "@/components/ui/skeleton"

interface TokenizationAnimationProps {
  text: string
}

interface TokenData {
  id: number
  token: string
}

export function TokenizationAnimation({ text }: TokenizationAnimationProps) {
  const [stage, setStage] = useState<'loading' | 'tokenizing' | 'to-ids' | 'from-ids' | 'complete'>('loading')
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [highlightedToken, setHighlightedToken] = useState<number | null>(null)

  useEffect(() => {
    const fetchTokenization = async () => {
      setStage('loading')
      setError(null)
      
      try {
        const response = await fetch('/api/tokenize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        })
        
        if (!response.ok) {
          throw new Error('API-Anfrage fehlgeschlagen')
        }
        
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        
        setTokens(data.tokens)
        
        // Animation-Sequenz starten
        await animateSequence()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
        setStage('complete')
      }
    }
    
    const animateSequence = async () => {
      // Step 1: Tokenizing
      setStage('tokenizing')
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Step 2: Converting to IDs
      setStage('to-ids')
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Step 3: Converting back from IDs
      setStage('from-ids')
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Complete
      setStage('complete')
    }
    
    fetchTokenization()
  }, [text])

  // Highlight-Funktion für Token und entsprechende ID
  const handleTokenHover = (index: number) => {
    setHighlightedToken(index)
  }
  
  const handleTokenLeave = () => {
    setHighlightedToken(null)
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500 text-center p-6 bg-red-50 rounded-lg">
          <p className="font-bold mb-2">Fehler bei der Tokenisierung:</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Loadingzustand */}
      {stage === 'loading' && (
        <div className="w-full flex flex-col items-center">
          <p className="text-center mb-4">Tokenisiere Text mit GPT Tokenizer...</p>
          <div className="space-y-3 w-full max-w-md">
            <Skeleton className="h-4 w-full" />
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: Math.min(10, Math.ceil(text.length / 4)) }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16" />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Tokenisierungsanimation */}
      {stage !== 'loading' && (
        <motion.div
          key="tokenization"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <motion.p 
            className="text-center text-lg font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {stage === 'tokenizing' && 'Text wird in Tokens zerlegt...'}
            {stage === 'to-ids' && 'Tokens werden in Token-IDs umgewandelt...'}
            {stage === 'from-ids' && 'IDs werden zurück in Tokens konvertiert...'}
            {stage === 'complete' && 'Tokenisierung abgeschlossen!'}
          </motion.p>
          
          <div className="flex flex-col items-center justify-center gap-6 w-full">
            {/* Original text */}
            <div className="text-center mb-2 max-w-md">
              <div className="font-medium text-gray-600 mb-1">Original:</div>
              <div className="text-lg font-semibold break-words">{text}</div>
            </div>
            
            {/* Interactive visualization of what parts of the text become tokens */}
            {stage !== 'loading' && (
              <div className="bg-gray-50 p-4 rounded-lg w-full max-w-lg mb-2">
                <p className="text-sm text-center text-gray-600 mb-2">
                  So sieht das Sprachmodell deinen Text:
                </p>
                <div className="border border-gray-200 rounded-md p-3 bg-white">
                  <span className="break-words">
                    {tokens.map((token, idx) => (
                      <span 
                        key={`text-token-${idx}`}
                        className={`relative inline-block cursor-pointer transition-colors
                          ${highlightedToken === idx ? 'bg-violet-200' : 'hover:bg-violet-100'}`}
                        onMouseEnter={() => handleTokenHover(idx)}
                        onMouseLeave={handleTokenLeave}
                      >
                        <span className="border-r border-dashed border-violet-300 last:border-r-0">{token.token}</span>
                        {highlightedToken === idx && (
                          <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-violet-700 text-white text-xs py-1 px-2 rounded z-10">
                            Token #{idx+1}
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            )}
            
            {/* Tokens */}
            <div className="w-full max-w-lg">
              <div className="font-medium text-center text-gray-600 mb-2">Tokens:</div>
              <div className="flex flex-wrap justify-center gap-2">
                {tokens.map((token, index) => (
                  <motion.div
                    key={`token-${index}`}
                    className={`px-3 py-1 bg-violet-100 border border-violet-200 rounded-md text-violet-800 
                     cursor-pointer ${highlightedToken === index ? 'ring-2 ring-violet-500 bg-violet-200' : ''}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      backgroundColor: stage === 'to-ids' ? '#e0e7ff' : '#f3e8ff'
                    }}
                    transition={{ delay: index * 0.05 }}
                    onMouseEnter={() => handleTokenHover(index)}
                    onMouseLeave={handleTokenLeave}
                  >
                    {token.token}
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Arrows */}
            {(stage === 'to-ids' || stage === 'from-ids' || stage === 'complete') && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl text-violet-500"
              >
                ↓
              </motion.div>
            )}
            
            {/* Token IDs */}
            {(stage === 'to-ids' || stage === 'from-ids' || stage === 'complete') && (
              <div className="w-full max-w-lg">
                <div className="font-medium text-center text-gray-600 mb-2">Token-IDs:</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {tokens.map((token, index) => (
                    <motion.div
                      key={`id-${index}`}
                      className={`px-3 py-1 bg-blue-100 border border-blue-200 rounded-md text-blue-800 font-mono
                        cursor-pointer ${highlightedToken === index ? 'ring-2 ring-blue-500 bg-blue-200' : ''}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onMouseEnter={() => handleTokenHover(index)}
                      onMouseLeave={handleTokenLeave}
                    >
                      {token.id}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Return arrows */}
            {(stage === 'from-ids' || stage === 'complete') && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl text-violet-500"
              >
                ↓
              </motion.div>
            )}
            
            {/* Back to tokens */}
            {(stage === 'from-ids' || stage === 'complete') && (
              <div className="w-full max-w-lg">
                <div className="font-medium text-center text-gray-600 mb-2">
                  Rekonstruierter Text:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {tokens.map((token, index) => (
                    <motion.div
                      key={`token-back-${index}`}
                      className={`px-3 py-1 bg-green-100 border border-green-200 rounded-md text-green-800
                        cursor-pointer ${highlightedToken === index ? 'ring-2 ring-green-500 bg-green-200' : ''}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onMouseEnter={() => handleTokenHover(index)}
                      onMouseLeave={handleTokenLeave}
                    >
                      {token.token}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Token count info */}
            {stage === 'complete' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center p-3 bg-violet-50 rounded-lg max-w-lg"
              >
                <p className="text-violet-800">
                  Dein Text wurde in <span className="font-bold">{tokens.length} Tokens</span> zerlegt.
                </p>
                {tokens.length >= 10 && (
                  <p className="text-sm text-violet-700 mt-1">
                    Sprachmodelle haben ein begrenztes "Gedächtnis" von Tokens (z.B. 128 000 bei GPT-4o).
                    Das sind etwa 300 Seiten.
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Erklärungs-Box zu BPE */}
      {stage === 'complete' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg w-full max-w-lg"
        >
          <h3 className="font-semibold text-blue-800 mb-2">Über GPT-Tokenisierung</h3>
          <p className="text-sm text-blue-700">
            Die Tokenisierung verwendet den <strong>BPE (Byte Pair Encoding)</strong> Algorithmus, der:
          </p>
          <ul className="list-disc ml-5 mt-2 text-sm text-blue-700 space-y-1">
            <li>Häufig zusammen vorkommende Zeichen zu größeren Einheiten zusammenfasst</li>
            <li>Einzelne Wörter in mehrere Tokens aufteilen kann (wie "<span className="font-mono">program + m + mieren</span>")</li>
            <li>Häufige Wörter als eigene Tokens behandelt</li>
            <li>Für seltene Wörter auf kleinere Teile zurückgreift</li>
          </ul>
          <p className="text-sm mt-2 text-blue-700">
            Das Modell "sieht" den Text nur als Zahlenfolge, nicht als echte Wörter!
          </p>
        </motion.div>
      )}
    </div>
  )
}