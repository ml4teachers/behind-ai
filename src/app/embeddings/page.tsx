'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuideCharacter } from '@/components/guide/guide-character'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { EmbeddingsVisualization } from '@/components/visualizations/embeddings-visualization'

export default function EmbeddingsPage() {
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
          <h1 className="text-3xl font-bold mb-2 text-violet-900">Embeddings</h1>
          <p className="text-lg text-gray-600">
            Wie Computer Bedeutung durch Zahlen verstehen
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Was sind Embeddings?</CardTitle>
          <CardDescription>
            Die zahlenmäßige Darstellung von Bedeutung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Embeddings sind ein faszinierendes Konzept: Sie übersetzen die Bedeutung von Wörtern oder Texten in Zahlen.
            Doch wie kann eine Reihe von Zahlen Bedeutung enthalten?
          </p>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-6 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">Embedding = Zahlenvektor mit Bedeutung</p>
              <p className="text-sm text-violet-700">
                Ein Embedding ist im Grunde ein langer Vektor aus Zahlen (z.B. ein Array mit 384 Zahlen). Das Besondere: 
                <strong> Wörter mit ähnlicher Bedeutung haben ähnliche Zahlenvektoren.</strong> Diese 
                mathematische Ähnlichkeit kann gemessen werden – und genau das macht Embeddings so wertvoll für KI-Systeme.
              </p>
            </div>
          </div>
          
          <p className="mb-4">
            Stell dir vor, jedes Wort wird in einem mehrdimensionalen Raum als Punkt platziert. Wörter mit ähnlicher 
            Bedeutung stehen nah beieinander, während unähnliche Wörter weit voneinander entfernt sind:
          </p>

          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Wörter wie "Hund" und "Katze" stehen nah beieinander (beide sind Haustiere)</li>
            <li>Wörter wie "Buch" und "lesen" stehen ebenfalls nah beieinander (inhaltlich verwandt)</li>
            <li>Wörter wie "Hund" und "Mathematik" stehen weit voneinander entfernt (kaum inhaltlich verwandt)</li>
            <li>Selbst Beziehungen wie "König" - "Mann" + "Frau" = "Königin" können in diesem Zahlenraum dargestellt werden</li>
          </ul>

          <p className="mb-4">
            Diese "numerische Repräsentation" von Bedeutung ist einer der fundamentalen Bausteine moderner 
            KI-Systeme. Sie ermöglicht es Computern, semantische Ähnlichkeit zu "verstehen" und damit Texte, 
            Bilder und andere Inhalte intelligent zu verarbeiten.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wie funktionieren Embeddings?</CardTitle>
          <CardDescription>
            Von Wörtern zu Zahlenvektoren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Embeddings werden durch komplexe KI-Modelle erzeugt, die darauf trainiert wurden, Bedeutung aus großen 
            Textmengen zu lernen. Der Trainingsprozess folgt einem einfachen Prinzip: 
            <strong> Wörter, die in ähnlichen Kontexten vorkommen, haben wahrscheinlich ähnliche Bedeutungen.</strong>
          </p>

          <p className="mb-4">
            Wenn ein Modell Millionen von Texten analysiert, lernt es die Beziehungen zwischen Wörtern und kann 
            diese dann als Zahlenvektoren darstellen. Diese Vektoren haben typischerweise zwischen 100 und 1000 
            Dimensionen, wobei jede Dimension einen bestimmten Aspekt der Bedeutung erfasst.
          </p>

          <div className="mb-6 border-l-4 border-violet-300 pl-4 py-1 italic">
            "Eine Biene fliegt von Blume zu Blume."<br/>
            "Ein Vogel fliegt durch die Luft."
          </div>

          <p className="mb-4">
            Aus solchen Sätzen lernt das Modell, dass "Biene" und "Vogel" ähnliche Eigenschaften haben (beide können fliegen), 
            während "Blume" und "Luft" in einem anderen semantischen Zusammenhang stehen. Diese Beziehungen werden in den 
            Embedding-Vektoren codiert.
          </p>

          <p className="mb-4">
            Die Ähnlichkeit zwischen zwei Embeddings wird typischerweise mit der Cosinus-Ähnlichkeit gemessen:
          </p>

          <div className="bg-gray-50 border rounded-md p-3 mb-4 font-mono text-sm overflow-auto">
            <p>cosine_similarity(embedding1, embedding2) = dot_product(embedding1, embedding2) / (||embedding1|| * ||embedding2||)</p>
          </div>

          <p className="mb-4">
            Das Ergebnis ist eine Zahl zwischen -1 und 1, wobei 1 perfekte Ähnlichkeit, 0 keine Ähnlichkeit und -1 
            gegensätzliche Bedeutung anzeigt. In der Praxis liegen die meisten Werte zwischen 0 und 1.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Embeddings in der Praxis</CardTitle>
          <CardDescription>
            Wie Zahlen zu mächtigen KI-Werkzeugen werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Embeddings sind heute ein unverzichtbarer Bestandteil vieler KI-Anwendungen:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Semantische Suche:</strong> Finde nicht nur Texte mit exakten Schlüsselwörtern, sondern auch inhaltlich ähnliche Dokumente</li>
            <li><strong>Empfehlungssysteme:</strong> Ähnliche Produkte, Filme oder Artikel finden basierend auf inhaltlicher Ähnlichkeit</li>
            <li><strong>Chatbots und KI-Assistenten:</strong> Besser verstehen, was Nutzer meinen, selbst wenn sie andere Worte verwenden</li>
            <li><strong>Sprachübersetzung:</strong> Wörter in unterschiedlichen Sprachen mit ähnlicher Bedeutung identifizieren</li>
            <li><strong>Sentimentanalyse:</strong> Die emotionale Färbung von Texten erfassen</li>
            <li><strong>RAG (Retrieval-Augmented Generation):</strong> Relevante Dokumente finden, um KI-Antworten zu verbessern</li>
          </ul>

          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">Wichtig zu verstehen</p>
              <p className="text-sm text-violet-700">
                KI-Modelle "verstehen" die Bedeutung von Wörtern nicht so wie Menschen. Sie erfassen statistische 
                Muster in Daten und bilden diese als mathematische Beziehungen ab. Dennoch sind Embeddings 
                erstaunlich effektiv darin, semantische Ähnlichkeit zu modellieren und bilden eine Brücke zwischen 
                menschlicher Sprache und maschineller Verarbeitung.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Embeddings ausprobieren</CardTitle>
          <CardDescription>
            Erlebe, wie Wörter und Sätze in Zahlenvektoren umgewandelt werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={handleSimulateClick} 
                disabled={showSimulation}
              >
                Interaktives Tool starten
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
              <EmbeddingsVisualization />
            ) : (
              <div className="text-gray-500 text-center h-full flex flex-col justify-center items-center">
                <p className="mb-2">
                  Klicke auf &quot;Interaktives Tool starten&quot;, um Embeddings zu erkunden
                </p>
                <p className="text-sm max-w-md">
                  Gib ein Wort oder einen kurzen Satz ein, um dessen Embedding zu berechnen. Das System 
                  vergleicht dann die Bedeutungsähnlichkeit mit hunderten verschiedenen Begriffen
                  und zeigt dir die 12 interessantesten Vergleichsbegriffe an.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/chain-of-thought">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/resources">
          <Button>
            Weiter zu Ressourcen <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}