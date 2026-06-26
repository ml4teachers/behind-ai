// ---------------------------------------------------------------------------
// Ein einzelnes Perzeptron (künstliches Neuron) – von Hand, ohne Framework.
//
// Es rechnet eine gewichtete Summe seiner Eingaben und feuert über einer
// Schwelle (harte Stufenfunktion). Genau dieses Rechenstück steckt –
// millionenfach und mit weicher Stufe (tanh) – in jedem grossen Sprachmodell:
// jedes Neuron der versteckten Schicht in lib/mini-llm/model.ts ist dasselbe
// Objekt. Bewusst so gebaut, dass später eine zweite Schicht (MLP) nur ein
// Array solcher Neuronen ist.
// ---------------------------------------------------------------------------

export type Vec = number[]

export interface Neuron {
  /** Ein Gewicht pro Eingabe. */
  w: Vec
  /** Bias = −Schwelle. Das Neuron feuert, wenn w·x + b > 0. */
  b: number
}

export interface DataPoint {
  /** Eingaben (im Floor zwei binäre Werte 0/1; im Punkte-Modus reell). */
  x: Vec
  /** Zielklasse 0 oder 1. */
  label: 0 | 1
  /** Stabile id für React-Keys / Auswahl. */
  id: string
}

export const dot = (a: Vec, b: Vec): number =>
  a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0)

/** Vor-Aktivierung z = w·x + b (die „gewichtete Summe über der Schwelle"). */
export const preActivation = (n: Neuron, x: Vec): number => dot(n.w, x) + n.b

/** Harte Stufenfunktion: feuert (1), sobald z > 0. */
export const fires = (n: Neuron, x: Vec): 0 | 1 => (preActivation(n, x) > 0 ? 1 : 0)

export interface StepResult {
  neuron: Neuron
  /** Fehler e = ziel − ausgabe ∈ {−1, 0, 1}. 0 = war schon richtig. */
  error: number
}

/**
 * Perzeptron-Lernregel an EINEM Beispiel:
 *   e = ziel − ausgabe;  w_i += lr·e·x_i;  b += lr·e
 * Bei ganzzahligen Eingaben und lr bleiben die Gewichte ganzzahlig.
 */
export function trainPoint(n: Neuron, p: DataPoint, lr = 1): StepResult {
  const e = p.label - fires(n, p.x)
  if (e === 0) return { neuron: n, error: 0 }
  return {
    neuron: { w: n.w.map((wi, i) => wi + lr * e * (p.x[i] ?? 0)), b: n.b + lr * e },
    error: e,
  }
}

/** Wie viele Beispiele klassifiziert das Neuron aktuell richtig? */
export function countCorrect(n: Neuron, data: DataPoint[]): number {
  return data.reduce((c, p) => c + (fires(n, p.x) === p.label ? 1 : 0), 0)
}

/** Index des nächsten falsch klassifizierten Beispiels ab `from` (zyklisch), sonst −1. */
export function nextMistake(n: Neuron, data: DataPoint[], from = 0): number {
  for (let k = 0; k < data.length; k++) {
    const i = (from + k) % data.length
    if (fires(n, data[i].x) !== data[i].label) return i
  }
  return -1
}
