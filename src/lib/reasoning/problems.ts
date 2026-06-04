// ---------------------------------------------------------------------------
// Kuratierte, empirisch geprüfte Aufgaben für die beiden Reasoning-Seiten.
// (Gegen das echte gemini-2.5-flash auf Vertex derisked, siehe Plan/Changelog.)
//
//   • Chain-of-Thought  → Mehrschritt-Arithmetik. „Sofort antworten" ist hier
//     zuverlässig FALSCH, „Schritt für Schritt" zuverlässig RICHTIG. Der reine
//     Falsch→Richtig-Flip ist die Lektion: Mitdenken = Rechnen.
//
//   • RLVR              → Buchstaben zählen. Selbst MIT Mitdenken STREUEN die
//     Antworten bei Temperatur (echte Mischung aus richtig/falsch) – ideal, um
//     einen Prüfer sortieren und das Richtige verstärken zu lassen. (Arithmetik
//     taugt hier nicht: unter CoT zu zuverlässig → keine Streuung.)
// ---------------------------------------------------------------------------

import { evalArith, countLetter } from './verify'

export interface ArithProblem {
  id: string
  /** Anzeige- und Prompt-Schreibweise (mit ×, −, ², ³). */
  expr: string
  /** Vom JS-Prüfer berechnetes Ergebnis – die einzige Quelle der Wahrheit. */
  answer: number
}

// Sieben Ausdrücke, bei denen das Modell ohne Notizblock konsistent danebenliegt
// (typisch: 15² oder 9³ wird verschluckt, Zwischenergebnisse gehen verloren).
const RAW_ARITH = [
  '(17×6)+(23×4)−15²',
  '13²−7×8+19',
  '47+18×3−6²',
  '(24×3)−(19×2)+7²',
  '100−7×9+4³',
  '(31×4)−9³+200',
  '8×7+6×9−5²',
]

export const ARITH_PROBLEMS: ArithProblem[] = RAW_ARITH.map((expr, i) => {
  const answer = evalArith(expr)
  if (answer === null) throw new Error(`Ungültiger Arithmetik-Ausdruck: ${expr}`)
  return { id: `a${i}`, expr, answer }
})

export interface LetterProblem {
  id: string
  word: string
  letter: string
  /** Vom JS-Prüfer gezählte Wahrheit. */
  answer: number
}

// Wörter, deren Buchstabenzahl das Modell unter Temperatur uneinheitlich rät:
// Es verzählt sich systematisch nach UNTEN, deshalb ist die häufigste
// (Bauchgefühl-)Antwort oft die falsche – genau das macht später den Kontrast
// „Prüfer vs. Eindruck" sichtbar. Das Default-Wort ist bewusst eines mit
// MITTLERER Fehlerquote: häufig genug falsch, dass die Mehrheit daneben liegt,
// aber zuverlässig auch mit ein paar richtigen Versuchen (sonst gäbe es nichts
// zu verstärken). Zu stark verzählte Wörter kämen sonst „alle falsch" zurück.
const RAW_LETTER: Array<[word: string, letter: string]> = [
  ['Schifffahrtsgesellschaft', 'f'],
  ['Wettervorhersage', 'e'],
  ['Geburtstagskuchen', 'g'],
  ['Regenbogenfarben', 'n'],
]

export const LETTER_PROBLEMS: LetterProblem[] = RAW_LETTER.map(([word, letter], i) => ({
  id: `l${i}`,
  word,
  letter,
  answer: countLetter(word, letter),
}))

export const DEFAULT_ARITH = ARITH_PROBLEMS[0]
export const DEFAULT_LETTER = LETTER_PROBLEMS[0]

/** Prompt-Text, der für eine Arithmetik-Aufgabe ans Modell geht. */
export const arithPrompt = (p: ArithProblem): string => `Berechne: ${p.expr}`

/** Prompt-Text, der für eine Buchstaben-Aufgabe ans Modell geht. */
export const letterPrompt = (p: LetterProblem): string =>
  `Wie viele Buchstaben '${p.letter}' kommen im Wort '${p.word}' vor?`
