import { NextRequest, NextResponse } from 'next/server';
import { baseCompletion } from '@/lib/base-model';
import { openRouterChat } from '@/lib/openrouter';

// ---------------------------------------------------------------------------
// Finetuning-Vergleich: Basismodell (nur Pretraining) vs. Assistent.
//
// - LINKS ein ECHTES Basismodell (Llama 3.1 8B Base über Hugging Face, siehe
//   @/lib/base-model): Es bekommt nur den rohen Text und setzt ihn fort – ohne
//   Anweisung, ohne Chat-Vorlage, ohne Trick. Was dabei herauskommt (Fragenliste,
//   Forenbeitrag, ein Dialog für beide Rollen …), ist authentisches Pretraining-
//   Verhalten und lässt sich nicht für jede Eingabe vorhersehen – genau darum
//   geht es.
// - RECHTS ein Chat-Modell nach Finetuning (Qwen3 über OpenRouter, siehe
//   @/lib/openrouter): Frage als user-Turn + System-Anweisung "hilfreicher
//   Assistent".
//
// Frühere Versuche, das Basismodell mit einem Chat-Modell zu simulieren
// (Prefill + „nur fortsetzen", vorgesetzte Fragenliste), scheiterten: Das
// Finetuning schlägt bei Fragen und Aufgaben immer wieder durch.
// ---------------------------------------------------------------------------

type Lang = 'de' | 'en';

// System-Anweisung für den ASSISTENT-Modus (normaler Chat).
const ASSISTANT_INSTRUCTION: Record<Lang, string> = {
  de:
    'Du bist ein hilfreicher Assistent. Beantworte die Anfrage direkt, präzise ' +
    'und klar strukturiert. Halte dich kurz. Antworte in der Sprache der Anfrage. ' +
    'Verwende keine Markdown-Formatierung (keine Sternchen, keine Rauten). Nur ' +
    'für echte Aufzählungen einfache Spiegelstriche (–), sonst normaler Text ' +
    'bzw. bei Gedichten normale Verse.',
  en:
    'You are a helpful assistant. Answer the request directly, precisely and in a ' +
    'clearly structured way. Keep it short. Answer in the language of the request. ' +
    'Do not use Markdown formatting (no asterisks, no hashes). Use simple dashes ' +
    '(–) only for real lists; otherwise plain text, or plain verses for poems.',
};

// Basis-Modus bewusst kurz: ein Basismodell würde endlos weiterschreiben, also
// brechen wir nach ~100 Tokens ab (didaktisch: "es stoppt nicht von selbst").
// Der Assistent bekommt genug Raum, um seine Antwort selbst zu Ende zu bringen
// (sonst stimmt das "hört von selbst auf" nicht mehr).
const MAX_OUTPUT_TOKENS_BASE = 100;
const MAX_OUTPUT_TOKENS_ASSISTANT = 256;

// Wie oft ein leeres Ergebnis neu versucht wird. Das Basismodell samplet
// gelegentlich sofort ein End-Token -> leere Fortsetzung; ein erneuter Versuch
// liefert dann fast immer Text.
const MAX_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    const { query, mode, locale } = await request.json();

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

    const lang: Lang = locale === 'en' ? 'en' : 'de';

    // Leere/sehr kurze Fortsetzung neu anfragen. Im Basis-Modus verlangen wir
    // eine substanzielle Länge (eine 23-Zeichen-Fortsetzung ist anschaulich
    // wertlos); im Assistent-Modus reicht "nicht leer", weil kurze Antworten
    // dort legitim sind. temperature > 0 sorgt für Varianz -> Retry hilft.
    const minLen = mode === 'base' ? 40 : 1;
    let responseText = '';
    for (
      let attempt = 0;
      attempt < MAX_ATTEMPTS && responseText.length < minLen;
      attempt++
    ) {
      responseText = (
        mode === 'base'
          ? // Nur der rohe Text – das Basismodell setzt ihn einfach fort.
            await baseCompletion({
              prompt: query,
              maxTokens: MAX_OUTPUT_TOKENS_BASE,
              temperature: 0.8,
            })
          : (
              await openRouterChat({
                messages: [
                  { role: 'system', content: ASSISTANT_INSTRUCTION[lang] },
                  { role: 'user', content: query },
                ],
                maxTokens: MAX_OUTPUT_TOKENS_ASSISTANT,
                temperature: 0.7,
              })
            ).text
      ).trim();
      if (responseText.length < minLen) {
        console.warn(
          `Leere/kurze Antwort (${mode}, Versuch ${attempt + 1}/${MAX_ATTEMPTS}, ` +
            `len=${responseText.length})`
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
