'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuideCharacter } from '@/components/guide/guide-character'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { RLHFSimulation } from '@/components/visualizations/rlhf-simulation'

export default function RLHFPage() {
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
        <GuideCharacter emotion="enthusiastic" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-violet-900">RLHF: Training mit menschlichem Feedback</h1>
          <p className="text-lg text-gray-600">
            Wie KI-Modelle durch menschliche Bewertungen weiter verfeinert werden
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Von Finetuning zu RLHF</CardTitle>
          <CardDescription>
            Warum auch finegetunte Modelle noch zusätzliches Training benötigen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Nach dem Finetuning sind KI-Modelle bereits in der Lage, als Assistenten zu fungieren. Allerdings zeigen
            sie manchmal noch problematisches Verhalten:
          </p>
          
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Sie können <strong>schädliche oder gefährliche Inhalte</strong> produzieren</li>
            <li>Sie sind manchmal <strong>unehrlich</strong> und behaupten Dinge, die nicht stimmen</li>
            <li>Sie verstehen nicht immer, was für Menschen <strong>wirklich hilfreich</strong> ist</li>
            <li>Sie können <strong>voreingenommen</strong> sein und bestimmte Perspektiven bevorzugen</li>
          </ul>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">RLHF: Reinforcement Learning from Human Feedback</p>
              <p className="text-sm text-violet-700">
                RLHF ist ein Prozess, bei dem menschliche Bewerter unterschiedliche Antworten eines KI-Modells ranken.
                Diese Bewertungen werden dann verwendet, um ein <strong>Belohnungsmodell</strong> zu trainieren,
                das vorhersagt, welche Antworten Menschen als hilfreich, harmlos und ehrlich bewerten würden.
              </p>
              <p className="text-sm text-violet-700 mt-2">
                Anschließend wird das KI-Modell mit <strong>Reinforcement Learning</strong> optimiert, 
                um Antworten zu generieren, die vom Belohnungsmodell höher bewertet werden.
              </p>
            </div>
          </div>
          
          <p>
            Dieser Prozess hilft dem Modell, komplexe menschliche Werte wie Hilfsbereitschaft und Sicherheit besser
            zu verstehen, die schwer explizit zu programmieren sind. RLHF ist ein wichtiger Schritt, um KI-Systeme
            zu entwickeln, die im Einklang mit menschlichen Werten handeln.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>RLHF-Prozess simulieren</CardTitle>
          <CardDescription>
            Erlebe, wie menschliches Feedback KI-Antworten verbessert
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
              <RLHFSimulation />
            ) : (
              <div className="text-gray-500 text-center h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf "Simulation starten", um den RLHF-Prozess zu erleben
                </p>
                <p className="text-sm max-w-md">
                  Du wirst verschiedene KI-Antworten bewerten, einen Eindruck vom Belohnungsmodell bekommen
                  und sehen, wie sich die Antworten nach dem RLHF-Training verbessern.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/finetuning">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/rag">
          <Button>
            Weiter zu RAG <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}