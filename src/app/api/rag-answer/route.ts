import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// ---------------------------------------------------------------------------
// RAG-Antwort: dieselbe Frage, einmal OHNE und einmal MIT abgerufenem Kontext.
//
// WARUM SO?
// - Die Lektion von RAG ist der Unterschied zwischen „das Modell rät aus seinem
//   Gedächtnis" und „das Modell antwortet anhand bereitgestellter Unterlagen".
//   Beide Antworten kommen vom selben echten Modell (Gemini über Vertex AI),
//   nur der Prompt unterscheidet sich.
// - OHNE Kontext: normaler Assistent, nur die Frage. Bei einer erfundenen
//   Wissensbasis (siehe scripts/gen-rag-docs.mjs) kann das Modell die Antwort
//   nicht kennen -> es sagt das ehrlich oder rät daneben.
// - MIT Kontext: die per Embeddings gefundenen Dokumente werden vor die Frage
//   gestellt, mit der Anweisung, AUSSCHLIESSLICH daraus zu antworten und ehrlich
//   zu sagen, wenn die Unterlagen nichts hergeben. Genau so wird echtes RAG
//   geprompptet – und genau das macht das Grounding sichtbar.
//
// Auth = dasselbe Dienstkonto wie Next-Token/Embeddings/Finetuning (OAuth
// Bearer Token), kein Plain-API-Key. Siehe api/predict-next/route.ts.
// ---------------------------------------------------------------------------

const LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Modell-Kandidaten mit Fallback bei 404 – identische Kette wie die anderen
// Gemini-Routen, damit alle dasselbe Modell nutzen.
const MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      // flash-lite als Primär: günstiger; das Grounding/Verzicht-Verhalten
      // dieser Route trägt es zuverlässig. flash bleibt als Fallback.
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
    ].filter((m): m is string => Boolean(m))
  )
);

type Lang = 'de' | 'en';

// System-Anweisung OHNE Kontext: ganz normaler hilfreicher Assistent.
const PLAIN_INSTRUCTION_DE =
  'Du bist ein hilfreicher Assistent. Beantworte die Frage so gut du kannst, ' +
  'kurz und klar. Wenn du es nicht sicher weisst, sage das offen und rate nicht ' +
  'ins Blaue. Antworte auf Deutsch, ohne Markdown-Formatierung ' +
  '(keine Sternchen, keine Rauten); nutze für Aufzählungen Spiegelstriche (–).';
const PLAIN_INSTRUCTION_EN =
  'You are a helpful assistant. Answer the question as well as you can, briefly ' +
  'and clearly. If you are not sure, say so openly and do not guess wildly. ' +
  'Answer in English, without Markdown formatting (no asterisks, no hashes); ' +
  'use dashes (–) for lists.';

// System-Anweisung MIT Kontext: striktes Grounding auf die Unterlagen.
const GROUNDED_INSTRUCTION_DE =
  'Du beantwortest die Frage AUSSCHLIESSLICH anhand der unten bereitgestellten ' +
  'Unterlagen. Verwende kein anderes Wissen. Steht die Antwort nicht oder nur ' +
  'teilweise in den Unterlagen, sage offen, dass die Unterlagen dazu nichts ' +
  'hergeben, statt zu raten. Fasse dich kurz und bleibe nah am Text der ' +
  'Unterlagen. Antworte auf Deutsch, ohne Markdown-Formatierung ' +
  '(keine Sternchen, keine Rauten); nutze für Aufzählungen Spiegelstriche (–).';
const GROUNDED_INSTRUCTION_EN =
  'You answer the question EXCLUSIVELY based on the documents provided below. ' +
  'Use no other knowledge. If the answer is not in the documents, or only ' +
  'partially, say openly that the documents do not cover it, instead of ' +
  'guessing. Be brief and stay close to the text of the documents. Answer in ' +
  'English, without Markdown formatting (no asterisks, no hashes); use dashes ' +
  '(–) for lists.';

const PLAIN_INSTRUCTION: Record<Lang, string> = { de: PLAIN_INSTRUCTION_DE, en: PLAIN_INSTRUCTION_EN };
const GROUNDED_INSTRUCTION: Record<Lang, string> = { de: GROUNDED_INSTRUCTION_DE, en: GROUNDED_INSTRUCTION_EN };

// Genug Raum, damit beide Antworten von selbst zu Ende kommen.
const MAX_OUTPUT_TOKENS = 320;

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

// Baut den User-Turn. Mit Kontext werden die Unterlagen vor die Frage gestellt.
function buildUserText(question: string, context: string, lang: Lang): string {
  if (!context) return question;
  if (lang === 'en') {
    return (
      'DOCUMENTS:\n' +
      context +
      '\n\nQUESTION:\n' +
      question +
      '\n\nAnswer the question only based on the documents above.'
    );
  }
  return (
    'UNTERLAGEN:\n' +
    context +
    '\n\nFRAGE:\n' +
    question +
    '\n\nBeantworte die Frage nur anhand der Unterlagen oben.'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question: unknown = body?.question;
    const contextRaw: unknown = body?.context;
    const context =
      typeof contextRaw === 'string' ? contextRaw.trim() : '';
    const lang: Lang = body?.locale === 'en' ? 'en' : 'de';

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Frage ist erforderlich' },
        { status: 400 }
      );
    }

    const grounded = context.length > 0;

    // OAuth-Token + Projekt-ID vom Dienstkonto.
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      throw new Error('Konnte kein OAuth-Token vom Dienstkonto erhalten');
    }
    const projectId = process.env.GCP_PROJECT_ID || (await auth.getProjectId());

    const requestBody = JSON.stringify({
      systemInstruction: {
        parts: [{ text: grounded ? GROUNDED_INSTRUCTION[lang] : PLAIN_INSTRUCTION[lang] }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserText(question.trim(), context, lang) }],
        },
      ],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        // Grounded bewusst etwas „kühler", damit es nah am Text bleibt.
        temperature: grounded ? 0.3 : 0.7,
        topP: 0.95,
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

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const answer = parts.map((p) => p.text ?? '').join('').trim();

    return NextResponse.json({ answer, grounded });
  } catch (error) {
    console.error('RAG-Antwort Fehler:', error);
    return NextResponse.json(
      {
        error: 'Antwort konnte nicht erzeugt werden',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
