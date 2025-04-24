'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuideCharacter } from '@/components/guide/guide-character'; // Pfad prüfen
import { Info, HardDrive, Cloud, AlertTriangle, Wallet, Receipt } from 'lucide-react'; // Passende Icons
import { ApiCostSimulator } from '@/components/visualizations/cost-calculator'; // Pfad zur neuen Komponente
import Link from 'next/link'; // Für Links zu anderen Seiten

export default function CostsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Titelbereich */}
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="thinking" /> {/* z.B. nachdenklich */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-orange-900">Was kostet die KI?</h1>
          <p className="text-lg text-gray-600">
            Ein Blick auf die Kosten von lokaler Nutzung und Cloud-Diensten.
          </p>
        </div>
      </div>

      {/* Card 1: Lokal vs. Cloud Kosten */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Einmalige Investition vs. Laufende Kosten</CardTitle>
          <CardDescription>
            Wie sich die Kostenmodelle grundlegend unterscheiden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-orange-800 mb-2 flex items-center"><HardDrive className="w-5 h-5 mr-2"/>Lokale Nutzung</h3>
              <p className="text-sm mb-2">
                Wenn du KI-Modelle auf deinem eigenen Computer laufen lässt, fallen die Hauptkosten bei der Anschaffung der Hardware an. Ein leistungsstarker PC oder vor allem eine gute Grafikkarte können teuer sein.
              </p>
              <p className="text-sm">
                Die laufenden Kosten beschränken sich meist auf den Stromverbrauch, der bei normaler Nutzung für Einzelpersonen oft vernachlässigbar ist. Open-Source-Software zur Ausführung (wie Ollama) ist häufig kostenlos.
              </p>
              <p className="text-sm mt-2"><strong>Kern:</strong> Hohe Anfangsinvestition möglich, danach sehr geringe laufende Kosten.</p>
            </div>
            <div>
               <h3 className="font-semibold text-orange-800 mb-2 flex items-center"><Cloud className="w-5 h-5 mr-2"/>Cloud/API-Nutzung</h3>
               <p className="text-sm mb-2">
                 Bei der Nutzung von KI über das Internet (Cloud-Dienste, APIs) zahlst du in der Regel für die tatsächliche Nutzung. Es ist wie beim Strom- oder Wasserverbrauch: Je mehr du nutzt, desto mehr kostet es.
               </p>
               <p className="text-sm">
                 Die Abrechnung erfolgt oft über "Tokens" – kleine Texteinheiten, aus denen deine Anfragen und die Antworten bestehen (mehr dazu im Kapitel <Link href="/tokenization" className="text-orange-700 underline hover:text-orange-900">Tokenisierung</Link>). Für jeden verarbeiteten Token zahlst du einen winzigen Betrag.
               </p>
                <p className="text-sm mt-2"><strong>Kern:</strong> Geringe Einstiegshürde, Kosten steigen mit der Nutzung.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: API Preise */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pay-per-Token: Ein Beispiel (OpenAI)</CardTitle>
          <CardDescription>
            Wie sich API-Kosten zusammensetzen (Stand: April 2025).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            API-Anbieter wie OpenAI haben unterschiedliche Preise für verschiedene Modelle. Leistungsstärkere Modelle kosten mehr pro Token als schnellere, einfachere Modelle. Ein wichtiger Punkt: Oft kosten die generierten Antwort-Tokens (Output) deutlich mehr als die Anfrage-Tokens (Input), da die KI hier die "Arbeit" leistet.
          </p>

          {/* Infobox mit Preisbeispielen */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 my-6 flex gap-3">
            <Info className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800 mb-2">Preisbeispiele von OpenAI (pro 1 Mio. Tokens, gerundet, Stand April 2025):</p>
              <ul className="list-none space-y-2 text-sm text-orange-900">
                 <li><strong>GPT-4.1 nano (Sehr schnell & günstig):</strong> Input ~$0.10 / Output ~$0.40</li>
                 <li><strong>GPT-4.1 mini (Ausgewogen):</strong> Input ~$0.40 / Output ~$1.60</li>
                 <li><strong>o4-mini (Gutes Reasoning, effizient):</strong> Input ~$1.10 / Output ~$4.40</li>
                 <li><strong>o3 (Stärkstes Reasoning):</strong> Input ~$10.00 / Output ~$40.00</li>
                 {/*<li><strong>GPT-4o (Multimodal, stark):</strong> Fine-tuning Input ~$3.75 / Output ~$15.00</li>*/}
              </ul>
               <p className="text-xs text-orange-700 mt-3">
                 <strong>Hinweis:</strong> Dies sind nur Beispiele! Preise ändern sich, und andere Anbieter haben andere Modelle und Kosten. Der Trend geht aber oft zu: Bessere Leistung für ähnliches oder nur leicht höheres Geld ("Value for Money"). Es lohnt sich, das passende Modell für die Aufgabe zu wählen, um Kosten zu sparen.
               </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-6 flex items-center gap-3 text-sm text-yellow-800">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <strong>Wichtig bei Chats:</strong> Bei längeren Konversationen senden viele KI-Systeme bei jeder neuen Nachricht den bisherigen Gesprächsverlauf als Kontext mit. Das erhöht die Input-Tokenzahl pro Runde, wodurch lange Chats teurer werden können als einzelne Anfragen gleicher Länge! (Manche Anbieter nutzen Techniken wie "Cached Input" für günstigere Kontext-Tokens).
            </div>
          </div>

          <p>
            Mit dem folgenden Simulator kannst du die ungefähren Kosten für eine Anfrage bei verschiedenen Modellen abschätzen.
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Simulator */}
       <Card className="mb-8">
        <CardHeader>
          <CardTitle>Kosten-Abschätzung für API-Anfragen</CardTitle>
          <CardDescription>
            Gib einen Text ein und wähle ein Modell, um die ungefähren Token-Kosten zu sehen.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm mb-4 text-gray-600">
             Dieser Simulator nutzt die Tokenisierungs-Logik, um die Anzahl der Input-Tokens zu schätzen. Du kannst auch angeben, wie lang die Antwort etwa sein soll. Beachte, dass dies Schätzungen basierend auf den Beispiel-Preisen sind.
           </p>
          <ApiCostSimulator />
        </CardContent>
      </Card>

      {/* Card 4: Wrapper & Abos */}
       <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sonderfall: Wrapper und Abonnements</CardTitle>
          <CardDescription>
             Andere Kostenmodelle neben der direkten API-Nutzung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
             <div>
               <h3 className="font-semibold text-orange-800 mb-2 flex items-center"><Receipt className="w-5 h-5 mr-2"/>Wrapper / Zwischen-Dienste</h3>
               <p className="text-sm mb-2">
                 Wie im Kapitel <Link href="/lokal-vs-cloud" className="text-orange-700 underline hover:text-orange-900">Lokal vs. Cloud</Link> erwähnt, leiten Wrapper Anfragen (oft anonymisiert) an grosse APIs weiter. Dafür haben sie eigene Preismodelle.
               </p>
                <ul className="list-disc pl-5 space-y-1 text-sm mb-2">
                    <li>Manchmal wird ein <strong>Aufschlag auf den API-Preis</strong> berechnet (z.B. doppelter Token-Preis).</li>
                    <li>Andere bieten <strong>Monats- oder Jahresabos</strong> mit einem Inklusiv-Volumen an (was für Wenig-Nutzer teuer sein kann).</li>
                    <li>Manche haben eine kostenlose Basis-Version mit Einschränkungen.</li>
                </ul>
               <p className="text-sm">
                 Der Aufpreis finanziert den Datenschutz, die eigene Infrastruktur, Entwicklung und Support des Wrappers. Es lohnt sich zu prüfen, wie transparent die Preise im Vergleich zu den zugrundeliegenden API-Kosten sind.
               </p>
             </div>
             <div>
               <h3 className="font-semibold text-orange-800 mb-2 flex items-center"><Wallet className="w-5 h-5 mr-2"/>Abo-Modelle (z.B. ChatGPT Plus)</h3>
               <p className="text-sm mb-2">
                 Direkte Abos bei Anbietern (wie ChatGPT Plus) bieten oft für eine feste Monatsgebühr Zugang zu leistungsfähigen Modellen, manchmal mit bevorzugtem Zugriff oder höheren Nutzungslimits als bei Gratis-Versionen.
               </p>
                <p className="text-sm">
                 Dies kann sich für Vielnutzer lohnen, ist aber weniger flexibel als die nutzungsbasierte API-Abrechnung. Manchmal sind die über Abos zugänglichen Modelle auch leicht anders konfiguriert als die Top-API-Modelle.
               </p>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional: Navigation */}
      {/* ... Navigation Buttons ... */}
    </div>
  );
}