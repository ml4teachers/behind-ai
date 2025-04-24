'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuideCharacter } from '@/components/guide/guide-character'; // Pfad prüfen
import { Info, MessageSquareText, Image as ImageIcon, Volume2, Sparkles, Cpu, Cloud } from 'lucide-react'; // Passende Icons (Sparkles für multimodal?)
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';

export default function ModelCapabilitiesPage() { // Neuer Name für die Funktion
  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Titelbereich */}
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="explaining" />
        <div>
          {/* Neuer Titel */}
          <h1 className="text-3xl font-bold mb-2 text-purple-900">Text, Bild, Ton: Was KI heute alles kann</h1>
          <p className="text-lg text-gray-600">
            Entdecke die vielseitigen Fähigkeiten moderner KI-Modelle.
          </p>
        </div>
      </div>

      {/* Card 1: Multimodale KI */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Das Zeitalter der multimodalen KI</CardTitle>
          <CardDescription>
            Moderne Modelle verstehen und erzeugen mehr als nur Text.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="mb-4">
            Noch vor wenigen Jahren waren KI-Modelle meist auf eine einzige Modalität spezialisiert – beispielsweise Text, Bilder oder Sprache. Seitdem hat sich jedoch ein klarer Trend zu <strong>multimodalen</strong> Modellen entwickelt. Diese Modelle können verschiedene Arten von Informationen (Modalitäten) gleichzeitig verarbeiten und generieren.
            </p>
          <p className="mb-4">
            Bekannte Beispiele sind <strong>GPT-4o</strong> ("Omni") von OpenAI oder <strong>Gemini</strong> von Google. Sie können nahtlos zwischen Text, Bildern und gesprochener Sprache wechseln. Aber auch kleinere, quelloffene Modelle wie <strong>Gemma 3</strong> (ebenfalls Google) werden zunehmend multimodal und können teilweise sogar lokal auf leistungsfähigerer Hardware laufen.
          </p>
          <p>
            Das heisst, die Grenzen zwischen "Textgenerator", "Bildgenerator" oder "Sprachassistent" verschwimmen. Ein Modell kann oft mehrere dieser Rollen übernehmen. Entscheidend wird eher, <strong>welche Fähigkeiten</strong> ein Modell besitzt und <strong>wie gut</strong> es diese beherrscht.
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Kernfähigkeiten */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ein Blick auf die Kernfähigkeiten</CardTitle>
          <CardDescription>
            Welche Aufgaben können moderne KI-Modelle übernehmen?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Statt in starren Modelltypen denken wir besser in Fähigkeiten oder Modalitäten, die ein Modell haben kann:
          </p>
           <ul className="list-none space-y-4 mb-4">
             <li className="flex items-start gap-3">
               <MessageSquareText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
               <div><strong>Textverarbeitung:</strong> Die Grundlage vieler Modelle. Umfasst Verstehen, Generieren, Übersetzen, Zusammenfassen von Text, Beantworten von Fragen, oft auch Code-Generierung.</div>
             </li>
             <li className="flex items-start gap-3">
               <ImageIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
               <div><strong>Bildverständnis/-erzeugung:</strong> Die Fähigkeit, Bilder zu analysieren und zu beschreiben (Verständnis) oder Bilder aus Text zu generieren (Erzeugung).</div>
             </li>
             <li className="flex items-start gap-3">
               <Volume2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
               <div><strong>Sprachverständnis/-erzeugung:</strong> Die Fähigkeit, gesprochene Sprache zu verstehen (Audio-Input, STT) und/oder Text als natürlich klingende Sprache auszugeben (Audio-Output, TTS).</div>
             </li>
              <li className="flex items-start gap-3">
               <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
               <div><strong>Weitere Fähigkeiten:</strong> Manche Modelle können auch Videos verstehen, komplexe Schlussfolgerungen ziehen ("Reasoning"), externe Werkzeuge nutzen ("Function Calling") oder über längere Gespräche hinweg den Kontext behalten (grosses Kontextfenster).</div>
             </li>
           </ul>
           <p>
            Ein multimodales Modell kombiniert mehrere dieser Fähigkeiten.
           </p>
        </CardContent>
      </Card>

       {/* Card 3: Lokal vs. Cloud im multimodalen Kontext */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fähigkeiten auf dem Prüfstand: Lokal vs. Cloud</CardTitle>
          <CardDescription>
            Können lokale Modelle mit den Cloud-Giganten mithalten?
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="mb-4">
             Die Unterscheidung zwischen lokaler Ausführung und Cloud/API bleibt auch bei multimodalen Modellen zentral. Selbst wenn kleinere Modelle wie Gemma 3 beeindruckende multimodale Fähigkeiten haben und lokal laufen können, gibt es oft noch Unterschiede zu den riesigen Cloud-Modellen:
           </p>

          {/* Infobox - Vergleich */}
           <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 my-6 flex gap-3">
             <Info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
             <div>
               <p className="font-medium text-purple-800 mb-2">Typische Unterschiede (Tendenz):</p>
               <ul className="list-none space-y-2 text-sm text-purple-900">
                 <li className="flex items-start gap-2">
                   <Cpu size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                   <div><strong>Lokal (z.B. Gemma 3 12B):</strong> <br />
                        <span className="ml-4 block"><strong>+</strong> Datenschutz, Kostenkontrolle, Offline.</span>
                        <span className="ml-4 block"><strong>-</strong> Evtl. geringere Qualität/Genauigkeit bei komplexen Aufgaben (Text, Bild, Audio), kleineres Kontextfenster, Setup nötig.</span>
                   </div>
                 </li>
                  <li className="flex items-start gap-2">
                   <Cloud size={16} className="mt-0.5 flex-shrink-0 text-red-600" />
                   <div><strong>Cloud/API (z.B. GPT-4o, Gemini):</strong> <br />
                       <span className="ml-4 block"><strong>+</strong> Höchste Qualität & Leistung über viele Modalitäten, riesiger Kontext, einfache Nutzung via API.</span>
                       <span className="ml-4 block"><strong>-</strong> Daten gehen an Anbieter, laufende Kosten, Internet nötig, Datenschutz gemäss Anbieter-Policy.</span>
                   </div>
                 </li>
               </ul>
                <p className="text-xs text-purple-700 mt-3"><strong>Fazit:</strong> Lokale Modelle werden immer fähiger, auch multimodal! Sie sind super für Datenschutz und Experimente. Für absolute Spitzenleistung über alle Bereiche oder sehr grosse Aufgaben sind Cloud-Modelle oft noch im Vorteil.</p>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Card 4: Interaktive Übung */}
       <Card className="mb-8">
        <CardHeader>
          <CardTitle>Der KI-Fähigkeiten-Explorer</CardTitle>
          <CardDescription>
            Welche Fähigkeiten braucht deine Aufgabe und wie erfüllst du sie am besten?
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm mb-4 text-gray-600">
             Wähle eine Aufgabe. Der Explorer zeigt dir, welche Kernfähigkeiten der KI dafür benötigt werden und vergleicht die typischen Vor- und Nachteile, wenn du diese Fähigkeit über ein lokales Modell oder eine Cloud-API nutzen würdest.
           </p>
          {/* Hier kommt die NEUE Simulator-Komponente */}
        </CardContent>
      </Card>

      {/* Optional: Navigation */}
      {/* ... Navigation Buttons ... */}

    </div>
  );
}