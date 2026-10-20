// ---------------------------------------------------------------------------
// Echtes Basismodell (nur Pretraining, KEIN Chat-/Assistenz-Finetuning).
//
// WARUM SO?
// - Chat-Modelle lassen sich nicht glaubwürdig „zurückdrehen": Mit Prefill und
//   neutraler Anweisung beantworten sie Fragen und erledigen Aufgaben trotzdem
//   – das Finetuning schlägt durch. Mit Tricks (vorgesetzte Fragenliste)
//   lassen sich nur Eingaben abdecken, die man vorhersieht.
// - Echte Basismodelle gibt es über Hugging Face (Anbieter Featherless). Über
//   den ROHEN /completions-Endpunkt bekommt das Modell nur den Text, ohne
//   Chat-Vorlage. Über den Chat-Endpunkt würde Hugging Face den Text in eine
//   „User/Assistant"-Vorlage verpacken – dann spielt auch ein Basismodell
//   Assistent.
//
// Modellwahl (empirisch geprüft, Oktober 2026):
// - Llama 3.1 8B (Base): Lehrbuch-Verhalten – eine Frage wird zur Fragenliste
//   wie auf einer Quizseite, ein Satz zum Forenbeitrag, ein Dialog wird für
//   BEIDE Rollen weitergeschrieben. Antwort in unter 1 s.
// - Qwen3-8B-Base als Ausweich: beantwortet Fragen teils (viele Frage-Antwort-
//   Daten im Pretraining), aber immer noch ohne Chat-Vorlage.
// - Mistral 7B v0.1 verworfen: driftet ins Englische und in Buchkataloge ab.
// - Logprobs liefert Featherless NICHT – Next-Token läuft deshalb über
//   OpenRouter (@/lib/openrouter).
//
// SETUP: HUGGINGFACE_API_KEY mit Guthaben (Inference Providers).
// Optional: HF_BASE_MODEL überschreibt das Primärmodell.
// ---------------------------------------------------------------------------

const ENDPOINT = 'https://router.huggingface.co/featherless-ai/v1/completions';

const BASE_MODELS: string[] = Array.from(
  new Set(
    [
      process.env.HF_BASE_MODEL,
      'meta-llama/Llama-3.1-8B',
      'Qwen/Qwen3-8B-Base',
    ].filter((m): m is string => Boolean(m))
  )
);

type BaseCompletionOptions = {
  prompt: string;
  maxTokens: number;
  temperature?: number;
};

export async function baseCompletion(opts: BaseCompletionOptions): Promise<string> {
  const key = process.env.HUGGINGFACE_API_KEY?.trim();
  if (!key) throw new Error('HUGGINGFACE_API_KEY ist nicht gesetzt');

  let lastError = '';
  for (const model of BASE_MODELS) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: opts.prompt,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature ?? 0.8,
      }),
    });

    const data = await res.json().catch(() => null);
    const text = data?.choices?.[0]?.text;
    if (res.ok && typeof text === 'string') return text;

    // Kein Guthaben / ungültiger Schlüssel betrifft alle Modelle -> sofort melden.
    lastError = `Hugging-Face-Fehler ${res.status} (${model}): ${JSON.stringify(data?.error ?? data).slice(0, 300)}`;
    if (res.status === 401 || res.status === 402) throw new Error(lastError);
    console.warn(lastError);
  }
  throw new Error(lastError || 'Kein Basismodell verfügbar');
}
