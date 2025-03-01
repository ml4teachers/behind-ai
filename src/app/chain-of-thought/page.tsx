'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuideCharacter } from '@/components/guide/guide-character'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { ThinkingSimulation } from '@/components/visualizations/thinking-simulation'

export default function ChainOfThoughtPage() {
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
        <GuideCharacter emotion="thinking" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-violet-900">Chain-of-Thought: Wie KI denkt</h1>
          <p className="text-lg text-gray-600">
            Wie moderne Sprachmodelle komplexe Probleme Schritt für Schritt lösen
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vom schnellen Antworten zum tatsächlichen Denken</CardTitle>
          <CardDescription>
            Warum KI-Modelle ihre Antworten durchdenken müssen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Frühe Sprachmodelle gaben Antworten in einem einzigen Durchgang aus - ohne die Möglichkeit,
            ihre Gedanken zu strukturieren oder Zwischenschritte zu durchlaufen. Moderne KI-Modelle können 
            jedoch einen Denkprozess simulieren, der dem menschlichen Denken ähnelt:
          </p>
          
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Sie zerlegen komplexe Probleme in <strong>kleinere Teilschritte</strong></li>
            <li>Sie führen <strong>Zwischenberechnungen</strong> durch und halten diese fest</li>
            <li>Sie <strong>überprüfen ihre eigene Logik</strong> und korrigieren sich selbst</li>
            <li>Sie <strong>kombinieren Teilantworten</strong> zur Erstellung einer Gesamtlösung</li>
          </ul>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">Chain-of-Thought (Gedankenkette)</p>
              <p className="text-sm text-violet-700">
                Chain-of-Thought ist eine Technik, bei der das KI-Modell seinen Denkprozess als eine Reihe 
                von zusammenhängenden Schritten formuliert, bevor es zur endgültigen Antwort kommt.
              </p>
              <p className="text-sm text-violet-700 mt-2">
                In modernen KI-Modellen wie Claude 3.7, OpenAI o3 oder Grok 3 wurde dieses Konzept weiterentwickelt 
                zu einem "Thinking Mode" oder "Extended Thinking", bei dem das Modell:
              </p>
              <ul className="text-sm text-violet-700 list-disc pl-5 mt-1 space-y-1">
                <li>Mehr Rechenzeit für komplexe Probleme erhält</li>
                <li>Einen internen "Notizblock" (Scratchpad) verwendet, um Zwischenschritte festzuhalten</li>
                <li>Verschiedene Lösungsansätze durchspielt und bewertet</li>
                <li>Sich selbst korrigiert, bevor die endgültige Antwort ausgegeben wird</li>
              </ul>
            </div>
          </div>
          
          <p>
            Diese Methode verbessert die Genauigkeit und Zuverlässigkeit bei komplexen Aufgaben erheblich - 
            besonders bei mathematischen Problemen, logischen Rätseln und Programmieraufgaben. 
            Allerdings erfordert dieser Prozess mehr Zeit und Rechenleistung, was je nach Anwendungsfall 
            abgewogen werden muss.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Thinking-Mode simulieren</CardTitle>
          <CardDescription>
            Erlebe, wie KI-Modelle Probleme Schritt für Schritt durchdenken
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
              <ThinkingSimulation />
            ) : (
              <div className="text-gray-500 text-center h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf "Simulation starten", um die Chain-of-Thought-Methode zu erleben
                </p>
                <p className="text-sm max-w-md">
                  Du kannst verschiedene Aufgabentypen ausprobieren und beobachten, wie ein KI-Modell
                  seinen Denkprozess strukturiert, um komplexe Probleme zu lösen.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/rag">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/resources">
          <Button>
            über diese Seite<span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}