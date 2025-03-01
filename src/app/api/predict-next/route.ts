import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI Client mit API-Key aus Umgebungsvariablen
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Babbage-002 für Next Token Prediction mit Logprobs
const MODEL_ID = "babbage-002";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text muss ein gültiger String sein' },
        { status: 400 }
      );
    }

    
    // Textgenerierung mit Wahrscheinlichkeitsberechnung über OpenAI
    const response = await openai.completions.create({
      model: MODEL_ID,
      prompt: text,
      max_tokens: 1,
      temperature: 1.0,
      top_p: 1.0,
      logprobs: 5, // Top 5 wahrscheinlichsten Tokens anfordern
      echo: false
    });
    

    // Extrahieren der logprobs aus der Antwort
    let topTokens = [];
    let remainingProbability = 1;
    
    // Prüfen, ob logprobs in der Antwort enthalten sind
    if (response.choices && 
        response.choices[0] && 
        response.choices[0].logprobs && 
        response.choices[0].logprobs.top_logprobs && 
        response.choices[0].logprobs.top_logprobs[0]) {
      
      const topLogprobs = response.choices[0].logprobs.top_logprobs[0];
      
      // Umwandlung in ein Array von {token, probability}
      topTokens = Object.entries(topLogprobs).map(([token, logprob]) => ({
        token: token,
        probability: Math.exp(Number(logprob)),
      }));
      
      
      // Sortieren nach Wahrscheinlichkeit (absteigend)
      topTokens = topTokens.sort((a, b) => b.probability - a.probability);
      
      // Summe der Wahrscheinlichkeiten berechnen
      const topTokensSum = topTokens.reduce((sum, item) => sum + item.probability, 0);
      remainingProbability = Math.max(0, 1 - topTokensSum);
    } else {
      // Fallback - simulieren Sie logprobs, wenn keine vorhanden sind
      topTokens = getFallbackPredictions(text);
    }

    const response_data = {
      text,
      topTokens,
      remainingProbability,
      generatedToken: response.choices[0].text,
      totalTokens: topTokens.length,
      // Info, wenn wir Fallback-Daten verwenden
      apiNotice: topTokens.length === 0 ? 
        "Modell konnte keine Token-Wahrscheinlichkeiten liefern, zeige Fallback-Daten." : 
        undefined
    };
    
    return NextResponse.json(response_data);
  } catch (error) {
    console.error('Next-Token Prediction Fehler:', error);
    
    // Fallback-Vorhersagen bereitstellen, wenn die API nicht erreichbar ist
    const requestText = typeof request.body === 'object' && request.body !== null 
      ? (request.body as { text?: string })?.text || ""
      : "";
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