import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// ---------------------------------------------------------------------------
// Finetuning-Vergleich: Basismodell (nur Pretraining) vs. Assistent.
//
// WARUM SO?
// - Ein echtes Basismodell (nur Pretraining, KEIN Assistenz-Finetuning) wie
//   damals OpenAI babbage-002 bieten die grossen Anbieter praktisch nicht mehr
//   über eine API an — verfügbar sind fast nur fertig finegetunte Chat-Modelle.
// - Das charakteristische Basismodell-Verhalten lässt sich aber reproduzieren:
//   Wir geben demselben Chat-Modell (Gemini über Vertex) den Text als
//   MODEL-Turn (Prefill) und weisen es an, ihn wie ein rohes Sprachmodell
//   bloss FORTZUSETZEN statt zu antworten. Genau diesen Prefill-Trick nutzt
//   schon die Next-Token-Route — er erzeugt echte Text-Fortsetzung.
// - Der "Assistent" ist dasselbe Modell im normalen Chat-Modus: Frage als
//   user-Turn + System-Anweisung "hilfreicher Assistent".
//
// Didaktische Ehrlichkeit: Der Unterschied, den Finetuning real durch
// veränderte Gewichte bewirkt, wird hier durch zwei Nutzungsarten desselben
// Modells SICHTBAR gemacht. Es geht um den Verhaltensunterschied, nicht um die
// Behauptung, dies sei mechanisch identisch mit echtem Finetuning.
//
// Auth = dasselbe Dienstkonto wie Next-Token/Embeddings (OAuth Bearer Token),
// kein Plain-API-Key. Siehe api/predict-next/route.ts für das Setup.
// ---------------------------------------------------------------------------

const LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Modell-Kandidaten mit Fallback bei 404 (abgeschaltete Generation).
// Identische Kette wie die Next-Token-Route, damit beide dasselbe Modell nutzen.
const MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ].filter((m): m is string => Boolean(m))
  )
);

// Anweisung für den BASIS-Modus: Text fortsetzen wie ein rohes Sprachmodell,
// NICHT antworten. Bewusst stark formuliert, weil heutige Chat-Modelle stark
// auf "hilfreich antworten" trainiert sind und sonst sofort in den Assistenz-
// Modus fallen.
const BASE_INSTRUCTION =
  'Du bist ein ROHES Sprachmodell direkt nach dem Pretraining: nur mit ' +
  'zufälligem Internet-Text trainiert, ganz OHNE Assistenz-Finetuning. Du ' +
  'kannst keine Fragen beantworten und keine Anweisungen befolgen — du kennst ' +
  'das Konzept "Assistent" gar nicht. Du tust nur eine Sache: den vorgegebenen ' +
  'Text genau so fortsetzen, wie er zufällig irgendwo im Internet weitergehen ' +
  'könnte — etwa als nächste Zeile einer FAQ- oder Fragenliste, eines ' +
  'Forenbeitrags, eines Blogposts oder Wikipedia-Artikels. Schreibe den Text ' +
  'als reinen Fliesstext weiter, ohne ihn zu wiederholen, ohne ihn zu ' +
  'kommentieren, ohne Formatierung (keine Sternchen, keine Aufzählungen, keine ' +
  'Überschriften). Beantworte die Eingabe NICHT. Bleibe dabei stets jugendfrei ' +
  'und unanstössig (keine sexuellen, gewalttätigen oder sonst heiklen Themen).';

// System-Anweisung für den ASSISTENT-Modus (normaler Chat).
const ASSISTANT_INSTRUCTION =
  'Du bist ein hilfreicher Assistent. Beantworte die Anfrage direkt, präzise ' +
  'und klar strukturiert. Halte dich kurz. Antworte in der Sprache der Anfrage. ' +
  'Verwende keine Markdown-Formatierung (keine Sternchen, keine Rauten); für ' +
  'Aufzählungen einfache Spiegelstriche (–).';

// Basis-Modus bewusst kurz: ein Basismodell würde endlos weiterschreiben, also
// brechen wir nach ~100 Tokens ab (didaktisch: "es stoppt nicht von selbst").
// Der Assistent bekommt genug Raum, um seine Antwort selbst zu Ende zu bringen
// (sonst stimmt das "hört von selbst auf" nicht mehr).
const MAX_OUTPUT_TOKENS_BASE = 100;
const MAX_OUTPUT_TOKENS_ASSISTANT = 256;

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

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
};

// Wie oft ein leeres Ergebnis neu versucht wird. Der Basis-Modus (Prefill)
// samplet gelegentlich sofort ein End-Token -> leere Fortsetzung; ein erneuter
// Versuch liefert dann fast immer Text.
const MAX_ATTEMPTS = 3;

// Zwei Zeilenumbrüche am Ende des Prefills geben dem Modell "Schwung", auf
// einer neuen Zeile weiterzuschreiben. Ohne diesen Prime beendet Gemini den
// vorbefüllten Turn oft sofort (finishReason=STOP -> leere Fortsetzung); mit
// ihm setzt es zuverlässig fort (z. B. als nächster Eintrag einer Fragenliste).
const BASE_PRIME = '\n\n';

// Baut den Request-Body je nach Modus.
function buildRequestBody(query: string, mode: 'base' | 'assistant'): string {
  if (mode === 'base') {
    // Prefill-Trick: die Eingabe kommt als MODEL-Turn, damit Gemini sie
    // wirklich fortsetzt statt frisch zu antworten.
    return JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: BASE_INSTRUCTION }] },
        { role: 'model', parts: [{ text: query + BASE_PRIME }] },
      ],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS_BASE,
        temperature: 0.8,
        topP: 0.95,
        // "Thinking" aus: die Ausgabe soll die rohe Text-Fortsetzung sein.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
  }

  // assistant: normaler Chat mit System-Anweisung.
  return JSON.stringify({
    systemInstruction: { parts: [{ text: ASSISTANT_INSTRUCTION }] },
    contents: [{ role: 'user', parts: [{ text: query }] }],
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS_ASSISTANT,
      temperature: 0.7,
      topP: 0.95,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { query, mode } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query muss angegeben werden' },
        { status: 400 }
      );
    }

    if (mode !== 'base' && mode !== 'assistant') {
      return NextResponse.json(
        { error: 'Gültiger Modus (base oder assistant) muss angegeben werden' },
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

    const requestBody = buildRequestBody(query, mode);

    // Leere/sehr kurze Fortsetzung neu anfragen. Im Basis-Modus verlangen wir
    // eine substanzielle Länge (eine 23-Zeichen-Fortsetzung ist anschaulich
    // wertlos); im Assistent-Modus reicht "nicht leer", weil kurze Antworten
    // dort legitim sind. temperature > 0 sorgt für Varianz -> Retry hilft.
    const minLen = mode === 'base' ? 40 : 1;
    let responseText = '';
    let lastError = '';
    let lastFinish = '';
    for (
      let attempt = 0;
      attempt < MAX_ATTEMPTS && responseText.length < minLen;
      attempt++
    ) {
      // Modelle der Reihe nach probieren; bei 404 zum nächsten Kandidaten.
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
      lastFinish = data.candidates?.[0]?.finishReason ?? '?';
      if (responseText.length < minLen) {
        console.warn(
          `Leere/kurze Antwort (${mode}, Versuch ${attempt + 1}/${MAX_ATTEMPTS}, ` +
            `len=${responseText.length}, finishReason=${lastFinish})`
        );
      }
    }

    return NextResponse.json({ response: responseText, mode });
  } catch (error) {
    console.error('Finetuning-Vergleich Fehler:', error);
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
