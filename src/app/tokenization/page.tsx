'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GuideCharacter } from '@/components/guide/guide-character'
import { TokenizationAnimation } from '@/components/animations/tokenization-animation'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'

export default function TokenizationPage() {
  const [inputText, setInputText] = useState('Hallo, diesen Text kannst du beliebig anpassen.')
  const [showResults, setShowResults] = useState(false)

  const handleProcessClick = () => {
    setShowResults(true)
  }
  
  // Nur zurücksetzen, wenn sich der Text ändert oder neue Beispiele geladen werden
  const handleTextChange = (newText: string) => {
    if (newText !== inputText) {
      setInputText(newText)
      setShowResults(false) // Ergebnisse zurücksetzen, wenn sich der Text ändert
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-start gap-6 mb-8">
        <GuideCharacter emotion="explaining" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-violet-900">Tokenisierung: Text in Stücke zerlegen</h1>
          <p className="text-lg text-gray-600">
            Der erste Schritt bei Sprachmodellen ist, Text in kleine Teile zu zerlegen,
            die wir &quot;Tokens&quot; nennen.
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Was ist Tokenisierung?</CardTitle>
          <CardDescription>
            Wie ein Computer Text &quot;liest&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Computer verstehen keine Wörter wie wir, sondern nur Zahlen. Darum müssen wir Text erst
            in kleine Stücke zerlegen und dann in Zahlen umwandeln.
          </p>
          <p className="mb-4">
            Diese Stücke nennt man &quot;Tokens&quot; - manchmal sind das ganze Wörter, manchmal 
            Teile eines Wortes oder auch nur einzelne Buchstaben.
          </p>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">BPE: Byte Pair Encoding</p>
              <p className="text-sm text-violet-700">
                Moderne Sprachmodelle verwenden einen Algorithmus namens BPE, der häufig zusammen vorkommende
                Buchstabenpaare zu größeren Tokens zusammenfügt. So können längere Wörter 
                effizient in wenige Tokens zerlegt werden!
              </p>
            </div>
          </div>
          
          <p>
            Zum Beispiel wird das Wort &quot;Programmieren&quot; in die drei Tokens &quot;Program&quot; + &quot;m&quot; + &quot;ieren&quot;
            zerlegt werden, statt in einzelne Buchstaben oder Silben.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Probiere es aus!</CardTitle>
          <CardDescription>
            Gib einen Text ein und schaue, wie er vom GPT-Tokenizer zerlegt wird
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Gib einen Text ein..."
              className="mb-4"
            />
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleProcessClick} 
                disabled={!inputText.trim()}
              >
                Text tokenisieren
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleTextChange('Programmieren lernt man am besten durch Übung.')}
              >
                Beispieltext 1
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleTextChange('Künstliche Intelligenz ist auch nur Mathematik!')}
              >
                Beispieltext 2
              </Button>
              
              {showResults && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowResults(false)}
                >
                  Zurücksetzen
                </Button>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white min-h-[400px]">
            {showResults ? (
              <TokenizationAnimation text={inputText} />
            ) : (
              <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf &quot;Text tokenisieren&quot;, um zu sehen, wie dein Text in Tokens zerlegt wird.
                </p>
                <p className="text-sm max-w-md">
                  Wir verwenden den echten GPT-Tokenizer, den auch ChatGPT benutzt! 
                  Fahre mit der Maus über Tokens, um zu sehen, wie sie zusammengehören.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/next-token">
          <Button>
            Weiter: Vorhersage des nächsten Tokens <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}