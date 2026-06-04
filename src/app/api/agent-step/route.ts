import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { declarationsFor } from '@/lib/agent/tools';

// ---------------------------------------------------------------------------
// Ein einzelner Zug des Agenten für die Agenten-Seite.
//
// Ein „Agent" ist dasselbe echte Modell (Gemini über Vertex) wie auf den übrigen
// Seiten – nur in eine Schleife gestellt und mit Werkzeugen ausgestattet. Diese
// Route macht GENAU EINEN Modell-Zug: sie bekommt den bisherigen Gesprächsverlauf
// plus die Liste der aktuell aktivierten Werkzeuge und liefert den nächsten Zug:
//   • einen oder mehrere Werkzeug-Aufrufe (functionCall), die das Modell wählt, ODER
//   • eine Endantwort (reiner Text, kein Aufruf mehr).
//
// Die Schleife selbst (Aufruf ausführen, Ergebnis zurück in den Verlauf, erneut
// fragen) läuft CLIENTSEITIG in der Komponente. Dadurch sind die Werkzeuge echt,
// sichtbar und abschaltbar – und man sieht, dass die „Handlungsfähigkeit" im
// Gerüst um das Modell herum steckt, nicht im Modell selbst.
//
// `thinking` ist AUS: die sichtbare Kurz-Begründung des Modells IST seine Ausgabe.
// Auth = dasselbe Dienstkonto wie Next-Token/Reasoning. Details: api/predict-next.
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

// Die Sprache der sichtbaren Ausgabe (Begründung + Endantwort) wird über das
// System-Prompt gesteuert, nicht über die Aufgabensprache: die Werkzeug-Namen,
// -Beschreibungen und -Ergebnisse sind deutsch, und dieser Kontext zieht das
// Modell sonst zuverlässig ins Deutsche – selbst bei englischer Aufgabe. Darum
// schickt die Komponente die aktive UI-Sprache mit, und wir wählen das passende
// System-Prompt. Die Werkzeug-Bezeichner bleiben als feste Identifier stehen.
const SYSTEM_DE = [
  'Du bist ein hilfreicher Assistent, der Werkzeuge benutzen kann, um Aufgaben zu lösen.',
  'Wenn ein Werkzeug die Aufgabe sicherer löst als Raten, rufe es auf, statt zu schätzen.',
  'Sage vor jedem Werkzeug in genau einem kurzen Satz, was du als Nächstes tust und warum.',
  'Sind alle nötigen Ergebnisse da, gib die Endantwort in ein bis zwei Sätzen.',
  'Steht kein passendes Werkzeug zur Verfügung, sage offen, dass du die Aufgabe so nicht zuverlässig lösen kannst.',
  'Verwende keine Markdown-Formatierung (keine Sternchen, keine Rauten).',
  'Formuliere deine Begründungen und die Endantwort auf Deutsch.',
].join(' ');

const SYSTEM_EN = [
  'You are a helpful assistant that can use tools to solve tasks.',
  'If a tool solves the task more reliably than guessing, call it instead of estimating.',
  'Before each tool, say in exactly one short sentence what you do next and why.',
  'Once you have all the results you need, give the final answer in one or two sentences.',
  'If no suitable tool is available, say openly that you cannot solve the task reliably this way.',
  'Do not use Markdown formatting (no asterisks, no hashes).',
  'Write your reasoning and the final answer in English. The tool names (heute, tage_bis, rechner, teilen_mit_rest) are fixed identifiers – use them as given.',
].join(' ');

function systemFor(locale: unknown): string {
  return locale === 'en' ? SYSTEM_EN : SYSTEM_DE;
}

const DEFAULT_MAX_TOKENS = 512;

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

// Teil eines Modell-Zugs (Text und/oder Werkzeug-Aufruf).
type Part = {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Part[] };
    finishReason?: string;
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const { contents, tools, temperature, maxOutputTokens, locale } = await request.json();

    if (!Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json(
        { error: 'contents (Gesprächsverlauf) muss angegeben werden' },
        { status: 400 }
      );
    }

    // `tools` = Namen der aktivierten Werkzeuge; daraus die Declarations bauen.
    const toolNames: string[] = Array.isArray(tools)
      ? tools.filter((t): t is string => typeof t === 'string')
      : [];
    const functionDeclarations = declarationsFor(toolNames);

    const temp = typeof temperature === 'number' ? Math.min(2, Math.max(0, temperature)) : 0.3;
    const maxTok =
      typeof maxOutputTokens === 'number'
        ? Math.min(2048, Math.max(16, Math.round(maxOutputTokens)))
        : DEFAULT_MAX_TOKENS;

    const requestBody = JSON.stringify({
      systemInstruction: { parts: [{ text: systemFor(locale) }] },
      contents,
      ...(functionDeclarations.length ? { tools: [{ functionDeclarations }] } : {}),
      generationConfig: {
        maxOutputTokens: maxTok,
        temperature: temp,
        topP: 0.95,
        // „Thinking" aus: die sichtbare Begründung IST die Ausgabe.
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

    // Modelle der Reihe nach; bei 404 zum nächsten Kandidaten.
    let data: GeminiResponse | null = null;
    let usedModel = '';
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
        usedModel = model;
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

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    // Normalisieren: Text-Teile = „Gedanke", functionCall-Teile = Aktionen.
    const thought = parts
      .filter((p) => typeof p.text === 'string')
      .map((p) => (p.text ?? '').trim())
      .filter(Boolean)
      .join(' ')
      .trim();

    const calls = parts
      .filter((p) => p.functionCall)
      .map((p) => ({
        name: p.functionCall!.name,
        args: p.functionCall!.args ?? {},
      }));

    return NextResponse.json({
      thought,
      calls,
      // Kein Aufruf mehr → der Text ist die Endantwort.
      final: calls.length === 0 ? thought : null,
      finishReason: candidate?.finishReason ?? null,
      model: usedModel,
    });
  } catch (error) {
    console.error('Agenten-Zug Fehler:', error);
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
