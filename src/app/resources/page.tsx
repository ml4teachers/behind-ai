import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText } from 'lucide-react'; // Icon für Dokumente

// Definiere das Zitat und den Link für das PDF
const pdfSource = {
    title: "Rechtliche Auslegeordnung zur Entwicklung und Nutzung von KI im Bildungsraum Schweiz",
    authors: "Thouvenin/Volz", // Optional: Autoren für Anzeige
    year: 2024, // Optional: Jahr für Anzeige
    url: "https://www.educa.ch/sites/default/files/2024-08/KI%20im%20Bildungsbereich_Rechtliche%20Auslegeordnung_2.pdf",
};

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Ressourcen und Hintergrund</h1>

      {/* Über diese Webseite - Aktualisiert */}
      <section className="mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Über diese Webseite</CardTitle>
            <CardDescription>Entstehung, Werkzeuge und Hintergrund</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Diese Webseite startete als Experiment mit dem damals neuen "Code Claude"-Tool von Anthropic (März 2025, Initial Commit: 1. März 2025). Seither wurde sie mithilfe verschiedener KI-Assistenten wie GitHub Copilot, Cursor und insbesondere <strong className="font-semibold">Gemini 2.5 Pro</strong> (genutzt via VS Code und der Gemini Advanced App, Stand April 2025) im <Link href="#vibe-coding" className="text-blue-600 hover:underline font-medium">Vibe Coding</Link>-Stil weiterentwickelt.
            </p>
            <p>
              Der Fokus liegt darauf, komplexe KI-Themen – sowohl die Technik dahinter als auch die praktischen Nutzungsaspekte wie Datenschutz und Kosten – interaktiv und möglichst einfach verständlich aufzubereiten, insbesondere für Lehrpersonen.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Andrej Karpathy Videos */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Andrej Karpathy: LLMs erklärt</h2>
        <p className="mb-4">
          Diese Webseite kratzt nur an der Oberfläche der beiden äusserst sehenswerten Videos von Andrej Karpathy, einem führenden KI-Forscher. Sie bieten tiefere technische Einblicke.
        </p>
        {/* Video 1 */}
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
            Es ist ein umfassender Einblick in die LLM-Technologie, die ChatGPT und verwandte Produkte antreibt.
          </p>
        </div>
        {/* Video 2 */}
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
            Der Titel &quot;How I use LLMs&quot; täuscht, da auch hier wieder sehr viel über die Nützlichkeit und Funktionsweise von LLMs erzählt wird.
            Zum Beispiel betont er, wie präsent Halluzinationen immer noch sind auch in den modernsten, grössten und
            teilweise sehr teuren KI-Tool-Abos.
          </p>
        </div>
      </section>

      {/* Datenquellen - Aktualisiert */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Datenquellen & Inspiration</h2>
         <p className="mb-2">
          Die Seite
            <Link href="/daten" className="text-blue-600 hover:underline font-medium"> Daten </Link>
          wurde inspiriert durch das zweite Video von Andrej Karpathy. Der Code sowie die Daten für die Visualisierung stammen von Huggingface:
        </p>
        <Link
          href="https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1"
          className="text-blue-600 hover:underline font-medium"
          target="_blank"
          rel="noopener noreferrer">
          HuggingFace FineWeb Demo
        </Link>
         <p className="mt-4 text-sm text-gray-600">
         Die deutsche Übersetzung der FineWeb-Daten wurden mit Hilfe von Google's kleinstem LLM "gemini-2.0-flash-lite" kostenlos per API übersetzt.
        </p>
      </section>

      {/* Prozess - Aktualisiert */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Entstehungsprozess</h2>
        <p>
          Der Entstehungsprozess dieser Webseite ist ein Beispiel für <a href="#vibe-coding" className="text-blue-600 hover:underline font-medium">Vibe Coding</a>. Es ist faszinierend, wie schnell heute interaktive Webseiten mithilfe von KI-Assistenten erstellt werden können, auch ohne tiefgreifende Webentwicklungs-Kenntnisse. Der Quellcode der Webseite ist auf Github verfügbar: {" "}
          <a href="https://github.com/ml4teachers/behind-ai" className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">ml4teachers/behind-ai</a>.
          Ob die Webseite weiter aktualisiert wird, ist offen – es ist ein Projekt, das in meiner Freizeit entstanden ist.
        </p>
      </section>

      <Separator className="my-8" />

      {/* Über den Autor - Aktualisiert */}
      <section className="mb-10" id="author">
        <h2 className="text-2xl font-semibold mb-4">Über den Autor</h2>
        <p className="mb-4">
          Ich arbeite an der PH Zug als Dozent für die Fachdidaktik Medienbildung und Informatik. Meine Arbeitsschwerpunkte sind Künstliche Intelligenz in der Lehrpersonenbildung und Digitalisierung im Unterricht.
        </p>

        {/* Links */}
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
            Ich habe einen Master in Fachdidaktik Medien und Informatik (PH Schwyz) und dabei Grundlagen des Programmierens gelernt. Vieles im Bereich Webentwicklung ist aber über die Jahre und vor allem durch die Zusammenarbeit mit KI-Tools entstanden – ganz im Sinne des "Vibe Coding". Aktuell (April 2025) nutze ich für solche Projekte am liebsten Gemini 2.5 Pro, sowohl in VS Code als auch über die Gemini Advanced App.
          </p>

          {/* Vibe Coding Zitat */}
          <div id="vibe-coding" className="space-y-6 mt-6 scroll-mt-20"> {/* ID für Link, scroll-mt für Offset */}
            <div className="bg-white p-4 rounded-lg border">
                 <h3 className="font-medium mb-2">Vibe Coding</h3>
                <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700">
                    <p>"There's a new kind of coding I call "vibe coding", where you fully give in to the vibes... I "Accept All" always, I don't read the diffs anymore... The code grows beyond my usual comprehension... it's not really coding - I just see stuff, say stuff, run stuff, and copy paste stuff, and it mostly works."</p>
                </blockquote>
                <div className="mt-2 text-sm"><a href="https://x.com/karpathy/status/1886192184808149383" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">— Andrej Karpathy auf X</a></div>
            </div>
             <p className="mt-6 text-sm">
                Obwohl ich den Code meist verstehe, habe ich an dieser Seite wenig von Hand geändert, sondern primär in natürlicher Sprache beschrieben, was die KI-Assistenten umsetzen sollen. Ich möchte alle Lesenden ermutigen, sich dem Vibe Coding einmal anzunehmen. Dank LLMs ist die Hürde zum Programmiereinstieg massiv gesunken.
            </p>
             {/* ... Zitat "English" ... */}
             <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Programmieren mit natürlicher Sprache</h3>
                <blockquote className="border-l-4 border-blue-400 pl-4 italic text-gray-700">
                    <p>"The hottest new programming language is English"</p>
                </blockquote>
                <div className="mt-2 text-sm"><a href="https://x.com/karpathy/status/1617979122625712128" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">— Andrej Karpathy auf X</a></div>
              </div>
          </div>

        </div>
      </section>

            {/* Neue Sektion: Wichtige Ressourcen */}
            <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Wichtige Ressourcen</h2>
         <Card>
            <CardHeader>
                <CardTitle className="text-lg">Rechtliche Grundlagen (Schweiz)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
                    <div>
                        <a href={pdfSource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                            {pdfSource.title}
                        </a>
                        <p className="text-sm text-gray-600">({pdfSource.authors}, {pdfSource.year}) – Eine zentrale Quelle für die Datenschutzseite dieser Webseite.</p>
                    </div>
                 </div>
            </CardContent>
         </Card>
      </section>

    </div>
  )
}