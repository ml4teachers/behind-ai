// ---------------------------------------------------------------------------
// Ein echtes Belohnungsmodell (reward model) – das Herzstück von RLHF.
//
// Genau wie InstructGPT lernt es aus paarweisen Vergleichen ("Antwort A ist
// besser als B") über die Bradley-Terry-Logistik:
//
//     reward(x) = w · merkmale(x)                  (lineares Modell)
//     P(A ≻ B)  = sigmoid( reward(A) − reward(B) )  (Bradley-Terry)
//     Verlust   = − log P( bevorzugte Antwort )     (paarweiser Logistik-Loss)
//
// Der einzige Unterschied zu echten Systemen: dort ist `merkmale(x)` ein
// riesiger Transformer, hier sind es ein paar von Hand ablesbare STIL-Merkmale
// (freundlich, ausführlich …). Das Lernen selbst ist dasselbe – echtes SGD,
// keine Skript-Animation. Bewusst frei von React: pure Logik.
//
// Wichtig für die Didaktik: das Modell sieht NUR den Stil, nicht die Wahrheit.
// Genau daraus entsteht später "Reward Hacking" ganz von selbst.
// ---------------------------------------------------------------------------

// Die sichtbaren Stil-Merkmale, auf denen das Belohnungsmodell rechnet.
// (Reihenfolge = Index in den Merkmalsvektoren der Antworten.)
export const TRAITS = [
  'freundlich',
  'strukturiert',
  'ausfuehrlich',
  'selbstsicher',
  'schmeichelhaft',
] as const

export type TraitKey = (typeof TRAITS)[number]
export const D = TRAITS.length

// Lesbare Labels + kurze Erklärung (DE; EN-Migration der Viz-Strings → Thread 9).
export const TRAIT_META: Record<TraitKey, { label: string; hint: string }> = {
  freundlich: { label: 'Freundlich', hint: 'warmer, höflicher Ton' },
  strukturiert: { label: 'Strukturiert', hint: 'klar gegliedert, übersichtlich' },
  ausfuehrlich: { label: 'Ausführlich', hint: 'lang, viele Details' },
  selbstsicher: { label: 'Selbstsicher', hint: 'klingt sehr überzeugt' },
  schmeichelhaft: { label: 'Schmeichelhaft', hint: 'lobt dich, gibt dir recht' },
}

export interface CurvePoint {
  x: number
  y: number
}

export interface Trajectory {
  /** Endgültige Gewichte des Belohnungsmodells (ein Wert pro Merkmal). */
  weights: number[]
  /** Lernkurve: mittlerer Verlust pro Epoche (zum Abspielen / Anzeigen). */
  loss: CurvePoint[]
  /** Gewichts-Snapshots pro Epoche (für die Lern-Animation der Balken). */
  weightFrames: number[][]
}

const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z))
const dot = (a: number[], b: number[]): number => {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

/** Reward einer Antwort = gewichtete Summe ihrer Stil-Merkmale. */
export function reward(weights: number[], traits: number[]): number {
  return dot(weights, traits)
}

export interface TrainOptions {
  lr?: number
  l2?: number
  epochs?: number
}

/**
 * Trainiert das Belohnungsmodell per Gradientenabstieg auf den Vergleichen.
 * Jeder Vergleich ist `[gewinner, verlierer]` (die vom Menschen bevorzugte
 * Antwort zuerst). Gibt die ganze Lern-Trajektorie zurück, damit die UI sie
 * ruhig abspielen kann – die Mathematik ist danach fertig und korrekt,
 * unabhängig davon, wie viele Frames die Animation zeigt.
 */
export function trainReward(
  pairs: Array<[number[], number[]]>,
  { lr = 0.5, l2 = 0.02, epochs = 240 }: TrainOptions = {},
): Trajectory {
  const w = new Array(D).fill(0)
  const loss: CurvePoint[] = []
  const weightFrames: number[][] = []

  const meanLoss = (): number => {
    if (pairs.length === 0) return 0
    let L = 0
    for (const [win, lose] of pairs) {
      const margin = reward(w, win) - reward(w, lose)
      L += -Math.log(sigmoid(margin) + 1e-9)
    }
    return L / pairs.length
  }

  loss.push({ x: 0, y: meanLoss() })
  weightFrames.push([...w])

  for (let e = 1; e <= epochs; e++) {
    // Voll-Batch-Gradient (winzige Datenmenge → exakt, kein Rauschen).
    const g = new Array(D).fill(0)
    for (const [win, lose] of pairs) {
      const delta = new Array(D)
      for (let i = 0; i < D; i++) delta[i] = win[i] - lose[i]
      const p = sigmoid(dot(w, delta))
      const coef = -(1 - p) // d(−log σ(w·Δ)) / d(w·Δ)
      for (let i = 0; i < D; i++) g[i] += coef * delta[i]
    }
    for (let i = 0; i < D; i++) {
      g[i] = g[i] / pairs.length + l2 * w[i] // + L2-Regularisierung (stabil bei wenig Daten)
      w[i] -= lr * g[i]
    }
    loss.push({ x: e, y: meanLoss() })
    weightFrames.push([...w])
  }

  return { weights: [...w], loss, weightFrames }
}

/**
 * Anteil der Vergleiche, bei denen das Modell dieselbe Antwort bevorzugt wie
 * der Mensch (Gewinner zuerst). Misst, wie gut es verallgemeinert.
 */
export function preferenceAccuracy(weights: number[], pairs: Array<[number[], number[]]>): number {
  if (pairs.length === 0) return 0
  let ok = 0
  for (const [win, lose] of pairs) {
    if (reward(weights, win) > reward(weights, lose)) ok++
  }
  return ok / pairs.length
}

/** Sagt voraus, welche von zwei Antworten das Modell bevorzugt (true = a). */
export function prefersA(weights: number[], a: number[], b: number[]): boolean {
  return reward(weights, a) >= reward(weights, b)
}
