// ---------------------------------------------------------------------------
// Gemeinsame Modell-Konfiguration für alle Chat-Routen (Gemini über Vertex).
//
// WARUM ZENTRAL?
// - Google schaltet Gemini-Generationen regelmässig ab (2.0 -> 404, 2.5 auf
//   Vertex am 20.10.2026). Steht die Modell-Kette an einer Stelle, ist der
//   nächste Wechsel eine Zeile statt sieben Dateien.
// - Die 3.x-Modelle gibt es auf Vertex nur am Standort "global" (us-central1
//   liefert 404). Darum ist der Standort hier fest und NICHT über GCP_LOCATION
//   steuerbar – eine alte GCP_LOCATION=us-central1 im Deployment würde sonst
//   alles brechen.
// - Logprobs und Prefill (Antwort als model-Turn vorgeben) sind bei 3.x NICHT
//   mehr zuverlässig verfügbar. Next-Token und das Basismodell laufen deshalb
//   über einen eigenen Anbieter, nicht über diese Kette.
// ---------------------------------------------------------------------------

export const VERTEX_LOCATION = 'global';

// Reihenfolge = Priorität; bei 404 (abgeschaltetes Modell) nimmt jede Route den
// nächsten Kandidaten. GEMINI_MODEL überschreibt das Primärmodell ohne Code-
// Änderung. Flash-Lite zuerst: am günstigsten und für die kurzen Lehr-Antworten
// ausreichend (und bei „direkt ohne Rechenweg" nicht so stark, dass der
// Chain-of-Thought-Unterschied verschwindet).
export const CHAT_MODEL_CANDIDATES: string[] = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
    ].filter((m): m is string => Boolean(m))
  )
);

// „Thinking" aus: ab Gemini 3 über thinkingLevel statt thinkingBudget
// (thinkingBudget ist dort veraltet). "minimal" lieferte im Test 0 Denk-Tokens.
export const THINKING_OFF = { thinkingLevel: 'minimal' } as const;

export function vertexGenerateUrl(projectId: string, model: string): string {
  return (
    `https://aiplatform.googleapis.com/v1/projects/${projectId}` +
    `/locations/${VERTEX_LOCATION}/publishers/google/models/${model}:generateContent`
  );
}
