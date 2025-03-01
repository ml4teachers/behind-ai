import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GuideCharacter } from '@/components/guide/guide-character'

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="happy" size="lg" />
        <div>
          <h1 className="text-4xl font-bold mb-3 text-violet-900">Was steckt hinter ChatGPT?</h1>
          <p className="text-xl text-gray-600">
            Entdecke, wie KI-Sprachmodelle funktionieren - ganz einfach erklärt!
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Was ist ein Sprachmodell?</CardTitle>
          <CardDescription>
            Eine einfache Einführung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Ein KI-Sprachmodell ist wie ein sehr schlauer Textvorhersager. Es hat viele Texte gelesen und 
            kann ziemlich gut vorhersagen, welches Wort als nächstes kommen könnte.
          </p>
          <p>
            Stell dir vor, jemand sagt: &quot;Der Himmel hat die Farbe...&quot; - du könntest wahrscheinlich raten, dass &quot;blau&quot; 
            als nächstes kommen könnte. KI-Sprachmodelle machen genau das, nur mit viel mehr Daten und für 
            jeden möglichen Text!
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Unsere Entdeckungsreise</CardTitle>
          <CardDescription>
            Was wir gemeinsam lernen werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-5 list-disc">
            <li>Wie Text in kleine Stücke zerlegt wird</li>
            <li>Wie das Modell das nächste Wort vorhersagt</li>
            <li>Woher die Trainingsdaten kommen</li>
            <li>Wie Wörter im Modell gespeichert sind</li>
            <li>Wie das Modell auf wichtige Wörter &quot;achtet&quot;</li>
            <li>Wie das Modell trainiert wird</li>
            <li>Wie Menschen dem Modell Feedback geben</li>
            <li>Wie KI besser und genauer werden kann</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link href="/tokenization">
          <Button size="lg" className="gap-2">
            Starte die Entdeckungsreise
            <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}