'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuideCharacter } from '@/components/guide/guide-character'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { TrainingSimulation } from '@/components/visualizations/training-simulation'

export default function TrainingPage() {
  const [showSimulation, setShowSimulation] = useState(false)
  const [trainingStep, setTrainingStep] = useState(1)

  const handleSimulateClick = () => {
    setShowSimulation(true)
    setTrainingStep(1)
  }

  const handleNextStep = () => {
    if (trainingStep < 3) {
      setTrainingStep(trainingStep + 1)
    }
  }

  const handleResetSimulation = () => {
    setShowSimulation(false)
    setTrainingStep(1)
  }
  
  // Event-Listener für automatisches Fortschreiten der Trainingsschritte
  useEffect(() => {
    const handleNextTrainingStep = () => {
      if (trainingStep < 3) {
        setTrainingStep(prevStep => prevStep + 1);
      }
    };
    
    window.addEventListener('nextTrainingStep', handleNextTrainingStep);
    
    return () => {
      window.removeEventListener('nextTrainingStep', handleNextTrainingStep);
    };
  }, [trainingStep]);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="excited" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-violet-900">Training: So lernt ein KI-Modell</h1>
          <p className="text-lg text-gray-600">
            Der Prozess, durch den KI-Modelle ihre Fähigkeiten entwickeln
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wie funktioniert das Training?</CardTitle>
          <CardDescription>
            Lernen durch Vorhersage und Fehlerkorrektur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Beim Training geht es darum, dass das Modell lernt, bessere Vorhersagen zu machen. Dies geschieht
            völlig getrennt von der Inferenz (dem Generieren von Text).
          </p>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">Wichtiger Unterschied: Training vs. Inferenz</p>
              <p className="text-sm text-violet-700">
                <strong>Training:</strong> Das Modell lernt aus vielen Beispielen, indem es Fehler in seiner 
                Vorhersage korrigiert. Dies erfordert enormen Rechenaufwand und dauert Wochen bis Monate.
              </p>
              <p className="text-sm text-violet-700 mt-2">
                <strong>Inferenz:</strong> Das Modell wendet an, was es gelernt hat, um neuen Text zu generieren. 
                Dies passiert, wenn du mit ChatGPT sprichst oder andere KI-Tools verwendest.
              </p>
            </div>
          </div>
          
          <p>
            Während des Trainings wird dem Modell ein Text gezeigt, und es muss versuchen, den nächsten
            Token vorherzusagen. Dann vergleicht es seine Vorhersage mit dem tatsächlichen nächsten Token
            und passt seine internen Parameter an, um beim nächsten Mal eine bessere Vorhersage zu machen.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Training simulieren</CardTitle>
          <CardDescription>
            Erlebe, wie ein KI-Modell durch Fehlerkorrektur lernt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleSimulateClick} 
                disabled={showSimulation && trainingStep === 1}
              >
                Training starten
              </Button>
              
              {showSimulation && (
                <>
                  <Button 
                    onClick={handleNextStep}
                    disabled={trainingStep >= 3}
                  >
                    Nächster Trainingsschritt
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleResetSimulation}
                  >
                    Zurücksetzen
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white min-h-[500px]">
            {showSimulation ? (
              <TrainingSimulation step={trainingStep} />
            ) : (
              <div className="text-gray-500 text-center h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf &quot;Training starten&quot;, um zu sehen, wie ein KI-Modell trainiert wird.
                </p>
                <p className="text-sm max-w-md">
                  Du wirst den Trainingsprozess Schritt für Schritt erleben und sehen, wie das Modell seine 
                  Vorhersagen verbessert. Wähle 5 Beispiele aus, um automatisch zum nächsten Trainingsschritt zu gelangen.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/daten">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/finetuning">
          <Button>
            Weiter: Finetuning <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}