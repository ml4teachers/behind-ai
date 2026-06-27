import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// ---------------------------------------------------------------------------
// Generierung für die Halluzinations-Seite.
//
// Eine GANZ NORMALE Assistenten-Anfrage: Das Modell soll eine Frage hilfreich
// und konkret beantworten. Es wird NICHT angewiesen, etwas zu erfinden – die
// Erfindung entsteht von selbst, wenn die Frage nach etwas fragt, das es nicht
// wissen kann (ein ausgedachter Roman, eine ausgedachte Person …). Genau das
// ist der Lerneffekt: Das Modell setzt den wahrscheinlichsten Text fort, statt
// zuzugeben, dass es die Antwort nicht hat.
//
// Auth = dasselbe Dienstkonto wie die übrigen Routen (OAuth Bearer Token).
// Setup-Details siehe api/predict-next/route.ts.
// ---------------------------------------------------------------------------

const LOCATION = process.env.GCP_LOCATION || 'us-central1';

const MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ].filter((m): m is string => Boolean(m))
  )
);

// Neutraler Assistenten-Prompt – kein Auftrag zu erfinden. Knapper Fliesstext,
// damit die Antwort gut lesbar bleibt und der „klingt fundiert"-Effekt trägt.
// Sprache wird je `locale` explizit gesetzt: „in derselben Sprache wie die Frage"
// ist NICHT zuverlässig – der deutsche System-Prompt zieht das Modell sonst auch
// bei englischen Fragen ins Deutsche (vgl. rag-answer/reasoning).
type Lang = 'de' | 'en';
const SYSTEM_INSTRUCTION_DE =
  'Du bist ein hilfreicher, sachkundiger Assistent. Beantworte die Frage ' +
  'konkret und gut lesbar AUF DEUTSCH, in 3 bis 5 Sätzen Fliesstext. Verwende ' +
  'keine Markdown-Formatierung: keine Sternchen, keine Aufzählungen, keine Überschriften.';
const SYSTEM_INSTRUCTION_EN =
  'You are a helpful, knowledgeable assistant. Answer the question concretely ' +
  'and readably IN ENGLISH, in 3 to 5 sentences of prose. Do not use any ' +
  'Markdown formatting: no asterisks, no bullet points, no headings.';
const SYSTEM_INSTRUCTION: Record<Lang, string> = {
  de: SYSTEM_INSTRUCTION_DE,
  en: SYSTEM_INSTRUCTION_EN,
};

const MAX_TOKENS = 260;

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

// Leichter Markdown-Cleanup, falls das Modell doch Sternchen/Backticks einstreut.
function cleanText(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { topic, locale } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'topic muss ein String sein' }, { status: 400 });
    }

    const lang: Lang = locale === 'en' ? 'en' : 'de';

    const requestBody = JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION[lang] }] },
      contents: [{ role: 'user', parts: [{ text: topic.slice(0, 300) }] }],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.7,
        topP: 0.95,
        // „Thinking" aus: keine verborgene Deliberation, die das Modell zum
        // Zurückrudern bringt – wir zeigen sein unmittelbares Fortsetzen.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      throw new Error('Konnte kein OAuth-Token vom Dienstkonto erhalten');
    }
    const projectId = process.env.GCP_PROJECT_ID || (await auth.getProjectId());

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
    const text = cleanText(parts.map((p) => p.text ?? '').join(''));

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Hallucinate-Generierung Fehler:', error);
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
