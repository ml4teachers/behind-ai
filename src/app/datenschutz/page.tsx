'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuideCharacter } from '@/components/guide/guide-character'; // Pfad prüfen
import { Info, Lock, FileText, ShieldAlert, AlertTriangle, UserCheck, Trash2 } from 'lucide-react'; // Passende Icons
import Link from 'next/link'; // Für Links zu anderen Seiten

// Definiere das Zitat und den Link
const pdfSource = {
    title: "Rechtliche Auslegeordnung zur Entwicklung und Nutzung von KI im Bildungsraum Schweiz (Thouvenin/Volz, 2024)",
    url: "https://www.educa.ch/sites/default/files/2024-08/KI%20im%20Bildungsbereich_Rechtliche%20Auslegeordnung_2.pdf",
    citationLabel: "Thouvenin/Volz, 2024" // Kurzes Label für Inline-Zitate
};

export default function DataPrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Titelbereich */}
      <div className="flex items-center gap-6 mb-8">
        <GuideCharacter emotion="curious" /> {/* z.B. besorgt oder nachdenklich */}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-red-900">Datenschutz im KI-Einsatz</h1>
          <p className="text-lg text-gray-600">
            Was du wissen musst, wenn KI auf persönliche Daten trifft.
          </p>
        </div>
      </div>

      {/* Card 1: Verantwortung */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wer ist verantwortlich?</CardTitle>
          <CardDescription>
            Die Rollen von Schule, Anbietern und Cloud-Diensten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Beim Einsatz von KI-Werkzeugen im Unterricht ist datenschutzrechtlich in der Regel die <strong>Schule die verantwortliche Stelle</strong>. Das heisst, die Schulleitung oder die zuständige kantonale Behörde trägt die Verantwortung dafür, dass die Datenschutzgesetze (eidgenössisch und kantonal) eingehalten werden.
          </p>
          <p className="mb-4">
            Die Anbieter der KI-Tools oder der Cloud-Infrastruktur handeln meist als <strong>Auftragsbearbeiter</strong>. Sie dürfen die Daten nur gemäss den Anweisungen der Schule bearbeiten. Hierfür sind spezielle Verträge (Auftragsbearbeitungsverträge, AVV) notwendig, die den Umgang mit den Daten regeln.
          </p>
          <p className="text-sm text-gray-600">
             Besondere Vorsicht ist geboten, wenn Daten auf Servern ausserhalb der Schweiz oder der EU gespeichert werden, da dort oft kein gleichwertiger Datenschutz gewährleistet ist. Anbieter sollten idealerweise Serverstandorte in der Schweiz oder EU anbieten.
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Zweckbindung & Training */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wofür werden die Daten genutzt?</CardTitle>
          <CardDescription>
            Zweckbindung und die heikle Frage der Trainingsdaten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Ein zentraler Grundsatz im Datenschutz ist die <strong>Zweckbindung</strong>. Daten, die im schulischen Kontext erhoben werden (z.B. über eine KI-Lernhilfe), dürfen grundsätzlich nur für den Zweck verwendet werden, für den sie erhoben wurden und für den eine gesetzliche Grundlage besteht (z.B. individuelle Förderung der Schüler:innen).
          </p>

          {/* Infobox: Training Data */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 my-6 flex gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 mb-2">Achtung: Verwendung für KI-Training!</p>
              <p className="text-sm text-red-900 mb-2">
                Wenn ein KI-Anbieter die eingegebenen Daten (z.B. deine Anfragen, Schülertexte) nutzt, um seine <strong>eigenen, allgemeinen KI-Modelle zu trainieren</strong> und zu verbessern, ist das eine <strong>Zweckänderung</strong>. Diese Nutzung für kommerzielle Zwecke des Anbieters ist durch die gesetzliche Grundlage der Schule normalerweise <strong>nicht gedeckt</strong>.
              </p>
               <p className="text-sm text-red-900 mb-2">
                 Eine solche Weiterverwendung wäre nur zulässig mit einer spezifischen gesetzlichen Erlaubnis (selten), einer gültigen Einwilligung (im Schulkontext kaum praktikabel und oft nicht freiwillig) oder wenn die Daten sicher anonymisiert werden.
              </p>
               <p className="text-sm text-red-900">
                 Lies die Datenschutzbestimmungen genau! Seriöse Anbieter (insbesondere solche, die sich an den Bildungsbereich oder Unternehmen richten, wie z.B. über Microsoft Azure oder die DeepL API Pro) garantieren oft vertraglich, dass deine Daten <strong>nicht</strong> für das Training ihrer allgemeinen Modelle verwendet werden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

       {/* Card 3: Wichtige Grundsätze */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Weitere Datenschutz-Grundsätze</CardTitle>
          <CardDescription>
             Worauf du und die Anbieter achten müssen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
               <Lock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
               <div>
                   <h4 className="font-medium">Datensicherheit</h4>
                   <p className="text-sm text-gray-700">Schule und Anbieter müssen die Daten durch geeignete technische und organisatorische Massnahmen vor unbefugtem Zugriff, Verlust oder Veränderung schützen. Schnittstellen und Cloud-Nutzung erfordern besondere Aufmerksamkeit.</p>
               </div>
            </div>
             <div className="flex items-start gap-3">
               <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
               <div>
                   <h4 className="font-medium">Transparenz</h4>
                   <p className="text-sm text-gray-700">Auch wenn oft keine Pflicht zur Datenschutzerklärung besteht, wenn eine klare gesetzliche Grundlage existiert, ist es sehr empfehlenswert, Schüler:innen und Eltern aktiv und altersgerecht über den Einsatz von KI und die Datenverarbeitung zu informieren, um Vertrauen zu schaffen.</p>
               </div>
            </div>
             <div className="flex items-start gap-3">
               <UserCheck className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
               <div>
                   <h4 className="font-medium">Datenrichtigkeit & -minimierung</h4>
                   <p className="text-sm text-gray-700">Es dürfen nur korrekte und für den Bildungszweck notwendige Daten verarbeitet werden ("Datenminimierung"). Das Sammeln von Daten "auf Vorrat" ist unzulässig. Falsche Daten können negative Folgen haben.</p>
               </div>
            </div>
             <div className="flex items-start gap-3">
               <Trash2 className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
               <div>
                   <h4 className="font-medium">Speicherbegrenzung</h4>
                   <p className="text-sm text-gray-700">Daten dürfen nur so lange gespeichert werden, wie es für den Zweck erforderlich ist. Kläre, wie lange Daten gespeichert werden und ob/wie sie gelöscht werden können.</p>
               </div>
            </div>
             <p className="text-xs text-gray-500 pt-2">Weitere Aspekte wie das Auskunftsrecht der Betroffenen oder die Pflicht zur Datenschutz-Folgenabschätzung bei hohem Risiko sind ebenfalls relevant.</p>
        </CardContent>
      </Card>

      {/* Card 4: Wrapper & Vertrauen */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vertrauenswürdige Werkzeuge wählen</CardTitle>
          <CardDescription>
            Besonderheiten bei Anonymisierungs-Diensten (Wrappern).
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="mb-4">
             Wie im Kapitel <Link href="/lokal-vs-cloud" className="text-red-700 underline hover:text-red-900">Lokal vs. Cloud</Link> und in der dortigen Simulation gezeigt, können Wrapper eine gute Lösung sein, um leistungsstarke Cloud-KI datenschutzfreundlicher zu nutzen. Aber Vorsicht ist geboten!
           </p>
           {/* Infobox: Wrapper Trust */}
           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6 flex gap-3">
             <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
             <div>
               <p className="font-medium text-yellow-800 mb-2">Wichtige Punkte bei Wrappern:</p>
               <ul className="list-disc pl-5 space-y-1.5 text-sm text-yellow-900">
                 <li><strong>Wer ist der Anbieter?</strong> Ist der Wrapper-Anbieter selbst vertrauenswürdig und transparent bezüglich seiner eigenen Datensicherheit und Geschäftspraktiken?</li>
                 <li><strong>Wo werden Daten verarbeitet/gespeichert?</strong> Findet die Anonymisierung und evtl. Zwischenspeicherung in der Schweiz/EU statt? Wie lange wird gespeichert? Gibt es Löschmöglichkeiten?</li>
                 <li><strong>Was passiert mit den Originaldaten?</strong> Der Wrapper *sieht* zwangsläufig die Originaldaten, um sie zu anonymisieren. Was macht er damit? Werden sie nach der Verarbeitung gelöscht?</li>
                 <li><strong>Welche Garantien gibt es?</strong> Gibt der Anbieter klare Zusagen (idealerweise vertraglich), dass Daten nicht für andere Zwecke (z.B. eigenes Training) verwendet werden und die Anonymisierung effektiv ist?</li>
                  <li><strong>Transparenz:</strong> Sind die Datenschutzbestimmungen und die Funktionsweise klar und verständlich erklärt?</li>
               </ul>
               <p className="text-xs text-yellow-700 mt-3">Beispiele wie Schabi zeigen, dass solche datenschutzfreundlichen Konfigurationen (z.B. über Azure OpenAI mit entsprechenden Verträgen) technisch möglich sind.</p>
             </div>
           </div>
             <p>
                Prüfe Angebote kritisch und bevorzuge Anbieter, die speziell für den Bildungsbereich konzipiert wurden und hohe Datenschutzstandards nachweisen können.
             </p>
        </CardContent>
      </Card>

      {/* Card 5: Fazit & Link */}
      <Card className="mb-8 border-l-4 border-red-700">
        <CardHeader>
            <CardTitle>Fazit: Bewusste Auswahl ist entscheidend</CardTitle>
        </CardHeader>
        <CardContent>
             <p className="mb-4">
                Beim Einsatz von KI im Unterricht ist eine sorgfältige Prüfung der Werkzeuge, der Datenflüsse, der Speicherorte und der Nutzungsbedingungen oft unerlässlich. Gib lokalen Lösungen oder geprüften, transparenten Wrappern den Vorzug, wenn sensible Daten im Spiel sind.
             </p>
             <div className="mt-6 pt-4 border-t">
                 <p className="text-sm font-medium text-gray-700 mb-2">Weiterführende Informationen:</p>
                 <div className="flex items-center gap-2">
                     <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                     <a href={pdfSource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-red-700 underline hover:text-red-900">
                         {pdfSource.title}
                     </a>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Diese Seite basiert teilweise auf den Erkenntnissen dieses Dokuments.</p>
             </div>
        </CardContent>
      </Card>

       {/* Optional: Navigation */}
       {/* ... Navigation Buttons ... */}

    </div>
  );
}