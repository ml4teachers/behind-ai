'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuideCharacter } from '@/components/guide/guide-character'; // Pfad prüfen
import { Info, Cpu, MemoryStick, Scaling, Image as ImageIcon, Mic } from 'lucide-react'; // Zusätzliche Icons für Hinweis
import { HardwareChecker } from '@/components/visualizations/hardware-checker'; // Pfad zur neuen Komponente

export default function HardwareCheckPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Titelbereich (unverändert) */}
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="curious" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-teal-900">Braucht KI einen Supercomputer?</h1>
          <p className="text-lg text-gray-600">
            Warum manche KI-Modelle auf deinem Gerät laufen – und andere nicht.
          </p>
        </div>
      </div>

      {/* Card 1 (unverändert) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Warum die Hardware eine Rolle spielt</CardTitle>
          <CardDescription>
            KI-Modelle sind riesig und brauchen "Arbeitsplatz".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ... Inhalt von Card 1 unverändert ... */}
           <p className="mb-4">
            Stell dir ein KI-Sprachmodell wie ein riesiges Netz aus Milliarden von Verbindungen vor, das all sein Wissen enthält. Um dieses Netz nutzen zu können, muss es in den Speicher deines Computers geladen werden. Je grösser und komplexer das Modell, desto mehr Speicherplatz braucht es – ähnlich wie eine grosse Werkstatt mehr Platz benötigt als ein kleiner Schreibtisch.
          </p>
          <p className="mb-4">
            Zwei Komponenten sind dabei besonders wichtig:
          </p>
          <ul className="list-none space-y-3 mb-4">
            <li className="flex items-start gap-3">
              <MemoryStick className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Arbeitsspeicher (RAM):</strong> Das Kurzzeitgedächtnis deines Computers. Hier wird das Modell "abgelegt", um damit arbeiten zu können.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" /> {/* Symbol für Rechenleistung */}
              <div>
                <strong>Rechenleistung (CPU/GPU):</strong> Das "Denken" der KI erfordert viele Berechnungen. Grafikkarten (GPUs) mit eigenem schnellen Speicher (VRAM) sind dafür oft viel besser geeignet als der Hauptprozessor (CPU). Sie sind wie spezialisierte "Rechenknechte".
              </div>
            </li>
          </ul>
          <p>
            Wenn nicht genug schneller Speicher (vor allem VRAM der Grafikkarte) vorhanden ist, muss der langsamere Arbeitsspeicher (RAM) aushelfen, oder die Berechnungen laufen nur auf der CPU – beides macht die KI deutlich langsamer.
          </p>
        </CardContent>
      </Card>

      {/* Card 2 (mit Ergänzung) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Modellgrössen und ihre typischen Anforderungen</CardTitle>
          <CardDescription>
            Nicht jedes KI-Modell braucht gleich viel Power.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Es gibt KI-Modelle in sehr unterschiedlichen Grössen, oft gemessen in Milliarden von "Parametern" (den Verbindungen im Netz). Glücklicherweise gibt es Tricks ("Quantisierung"), um Modelle kleiner zu machen, damit sie weniger Speicher brauchen und schneller laufen, manchmal mit kleinen Abstrichen bei der Qualität. Das ermöglicht es, auch auf normaler Hardware schon einiges zu erreichen.
          </p>

          {/* Infobox - Vereinfacht (unverändert) */}
          <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 my-6 flex gap-3">
             {/* ... Inhalt der Infobox unverändert ... */}
             <Info className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-teal-800 mb-2">Grössenordnungen (Beispiele für Sprachmodelle):</p> {/* Kleine Ergänzung im Titel */}
              <ul className="list-none space-y-2 text-sm text-teal-900">
                 <li className="flex items-start gap-2">
                   <Scaling size={16} className="mt-0.5 flex-shrink-0"/>
                   <div><strong>Kleine Modelle (z.B. Phi-3 Mini, ~3B):</strong> Laufen oft schon auf Smartphones oder einfacheren Laptops (wenig RAM/VRAM nötig). Gut für spezifische Aufgaben.</div>
                 </li>
                 <li className="flex items-start gap-2">
                    <Scaling size={16} className="mt-0.5 flex-shrink-0"/>
                    <div><strong>Mittlere Modelle (z.B. Llama 3 8B, Mistral 7B):</strong> Benötigen einen modernen Computer, idealerweise mit einer mittelstarken Grafikkarte (z.B. 6-8 GB VRAM) oder viel RAM. Allrounder für viele Textaufgaben.</div>
                 </li>
                 <li className="flex items-start gap-2">
                    <Scaling size={16} className="mt-0.5 flex-shrink-0"/>
                    <div><strong>Grosse Modelle (z.B. Llama 3 70B):</strong> Erfordern spezielle, teure Hardware mit sehr viel VRAM (z.B. 40GB+). Lokal nur für Enthusiasten oder Profis machbar.</div>
                 </li>
                 <li className="flex items-start gap-2">
                    <Scaling size={16} className="mt-0.5 flex-shrink-0"/>
                    <div><strong>Sehr Grosse Modelle (z.B. GPT-4 Klasse):</strong> Laufen aufgrund ihrer enormen Grösse praktisch nur in Rechenzentren der grossen Anbieter (Cloud/API).</div>
                 </li>
              </ul>
               <p className="text-xs text-teal-700 mt-3"><strong>Vergleich:</strong> Typische Laptops haben 8-16GB RAM und oft keine dedizierte GPU (nur Shared Memory). Gaming-PCs haben 16-32GB RAM und 6-16GB VRAM.</p>
            </div>
          </div>

          {/* ***** NEUER HINWEIS HIER EINGEFÜGT ***** */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 my-6 flex items-center gap-3 text-sm text-gray-700">
             <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
             <div>
                <strong>Übrigens:</strong> Nicht nur die Grösse des Sprachmodells, auch die <strong>Art der Aufgabe</strong> beeinflusst die Hardware. Das Erzeugen von Bildern (<ImageIcon size={14} className="inline-block mx-1"/>) braucht oft besonders leistungsfähige Grafikkarten, während eine einfache Sprachausgabe (<Mic size={14} className="inline-block mx-1"/>) meist weniger anspruchsvoll ist.
             </div>
          </div>
          {/* ***** ENDE NEUER HINWEIS ***** */}

          <p>
            Die folgende interaktive Simulation lässt dich erkunden, wie sich unterschiedliche Hardware-Ausstattungen auf die Möglichkeit auswirken, verschiedene <strong>Sprachmodell</strong>grössen lokal auszuführen. {/* Fokus auf Sprachmodelle hier explizit */}
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Simulator (unverändert) */}
      <Card className="mb-8">
        {/* ... Header und Inhalt von Card 3 unverändert ... */}
         <CardHeader>
          <CardTitle>Hardware-Explorer: Was wäre wenn?</CardTitle>
          <CardDescription>
            Entdecke spielerisch den Zusammenhang zwischen Modellgrösse und Hardware.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm mb-4 text-gray-600">
             Wähle eine Modellgrösse und verschiedene Hardware-Ausstattungen aus. Der Explorer zeigt dir, ob das Modell unter diesen Bedingungen voraussichtlich gut, langsam oder gar nicht lokal laufen würde. Es ist keine exakte Diagnose für deinen PC, sondern eine Veranschaulichung der Anforderungen.
           </p>
          <HardwareChecker />
        </CardContent>
      </Card>

      {/* Optional: Navigation */}
      {/* ... Navigation Buttons ... */}

    </div>
  );
}