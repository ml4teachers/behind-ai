'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GuideCharacter } from '@/components/guide/guide-character'
import { NextTokenPrediction } from '@/components/visualizations/next-token-prediction'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'

export default function NextTokenPage() {
  const [inputText, setInputText] = useState('Gelb ist eine')
  const [showPrediction, setShowPrediction] = useState(false)

  const handlePredictClick = () => {
    setShowPrediction(true)
  }
  
  // Nur zurücksetzen, wenn sich der Text ändert
  const handleTextChange = (newText: string) => {
    if (newText !== inputText) {
      setInputText(newText)
      setShowPrediction(false) // Vorhersage zurücksetzen, wenn sich der Text ändert
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="thinking" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-violet-900">Next-Token-Prediction: Das Herzstück des Modells</h1>
          <p className="text-lg text-gray-600">
            Wie Sprachmodelle das nächste Wort vorhersagen
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wie funktioniert die Vorhersage?</CardTitle>
          <CardDescription>
            Das KI-Modell berechnet Wahrscheinlichkeiten für jedes mögliche nächste Wort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Das Kernstück eines Sprachmodells ist seine Fähigkeit, das nächste Wort in einer Sequenz 
            vorherzusagen. Es berechnet für jeden möglichen Token eine Wahrscheinlichkeit.
          </p>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">Wahrscheinlichkeitsverteilung</p>
              <p className="text-sm text-violet-700">
                Das Modell berechnet Wahrscheinlichkeiten für <strong>alle</strong> möglichen nächsten Tokens 
                (über 50.000!), aber nur wenige davon haben eine hohe Wahrscheinlichkeit. Die meisten 
                Tokens haben eine Wahrscheinlichkeit nahe Null.
              </p>
            </div>
          </div>
          
          <p>
            Das Modell kann deterministisch den wahrscheinlichsten Token auswählen oder
            zufällig einen Token basierend auf seiner Wahrscheinlichkeit auswählen. Bei höherer Zufälligkeit 
            (Temperatur) werden auch weniger wahrscheinliche Tokens manchmal ausgewählt.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Probiere es aus!</CardTitle>
          <CardDescription>
            Schreibe den Anfang eines Satzes und beobachte echte KI-Vorhersagen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Gib den Anfang eines Satzes ein..."
              className="mb-4"
            />
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handlePredictClick} 
                disabled={!inputText.trim()}
              >
                Nächsten Token vorhersagen
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleTextChange("Der beste Freund des Menschen ist der")}
              >
                Beispiel 1
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleTextChange("Es war einmal eine")}
              >
                Beispiel 2
              </Button>
              
              {showPrediction && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrediction(false)}
                >
                  Zurücksetzen
                </Button>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white min-h-[420px]">
            {showPrediction ? (
              <NextTokenPrediction text={inputText} />
            ) : (
              <div className="text-gray-500 text-center h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf &quot;Nächsten Token vorhersagen&quot;, um echte KI-Vorhersagen zu sehen.
                </p>
                <p className="text-sm max-w-md">
                  Du kannst einzelne Tokens auswählen, um zu sehen, wie das Modell 
                  Schritt für Schritt Text generiert. Oder wähle &quot;Zufälliger Token&quot; für 
                  eine wahrscheinlichkeitsbasierte Auswahl.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/tokenization">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/daten">
          <Button>
            Weiter: Wo kommen die Daten her? <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}