// ---------------------------------------------------------------------------
// OpenRouter-Anbindung für Next-Token (Logprobs) und den Assistenten der
// Finetuning-Seite. Das Basismodell der Finetuning-Seite ist ein ECHTES
// Basismodell über Hugging Face (@/lib/base-model).
//
// WARUM OPENROUTER?
// - Gemini ab 3.x liefert auf Vertex keine Logprobs mehr und lehnt Prefill
//   (Text als Anfang der Modell-Antwort vorgeben) teils ganz ab.
// - Echte Basismodelle (nur Pretraining) bietet kaum noch ein Anbieter an;
//   OpenAI hat babbage-002/davinci-002 am 28.09.2026 abgeschaltet.
// - Über OpenRouter bekommen wir ein offenes Modell mit Logprobs (bis 20
//   Alternativen). Echte Basismodelle gibt es dort nicht.
//
// Modellwahl (empirisch geprüft, Oktober 2026):
// - Qwen3-235B-2507 (Instruct, OHNE Thinking): Logprobs passen zum Text und
//   sind scharf („ist" -> „ Bern" 99 %). Nur über Parasail/Google sauber;
//   andere Anbieter liefern teils Logprobs, die nicht zum Text passen, oder
//   sind überlastet.
// - DeepSeek V3.2 als Fallback, nur über Google (SambaNova lieferte Unsinn).
// - Der /completions-Endpunkt von OpenRouter verpackt den Prompt intern als
//   Chat – das Modell antwortet dann, statt fortzusetzen.
//
// SETUP: OPENROUTER_API_KEY in .env.local bzw. im Deployment.
// Optional: OPENROUTER_MODEL überschreibt das Primärmodell.
// ---------------------------------------------------------------------------

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

type Candidate = { model: string; providers: string[] };

export const MODEL_CANDIDATES: Candidate[] = [
  ...(process.env.OPENROUTER_MODEL
    ? [{ model: process.env.OPENROUTER_MODEL, providers: [] }]
    : []),
  { model: 'qwen/qwen3-235b-a22b-2507', providers: ['Parasail', 'Google'] },
  { model: 'deepseek/deepseek-v3.2', providers: ['Google'] },
];

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type TopLogprob = { token: string; logprob: number };

export type OpenRouterResult = {
  text: string;
  model: string;
  provider?: string;
  // Alternativen pro Ausgabe-Position (nur wenn topLogprobs angefragt).
  logprobs?: Array<{ token: string; logprob: number; top_logprobs: TopLogprob[] }>;
};

type OpenRouterOptions = {
  messages: ChatMessage[];
  maxTokens: number;
  temperature?: number;
  topLogprobs?: number;
};

export async function openRouterChat(opts: OpenRouterOptions): Promise<OpenRouterResult> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) throw new Error('OPENROUTER_API_KEY ist nicht gesetzt');

  let lastError = '';
  for (const { model, providers } of MODEL_CANDIDATES) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: opts.messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature ?? 1,
        ...(opts.topLogprobs ? { logprobs: true, top_logprobs: opts.topLogprobs } : {}),
        provider: {
          // Nur Anbieter, die ALLE Parameter (v. a. Logprobs) wirklich können.
          require_parameters: true,
          ...(providers.length ? { order: providers, allow_fallbacks: false } : {}),
        },
      }),
    });

    const data = await res.json().catch(() => null);
    const choice = data?.choices?.[0];
    if (res.ok && choice && !data.error) {
      return {
        text: choice.message?.content ?? '',
        model,
        provider: data.provider,
        logprobs: choice.logprobs?.content ?? undefined,
      };
    }

    // Jeder Fehler (Modell weg, Anbieter überlastet, 5xx) -> nächstes Modell.
    // Nur fehlender/ungültiger Schlüssel wird sofort gemeldet.
    lastError = `OpenRouter-Fehler ${res.status} (${model}): ${JSON.stringify(data?.error ?? data).slice(0, 300)}`;
    if (res.status === 401 || res.status === 402) throw new Error(lastError);
    console.warn(lastError);
  }
  throw new Error(lastError || 'Kein OpenRouter-Modell verfügbar');
}

// --- Next-Token: Fortsetzung mit Few-Shot statt Prefill -----------------------
//
// Beim Prefill tokenisiert der Anbieter den vorgegebenen Text als abgeschlossen:
// Den Tokens fehlt dann das führende Leerzeichen („ist" -> „Bern"), und nach
// einem Wortteil („… Finger ges") rät das Modell den Wortanfang erneut. Ob ein
// Leerzeichen hingehört, lässt sich aus dem Token allein nicht ablesen.
// Lösung: Der Text steht in der Anfrage, das Modell gibt NUR die Fortsetzung
// aus – und ein paar Beispiel-Paare zeigen ihm, wann sie mit Leerzeichen
// beginnt (neues Wort) und wann nicht (angefangenes Wort). Im Test: „ist" ->
// „ Bern" 99 %, „ist Be" -> „rn" 100 %, „Finger ges" -> „chn" 100 %.
const NEXT_TOKEN_SYSTEM =
  'Du bist ein Sprachmodell zur Textfortsetzung. Gib AUSSCHLIESSLICH die direkte ' +
  'Fortsetzung des Textes aus – exakt die Zeichen, die unmittelbar danach folgen. ' +
  'Beginnt die Fortsetzung mit einem neuen Wort, beginne mit einem Leerzeichen; ' +
  'vervollständigt sie ein angefangenes Wort, beginne ohne Leerzeichen. ' +
  'Wiederhole den Text nicht.';
const NEXT_TOKEN_SHOTS: [string, string][] = [
  ['Der Hund', ' bellt laut.'],
  ['Am Morgen trinke ich Kaf', 'fee mit Milch.'],
  ['Gestern Abend', ' war ich im Kino.'],
  ['Wir fahren nach Ber', 'lin.'],
];

export function nextTokenMessages(text: string): ChatMessage[] {
  return [
    { role: 'system', content: NEXT_TOKEN_SYSTEM },
    ...NEXT_TOKEN_SHOTS.flatMap(([user, assistant]): ChatMessage[] => [
      { role: 'user', content: user },
      { role: 'assistant', content: assistant },
    ]),
    // Ohne Schluss-Leerraum: das Modell entscheidet selbst über das Leerzeichen.
    { role: 'user', content: text.trimEnd() },
  ];
}

// Token für die Anzeige aufbereiten. Endet der Originaltext schon auf Leerraum,
// fällt das führende Leerzeichen weg (sonst stünden zwei). Steuer-Tokens wie
// „<|eot_id|>" oder „<｜end▁of▁sentence｜>" sind kein Text -> null. Ebenso
// chinesische/japanische/koreanische Zeichen („巴黎" für Paris): Qwen wurde
// stark auf Chinesisch trainiert, das verwirrt auf einer deutschen Seite nur.
export function displayToken(text: string, token: string): string | null {
  if (/^<[|｜].*[|｜]>$/.test(token)) return null;
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(token)) return null;
  // Unsichtbare Sonder-Leerzeichen (z. B. geschütztes Leerzeichen) ergäben
  // einen leeren Balken ohne Beschriftung.
  if (/^[\u00a0\u2000-\u200b\u202f\u3000\ufeff]+$/.test(token)) return null;
  return /\s$/.test(text) ? token.replace(/^ +/, '') : token;
}
