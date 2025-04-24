'use client'; // Nötig für GuideCharacter und Interaktion

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuideCharacter } from '@/components/guide/guide-character'; // Pfad prüfen
import { Info, Cloud, Laptop } from 'lucide-react'; // Info-Icon für die Infobox
import { DataFlowSimulator } from '@/components/visualizations/data-flow-simulator'; // Pfad prüfen
import Link from 'next/link'; // Falls du Navigation brauchst
import { Button } from '@/components/ui/button'; // Falls du Navigation brauchst

export default function LokalVsCloudPage() {
  return (
    // Container und Layout ähnlich wie FinetuningPage
    <div className="container mx-auto max-w-4xl py-8">
      {/* Titelbereich mit GuideCharacter */}
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="thinking" /> {/* Emotion anpassen, z.B. thinking, explaining */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-blue-900">Lokal vs. Cloud: Wo arbeitet die KI?</h1>
          <p className="text-lg text-gray-600">
            Verstehe, wo deine Daten verarbeitet werden und was das für dich bedeutet.
          </p>
        </div>
      </div>

      {/* Erste Erklärungskarte */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dein Computer oder die "Wolke"?</CardTitle>
          <CardDescription>
            Wo findet die eigentliche Rechenarbeit der Künstlichen Intelligenz statt?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Künstliche Intelligenz, insbesondere grosse Sprachmodelle, benötigt viel Rechenleistung. Diese Leistung kann grundsätzlich an zwei Orten bereitgestellt werden: direkt auf deinem eigenen Gerät oder auf leistungsstarken Computern (Servern) in Rechenzentren irgendwo auf der Welt – oft als "Cloud" bezeichnet.
          </p>
          <p className="mb-4">
            <strong>Lokale Verarbeitung:</strong> Hier läuft das KI-Modell direkt auf deinem Computer, Tablet oder Smartphone. Du brauchst dafür entsprechende Software (z.B. Ollama) und genügend leistungsfähige Hardware (vor allem Arbeitsspeicher und evtl. eine gute Grafikkarte). Der grosse Vorteil: Deine Eingaben und die generierten Antworten verlassen dein Gerät nicht.
          </p>
          <p>
            <strong>Cloud/API-Verarbeitung:</strong> Hier schickst du deine Anfrage über das Internet an einen Dienstleister (wie OpenAI, Google, Anthropic etc.). Dort wird deine Anfrage auf sehr leistungsfähigen Servern von einem grossen KI-Modell verarbeitet und die Antwort zurückgeschickt. Das ist oft bequemer und ermöglicht den Zugriff auf die besten Modelle, bedeutet aber, dass deine Daten dein Gerät verlassen und vom Anbieter verarbeitet werden. API steht für "Application Programming Interface", eine Schnittstelle zur Kommunikation zwischen Programmen.
          </p>
        </CardContent>
      </Card>

      {/* Zweite Erklärungskarte mit Infobox */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Die Kernunterschiede und ihre Folgen</CardTitle>
          <CardDescription>
            Kontrolle, Kosten, Leistung – die Wahl des Weges hat Konsequenzen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Ob du eine KI lokal oder über die Cloud nutzt, hat entscheidende Auswirkungen, besonders wenn es um Datenschutz, aber auch um Kosten und die Qualität der Ergebnisse geht. Es gibt nicht den einen "besten" Weg – die Wahl hängt stark vom Anwendungsfall ab.
          </p>

          {/* Infobox im Stil deines Beispiels */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 my-6 flex gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 mb-2">Wichtige Unterschiede auf einen Blick:</p>
              <ul className="list-none space-y-1.5">
                <li className="flex items-start">
                  <strong className="w-32 flex-shrink-0 text-sm text-blue-700">Datenschutz:</strong>
                  <span className="text-sm text-blue-900">
                    <strong className="text-green-700">Lokal:</strong> Maximale Kontrolle, Daten bleiben privat. <br />
                    <strong className="text-red-700">Cloud:</strong> Daten gehen an Anbieter, Datenschutzrichtlinien & Serverstandort prüfen, Risiko durch Dritte/Hacker.
                  </span>
                </li>
                 <li className="flex items-start">
                  <strong className="w-32 flex-shrink-0 text-sm text-blue-700">Leistung:</strong>
                  <span className="text-sm text-blue-900">
                    <strong className="text-yellow-700">Lokal:</strong> Begrenzt durch eigene Hardware, oft kleinere/einfachere Modelle. <br />
                    <strong className="text-green-700">Cloud:</strong> Zugriff auf sehr grosse, leistungsstarke State-of-the-Art-Modelle.
                  </span>
                </li>
                 <li className="flex items-start">
                  <strong className="w-32 flex-shrink-0 text-sm text-blue-700">Kosten:</strong>
                   <span className="text-sm text-blue-900">
                    <strong>Lokal:</strong> Anschaffung Hardware, Strom. <br />
                    <strong>Cloud:</strong> Laufende Kosten (API-Nutzung, Abos) oder Bezahlung durch indirekte Datennutzung (z.B. für Training bei Gratisdiensten?).
                  </span>
                </li>
                 <li className="flex items-start">
                  <strong className="w-32 flex-shrink-0 text-sm text-blue-700">Zugang/Setup:</strong>
                   <span className="text-sm text-blue-900">
                    <strong>Lokal:</strong> Installation, Konfiguration, technisches Wissen nötig. <br />
                    <strong>Cloud:</strong> Oft sehr einfach via Web/App, keine lokale Installation.
                  </span>
                </li>
                 <li className="flex items-start">
                  <strong className="w-32 flex-shrink-0 text-sm text-blue-700">Abhängigkeit:</strong>
                   <span className="text-sm text-blue-900">
                    <strong>Lokal:</strong> Funktioniert offline. <br />
                    <strong>Cloud:</strong> Internetverbindung zwingend erforderlich.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-6 mb-4 italic">
             <strong>Wichtig zu wissen:</strong> Diese grundlegenden Unterschiede zwischen lokaler Datenkontrolle (<Laptop size={14} className="inline-block mx-1"/>) und der Leistung von Cloud-Diensten (<Cloud size={14} className="inline-block mx-1"/>) gelten nicht nur für Text-Assistenten, sondern auch für andere KI-Anwendungen wie Bildgeneratoren, Übersetzungstools oder Sprachausgaben.
          </p>

          <p>
            Gerade im Bildungskontext ist das Verständnis dieser Unterschiede essenziell. Sobald potenziell sensible Daten von Schülerinnen und Schülern (Namen, Noten, persönliche Anliegen) verarbeitet werden sollen, hat der Datenschutz höchste Priorität. Die folgende Simulation hilft dir, den Weg der Daten in den verschiedenen Szenarien nachzuvollziehen.
          </p>
        </CardContent>
      </Card>

      {/* Dritte Karte mit der Simulation */}
      <DataFlowSimulator />

      {/* Optional: Navigation zu vorheriger/nächster Seite */}
      {/*
      <div className="flex justify-between">
        <Link href="/vorherige-seite">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/naechste-seite">
          <Button>
            Weiter <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
      */}
    </div>
  );
}