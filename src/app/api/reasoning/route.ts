import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// ---------------------------------------------------------------------------
// Reasoning-Generierung für die Chain-of-Thought- und RLVR-Seiten.
//
// Dasselbe echte Modell (Gemini über Vertex), zwei Nutzungsarten:
//   • mode 'direct' — SOFORT antworten, kein Rechenweg. Bei Mehrschritt-Aufgaben
//     liegt es so oft daneben (eine Vorhersage ohne Notizblock).
//   • mode 'cot'    — Schritt für Schritt, Rechenweg ausschreiben, mit einer
//     Zeile „Antwort: …" abschliessen. Die Zwischenschritte sind dabei nichts
//     anderes als weitere vorhergesagte Tokens, die das Modell sich selbst als
//     Kontext gibt — und genau das macht harte Aufgaben lösbar.
//
// Beide Modi sind normaler Chat mit System-Anweisung; „thinking" ist AUS, damit
// der sichtbare Rechenweg auch wirklich die Ausgabe ist (kein verborgenes Denken).
//
// Auth = dasselbe Dienstkonto wie Next-Token/Finetuning (OAuth Bearer Token),
// kein Plain-API-Key. Setup-Details siehe api/predict-next/route.ts.
// ---------------------------------------------------------------------------

const LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Identische Modell-Kette wie die übrigen Routen (Fallback bei 404).
const MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ].filter((m): m is string => Boolean(m))
  )
);

const DIRECT_INSTRUCTION =
  'Beantworte die Aufgabe SOFORT mit dem Endergebnis. Schreibe KEINE ' +
  'Zwischenschritte, KEINEN Rechenweg und KEINE Erklärung. Gib genau eine Zeile ' +
  'aus: Antwort: <Ergebnis>.';

const COT_INSTRUCTION =
  'Löse die Aufgabe Schritt für Schritt. Schreibe deinen Rechenweg bzw. ' +
  'Gedankengang kurz und nachvollziehbar aus. Schliesse mit genau einer Zeile: ' +
  'Antwort: <Ergebnis>. Verwende keine Markdown-Formatierung (keine Sternchen, ' +
  'keine Rauten).';

// 'sample' (für RLVR): eine SCHÄTZUNG aus dem Stegreif, ohne pedantisches
// Durchbuchstabieren. Das ist Absicht — es bringt die natürliche Unsicherheit
// des Modells beim Buchstabenzählen zum Vorschein (es verzählt sich, weil es
// Tokens sieht statt Buchstaben). Erst diese Streuung gibt dem Prüfer etwas zu
// sortieren. Methodisches Durchzählen würde die Aufgabe trivialisieren (siehe
// die Chain-of-Thought-Seite: mit Rechenweg wird das Modell zuverlässig).
const SAMPLE_INSTRUCTION =
  'Schätze aus dem Bauch heraus, OHNE die Buchstaben einzeln durchzuzählen. ' +
  'Nenne in einem kurzen Satz deine Schätzung und schliesse mit genau einer ' +
  'Zeile: Antwort: <Zahl>. Verwende keine Markdown-Formatierung.';

// „Sofort"-Antworten sind kurz; der Rechenweg braucht Platz; ein Stegreif-
// Versuch ist knapp. Alle Werte lassen sich pro Anfrage übersteuern.
const MAX_TOKENS_DIRECT = 80;
const MAX_TOKENS_COT = 1024;
const MAX_TOKENS_SAMPLE = 220;
const MAX_ATTEMPTS = 2;

type Mode = 'direct' | 'cot' | 'sample';

const INSTRUCTIONS: Record<Mode, string> = {
  direct: DIRECT_INSTRUCTION,
  cot: COT_INSTRUCTION,
  sample: SAMPLE_INSTRUCTION,
};
const DEFAULT_MAX_TOKENS: Record<Mode, number> = {
  direct: MAX_TOKENS_DIRECT,
  cot: MAX_TOKENS_COT,
  sample: MAX_TOKENS_SAMPLE,
};

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

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, mode, temperature, maxOutputTokens } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt muss angegeben werden' }, { status: 400 });
    }
    if (mode !== 'direct' && mode !== 'cot' && mode !== 'sample') {
      return NextResponse.json(
        { error: 'Gültiger Modus (direct, cot oder sample) muss angegeben werden' },
        { status: 400 }
      );
    }

    const m = mode as Mode;
    const temp = typeof temperature === 'number' ? Math.min(2, Math.max(0, temperature)) : 0.7;
    const maxTok =
      typeof maxOutputTokens === 'number'
        ? Math.min(2048, Math.max(16, Math.round(maxOutputTokens)))
        : DEFAULT_MAX_TOKENS[m];

    const requestBody = JSON.stringify({
      systemInstruction: {
        parts: [{ text: INSTRUCTIONS[m] }],
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTok,
        temperature: temp,
        topP: 0.95,
        // „Thinking" aus: der sichtbare Rechenweg IST die Ausgabe.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    // OAuth-Token + Projekt-ID vom Dienstkonto.
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      throw new Error('Konnte kein OAuth-Token vom Dienstkonto erhalten');
    }
    const projectId = process.env.GCP_PROJECT_ID || (await auth.getProjectId());

    let responseText = '';
    let lastError = '';
    for (let attempt = 0; attempt < MAX_ATTEMPTS && responseText.length < 1; attempt++) {
      // Modelle der Reihe nach; bei 404 zum nächsten Kandidaten.
      let data: GeminiResponse | null = null;
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

      const parts = data.candidates?.[0]?.content?.parts ?? [];
      responseText = parts.map((p) => p.text ?? '').join('').trim();
    }

    return NextResponse.json({ text: responseText, mode: m });
  } catch (error) {
    console.error('Reasoning-Generierung Fehler:', error);
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
