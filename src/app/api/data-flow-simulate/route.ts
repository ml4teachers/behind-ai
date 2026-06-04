import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// ---------------------------------------------------------------------------
// Datenfluss-Demo (Lokal vs. Cloud): Was verlässt dein Gerät?
//
// Diese Route macht GENAU EINEN echten Modell-Aufruf (Gemini über Vertex,
// Structured Output): sie findet im eingegebenen Text die sensiblen Stellen
// und erzeugt eine anonymisierte Fassung. Aus diesem EINEN Ergebnis rendert
// die Komponente alle drei Bahnen (lokal / Cloud-API / Wrapper) — die
// „Wer-sieht-was"-Logik ist statisch in der Komponente, kein LLM nötig.
//
// Früher lief diese Route über OpenAI (gpt-4.1 / gpt-4.1-mini, 4 Calls). Jetzt
// dasselbe Dienstkonto/Muster wie predict-next & finetuning-simulate (OAuth
// Bearer, Modell-Fallback-Kette, thinkingBudget 0). Damit ist OpenAI aus dem
// Projekt verschwunden.
// ---------------------------------------------------------------------------

export const maxDuration = 60;

const LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Modell-Fallback-Kette wie die übrigen Vertex-Routen (404 -> nächster Kandidat).
const MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ].filter((m): m is string => Boolean(m))
  )
);

// GoogleAuth einmal pro Server-Instanz (Token wird gecacht/erneuert).
function createAuth(): GoogleAuth {
  const scopes = 'https://www.googleapis.com/auth/cloud-platform';
  const raw = process.env.GCP_SERVICE_ACCOUNT_KEY?.trim();

  if (raw) {
    const jsonStr = raw.startsWith('{')
      ? raw
      : Buffer.from(raw, 'base64').toString('utf8');
    const credentials = JSON.parse(jsonStr);
    return new GoogleAuth({
      scopes,
      credentials,
      projectId: process.env.GCP_PROJECT_ID || credentials.project_id,
    });
  }

  return new GoogleAuth({ scopes });
}

const auth = createAuth();

const SYSTEM_INSTRUCTION =
  'Du bist ein Datenschutz-Analysedienst für Lehrpersonen. Untersuche den ' +
  'eingegebenen Text und finde alle personenbezogenen oder sonst sensiblen ' +
  'Stellen: Namen, Orte/Adressen, Daten, Kontaktangaben (E-Mail/Telefon), ' +
  'Gesundheitsangaben, Noten/Leistungen und andere persönliche Details. ' +
  'Erzeuge ausserdem eine anonymisierte Fassung GENAU desselben Textes, in der ' +
  'jede sensible Stelle durch einen neutralen Platzhalter in eckigen Klammern ' +
  'ersetzt ist (z. B. [Name], [Ort], [Datum], [Note]). Der restliche Wortlaut ' +
  'bleibt unverändert und lesbar. Wenn nichts Sensibles vorkommt, gib eine ' +
  'leere Liste und den Originaltext zurück. Antworte ausschliesslich im JSON.';

// Vertex/Gemini "controlled generation": OpenAPI-Teilschema als responseSchema.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    sensitiveParts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          category: {
            type: 'string',
            enum: ['name', 'ort', 'datum', 'kontakt', 'gesundheit', 'noten', 'persoenlich', 'andere'],
          },
          reason: { type: 'string' },
        },
        required: ['text', 'category', 'reason'],
      },
    },
    anonymizedText: { type: 'string' },
  },
  required: ['sensitiveParts', 'anonymizedText'],
};

type SensitivePart = { text: string; category: string; reason: string };
type AnalysisResult = { sensitiveParts: SensitivePart[]; anonymizedText: string };

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
};

// Heuristischer Fallback, falls Vertex nicht erreichbar ist: grobe Maskierung
// von Eigennamen/E-Mails, damit die Demo trotzdem etwas zeigt.
function regexFallback(text: string): AnalysisResult {
  const parts: SensitivePart[] = [];
  let anon = text;

  // E-Mail-Adressen
  anon = anon.replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, (m) => {
    parts.push({ text: m, category: 'kontakt', reason: 'E-Mail-Adresse' });
    return '[E-Mail]';
  });
  // Zwei aufeinanderfolgende grossgeschriebene Wörter -> mutmasslicher Name
  anon = anon.replace(/\b[A-ZÄÖÜ][a-zäöüß]+ [A-ZÄÖÜ][a-zäöüß]+\b/g, (m) => {
    parts.push({ text: m, category: 'name', reason: 'Mutmasslicher Name' });
    return '[Name]';
  });

  return { sensitiveParts: parts, anonymizedText: anon };
}

export async function POST(request: NextRequest) {
  let promptText: string | undefined;

  try {
    const body = await request.json();
    promptText = body.promptText;

    if (!promptText || typeof promptText !== 'string') {
      return NextResponse.json(
        { error: 'promptText muss angegeben werden' },
        { status: 400 }
      );
    }

    // OAuth-Token + Projekt-ID vom Dienstkonto.
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      throw new Error('Konnte kein OAuth-Token vom Dienstkonto erhalten');
    }
    const projectId = process.env.GCP_PROJECT_ID || (await auth.getProjectId());

    const requestBody = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // Modelle der Reihe nach probieren; bei 404 zum nächsten Kandidaten.
    let data: GeminiResponse | null = null;
    let lastError = '';
    for (const model of MODEL_CANDIDATES) {
      const endpoint =
        `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${projectId}` +
        `/locations/${LOCATION}/publishers/google/models/${model}:generateContent`;

      const geminiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: requestBody,
      });

      if (geminiResponse.ok) {
        data = await geminiResponse.json();
        break;
      }

      const errorBody = await geminiResponse.text();
      lastError = `Vertex-API-Fehler ${geminiResponse.status} (${model}): ${errorBody}`;
      if (geminiResponse.status === 404) {
        console.warn(`Modell ${model} nicht verfügbar, versuche nächstes…`);
        continue;
      }
      throw new Error(lastError);
    }

    if (data === null) {
      throw new Error(lastError || 'Kein Vertex-Modell verfügbar');
    }

    const raw = (data.candidates?.[0]?.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .join('')
      .trim();

    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Modell lieferte kein sauberes JSON -> heuristischer Fallback.
      parsed = regexFallback(promptText);
    }

    return NextResponse.json({
      sensitiveParts: Array.isArray(parsed.sensitiveParts) ? parsed.sensitiveParts : [],
      anonymizedText: parsed.anonymizedText || promptText,
    });
  } catch (error) {
    console.error('Fehler in /api/data-flow-simulate:', error);
    // Graceful: Demo soll auch ohne Modell etwas zeigen (Komponente blendet
    // dann einen „Beispiel-Daten"-Hinweis ein).
    const fallback = regexFallback(promptText || '');
    return NextResponse.json(
      { ...fallback, fallback: true },
      { status: 200 }
    );
  }
}
