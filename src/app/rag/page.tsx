'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuideCharacter } from '@/components/guide/guide-character'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { RAGSimulation } from '@/components/visualizations/rag-simulation'

export default function RAGPage() {
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
          <h1 className="text-3xl font-bold mb-2 text-violet-900">RAG: Retrieval-Augmented Generation</h1>
          <p className="text-lg text-gray-600">
            Wie KI-Modelle mit externen Informationsquellen angereichert werden
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Die Grenzen des Modellwissens</CardTitle>
          <CardDescription>
            Warum KI-Modelle externe Informationen benötigen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Moderne KI-Modelle verfügen über ein umfangreiches Wissen, das während des Trainings erworben wurde. 
            Jedoch gibt es klare Grenzen:
          </p>
          
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Das Wissen ist auf den <strong>Trainingszeitraum begrenzt</strong> - alles, was danach passiert ist, kennt das Modell nicht</li>
            <li>Sehr <strong>spezifische, fachliche oder aktuelle Informationen</strong> sind möglicherweise nicht präzise genug</li>
            <li>Ohne Kontext kann das Modell <strong>keine Berechnungen durchführen</strong> oder auf Daten zugreifen, die nicht Teil seines Wissens sind</li>
            <li>Es kann <strong>Informationen &quot;halluzinieren&quot;</strong> - also Dinge erfinden, die falsch oder ungenau sind</li>
          </ul>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">RAG: Retrieval-Augmented Generation</p>
              <p className="text-sm text-violet-700">
                RAG ist eine Technik, bei der ein Sprachmodell mit zusätzlichen Informationsquellen ergänzt wird. 
                Das Modell kann dann auf diese Informationen zugreifen, um präzisere und aktuellere Antworten zu generieren.
              </p>
              <p className="text-sm text-violet-700 mt-2">
                Der Prozess umfasst drei Hauptschritte:
              </p>
              <ol className="text-sm text-violet-700 list-decimal pl-5 space-y-1 mt-1">
                <li><strong>Retrieval (Abrufen)</strong>: Relevante Informationen werden aus einer externen Quelle abgerufen</li>
                <li><strong>Augmentation (Anreicherung)</strong>: Diese Informationen werden dem Kontext des Modells hinzugefügt</li>
                <li><strong>Generation (Generierung)</strong>: Das Modell erzeugt eine Antwort basierend auf seinem Wissen UND den abgerufenen Informationen</li>
              </ol>
            </div>
          </div>
          
          <p>
            Durch RAG können KI-Modelle präzisere, aktuellere und fundiertere Antworten geben. 
            Es reduziert Halluzinationen und erweitert die Fähigkeiten des Modells erheblich. 
            Allerdings ist es wichtig zu verstehen, dass auch mit RAG Fehler auftreten können, 
            da die Informationen immer noch vom Modell interpretiert werden müssen.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>RAG-Prozess simulieren</CardTitle>
          <CardDescription>
            Erlebe, wie externe Informationen die Antworten verbessern – und wo die Grenzen liegen
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
              <RAGSimulation />
            ) : (
              <div className="text-gray-500 text-center h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf &quot;Simulation starten&quot;, um RAG in Aktion zu erleben
                </p>
                <p className="text-sm max-w-md">
                  Du kannst verschiedene Anfragen testen und sehen, wie externe Informationen die Antworten
                  verbessern - und welche Herausforderungen weiterhin bestehen.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/rlhf">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/chain-of-thought">
          <Button>
            Weiter zu Chain-of-Thought <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}