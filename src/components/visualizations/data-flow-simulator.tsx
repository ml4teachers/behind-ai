'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Laptop,
  Server,
  ShieldCheck,
  Bot,
  Loader2,
  AlertTriangle,
  Users,
  Bug,
  User,
  MessageSquareText,
  CheckCircle,
  Info,
  Eye,
  Filter,
  Lock,
  List,
  Database, // Icon für Metadaten
  Replace, // Icon für Anonymisierung
  FileText, // Icon für Prompt-Text
  Save, // Icon für Speicherung
  BrainCircuit, // Icon für Training
  ShieldAlert // Icon für Sicherheitswarnung
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DataFlowVisualization } from './data-flow-visualization'; // Import der neuen Komponente

// --- Typdefinitionen ---

type Scenario = 'local' | 'api' | 'wrapper';
type AccessEntity = "Benutzer" | "Anonymisierungs-Dienst" | "Modell-Anbieter" | "Anbieter-Mitarbeiter" | "Dritte/Hacker";
type AccessDataType = "original" | "anonymisiert" | "metadaten" | "keine";

type AccessDetail = {
  entity: AccessEntity;
  dataSeen: AccessDataType;
  accessPossible: boolean;
};

// Angepasst an Backend Zod Schema
type SensitivePart = {
  text: string;
  category: "name" | "location" | "date" | "email" | "health" | "personal" | "other";
  reason: string;
  impact: "low" | "medium" | "high";
};

// Angepasst an Backend Zod Schema
type MetadataInfo = {
  type: "usage_data" | "ip" | "timestamp" | "device_info" | "location" | "other";
  description: string;
  visibleTo: Array<"Modell-Anbieter" | "Anbieter-Mitarbeiter" | "Dritte/Hacker">;
};

// Angepasst an Backend Zod Schema
type AnonymizationDetail = {
  originalText: string;
  anonymizedText: string;
  technique: "redaction" | "generalization" | "masking" | "synthetic" | "tokenization" | "other";
  category: "name" | "location" | "date" | "email" | "health" | "personal" | "other";
};

// Schema für Datenspeicherung (aus Backend übernommen)
type DataStorageInfo = {
  location: string;
  duration: string;
  purpose: string;
};

// Angepasst an Backend Zod Schema
type SimulationResponse = {
  scenario: Scenario;
  processedPromptForApi: string | null;
  simulatedQuality: "einfach" | "detailliert";
  accessDetails: AccessDetail[];
  simulatedAnswer: string | null;
  sensitiveParts?: SensitivePart[]; // Angepasst
  metadataInfo?: MetadataInfo[]; // Neu
  anonymizationDetails?: AnonymizationDetail[]; // Neu
  dataStorageInfo?: DataStorageInfo[]; // NEU
  usedForTraining?: boolean; // NEU
  error?: string;
};

// ChatMessage Typ erweitert
type ChatMessage = {
    id: number;
    sender: 'user' | 'system' | 'wrapper' | 'apiProvider' | 'localModel' | 'quality' | 'access' | 'loader' | 'sensitive' | 'metadata' | 'anonymization' | 'promptDisplay' | 'storage' | 'training'; // Neue Sender
    content: React.ReactNode;
    icon?: React.ElementType;
};

// Vorbereitete Beispiel-Prompts mit Datenschutzrelevanz
type PromptExample = {
  title: string;
  text: string;
  description: string;
  sensitiveInfo?: string;
};

const promptExamples: PromptExample[] = [
  {
    title: "Notenbesprechung (Schüler:in)",
    text: "Formuliere ein Feedback für die Eltern von Ben. Seine Deutschnote im letzten Quartal war 4.0, vor allem wegen Schwächen in der Grammatik. Er ist aber sehr motiviert.",
    description: "Enthält Name, Note und Leistungsbeurteilung eines Schülers.",
    sensitiveInfo: "Name (Ben), Note (4.0), Leistungsdetails (Schwächen Grammatik, Motivation)"
  },
  {
    title: "Übungsanpassung (Schüler:in)",
    text: "Passe diesen Übungstext zum Thema 'Fotosynthese' für die 6. Klasse an. Er ist für Petra, die Legasthenie hat und einfachere Sprache benötigt.",
    description: "Enthält Platzhalter für Name und sensible Eigenschaft (Legasthenie).",
    sensitiveInfo: "Platzhalter Name, Legasthenie (Gesundheitsmerkmal)"
  },
  {
    title: "Bewerbungscheck (Eigene Daten)",
    text: "Redigiere mein Bewerbungsschreiben an die Firma Meier AG: 'Sehr geehrte Frau Schmidt, ich, Simon Müller (geboren am 04.03.1988), bewerbe mich auf die ausgeschriebene Stelle als Projektleiter. Sie können mich unter simon.mueller@email.com erreichen.'",
    description: "Enthält eigenen Namen, Geburtsdatum, E-Mail-Adresse und Empfängername.",
    sensitiveInfo: "Name (Simon Müller), Geburtsdatum, E-Mail, Empfängername (Frau Schmidt), Firmenname (Meier AG)"
  },
  {
    title: "Gesundheitsfrage (Eigene Daten)",
    text: "Ich, Petra Huber aus Luzern, habe seit 3 Wochen Rückenschmerzen nach einem Sturz beim Wandern am Pilatus. Was könnten die Ursachen sein?",
    description: "Enthält Namen, Ort, Gesundheitsinformationen und Unfallhergang.",
    sensitiveInfo: "Name (Petra Huber), Ort (Luzern, Pilatus), Gesundheitsinfo (Rückenschmerzen), Unfall"
  },
  {
    title: "Teamsitzung Notizen (Kollegen)",
    text: "Fasse die wichtigsten Punkte unserer Teamsitzung vom 20. April zusammen: Projekt 'Medientage' Budget wurde genehmigt (Verantwortlich: Fr. Gerber), Hr. Rossi fehlt nächste Woche (krank).",
    description: "Enthält Namen von Kollegen, interne Projektinfos und Abwesenheitsgrund (Gesundheit).",
    sensitiveInfo: "Namen (Fr. Gerber, Hr. Rossi), Interne Info (Budget), Gesundheitsinfo (krank)"
  },
  {
    title: "Konflikt im Team (Kollegen)",
    text: "Meine Kollegin Anna hat die von mir erstellten Arbeitsblätter für den Matheunterricht ohne Rücksprache kopiert und als ihre eigenen bei der Schulleitung eingereicht. Wie soll ich das klären?",
    description: "Enthält Namen Dritter und Details zu einer heiklen Arbeitssituation.",
    sensitiveInfo: "Name einer Dritten (Anna), Konfliktdetails (Urheberrecht/Plagiat), Kontext (Schulleitung)"
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Hilfsfunktion zum Hervorheben schützenswerter Daten im Text
// Nimmt jetzt SensitivePart[] entgegen
const highlightSensitiveParts = (text: string, sensitiveParts?: SensitivePart[]) => {
  if (!sensitiveParts || sensitiveParts.length === 0) return <span>{text}</span>;

  let elements: React.ReactNode[] = [];
  const parts = [...sensitiveParts].sort((a, b) => {
    const posA = text.indexOf(a.text);
    const posB = text.indexOf(b.text);
    // Handle cases where text might not be found (shouldn't happen ideally)
    if (posA === -1) return 1;
    if (posB === -1) return -1;
    return posA - posB;
  });

  let lastIndex = 0;

  for (const part of parts) {
    const startIndex = text.indexOf(part.text, lastIndex);
    if (startIndex === -1) {
        console.warn(`Sensitiver Teil "${part.text}" nicht im Text gefunden.`);
        continue; // Skip if not found
    }

    // Text vor dem sensitiven Teil
    if (startIndex > lastIndex) {
      elements.push(<span key={`text-${lastIndex}-${startIndex}`}>{text.substring(lastIndex, startIndex)}</span>);
    }

    // Sensitiver Teil mit Tooltip (zeigt jetzt Grund und Kategorie)
    elements.push(
      <span
        key={`sensitive-${startIndex}`}
        className="bg-yellow-200 text-gray-900 rounded px-1 mx-0.5 relative group cursor-help"
        title={`${part.reason} (Kategorie: ${part.category}, Risiko: ${part.impact})`}
      >
        {part.text}
        <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded p-1 mb-1 whitespace-nowrap z-10">
          {part.reason} ({part.category}, {part.impact})
        </span>
      </span>
    );

    lastIndex = startIndex + part.text.length;
  }

  // Rest des Textes
  if (lastIndex < text.length) {
    elements.push(<span key={`text-${lastIndex}-end`}>{text.substring(lastIndex)}</span>);
  }

  return <>{elements}</>;
};


export function DataFlowSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('local');
  const [inputText, setInputText] = useState<string>(
    ''
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);

  // Szenario-Details mit verbesserten Beschreibungen und optional angepasstem Titel
  const scenarioDetails = {
    local: {
      title: 'Lokales Modell',
      description: 'Die KI läuft direkt auf deinem Computer. Daten verlassen dein Gerät nicht, aber die Modellgröße und damit die Qualität der Antworten ist begrenzt.',
    },
    api: {
      title: 'Direkt zum Anbieter',
      description: 'Deine Anfrage wird direkt an den Modell-Anbieter (z.B. ChatGPT) gesendet. Höchste Qualität, aber deine Daten sind für den Anbieter und dessen Mitarbeiter sichtbar.',
    },
    wrapper: {
      // Optional: Titel angepasst
      title: 'Sicherer Schul-Wrapper',
      description: 'Ein Zwischendienst (z.B. Schabi) anonymisiert deine Anfrage und leitet sie dann an den Modell-Anbieter weiter. Hohe Qualität bei verbessertem Datenschutz.',
    },
  };


  // Reset bei Szenariowechsel
  useEffect(() => {
    setChatMessages([]);
    setIsLoading(false);
    setErrorText(null);
    setSimulationResult(null);
  }, [selectedScenario]);

  // Auto-Scroll zum Ende der Nachrichten
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);


  // Format AccessDetails für Chat (Anpassung für Hacker)
  const formatAccessDetailsForChat = (accessDetails: AccessDetail[] | undefined): React.ReactNode => {
    if (!accessDetails || accessDetails.length === 0) {
      return "Keine Zugriffsdaten verfügbar.";
    }
    const relevantDetails = accessDetails.filter(d => d.accessPossible && !(selectedScenario === 'local' && d.entity !== 'Benutzer') && !(selectedScenario === 'api' && d.entity === 'Anonymisierungs-Dienst'));

    if (relevantDetails.length === 0 && accessDetails.some(d => d.entity === 'Benutzer')) {
        return (
            <div>
                <strong className="block mb-2">Potenzieller Datenzugriff:</strong>
                <ul className="list-none space-y-1">
                    <li className={`flex items-center text-sm text-green-600`}>
                       <User size={16} className="mr-2 flex-shrink-0" />
                       <span className="font-medium mr-1">Benutzer:</span> sieht unveränderte Daten
                    </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">In diesem Szenario haben keine anderen Dienste Zugriff.</p>
           </div>
       );
    }
    if (relevantDetails.length === 0) {
        return "Keine relevanten Zugriffsdaten für dieses Szenario.";
    }

    return (
      <div>
        <strong className="block mb-2">Potenzieller Datenzugriff:</strong>
        <ul className="list-none space-y-1">
          {relevantDetails.map(detail => {
            let dataText = '';
            let Icon = Info;
            let color = 'text-gray-600';
            switch (detail.dataSeen) {
              case 'original': dataText = 'sieht unveränderte Daten'; Icon = Eye; color = 'text-red-600'; break;
              case 'anonymisiert': dataText = 'sieht anonymisierte Daten'; Icon = ShieldCheck; color = 'text-yellow-700'; break;
              case 'metadaten': dataText = 'sieht nur Metadaten'; Icon = Info; color = 'text-blue-600'; break;
              case 'keine': dataText = 'sieht keine Daten'; Icon = Lock; color = 'text-green-600'; break;
            }
            // Icons für Entitäten
            let EntityIcon = Users;
            if (detail.entity === 'Benutzer') EntityIcon = User;
            if (detail.entity === 'Anonymisierungs-Dienst') EntityIcon = Filter;
            if (detail.entity === 'Modell-Anbieter') EntityIcon = Server;
            if (detail.entity === 'Dritte/Hacker') EntityIcon = Bug; // Hacker Icon

            // Verhindere Anzeige von "Hacker sieht keine Daten" wenn nicht möglich (angepasst)
            // Zeige Hacker immer an, wenn accessPossible true ist, auch wenn dataSeen 'keine' ist (für lokales Szenario)
            // if (detail.entity === 'Dritte/Hacker' && detail.dataSeen === 'keine') return null;

            return (
              <li key={detail.entity} className={`flex items-center text-sm ${color}`}>
                <EntityIcon size={16} className="mr-2 flex-shrink-0" />
                <span className="font-medium mr-1">{detail.entity}:</span> {dataText}
                {/* Hinweis auf Risiko bei Mitarbeitern/Hackern - Immer bei Hacker anzeigen */}
                {(detail.entity === 'Anbieter-Mitarbeiter' || detail.entity === 'Dritte/Hacker') && detail.accessPossible &&
                   <span title="Potenzielles Zugriffsrisiko durch interne Mitarbeiter oder externe Angreifer">
                     <AlertTriangle size={14} className="ml-2 text-orange-500" />
                   </span>
                }
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // handleSend (bleibt funktional gleich, ruft generateMessagesFromResult auf)
  const handleSend = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorText(null);
    setSimulationResult(null);

    const initialUserMessage: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        content: inputText, // Einfach nur Text anzeigen, Hervorhebungen kommen später
        icon: User,
    };
    const loadingMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'loader',
        content: <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />,
    }
    // Alte Nachrichten löschen, User-Nachricht + Loader anzeigen
    setChatMessages([initialUserMessage, loadingMessage]);

    try {
      const response = await fetch('/api/data-flow-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: inputText,
          scenario: selectedScenario
        }),
      });

      // Wichtig: Hier den Typ SimulationResponse verwenden
      const result: SimulationResponse = await response.json();
      setSimulationResult(result); // Speichere das vollständige Ergebnis

      setChatMessages(prev => prev.filter(m => m.sender !== 'loader')); // Loader entfernen

      if (!response.ok || result.error) {
        const errorMsg = result.error || `API Fehler (${response.status})`;
        // Wenn Fallback-Daten vorhanden sind, zeige diese trotzdem an
        if (result?.accessDetails && result?.scenario) {
            setErrorText(`Fehler: ${errorMsg}. Zeige teilweise Daten.`);
            // Generiere Nachrichten basierend auf (möglicherweise unvollständigen) Daten
            generateMessagesFromResult(result, inputText);
        } else {
            throw new Error(errorMsg); // Kein Fallback -> Echter Fehler
        }
      } else {
        // Erfolgsfall: Generiere Nachrichten basierend auf API-Ergebnis
        generateMessagesFromResult(result, inputText);
      }
    } catch (error) {
      console.error("Simulationsfehler:", error);
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setErrorText(`Fehler: ${message}`);
      // Zeige Fehlermeldung im Chat an, aber behalte die User-Nachricht
      setChatMessages(prev => prev.filter(m => m.sender === 'user'));
      setChatMessages(prev => [...prev, {
          id: Date.now() + 8,
          sender: 'system',
          icon: AlertTriangle,
          content: <span className="text-red-600">Fehler bei der Simulation: {message}</span>
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Überarbeitete Funktion zum Generieren der Nachrichten ---
  const generateMessagesFromResult = (result: SimulationResponse, originalInputText: string) => {
    let newMessages: ChatMessage[] = [];
    let messageIdCounter = Date.now() + 2; // Start-ID für neue Nachrichten

    // 1. Sensible Daten hervorheben (im User-Prompt) und als separate Nachricht anzeigen
    if (result.sensitiveParts && result.sensitiveParts.length > 0) {
      // Aktualisiere die User-Nachricht mit hervorgehobenen sensiblen Daten
      setChatMessages(prev => {
        const userMessageIndex = prev.findIndex(m => m.sender === 'user');
        if (userMessageIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[userMessageIndex] = {
            ...updatedMessages[userMessageIndex],
            content: highlightSensitiveParts(originalInputText, result.sensitiveParts)
          };
          return updatedMessages;
        }
        return prev; // Sollte nicht passieren, aber sicher ist sicher
      });

      // Zeige separate Nachricht mit Details zu sensiblen Daten
      newMessages.push({
        id: messageIdCounter++,
        sender: 'sensitive',
        icon: AlertTriangle,
        content: (
          <div>
            <strong className="block mb-1">Potenziell schützenswerte Daten erkannt:</strong>
            <ul className="list-disc pl-5 text-sm space-y-0.5">
              {result.sensitiveParts.map((part, index) => (
                <li key={index}>
                  <span className="font-medium bg-yellow-100 px-1 rounded">{part.text}</span>
                  <span className="text-gray-600"> - {part.reason} (Kategorie: {part.category}, Risiko: {part.impact})</span>
                </li>
              ))}
            </ul>
          </div>
        )
      });
    }

    // 2. Qualitäts-Hinweis
    newMessages.push({
      id: messageIdCounter++,
      sender: 'quality',
      icon: result.simulatedQuality === 'einfach' ? AlertTriangle : CheckCircle,
      content: (
        <span>
          <strong>Modellqualität: {result.simulatedQuality === 'einfach' ? 'Einfach' : 'Detailliert'}</strong> -{' '}
          {result.simulatedQuality === 'einfach'
            ? 'Lokale Modelle liefern oft grundlegendere Antworten.'
            : 'Große Cloud-Modelle liefern meist präzisere Antworten.'}
        </span>
      )
    });

    // 3. Szenario-spezifische Prozess-Nachrichten
    switch (result.scenario) {
      case 'local':
        newMessages.push({ id: messageIdCounter++, sender: 'system', icon: Laptop, content: "Anfrage wird direkt auf deinem Computer verarbeitet." });
        newMessages.push({ id: messageIdCounter++, sender: 'system', icon: Lock, content: "Deine Daten haben das Gerät nicht verlassen." });
        // Zeige die Antwort für 'local'
        if (result.simulatedAnswer) {
          newMessages.push({ id: messageIdCounter++, sender: 'localModel', icon: MessageSquareText, content: result.simulatedAnswer });
        } else {
          newMessages.push({ id: messageIdCounter++, sender: 'system', icon: AlertTriangle, content: "[Keine lokale Antwort generiert]" });
        }
        break;

      case 'api':
        newMessages.push({ id: messageIdCounter++, sender: 'system', icon: Server, content: `Anfrage wird direkt an den Modell-Anbieter gesendet.` });
        // Zeige den Prompt, der gesendet wird (Original)
        newMessages.push({
            id: messageIdCounter++,
            sender: 'promptDisplay',
            icon: FileText,
            content: (
                <div>
                    <strong className="block mb-1">Gesendeter Prompt (Original):</strong>
                    <div className="text-xs p-2 bg-gray-50 border rounded whitespace-pre-wrap break-words">
                        {highlightSensitiveParts(originalInputText, result.sensitiveParts)}
                    </div>
                </div>
            )
        });
        if (result.sensitiveParts && result.sensitiveParts.length > 0) {
          newMessages.push({ id: messageIdCounter++, sender: 'system', icon: Eye, content: <span>Anbieter sieht alle potenziell sensiblen Daten!</span> });
        }
        // Zeige Metadaten
        if (result.metadataInfo && result.metadataInfo.length > 0) {
          newMessages.push({
            id: messageIdCounter++,
            sender: 'metadata',
            icon: Database,
            content: (
              <div>
                <strong className="block mb-1">Potenziell erfasste Metadaten:</strong>
                <ul className="list-disc pl-5 text-sm space-y-0.5">
                  {result.metadataInfo.map((meta, index) => (
                    <li key={index}>
                      <span className="font-medium">{meta.type}:</span> {meta.description}
                      <span className="text-xs text-gray-500"> (Sichtbar für: {meta.visibleTo.join(', ') || 'Niemanden'})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          });
        }
        // Zeige die Antwort für 'api'
        if (result.simulatedAnswer) {
          newMessages.push({ id: messageIdCounter++, sender: 'apiProvider', icon: MessageSquareText, content: result.simulatedAnswer });
        } else {
          newMessages.push({ id: messageIdCounter++, sender: 'system', icon: AlertTriangle, content: "[Keine Antwort vom Anbieter erhalten]" });
        }
        break;

      case 'wrapper':
        newMessages.push({ id: messageIdCounter++, sender: 'wrapper', icon: Filter, content: `Sicherer Schul-Wrapper empfängt die Anfrage.` });

        // NEU: Hinweis zur Sicherheit des Wrappers
        newMessages.push({
          id: messageIdCounter++,
          sender: 'system', // Oder 'wrapper' mit anderer Farbe? System passt gut.
          icon: ShieldAlert, // Oder Info
          content: (
            <span className="text-orange-700">
              <strong>Wichtig:</strong> Der Wrapper-Dienst selbst sieht die Originaldaten (um sie zu verarbeiten). Seine eigene Sicherheit und Vertrauenswürdigkeit sind daher entscheidend!
            </span>
          )
        });

        // Zeige Anonymisierungsdetails
        if (result.anonymizationDetails && result.anonymizationDetails.length > 0) {
          newMessages.push({
            id: messageIdCounter++,
            sender: 'anonymization',
            icon: Replace,
            content: (
              <div>
                <strong className="block mb-1">Anonymisierung durchgeführt:</strong>
                <ul className="list-disc pl-5 text-sm space-y-0.5">
                  {result.anonymizationDetails.map((anon, index) => (
                    <li key={index}>
                      Ersetzt "<span className="font-mono bg-gray-100 px-1 rounded">{anon.originalText}</span>"
                      durch "<span className="font-mono bg-gray-100 px-1 rounded">{anon.anonymizedText}</span>"
                      <span className="text-xs text-gray-500"> (Technik: {anon.technique}, Kategorie: {anon.category})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          });
        } else if (result.sensitiveParts && result.sensitiveParts.length > 0) {
            // Fall: Sensible Daten erkannt, aber keine Anonymisierung erfolgt
             newMessages.push({ id: messageIdCounter++, sender: 'wrapper', icon: AlertTriangle, content: `Sensible Daten wurden erkannt, aber der Dienst konnte sie nicht (oder nicht alle) anonymisieren.` });
        } else {
            // Fall: Keine sensiblen Daten erkannt
             newMessages.push({ id: messageIdCounter++, sender: 'wrapper', icon: CheckCircle, content: `Keine sensiblen Daten zum Anonymisieren erkannt.` });
        }

        // Zeige den (potenziell) anonymisierten Prompt
        newMessages.push({
            id: messageIdCounter++,
            sender: 'promptDisplay',
            icon: FileText,
            content: (
                <div>
                    <strong className="block mb-1">Anonymisierter Prompt für Anbieter:</strong>
                    <div className="text-xs p-2 bg-gray-50 border rounded whitespace-pre-wrap break-words">
                        {result.processedPromptForApi || "[Kein Prompt übermittelt]"}
                    </div>
                </div>
            )
        });

        newMessages.push({ id: messageIdCounter++, sender: 'system', icon: Server, content: `Anonymisierte Anfrage wird an den Modell-Anbieter gesendet.` });

        // Zeige Metadaten (die der Anbieter sieht)
        if (result.metadataInfo && result.metadataInfo.length > 0) {
          newMessages.push({
            id: messageIdCounter++,
            sender: 'metadata',
            icon: Database,
            content: (
              <div>
                <strong className="block mb-1">Potenziell erfasste Metadaten (trotz Anonymisierung):</strong>
                 <ul className="list-disc pl-5 text-sm space-y-0.5">
                  {result.metadataInfo.map((meta, index) => (
                    <li key={index}>
                      <span className="font-medium">{meta.type}:</span> {meta.description}
                      <span className="text-xs text-gray-500"> (Sichtbar für: {meta.visibleTo.join(', ') || 'Niemanden'})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          });
        }

        // Zeige die Antwort für 'wrapper'
        if (result.simulatedAnswer) {
          newMessages.push({ id: messageIdCounter++, sender: 'apiProvider', icon: MessageSquareText, content: result.simulatedAnswer });
        } else {
          newMessages.push({ id: messageIdCounter++, sender: 'system', icon: AlertTriangle, content: "[Keine Antwort vom Anbieter erhalten]" });
        }
        break;
    }

    // 4. NEU: Informationen zur Datenspeicherung
    if (result.dataStorageInfo && result.dataStorageInfo.length > 0) {
      newMessages.push({
        id: messageIdCounter++,
        sender: 'storage', // Neuer Sender-Typ
        icon: Save,
        content: (
          <div>
            <strong className="block mb-1">Potenzielle Datenspeicherung:</strong>
            <ul className="list-disc pl-5 text-sm space-y-0.5">
              {result.dataStorageInfo.map((storage, index) => (
                <li key={index}>
                  <span className="font-medium">{storage.location}:</span> {storage.duration} ({storage.purpose})
                </li>
              ))}
            </ul>
          </div>
        )
      });
    }

    // 5. NEU: Information zur Nutzung für Trainingszwecke
    if (typeof result.usedForTraining === 'boolean') {
      newMessages.push({
        id: messageIdCounter++,
        sender: 'training', // Neuer Sender-Typ
        icon: result.usedForTraining ? AlertTriangle : CheckCircle,
        content: (
          <span className={result.usedForTraining ? 'text-red-700' : 'text-green-700'}>
            <strong>Nutzung für KI-Training:</strong>{' '}
            {result.usedForTraining
              ? 'Deine Daten könnten potenziell zum Training von KI-Modellen verwendet werden.'
              : 'Deine Daten werden voraussichtlich NICHT zum Training von KI-Modellen verwendet.'}
          </span>
        )
      });
    }

    // 6. Zugriffsdetails als letzte Nachricht (vorher 4.)
    newMessages.push({
        id: messageIdCounter++,
        sender: 'access',
        icon: Info,
        content: formatAccessDetailsForChat(result.accessDetails)
    });

    // Füge neue Nachrichten zu bestehender User-Nachricht hinzu (oder ersetze alle außer User)
    setChatMessages(prev => [...prev.filter(m => m.sender === 'user'), ...newMessages]);
  };


  // Render-Funktion für Chat Nachrichten (mit neuen Sendern und Farben)
  const renderChatMessage = (msg: ChatMessage) => {
    const isUser = msg.sender === 'user';
    const alignment = isUser ? 'justify-end' : 'justify-start';
    // Farben und Hintergründe für verschiedene Sender
    const bubbleStyles: { [key: string]: string } = {
        user: 'bg-blue-600 text-white',
        system: 'bg-white text-gray-900 border border-gray-200',
        wrapper: 'bg-yellow-100 text-yellow-900 border border-yellow-200',
        apiProvider: 'bg-purple-100 text-purple-900 border border-purple-200',
        localModel: 'bg-green-100 text-green-900 border border-green-200',
        quality: 'bg-gray-100 text-gray-800 border border-gray-200',
        access: 'bg-indigo-50 text-indigo-900 border border-indigo-200',
        sensitive: 'bg-red-50 text-red-800 border border-red-200',
        metadata: 'bg-cyan-50 text-cyan-900 border border-cyan-200',
        anonymization: 'bg-orange-50 text-orange-900 border border-orange-200',
        promptDisplay: 'bg-gray-50 text-gray-700 border border-gray-200',
        storage: 'bg-lime-50 text-lime-900 border border-lime-200', // NEU
        training: 'bg-rose-50 text-rose-900 border border-rose-200', // NEU
        loader: 'bg-transparent',
    };
    const bubbleColor = bubbleStyles[msg.sender] || bubbleStyles['system'];

    const Icon = msg.icon;

    if(msg.sender === 'loader') {
        return (
             <div key={msg.id} className={`flex justify-center items-center h-10`}>
                {msg.content}
             </div>
        );
    }

    // Icon Farben anpassen
    const getIconColor = (sender: ChatMessage['sender'], content?: React.ReactNode): string => {
        if (isUser) return 'text-white/70';
        switch (sender) {
            case 'sensitive': return 'text-red-600';
            case 'localModel': return 'text-green-600';
            case 'apiProvider': return 'text-purple-600';
            case 'quality':
                // Prüfen, ob der Text "Einfach" enthält, um die Farbe anzupassen - Noch sicherere Prüfung
                let qualityText = '';
                if (React.isValidElement<{ children?: React.ReactNode }>(content) && content.props.children) {
                    const firstChild = React.Children.toArray(content.props.children)[0];
                    if (React.isValidElement<{ children?: React.ReactNode }>(firstChild) && firstChild.props.children) {
                         const strongElement = React.Children.toArray(firstChild.props.children)[0];
                         // Prüfen, ob strongElement ein React Element ist und children hat
                         if (React.isValidElement<{ children?: React.ReactNode }>(strongElement) && typeof strongElement.props.children === 'string') {
                             qualityText = strongElement.props.children;
                         }
                         // Fallback, falls der Text direkt im ersten Kind ist (unwahrscheinlich, aber sicher)
                         else if (typeof firstChild.props.children === 'string') {
                            qualityText = firstChild.props.children;
                         }
                    }
                }
                // Einfacher Check, ob "Einfach" im relevanten Teil vorkommt
                return qualityText.includes('Einfach') ? 'text-yellow-600' : 'text-green-600';
            case 'wrapper': return 'text-yellow-700';
            case 'access': return 'text-indigo-600';
            case 'metadata': return 'text-cyan-600';
            case 'anonymization': return 'text-orange-600';
            case 'promptDisplay': return 'text-gray-500';
            case 'storage': return 'text-lime-600'; // NEU
            case 'training': // Farbe basierend auf Inhalt (true/false)
                 let isTrainingUsed = false;
                 if (React.isValidElement<{ children?: React.ReactNode }>(content) && content.props.children) {
                     const textContent = React.Children.toArray(content.props.children).join('');
                     isTrainingUsed = textContent.includes('könnten potenziell');
                 }
                 return isTrainingUsed ? 'text-red-600' : 'text-green-600'; // NEU
            case 'system': // Spezifische Farbe für Wrapper-Warnung
                 if (React.isValidElement<{ children?: React.ReactNode }>(content) && content.props.children) {
                     const textContent = React.Children.toArray(content.props.children).join('');
                     if (textContent.includes('Wrapper-Dienst selbst sieht')) return 'text-orange-600';
                 }
                 return 'text-gray-500'; // Standard System Farbe
            default: return 'text-gray-500';
        }
    };

    return (
      <div key={msg.id} className={`flex ${alignment} mb-4 w-full`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex items-start max-w-[85%] sm:max-w-[75%] p-3 rounded-lg shadow-sm ${bubbleColor}`}
        >
          {Icon && <Icon size={18} className={`mr-2.5 mt-0.5 flex-shrink-0 ${getIconColor(msg.sender, msg.content)}`} />}
          <div className="text-sm whitespace-pre-wrap break-words w-full"> {/* w-full hinzugefügt */}
            {msg.content}
          </div>
        </motion.div>
      </div>
    );
  };

  // Beispiel-Prompt auswählen
  const selectPromptExample = (example: PromptExample) => {
    setInputText(example.text);
    setShowExamples(false);
  };


  // --- JSX Struktur ---
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datenfluss-Simulator: Lokal vs. Cloud</CardTitle>
        <CardDescription>
          {scenarioDetails[selectedScenario].description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          defaultValue="local"
          onValueChange={(value) => setSelectedScenario(value as Scenario)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="local">{scenarioDetails.local.title}</TabsTrigger>
            <TabsTrigger value="api">{scenarioDetails.api.title}</TabsTrigger>
            {/* Optional: Angepasste Bezeichnung */}
            <TabsTrigger value="wrapper">{scenarioDetails.wrapper.title}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* HIER die neue Visualisierung einfügen */}
        <DataFlowVisualization scenario={selectedScenario} />

        {/* Chat Nachrichten Anzeige */}
        <div className="h-[500px] overflow-y-auto border rounded-md p-4 bg-muted/20 space-y-1 scroll-smooth"> {/* Höhe angepasst */}
            {chatMessages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground pt-4">Gib eine Anfrage ein und klicke auf "Senden", um die Simulation zu starten.</p>
            )}
            {chatMessages.map(renderChatMessage)}
            {/* Leeres Div für Auto-Scroll */}
            <div ref={messageEndRef} />
        </div>

        {/* Fehlermeldung (wenn nicht schon im Chat) */}
        {/* Sicherere Prüfung für Fehlermeldung */}
        {errorText && !chatMessages.some(m =>
            m.sender === 'system' &&
            React.isValidElement<{ className?: string }>(m.content) && // Prüfen ob Element und ob props existieren könnten
            typeof m.content.props.className === 'string' && // Prüfen ob className ein String ist
            m.content.props.className.includes('text-red-600') // Sicherer Zugriff
        ) && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{errorText}</span>
          </div>
        )}

        <Textarea
          placeholder="Gib eine eigene Anfrage ein oder wähle ein Beispiel..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          aria-label="Beispielanfrage eingeben"
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="flex-grow"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Simuliere...' : 'Senden & Simulieren'}
          </Button>

          <Button
            onClick={() => setShowExamples(!showExamples)}
            variant="outline"
            className="px-3"
            title="Beispiel-Prompts anzeigen"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Beispiel-Prompts Sektion (bleibt gleich) */}
      {showExamples && (
        <CardFooter className="block border-t pt-4">
          <h3 className="text-md font-medium mb-2">Beispiel-Prompts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {promptExamples.map((example, index) => (
              <div
                key={index}
                onClick={() => selectPromptExample(example)}
                className="p-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm">{example.title}</div>
                <div className="text-xs text-gray-500 mb-1 truncate">{example.description}</div>
                <div className="text-xs truncate bg-gray-100 p-1 rounded">{example.text}</div>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}