import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GuideCharacter } from '@/components/guide/guide-character' // Pfad prüfen
import { Cpu, ShieldCheck } from 'lucide-react'; // Icons für die Bereiche

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Titelbereich - Leicht angepasst */}
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="happy" size="lg" />
        <div>
          {/* Breiterer Titel */}
          <h1 className="text-4xl font-bold mb-3 text-gray-900">KI verstehen: Von der Technik zur Praxis</h1>
          {/* Angepasster Untertitel */}
          <p className="text-xl text-gray-600">
            Entdecke, wie Sprachmodelle funktionieren <span className="font-semibold text-indigo-600">und</span> worauf du bei ihrer Nutzung achten musst.
          </p>
        </div>
      </div>

      {/* Intro Card - Leicht angepasst */}
      <Card className="mb-8 border-indigo-600">
        <CardHeader>
          <CardTitle>Was ist ein Sprachmodell (LLM)?</CardTitle>
          <CardDescription>
            Eine einfache Einführung in die Grundlage vieler KI-Tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Ein KI-Sprachmodell ist wie ein sehr schlauer Textvorhersager oder Gesprächspartner. Es hat riesige Mengen an Text gelesen und gelernt, Muster und Zusammenhänge in der Sprache zu erkennen. Dadurch kann es Texte fortsetzen, Fragen beantworten, zusammenfassen und vieles mehr.
          </p>
          <p>
            Es versucht im Grunde, immer das wahrscheinlichste nächste Wort (oder den nächsten "Token") vorherzusagen – nur eben auf einem extrem hohen Niveau und mit einem riesigen Wissensschatz.
          </p>
        </CardContent>
      </Card>

      {/* Entdeckungsreise Card - NEU STRUKTURIERT */}
      <Card className="mb-8 border-teal-600">
        <CardHeader>
          <CardTitle>Unsere Entdeckungsreise</CardTitle>
          <CardDescription>
            Zwei Wege, um KI besser zu verstehen:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bereich 1: Hinter den Modellen */}
          <div>
             <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-indigo-800">
                <Cpu size={20} /> Hinter den Modellen: Wie funktioniert die Technik?
             </h3>
             <p className="text-sm text-gray-700 mb-3 ml-7">Tauche ein in die technischen Konzepte, die Sprachmodelle antreiben:</p>
             <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-12 list-disc text-sm">
                <li>Tokenisierung: Text in Stücke zerlegen</li>
                <li>Next-Token-Prediction: Das nächste Wort vorhersagen</li>
                <li>Training: Wie die KI lernt</li>
                <li>Embeddings: Wörter als Zahlen darstellen</li>
                <li>Finetuning & RLHF: Vom Basismodell zum Assistenten</li>
                <li>RAG & Chain-of-Thought: Fortgeschrittene Techniken</li>
             </ul>
          </div>

           {/* Bereich 2: KI im Einsatz */}
           <div>
             <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-teal-800">
                 <ShieldCheck size={20} /> KI im Einsatz: Worauf muss ich achten?
             </h3>
              <p className="text-sm text-gray-700 mb-3 ml-7">Verstehe die praktischen Aspekte der KI-Nutzung im Alltag:</p>
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-12 list-disc text-sm">
                <li>Lokal vs. Cloud: Wo laufen die Daten?</li>
                <li>Hardware-Check: Was braucht mein Computer?</li>
                {/* <li>Modell-Fähigkeiten: Was kann KI noch? (Optional, wenn Seite doch existiert)</li> */}
                <li>Kosten: Was kostet die Nutzung?</li>
                <li>Datenschutz: Wie sicher sind meine Daten?</li>
             </ul>
           </div>
        </CardContent>
      </Card>

      {/* Call to Action Buttons - Zwei Buttons */}
      <div className="flex justify-center gap-4"> {/* Fügt Abstand zwischen den Buttons hinzu */}
        <Link href="/tokenization"> {/* Link zum Start des ersten Bereichs */}
          <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Cpu size={18} /> Funktionsweise entdecken
            <span aria-hidden="true">→</span>
          </Button>
        </Link>
        <Link href="/lokal-vs-cloud"> {/* Link zum Start des zweiten Bereichs */}
          <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
             <ShieldCheck size={18} /> Nutzung verstehen
            <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}