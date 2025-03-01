import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Ressourcen und Hintergrund</h1>
      
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Über diese Webseite</CardTitle>
            <CardDescription>Entstehung und Hintergrund</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Diese Webseite wurde in ca. 10 Stunden gemeinsam mit dem neuen Tool Claude Code erstellt
              und dafür etwa CHF 15.- in API-Kosten für das Modell Claude 3.7 ausgegeben.
            </p>
            <p>
              <Link href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" 
                className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">
                Weitere Informationen zum Claude Code Tool
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Andrej Karpathy: LLMs erklärt</h2>
        <p className="mb-4">
          Diese Webseite kratzt nur an der Oberfläche der beiden kürzlich erschienenen Videos von Andrej Karpathy
          und soll durch interaktive Anwendungen ermöglichen, hinter die Funktionsweise von KI-Tools,
          die große Sprachmodelle nutzen, zu blicken.
        </p>

        <div className="mb-6">
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg shadow-md"
              src="https://www.youtube.com/embed/7xTGNNLPyMI"
              title="ChatGPT & LLMs: A Complete Introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Dieses Video dauert drei Stunden und geht zu jeder Erklärung auf dieser Seite noch viel stärker ins technische Detail.
            Es ist ein umfassender Einblick in die Large Language Model (LLM) AI-Technologie, die ChatGPT und verwandte Produkte antreibt.
          </p>
        </div>

        <div className="mb-6">
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-lg shadow-md"
              src="https://www.youtube.com/embed/EWvNQjAaOHw"
              title="How I use ChatGPT"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Der Titel "How I use LLMs" täuscht, da auch hier wieder sehr viel über die Nützlichkeit und Funktionsweise von LLMs erzählt wird.
            Zum Beispiel betont er, wie präsent Halluzinationen immer noch sind auch in den modernsten, grössten und
            teilweise sehr teuren KI-Tool-Abos.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Datenquellen</h2>
        <p className="mb-4">
          Die Seite 
            <Link href="/daten" className="text-violet-600 hover:underline font-medium"> Daten </Link> 
          wurde inspiriert durch das Video von Andrej Karpathy. Der Code sowie die Daten stammen von Huggingface:
        </p>
        <Link 
          href="https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1" 
          className="text-violet-600 hover:underline font-medium" 
          target="_blank" 
          rel="noopener noreferrer">
          HuggingFace FineWeb Demo
        </Link>
        <p className="mt-4">
          Die deutschen Textausschnitte wurden mit Hilfe von Google's kleinstem LLM "gemini-2.0-flash-lite" kostenlos per API übersetzt.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Prozess</h2>
        <p>
          Rückblickend auf den gesamten Prozess muss man sagen, dass es völlig unglaublich ist, dass so eine Webseite 
          mit so vielen interaktiven Elementen heute in so kurzer Zeit erstellt werden kann. Der Quellcode der Webseite ist auf Github verfügbar. 
          Es ist unklar, ob die Webseite aktualisiert wird. Das ist ein Projekt, das in meiner Freizeit entstanden ist.
        </p>
      </section>

      <Separator className="my-8" />

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Über den Autor</h2>
        <p className="mb-4">
          In meiner Arbeitszeit arbeite ich an der PH Zug als Dozent für die Fachdidaktik Medienbildung und Informatik. 
          Meine Arbeitsschwerpunkte sind Künstliche Intelligenz in der Lehrpersonenbildung und Digitalisierung im Unterricht.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">PH Zug</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href="https://www.zg.ch/behoerden/direktion-fur-bildung-und-kultur/phzg/kontakte/zurfluh-thomas?searchterm=thomas+zurfluh" 
                className="text-violet-600 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer">
                Profil an der PH Zug
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">YouTube</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href="http://youtube.com/@thomaszurfluh453" 
                className="text-violet-600 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer">
                YouTube Kanal
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">LinkedIn</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href="https://www.linkedin.com/in/thomas-zurfluh-b6720b203/" 
                className="text-violet-600 hover:underline" 
                target="_blank" 
                rel="noopener noreferrer">
                LinkedIn Profil
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <p className="mb-4">
            Ich finde es wichtig zu erwähnen, dass ich einen Master in Fachdidaktik Medien und Informatik an der PH Schwyz gemacht habe. 
            Ich habe ein Semester lang die Grundlagen des Programmierens kennengelernt. Der Rest ist selbst beigebracht. Was man hier auf dieser Seite sieht ist eindeutig "Vibe Coding"...
          </p>
          
          <div className="space-y-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Vibe Coding</h3>
              <blockquote className="border-l-4 border-violet-400 pl-4 italic">
                <p>
                  There's a new kind of coding I call "vibe coding", where you fully give in to the vibes, embrace exponentials, and forget that the code even exists. It's possible because the LLMs (e.g. Cursor Composer w Sonnet) are getting too good. Also I just talk to Composer with SuperWhisper so I barely even touch the keyboard. I ask for the dumbest things like "decrease the padding on the sidebar by half" because I'm too lazy to find it. I "Accept All" always, I don't read the diffs anymore. When I get error messages I just copy paste them in with no comment, usually that fixes it. The code grows beyond my usual comprehension, I'd have to really read through it for a while. Sometimes the LLMs can't fix a bug so I just work around it or ask for random changes until it goes away. It's not too bad for throwaway weekend projects, but still quite amusing. I'm building a project or webapp, but it's not really coding - I just see stuff, say stuff, run stuff, and copy paste stuff, and it mostly works.
                </p>
              </blockquote>
              <div className="mt-2 text-sm">
                <a 
                  href="https://x.com/karpathy/status/1886192184808149383" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline">
                  — Andrej Karpathy auf X
                </a>
              </div>
            </div>

            <p className="mt-6">
            Ich selbst bin kein guter Coder, vor allem kein Web-Developer. Ich habe an der vorliegenden Seite
            fast keinen Code verändert, sondern nur in natürlicher Sprache gesagt, was mein Code machen soll und ab und zu mal ein paar Zeilen angepasst.
            Es hilft mir, dass ich den Code verstehe, aber ich möchte alle Lesenden dazu ermutigen, sich dem Vibe Coding einmal anzunehmen.
            Dank LLMs ist die Hürde zum Programmiereinstieg inzwischen so tief gefallen, dass das wirklich jeder und jede ausprobieren kann.
            Oder in den Worten von Andrej Karpathy (Januar 2023):
          </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Programmieren mit natürlicher Sprache</h3>
              <blockquote className="border-l-4 border-violet-400 pl-4 italic">
                <p>
                  "The hottest new programming language is English"
                </p>
              </blockquote>
              <div className="mt-2 text-sm">
                <a 
                  href="https://x.com/karpathy/status/1617979122625712128" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline">
                  — Andrej Karpathy auf X
                </a>
              </div>
            </div>
          </div>
        
        </div>
      </section>
    </div>
  )
}