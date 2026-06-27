// ---------------------------------------------------------------------------
// Reine Prüf-Logik für die Reasoning-Seiten (Chain-of-Thought + RLVR).
// Kein React, keine Abhängigkeiten – nur Funktionen, die man von Hand nachrechnet.
//
// Der gemeinsame Witz beider Seiten: Bei Aufgaben mit einer EINDEUTIG prüfbaren
// Antwort (ein Rechenergebnis, eine Buchstabenzahl) kann ein winziges Stück Code
// die Wahrheit bestimmen – egal, wie selbstsicher das Sprachmodell klingt. Genau
// dieser „Prüfer" ist auf der RLVR-Seite die Belohnung, die man nicht faken kann.
// ---------------------------------------------------------------------------

/** Zählt, wie oft ein Buchstabe in einem Wort vorkommt (Gross/Klein egal). */
export function countLetter(word: string, letter: string): number {
  const ch = letter.toLowerCase()
  let n = 0
  for (const c of word.toLowerCase()) if (c === ch) n++
  return n
}

// Erlaubte Zeichen eines Rechenausdrucks. Wir werten NUR Ausdrücke aus, die
// ausschliesslich hieraus bestehen – niemals beliebige Strings.
const ARITH_ALLOWED = /^[0-9+\-*/().,\s×÷−²³^]+$/

/**
 * Wertet einen einfachen Rechenausdruck aus. Unsere Anzeige-Schreibweise (×, −,
 * ², ³, ^) wird in JS-Operatoren übersetzt. Gibt `null` zurück, wenn der String
 * unerlaubte Zeichen enthält oder kein endliches Ergebnis liefert – dann gibt es
 * schlicht kein Urteil (z. B. bei einer frei eingetippten Wortaufgabe).
 */
export function evalArith(expr: string): number | null {
  const raw = expr.trim()
  if (!raw || !ARITH_ALLOWED.test(raw)) return null
  const js = raw
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/²/g, '**2')
    .replace(/³/g, '**3')
    .replace(/\^/g, '**')
    .replace(/,/g, '.')
  try {
    // Streng begrenzt durch ARITH_ALLOWED oben.
    const val = Function(`"use strict"; return (${js});`)()
    return typeof val === 'number' && Number.isFinite(val) ? val : null
  } catch {
    return null
  }
}

/**
 * Holt die Antwort aus einer Modell-Ausgabe. Bevorzugt die letzte Zeile der Form
 * „Antwort: …" bzw. „Answer: …" (beide Sprachen); fehlt sie, nimmt sie den ganzen
 * Text. Liefert den rohen String (z. B. „-31", „0,05 Franken", „4 Buchstaben").
 */
export function parseAnswer(text: string): string {
  const matches = [...text.matchAll(/(?:Antwort|Answer):\s*(.+)/gi)]
  const tail = matches.length ? matches[matches.length - 1][1] : text
  return tail.trim()
}

/** Zieht die letzte (vorzeichenbehaftete) Zahl aus einem String, sonst `null`. */
export function extractNumber(s: string): number | null {
  const norm = s.replace(/−/g, '-')
  const nums = norm.match(/-?\d+(?:[.,]\d+)?/g)
  if (!nums) return null
  return Number(nums[nums.length - 1].replace(',', '.'))
}

/**
 * Prüft, ob die geparste Modell-Antwort zur Wahrheit passt (numerisch, mit
 * winziger Toleranz für Rundung). `answer` ist roher Text, `truth` die Zahl.
 */
export function isCorrect(answer: string, truth: number): boolean {
  const got = extractNumber(answer)
  if (got === null) return false
  return Math.abs(got - truth) < 1e-6
}
