import { NextResponse } from 'next/server';
import { displayToken, nextTokenMessages, openRouterChat } from '@/lib/openrouter';

// ---------------------------------------------------------------------------
// Next-Token-Prediction: Wahrscheinlichkeiten für das NÄCHSTE Token.
//
// WARUM SO?
// - Früher lief das über Gemini 2.5 auf Vertex (responseLogprobs). Google hat
//   2.5 auf Vertex am 20.10.2026 abgeschaltet, und die 3.x-Modelle liefern
//   keine Logprobs mehr. Jetzt: offenes Modell über OpenRouter, Details und
//   Modellwahl in @/lib/openrouter.
// - Das Modell gibt NUR die Fortsetzung des Textes aus (Few-Shot, siehe
//   nextTokenMessages) – so stimmen auch die Leerzeichen der Tokens.
//
// SETUP: OPENROUTER_API_KEY (siehe .env.example).
// ---------------------------------------------------------------------------

// Angezeigte Alternativen pro Position. Abgefragt werden mehr (OpenRouter
// erlaubt bis 20), weil displayToken Steuer- und CJK-Tokens herausfiltert und
// danach trotzdem genug übrig bleiben sollen.
const TOP_TOKENS_SHOWN = 5;
const TOP_LOGPROBS = 10;

// Kalibrier-Temperatur: Chat-Modelle sind nach Finetuning/RLHF überkonfident –
// Qwen liefert „Ein frohes neues" -> „ Jahr" mit 99.99 %, „ist" -> „ Bern" mit
// 99 %. Mit T = 2.2 liegen die Werte wieder dort, wo Gemini 2.5 früher lag und
// wo man sie intuitiv erwartet („ Jahr" ~99 %, „Es war einmal eine" verteilt
// sich auf mehrere plausible Fortsetzungen). Die Reihenfolge
// der Tokens ändert sich dadurch nicht. Der Temperatur-Regler der Next-Token-
// Seite wirkt zusätzlich auf diese Werte.
const CALIBRATION_TEMPERATURE = 2.2;

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

    const result = await openRouterChat({
      messages: nextTokenMessages(text),
      // Nur das erste Fortsetzungs-Token interessiert uns.
      maxTokens: 1,
      temperature: 1.0,
      topLogprobs: TOP_LOGPROBS,
    });

    // Logprobs der ersten Ausgabe-Position.
    let topTokens: { token: string; probability: number }[] = [];
    let remainingProbability = 1;

    const firstPosition = result.logprobs?.[0]?.top_logprobs;
    if (firstPosition && firstPosition.length > 0) {
      // logprob ist der natürliche Logarithmus der Wahrscheinlichkeit. Nach der
      // Aufbereitung können zwei Tokens gleich aussehen – wir fassen sie zusammen.
      const byToken = new Map<string, number>();
      for (const c of firstPosition) {
        const token = displayToken(text, c.token ?? '');
        if (token === null || token === '') continue;
        const probability = Math.exp(Number(c.logprob ?? -Infinity));
        byToken.set(token, (byToken.get(token) ?? 0) + probability);
      }

      // „ Bern" und „Bern" sind dasselbe Wort – das Modell ist sich nur beim
      // Leerzeichen uneins. Wir fassen solche Paare zur wahrscheinlicheren
      // Schreibweise zusammen (sonst stünde „Bern" nach der Kalibrierung mit
      // ~10 % als eigene Alternative da).
      for (const [token, probability] of Array.from(byToken)) {
        const twin = token.startsWith(' ') ? token.slice(1) : ' ' + token;
        const twinProbability = byToken.get(twin);
        if (twinProbability === undefined || !byToken.has(token)) continue;
        const [keep, drop] = probability >= twinProbability ? [token, twin] : [twin, token];
        byToken.set(keep, probability + twinProbability);
        byToken.delete(drop);
      }

      topTokens = Array.from(byToken, ([token, probability]) => ({ token, probability }));
      topTokens = topTokens
        .sort((a, b) => b.probability - a.probability)
        .slice(0, TOP_TOKENS_SHOWN);

      const topTokensSum = topTokens.reduce((sum, item) => sum + item.probability, 0);
      remainingProbability = Math.max(0, 1 - topTokensSum);

      // Kalibrieren: p^(1/T), dann neu normieren (Rest als ein Bucket).
      const invT = 1 / CALIBRATION_TEMPERATURE;
      const weighted = topTokens.map((t) => Math.pow(t.probability, invT));
      const weightedRest = Math.pow(remainingProbability, invT);
      const z = weighted.reduce((a, b) => a + b, 0) + weightedRest;
      if (z > 0) {
        topTokens = topTokens.map((t, i) => ({ ...t, probability: weighted[i] / z }));
        remainingProbability = weightedRest / z;
      }
    } else {
      // Fallback, falls das Modell keine logprobs liefert.
      topTokens = getFallbackPredictions(text);
    }

    // Vom Modell tatsächlich gewähltes Token.
    const chosenToken: string =
      displayToken(text, result.logprobs?.[0]?.token ?? '') ||
      topTokens[0]?.token ||
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
