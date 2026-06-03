import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// ---------------------------------------------------------------------------
// Next-Token-Prediction über Vertex AI / Gemini Enterprise Agent Platform.
//
// WARUM SO?
// - Die "AI Studio"-Gemini-API (generativelanguage.googleapis.com) hat logprobs
//   serverseitig deaktiviert.
// - logprobs gibt es nur über Vertex AI (aiplatform.googleapis.com), dort als
//   Public Preview via responseLogprobs/logprobs.
// - Vertex erlaubt in einem normalen Cloud-Projekt KEINE Plain-API-Key-Auth
//   ("Diese API erfordert ... ein Dienstkonto"). Deshalb authentifizieren wir
//   per Service Account (OAuth Bearer Token).
//
// SETUP – Authentifizierung (zwei Wege, automatisch erkannt):
//
//   A) LOKALE ENTWICKLUNG – Dateipfad:
//      GOOGLE_APPLICATION_CREDENTIALS=/absoluter/pfad/zu/gcp-service-account.json
//
//   B) DEPLOYMENT (z. B. Vercel) – Credentials als Env-Variable, KEINE Datei:
//      GCP_SERVICE_ACCOUNT_KEY=<komplette JSON ODER deren Base64>
//      (Base64 wird automatisch erkannt – praktisch, weil der private_key
//       Zeilenumbrüche enthält. Erzeugen: `base64 -i gcp-service-account.json`)
//
// Optional (beide Wege):
//   GCP_LOCATION=us-central1   (Default unten; global/europe-west1 gaben 403)
//   GCP_PROJECT_ID=…           (sonst aus der JSON/Credentials gelesen)
//   GEMINI_MODEL=…             (überschreibt das Primärmodell, siehe unten)
//
// Das Dienstkonto braucht die Rolle "Vertex AI User". Die JSON-Schlüsseldatei
// ist in .gitignore ausgeschlossen und darf NICHT eingecheckt werden.
// ---------------------------------------------------------------------------

const LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Modell mit logprobs-Unterstützung auf Vertex.
//
// ZUKUNFTSSICHERHEIT: Auf Vertex gibt es KEINE "-latest"-Aliase (die existieren
// nur in der AI-Studio-API). Wir nehmen den stabilen, automatisch aktualisierten
// Major-Alias "gemini-2.5-flash". Wird eine Generation irgendwann abgeschaltet
// (wie damals gemini-2.0-flash -> 404), greift die Fallback-Kette: bei einem
// 404/NOT_FOUND probieren wir automatisch das nächste Modell. Den Primär-Wert
// kannst du jederzeit per Env-Variable GEMINI_MODEL überschreiben – ohne Code-
// Änderung auf eine neue Generation umstellen.
const MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ].filter((m): m is string => Boolean(m))
  )
);

// Anzahl der Top-Alternativen pro Position (Vertex erlaubt 1–20).
const TOP_LOGPROBS = 5;

// Anweisung im user-Turn. Der eigentliche Text kommt als "model"-Turn (Prefill),
// damit Gemini den Text WIRKLICH fortsetzt – dadurch tragen die Tokens wieder das
// führende Leerzeichen (" Paris" statt "Paris") und Wörter werden nicht mitten
// im Wort zerschnitten ("Farbe" bleibt " Farbe" statt "Far"+"be").
const USER_INSTRUCTION =
  'Setze den folgenden Text wie ein Sprachmodell als reinen Fliesstext fort. ' +
  'Schreibe direkt weiter, ohne den Text zu wiederholen. ' +
  'Verwende KEINE Formatierung: keine Markdown-Zeichen, keine Sternchen (*), ' +
  'keine Unterstriche (_), keine Aufzählungen, keine Überschriften und keine ' +
  'Anführungszeichen. Nur normaler Fliesstext.';

// GoogleAuth einmal pro Server-Instanz initialisieren (Token wird gecacht/erneuert).
// Deployment-tauglich: Credentials kommen entweder aus GCP_SERVICE_ACCOUNT_KEY
// (Env-Variable, JSON oder Base64 – für Vercel & Co.) oder, falls nicht gesetzt,
// aus GOOGLE_APPLICATION_CREDENTIALS (Dateipfad, lokale Entwicklung).
function createAuth(): GoogleAuth {
  const scopes = 'https://www.googleapis.com/auth/cloud-platform';
  const raw = process.env.GCP_SERVICE_ACCOUNT_KEY?.trim();

  if (raw) {
    // Base64 automatisch erkennen (JSON beginnt mit "{").
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

  // Lokal: Dateipfad via GOOGLE_APPLICATION_CREDENTIALS.
  return new GoogleAuth({ scopes });
}

const auth = createAuth();

type GeminiLogprobCandidate = {
  token?: string;
  logProbability?: number;
  tokenId?: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    logprobsResult?: {
      topCandidates?: Array<{ candidates?: GeminiLogprobCandidate[] }>;
      chosenCandidates?: GeminiLogprobCandidate[];
    };
  }>;
};

export async function POST(request: Request) {
  let requestText = "";

  try {
    const body = await request.json();
    requestText = body?.text ?? "";
    const text = requestText;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text muss ein gültiger String sein' },
        { status: 400 }
      );
    }

    // OAuth-Token vom Dienstkonto holen + Projekt-ID bestimmen.
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      throw new Error('Konnte kein OAuth-Token vom Dienstkonto erhalten');
    }
    const projectId =
      process.env.GCP_PROJECT_ID || (await auth.getProjectId());

    const requestBody = JSON.stringify({
      contents: [
        // user-Turn: die Anweisung.
        { role: 'user', parts: [{ text: USER_INSTRUCTION }] },
        // model-Turn (Prefill): der fortzusetzende Text. So setzt Gemini den
        // Text echt fort statt frisch zu antworten -> Tokens mit Leerzeichen.
        { role: 'model', parts: [{ text }] },
      ],
      generationConfig: {
        // Nur das erste Fortsetzungs-Token interessiert uns.
        maxOutputTokens: 1,
        temperature: 1.0,
        topP: 1.0,
        responseLogprobs: true,
        logprobs: TOP_LOGPROBS,
        // "Thinking" deaktivieren, damit das erste Output-Token die echte
        // Text-Fortsetzung ist und nicht von Denk-Tokens verbraucht wird.
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    // Modelle der Reihe nach probieren; bei 404 (Modell abgeschaltet/unbekannt)
    // automatisch zum nächsten Kandidaten wechseln.
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
      // Nur bei 404 (Modell existiert nicht mehr) den nächsten Kandidaten testen.
      if (geminiResponse.status === 404) {
        console.warn(`Modell ${model} nicht verfügbar, versuche nächstes…`);
        continue;
      }
      // Andere Fehler (Auth, Quota, 500 …) nicht maskieren.
      throw new Error(lastError);
    }

    if (data === null) {
      throw new Error(lastError || 'Kein Vertex-Modell verfügbar');
    }

    // Logprobs extrahieren.
    // Struktur: candidates[0].logprobsResult.topCandidates[0].candidates[]
    let topTokens: { token: string; probability: number }[] = [];
    let remainingProbability = 1;

    const logprobsResult = data?.candidates?.[0]?.logprobsResult;
    const firstPositionCandidates: GeminiLogprobCandidate[] | undefined =
      logprobsResult?.topCandidates?.[0]?.candidates;

    if (firstPositionCandidates && firstPositionCandidates.length > 0) {
      // logProbability ist der natürliche Logarithmus der Wahrscheinlichkeit.
      // Gemini liefert gelegentlich dasselbe Token doppelt – wir deduplizieren
      // nach Token und behalten jeweils die höchste Wahrscheinlichkeit.
      const byToken = new Map<string, number>();
      for (const c of firstPositionCandidates) {
        const token = c.token ?? '';
        const probability = Math.exp(Number(c.logProbability ?? -Infinity));
        const existing = byToken.get(token);
        if (existing === undefined || probability > existing) {
          byToken.set(token, probability);
        }
      }

      topTokens = Array.from(byToken, ([token, probability]) => ({ token, probability }));
      topTokens = topTokens.sort((a, b) => b.probability - a.probability);

      const topTokensSum = topTokens.reduce((sum, item) => sum + item.probability, 0);
      remainingProbability = Math.max(0, 1 - topTokensSum);
    } else {
      // Fallback, falls das Modell keine logprobs liefert.
      topTokens = getFallbackPredictions(text);
    }

    // Vom Modell tatsächlich gewähltes Token.
    const chosenToken: string =
      logprobsResult?.chosenCandidates?.[0]?.token ??
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      topTokens[0]?.token ??
      '';

    const response_data = {
      text,
      topTokens,
      remainingProbability,
      generatedToken: chosenToken,
      totalTokens: topTokens.length,
      apiNotice: topTokens.length === 0
        ? "Modell konnte keine Token-Wahrscheinlichkeiten liefern, zeige Fallback-Daten."
        : undefined,
    };

    return NextResponse.json(response_data);
  } catch (error) {
    console.error('Next-Token Prediction Fehler:', error);

    // Fallback-Vorhersagen, wenn die API nicht erreichbar ist.
    const fallbackTokens = getFallbackPredictions(requestText);

    return NextResponse.json({
      text: requestText,
      topTokens: fallbackTokens,
      remainingProbability: 0.33,
      generatedToken: fallbackTokens[0].token,
      totalTokens: fallbackTokens.length,
      apiNotice: error instanceof Error
        ? `API-Fehler: ${error.message}. Zeige Fallback-Daten.`
        : "API nicht erreichbar. Zeige Fallback-Daten."
    });
  }
}

// Verbesserte Fallback-Funktion mit kontextbezogenen Vorhersagen
function getFallbackPredictions(text: string) {
  const lowercaseText = text.toLowerCase();

  if (lowercaseText.includes('sonne scheint')) {
    return [
      { token: ' hell', probability: 0.32 },
      { token: ' heute', probability: 0.24 },
      { token: ' am', probability: 0.14 },
      { token: ' durch', probability: 0.08 },
      { token: ' und', probability: 0.06 },
      { token: ' auf', probability: 0.05 },
    ];
  } else if (lowercaseText.includes('künstliche intelligenz')) {
    return [
      { token: ' ist', probability: 0.28 },
      { token: ' kann', probability: 0.22 },
      { token: ' hat', probability: 0.12 },
      { token: ' wird', probability: 0.09 },
      { token: ' und', probability: 0.07 },
      { token: ' revolutioniert', probability: 0.04 },
    ];
  } else if (lowercaseText.includes('schüler lernen')) {
    return [
      { token: ' mit', probability: 0.26 },
      { token: ' in', probability: 0.18 },
      { token: ' durch', probability: 0.14 },
      { token: ' besser', probability: 0.11 },
      { token: ' schneller', probability: 0.08 },
      { token: ' gemeinsam', probability: 0.05 },
    ];
  } else {
    // Allgemeiner Fallback
    return [
      { token: ' und', probability: 0.18 },
      { token: ' ist', probability: 0.15 },
      { token: ' in', probability: 0.12 },
      { token: ' der', probability: 0.09 },
      { token: ' mit', probability: 0.07 },
      { token: ' die', probability: 0.06 },
    ];
  }
}
