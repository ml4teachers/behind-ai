'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuideCharacter } from '@/components/guide/guide-character'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { FinetuningSimulation } from '@/components/visualizations/finetuning-simulation'

export default function FinetuningPage() {
  const [showSimulation, setShowSimulation] = useState(false)

  const handleSimulateClick = () => {
    setShowSimulation(true)
  }

  const handleResetSimulation = () => {
    setShowSimulation(false)
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="curious" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-violet-900">Finetuning: Vom Textgenerator zum Assistenten</h1>
          <p className="text-lg text-gray-600">
            Wie aus einem Sprachmodell ein hilfreicher Assistent wird
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wissen aus dem Pretraining, Verhalten aus dem Finetuning</CardTitle>
          <CardDescription>
            Nach dem Pretraining ist das Modell noch kein Assistent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Im vorherigen Kapitel haben wir gesehen, wie ein Sprachmodell im Pretraining lernt, Texte zu ergänzen 
            und Zusammenhänge zu verstehen. Das vermittelt dem Modell sein <strong>grundlegendes Wissen</strong> über Sprache und Inhalte.
          </p>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">Probleme mit Pretraining allein:</p>
              <p className="text-sm text-violet-700">
                1. Das Modell <strong>setzt einfach Texte fort</strong> statt zu antworten
              </p>
              <p className="text-sm text-violet-700">
                2. Es ist nicht klar, dass es als <strong>Assistent</strong> fungieren soll
              </p>
              <p className="text-sm text-violet-700">
                3. Es hat keine <strong>Struktur</strong> für Gespräche
              </p>
              <p className="text-sm text-violet-700">
                4. Es kann <strong>schädliche oder falsche</strong> Inhalte generieren
              </p>
            </div>
          </div>
          
          <p className="mb-4">
            Durch <strong>Finetuning</strong> lernt das Modell, wie ein Assistent zu kommunizieren. Wir trainieren es mit 
            Beispielgesprächen zwischen Menschen und Assistenten, damit es:
          </p>
          
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Seine Rolle als <strong>hilfreicher Assistent</strong> versteht</li>
            <li>Auf Anfragen <strong>direkt antwortet</strong> statt Text fortzuführen</li>
            <li>Die <strong>Struktur eines Dialogs</strong> beibehält</li>
            <li>Sich an <strong>Anweisungen und Constraints</strong> hält</li>
          </ul>
          
          <p>
            Das Finetuning nutzt die gleiche Trainingsmethode wie das Pretraining, aber mit spezifischen Beispielen, 
            die dem Modell beibringen, wie es sein Wissen im Assistenz-Kontext anwenden soll.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Finetuning simulieren</CardTitle>
          <CardDescription>
            Erlebe den Unterschied zwischen einem nur vortrainierten und einem finegetuned Modell
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleSimulateClick} 
                disabled={showSimulation}
              >
                Simulation starten
              </Button>
              
              {showSimulation && (
                <Button 
                  variant="outline" 
                  onClick={handleResetSimulation}
                >
                  Zurücksetzen
                </Button>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white min-h-[500px]">
            {showSimulation ? (
              <FinetuningSimulation />
            ) : (
              <div className="text-gray-500 text-center h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf "Simulation starten", um den Unterschied zu sehen
                </p>
                <p className="text-sm max-w-md">
                  Du wirst den Unterschied zwischen einem Modell direkt nach dem Pretraining und 
                  einem Modell nach dem Finetuning erleben können, indem du verschiedene Fragen stellst.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/training">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/rlhf">
          <Button>
            Weiter zu RLHF <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}