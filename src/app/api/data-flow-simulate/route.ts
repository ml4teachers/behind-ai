import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

export const maxDuration = 60; // Setzt die maximale Ausführungsdauer auf 60 Sekunden

const openai = new OpenAI({
  // Stelle sicher, dass dein API-Key hier konfiguriert ist,
  // z.B. über Umgebungsvariablen (process.env.OPENAI_API_KEY)
});

// Erweitertes Zod-Schema MIT simulatedAnswer
const AccessDetailSchema = z.object({
  entity: z.enum(["Benutzer", "Anonymisierungs-Dienst", "Modell-Anbieter", "Anbieter-Mitarbeiter", "Dritte/Hacker"]).describe("Die Entität, die potenziell Zugriff hat."),
  dataSeen: z.enum(["original", "anonymisiert", "metadaten", "keine"]).describe("Die Art der Daten, die potenziell eingesehen werden können."),
  accessPossible: z.boolean().describe("Gibt an, ob ein Zugriff für diese Entität in diesem Szenario prinzipiell möglich ist.")
});

// Schema für sensible Daten im Prompt
const SensitiveDataSchema = z.object({
  text: z.string().describe("Der sensible Text im Prompt"),
  category: z.enum(["name", "location", "date", "email", "health", "personal", "other"]).describe("Kategorie der sensiblen Information"),
  reason: z.string().describe("Begründung, warum diese Information als sensitiv gilt"),
  impact: z.enum(["low", "medium", "high"]).describe("Potentielles Risiko bei Offenlegung")
});

// Schema für Metadaten
const MetadataSchema = z.object({
  type: z.enum(["usage_data", "ip", "timestamp", "device_info", "location", "other"]).describe("Art der Metadaten"),
  description: z.string().describe("Beschreibung der Metadaten und deren Bedeutung"),
  visibleTo: z.array(z.enum(["Modell-Anbieter", "Anbieter-Mitarbeiter", "Dritte/Hacker"]))
    .describe("Wer kann potenziell diese Metadaten sehen")
});

// Schema für Anonymisierung
const AnonymizationSchema = z.object({
  originalText: z.string().describe("Ursprünglicher Text vor der Anonymisierung"),
  anonymizedText: z.string().describe("Text nach der Anonymisierung"),
  technique: z.enum(["redaction", "generalization", "masking", "synthetic", "tokenization", "other"])
    .describe("Verwendete Anonymisierungstechnik"),
  category: z.enum(["name", "location", "date", "email", "health", "personal", "other"])
    .describe("Kategorie der anonymisierten Information")
});

// Schema für Datenspeicherung
const DataStorageSchema = z.object({
  location: z.string().describe("Ort der Speicherung (z.B. Server-Standort)"),
  duration: z.string().describe("Dauer der Speicherung"),
  purpose: z.string().describe("Zweck der Speicherung")
});

const SimulationResponseSchema = z.object({
  scenario: z.enum(["local", "api", "wrapper"]).describe("Das simulierte Szenario."),
  processedPromptForApi: z.string().nullable().describe(
    "Der Prompt-Text, wie er hypothetisch beim Modell-Anbieter ankommt. Null bei 'local'. Anonymisiert bei 'wrapper'. Original bei 'api'."
  ),
  simulatedQuality: z.enum(["einfach", "detailliert"]).describe(
    "Die simulierte Qualität der Antwort (einfach für lokal, detailliert für API/Wrapper)."
  ),
  accessDetails: z.array(AccessDetailSchema).describe(
    "Detaillierte Aufschlüsselung, wer potenziell welche Daten sehen kann."
  ),
  simulatedAnswer: z.string().nullable().describe("Die simulierte Antwort des KI-Modells."),
  
  // Neue Felder für detailliertere Informationen
  sensitiveParts: z.array(SensitiveDataSchema).optional().describe(
    "Liste der erkannten sensiblen Daten im ursprünglichen Prompt"
  ),
  metadataInfo: z.array(MetadataSchema).optional().describe(
    "Detaillierte Informationen zu Metadaten, die erfasst werden können"
  ),
  anonymizationDetails: z.array(AnonymizationSchema).optional().describe(
    "Details zum Anonymisierungsprozess (nur bei wrapper-Szenario)"
  ),
  // NEU: Informationen zur Datenspeicherung
  dataStorageInfo: z.array(DataStorageSchema).optional().describe(
    "Informationen zur potenziellen Datenspeicherung."
  ),
  // NEU: Nutzung für Trainingszwecke
  usedForTraining: z.boolean().optional().describe(
    "Gibt an, ob Daten potenziell zum Training von KI-Modellen verwendet werden."
  )
});

// Typ basierend auf dem erweiterten Schema
type SimulationResponse = z.infer<typeof SimulationResponseSchema>;

// --- Helper-Funktion für die Antwort-Generierung ---
async function generateAnswer(prompt: string | null, quality: 'einfach' | 'detailliert'): Promise<string | null> {
    // Kein Prompt -> keine Antwort
    if (!prompt) return null;

    try {
        // Wähle Modell und Parameter basierend auf Qualität
        const model = quality === 'einfach' ? "gpt-4.1-mini" : "gpt-4.1";
        
        // Systemanweisung für jeweils einfache oder detaillierte Antworten
        const systemPrompt = quality === 'einfach' 
            ? "Du bist ein einfaches lokales KI-Modell. Gib kurze, einfache Antworten mit grundlegenden Informationen. Achte auf eine klare aber begrenzte Erklärung. Deine Antwort kann Fehler enthalten."
            : "Du bist ein fortschrittliches Cloud-basiertes KI-Modell. Gib detaillierte, präzise Antworten mit umfassenden Informationen. Achte auf Vollständigkeit.";

        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: quality === 'einfach' ? 150 : 300, // Längere Antworten für detaillierte Qualität
            temperature: quality === 'einfach' ? 0.3 : 0.7, // Kreativere Antworten bei hoher Qualität
            n: 1,
        });
        
        return completion.choices[0]?.message?.content?.trim() || 
               `[${quality === 'einfach' ? 'Einfache' : 'Detaillierte'} Antwort konnte nicht generiert werden]`;
    } catch (error) {
        console.error(`Fehler beim Generieren der ${quality} Antwort:`, error);
        // Fallback für Fehlerfall
        return quality === 'einfach' 
            ? "Dies ist eine vereinfachte Antwort. Da lokale Modelle begrenzte Ressourcen haben, kann die Qualität variieren."
            : "Dies ist eine detailliertere Antwort vom Cloud-Anbieter. In der Praxis wäre sie umfassender und präziser als eine lokale Antwort.";
    }
}

// Funktion zur Extraktion sensibler Daten aus dem Prompt
async function extractSensitiveData(promptText: string): Promise<any> {
  try {
    // Definiere ein Objekt-Schema, das das Array enthält
    const SensitiveDataListSchema = z.object({
      sensitive_items: z.array(SensitiveDataSchema).describe("Liste der erkannten sensiblen Daten")
    });

    const sensitiveDataResponse = await openai.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "Analysiere den folgenden Text und identifiziere alle sensiblen Daten wie Namen, Orte, Daten, E-Mails, Gesundheitsinformationen und persönliche Details. Gib das Ergebnis als JSON-Objekt zurück, das ein Feld 'sensitive_items' enthält, welches eine Liste der gefundenen sensiblen Daten ist. Bewerte auch das potenzielle Risiko bei Offenlegung."
        },
        { role: "user", content: promptText }
      ],
      text: {
        // Verwende das neue Objekt-Schema
        format: zodTextFormat(SensitiveDataListSchema, "sensitive_data_extraction"),
      },
      temperature: 0.1,
    });

    // Extrahiere das Array aus dem geparsten Objekt
    return sensitiveDataResponse.output_parsed?.sensitive_items || [];
  } catch (error) {
    console.error("Fehler bei der Extraktion sensibler Daten:", error);
    return []; // Gib weiterhin ein leeres Array im Fehlerfall zurück
  }
}

// Funktion für detaillierte Anonymisierungsinformationen
async function generateAnonymizationDetails(promptText: string): Promise<any> {
  try {
    // Erst anonymisieren
    const anonymizationResponse = await openai.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        { 
          role: "system", 
          content: "Du bist ein Anonymisierungsdienst. Identifiziere sensible Daten im folgenden Text und ersetze sie durch anonymisierte Versionen. Erstelle für jede Ersetzung ein Objekt mit dem Original, der anonymisierten Version, der verwendeten Technik und der Kategorie." 
        },
        { role: "user", content: promptText }
      ],
      text: {
        format: zodTextFormat(
          z.object({
            anonymizedText: z.string(),
            replacements: z.array(AnonymizationSchema)
          }), 
          "anonymization_details"
        ),
      },
      temperature: 0.1,
    });
    
    return anonymizationResponse.output_parsed;
  } catch (error) {
    console.error("Fehler bei der Generierung der Anonymisierungsdetails:", error);
    // Einfachen Fallback liefern
    return {
      anonymizedText: promptText.replace(/\b[A-Z][a-zA-Z]+ [A-Z][a-zA-Z]+\b/g, "[NAME]")
                            .replace(/\b[A-Z][a-zA-Z]+\b/g, "[ORT]"),
      replacements: []
    };
  }
}

// Funktion zur Generierung von Metadaten-Informationen
async function generateMetadataInfo(): Promise<any> {
  try {
    // Definiere ein Objekt-Schema, das das Array enthält
    const MetadataListSchema = z.object({
      metadata_items: z.array(MetadataSchema).describe("Liste der erkannten Metadaten")
    });

    const metadataResponse = await openai.responses.parse({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "Erstelle eine Liste von typischen Metadaten, die bei der Nutzung von KI-Diensten anfallen können. Gib für jede Metadatenart eine Beschreibung und an, wer potenziell Zugriff haben könnte. Gib das Ergebnis als JSON-Objekt zurück, das ein Feld 'metadata_items' enthält, welches die Liste der Metadaten ist."
        },
        { role: "user", content: "Generiere eine Liste von KI-relevanten Metadaten" }
      ],
      text: {
        // Verwende das neue Objekt-Schema
        format: zodTextFormat(MetadataListSchema, "metadata_info"),
      },
      temperature: 0.1,
    });

    // Extrahiere das Array aus dem geparsten Objekt
    return metadataResponse.output_parsed?.metadata_items || [];
  } catch (error) {
    console.error("Fehler bei der Generierung der Metadaten-Infos:", error);
    // Einfachen Fallback liefern
    return [
      {
        type: "ip",
        description: "IP-Adresse des Nutzers, kann ungefähren Standort verraten",
        visibleTo: ["Modell-Anbieter", "Anbieter-Mitarbeiter"]
      },
      {
        type: "timestamp",
        description: "Zeitpunkt der Anfrage",
        visibleTo: ["Modell-Anbieter"]
      },
      {
        type: "usage_data",
        description: "Nutzungsmuster und -häufigkeit",
        visibleTo: ["Modell-Anbieter"]
      }
    ];
  }
}


export async function POST(request: Request) {
  let scenario: "local" | "api" | "wrapper" | undefined;
  let promptText: string | undefined;

  try {
    const body = await request.json();
    promptText = body.promptText;
    scenario = body.scenario;

    if (!promptText || !scenario || !["local", "api", "wrapper"].includes(scenario)) {
      return NextResponse.json({ error: 'promptText and a valid scenario (local, api, wrapper) are required' }, { status: 400 });
    }

    // Extrahiere sensible Daten IMMER zuerst (wird für alle Szenarien benötigt)
    const sensitiveParts = await extractSensitiveData(promptText);

    // --- Lokales Szenario ---
    if (scenario === 'local') {
       // Generiere eine einfache simulierte Antwort
       const simulatedAnswerContent = await generateAnswer(promptText, 'einfach');

       const localResponse: SimulationResponse = {
        scenario: "local",
        processedPromptForApi: null,
        simulatedQuality: "einfach",
        accessDetails: [
          { entity: "Benutzer", dataSeen: "original", accessPossible: true },
          { entity: "Anonymisierungs-Dienst", dataSeen: "keine", accessPossible: false },
          { entity: "Modell-Anbieter", dataSeen: "keine", accessPossible: false },
          { entity: "Anbieter-Mitarbeiter", dataSeen: "keine", accessPossible: false },
          // Hacker: Kein Zugriff, da Daten lokal bleiben
          { entity: "Dritte/Hacker", dataSeen: "keine", accessPossible: true } // accessPossible bleibt true, um das prinzipielle Risiko darzustellen
        ],
        simulatedAnswer: simulatedAnswerContent,
        sensitiveParts: sensitiveParts,
        // NEU: Speicherinfo für lokal
        dataStorageInfo: [
          { location: "Dein Computer", duration: "Bis zur Löschung durch dich", purpose: "Lokale Verarbeitung" }
        ],
        // NEU: Training für lokal
        usedForTraining: false
      };
      
      return NextResponse.json(localResponse);
    }

    // --- API- und Wrapper-Szenarien: Parallele Ausführung der unabhängigen Aufrufe ---
    const metadataPromise = generateMetadataInfo();
    let anonymizationPromise: Promise<any> | undefined = undefined;
    if (scenario === 'wrapper') {
      anonymizationPromise = generateAnonymizationDetails(promptText);
    }

    // Hole Basis-Metadaten (ohne LLM-Call, da dieser entfernt wurde)
    let baseResult = generateFallbackMeta(scenario, promptText);

    // Warte auf parallele Aufrufe
    const [metadataInfo, anonymizationResult] = await Promise.all([
      metadataPromise,
      scenario === 'wrapper' && anonymizationPromise ? anonymizationPromise : Promise.resolve(undefined)
    ]);

    // Prompt für die Antwortgenerierung bestimmen
    let promptForAnswer = promptText;
    let anonymizationDetails = undefined;
    if (scenario === 'wrapper' && anonymizationResult) {
      baseResult.processedPromptForApi = anonymizationResult.anonymizedText;
      promptForAnswer = anonymizationResult.anonymizedText;
      anonymizationDetails = anonymizationResult.replacements;
      // Speicherinfo & Training für Wrapper
      baseResult.dataStorageInfo = [
        { location: "Wrapper-Server (Schweiz/EU)", duration: "Bis Löschung durch Nutzer", purpose: "Verlauf für Nutzer" },
        { location: "Anbieter-Server (Azure EU)", duration: "Nur zur Verarbeitung (In-Memory)", purpose: "Antwortgenerierung" }
      ];
      baseResult.usedForTraining = false;
    } else if (scenario === 'api') {
      // Speicherinfo & Training für API
      baseResult.dataStorageInfo = [
        { location: "OpenAI Server (USA/Global)", duration: "Bis zu 30 Tage (lt. Policy)", purpose: "Missbrauchserkennung, Qualitätskontrolle" }
      ];
      baseResult.usedForTraining = true;
    }

    // 2. API Call: Antwort generieren
    let simulatedAnswerContent: string | null = null;
    if (promptForAnswer) {
      simulatedAnswerContent = await generateAnswer(promptForAnswer, "detailliert");
    } else {
      console.warn("Kein Prompt für Antwortgenerierung in Szenario:", scenario);
      simulatedAnswerContent = "Keine Antwort generierbar aufgrund fehlender Daten.";
    }

    // Kombiniere Metadaten und Antwort
    const finalResult: SimulationResponse = {
      ...baseResult, // Enthält jetzt scenario, processedPrompt, quality, accessDetails, dataStorageInfo, usedForTraining
      simulatedAnswer: simulatedAnswerContent,
      sensitiveParts: sensitiveParts,
      metadataInfo: metadataInfo,
      anonymizationDetails: anonymizationDetails
    };

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error("Fehler in /api/data-flow-simulate:", error);
    let errorMessage = "Ein interner Fehler ist aufgetreten.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }

    // Generiere Fallback mit Fehlermeldung und neuen Feldern
    const fallbackMeta = generateFallbackMeta(scenario, promptText);
    const fallbackAnswer = `[Simulierte ${scenario === 'local' ? 'einfache' : 'detaillierte'} Antwort - Fehler bei der Generierung: ${errorMessage}]`;
    
    return NextResponse.json({
        ...fallbackMeta, // Enthält jetzt auch Fallback für neue Felder
        simulatedAnswer: fallbackAnswer,
        error: errorMessage
    }, { status: 500 });
  }
}


// Verbesserte Hilfsfunktion für Fallback-Metadaten
function generateFallbackMeta(scenario: string | undefined, promptText: string | undefined): SimulationResponse {
    // Basis-Fallback (wird überschrieben)
    const defaultResponse: SimulationResponse = {
      scenario: "api",
      processedPromptForApi: promptText || "",
      simulatedQuality: "detailliert",
      accessDetails: [
        { entity: "Benutzer", dataSeen: "original", accessPossible: true },
        { entity: "Anonymisierungs-Dienst", dataSeen: "keine", accessPossible: false },
        { entity: "Modell-Anbieter", dataSeen: "original", accessPossible: true },
        { entity: "Anbieter-Mitarbeiter", dataSeen: "original", accessPossible: true },
        { entity: "Dritte/Hacker", dataSeen: "original", accessPossible: true } // Hacker sieht, was Anbieter sieht
      ],
      simulatedAnswer: null,
      dataStorageInfo: [ // Fallback Speicherinfo
        { location: "Unbekannt", duration: "Unbekannt", purpose: "Verarbeitung" }
      ],
      usedForTraining: true // Fallback Annahme
    };

    if (!scenario || !promptText) return defaultResponse;

    switch(scenario) {
      case 'local':
        return {
          scenario: "local",
          processedPromptForApi: null,
          simulatedQuality: "einfach",
          accessDetails: [
            { entity: "Benutzer", dataSeen: "original", accessPossible: true },
            { entity: "Anonymisierungs-Dienst", dataSeen: "keine", accessPossible: false },
            { entity: "Modell-Anbieter", dataSeen: "keine", accessPossible: false },
            { entity: "Anbieter-Mitarbeiter", dataSeen: "keine", accessPossible: false },
            { entity: "Dritte/Hacker", dataSeen: "keine", accessPossible: true } // Hacker kann theoretisch immer zugreifen, sieht aber nichts
          ],
          simulatedAnswer: null,
          dataStorageInfo: [
            { location: "Dein Computer", duration: "Bis zur Löschung durch dich", purpose: "Lokale Verarbeitung" }
          ],
          usedForTraining: false
        };
      
      case 'api':
        return {
          scenario: "api",
          processedPromptForApi: promptText,
          simulatedQuality: "detailliert",
          accessDetails: [
            { entity: "Benutzer", dataSeen: "original", accessPossible: true },
            { entity: "Anonymisierungs-Dienst", dataSeen: "keine", accessPossible: false },
            { entity: "Modell-Anbieter", dataSeen: "original", accessPossible: true },
            { entity: "Anbieter-Mitarbeiter", dataSeen: "original", accessPossible: true },
            { entity: "Dritte/Hacker", dataSeen: "original", accessPossible: true } // Hacker sieht, was Anbieter sieht
          ],
          simulatedAnswer: null,
          dataStorageInfo: [
            { location: "OpenAI Server (USA/Global)", duration: "Bis zu 30 Tage (lt. Policy)", purpose: "Missbrauchserkennung, Qualitätskontrolle" }
          ],
          usedForTraining: true
        };
      
      case 'wrapper':
        // Einfache Anonymisierung für Fallback
        const anonymizedPrompt = promptText.replace(/\[.*?\]/g, '[ANONYMISIERT]')
                                         .replace(/\b[A-Z][a-zA-Z]+\b/g, '[NAME]');
        return {
          scenario: "wrapper",
          processedPromptForApi: anonymizedPrompt,
          simulatedQuality: "detailliert",
          accessDetails: [
            { entity: "Benutzer", dataSeen: "original", accessPossible: true },
            { entity: "Anonymisierungs-Dienst", dataSeen: "original", accessPossible: true }, // Wrapper sieht Original
            { entity: "Modell-Anbieter", dataSeen: "anonymisiert", accessPossible: true },
            { entity: "Anbieter-Mitarbeiter", dataSeen: "anonymisiert", accessPossible: true },
            { entity: "Dritte/Hacker", dataSeen: "anonymisiert", accessPossible: true } // Hacker sieht, was Anbieter sieht (anonymisiert)
          ],
          simulatedAnswer: null,
          dataStorageInfo: [ // Schabi-orientierter Fallback
            { location: "Wrapper-Server (Schweiz/EU)", duration: "Bis Löschung durch Nutzer", purpose: "Verlauf für Nutzer" },
            { location: "Anbieter-Server (Azure EU)", duration: "Nur zur Verarbeitung (In-Memory)", purpose: "Antwortgenerierung" }
          ],
          usedForTraining: false
        };
      
      default:
        return defaultResponse;
    }
}