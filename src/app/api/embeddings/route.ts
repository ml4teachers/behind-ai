import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

// ---------------------------------------------------------------------------
// Embeddings über Vertex AI / Google gemini-embedding-2.
//
// WARUM SO?
// - Wir wollen das neueste Gemini-Embedding-Modell (gemini-embedding-2,
//   multimodal). Es ist über die Vertex-AI-API in der Region "global"
//   verfügbar (regionale Endpunkte wie us-central1 kennen das Modell noch
//   nicht -> 404). Aufruf über :embedContent.
// - Auth läuft – wie bei der Next-Token-Route – über ein Dienstkonto
//   (OAuth Bearer Token), nicht über einen Plain-API-Key. Damit teilen sich
//   beide Routen dieselbe, bereits eingerichtete Authentifizierung.
//
// WICHTIG – Modell & Dimension müssen zur Landkarte passen:
//   Die Referenz-Embeddings der Bedeutungs-Landkarte (public/embeddings-map.json)
//   werden mit demselben Modell und derselben Dimension erzeugt
//   (scripts/gen-embeddings-map.mjs). Live-Wort und Referenzpunkte liegen nur
//   dann im selben Vektorraum, wenn Modell + outputDimensionality identisch
//   sind. Wer das Modell wechselt, muss die Landkarte neu generieren.
//
// SETUP – Authentifizierung (zwei Wege, automatisch erkannt):
//   A) LOKAL – Dateipfad:
//      GOOGLE_APPLICATION_CREDENTIALS=/absoluter/pfad/zu/gcp-service-account.json
//   B) DEPLOYMENT (z. B. Vercel) – Credentials als Env-Variable:
//      GCP_SERVICE_ACCOUNT_KEY=<komplette JSON ODER deren Base64>
//
// Optional:
//   GEMINI_EMBEDDING_MODEL=…   (überschreibt das Modell, Default unten)
// ---------------------------------------------------------------------------

// gemini-embedding-2 lebt aktuell unter der Vertex-Region "global".
const LOCATION = 'global';

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';

// Ausgabedimension. MUSS mit scripts/gen-embeddings-map.mjs übereinstimmen.
const OUTPUT_DIM = 768;

// GoogleAuth einmal pro Server-Instanz (Token wird gecacht/erneuert).
// Credentials kommen aus GCP_SERVICE_ACCOUNT_KEY (Env, JSON oder Base64 – für
// Vercel & Co.) oder, falls nicht gesetzt, aus GOOGLE_APPLICATION_CREDENTIALS
// (Dateipfad, lokale Entwicklung).
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

type EmbedContentResponse = {
  embedding?: { values?: number[] };
};

// Erzeugt ein Embedding für einen Text via Vertex gemini-embedding-2.
async function generateEmbedding(text: string): Promise<number[]> {
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken = accessTokenResponse?.token;
  if (!accessToken) {
    throw new Error('Konnte kein OAuth-Token vom Dienstkonto erhalten');
  }
  const projectId = process.env.GCP_PROJECT_ID || (await auth.getProjectId());

  const endpoint =
    `https://aiplatform.googleapis.com/v1/projects/${projectId}` +
    `/locations/${LOCATION}/publishers/google/models/${EMBEDDING_MODEL}:embedContent`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      output_dimensionality: OUTPUT_DIM,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Vertex-Embedding-Fehler ${response.status} (${EMBEDDING_MODEL}): ${errorBody}`
    );
  }

  const data: EmbedContentResponse = await response.json();
  const values = data.embedding?.values;
  if (!values || !Array.isArray(values) || values.length === 0) {
    throw new Error('Antwort enthielt keinen Embedding-Vektor');
  }
  return values;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text: unknown = body?.text;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      );
    }

    const embedding = await generateEmbedding(text.trim());

    return NextResponse.json({ embedding, model: EMBEDDING_MODEL, dim: embedding.length });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      {
        error: 'Embedding konnte nicht erzeugt werden',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
