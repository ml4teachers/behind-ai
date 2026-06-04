// ---------------------------------------------------------------------------
// Mini-RL für die RLVR-Seite: REINFORCE (Policy-Gradient) über die Antworten,
// die das echte Modell tatsächlich produziert hat.
//
// Die „Policy" ist eine Verteilung über die verschiedenen Antwort-Werte, die in
// den Versuchen auftauchten (Start = wie oft jeder Wert vorkam = der momentane
// „Glaube" des Modells). Jede Antwort bekommt eine Belohnung; REINFORCE schiebt
// die Wahrscheinlichkeit zu den höher belohnten Antworten:
//
//     p   = softmax(z)                      (Policy über die Antwort-Klassen)
//     E[r] = Σ p_i · r_i                     (erwartete Belohnung)
//     z_i += lr · p_i · (r_i − E[r])         (Gradientenaufstieg auf E[r])
//
// Das ist eine ehrliche Miniatur des RLVR-Updates: „mach Versuche, die sich als
// richtig erweisen, wahrscheinlicher". Mit zwei Belohnungen:
//   • Prüfer   — r = 1, wenn der Wert stimmt (vom JS-Prüfer verifiziert), sonst 0.
//   • Eindruck — r = wie verbreitet/überzeugend der Wert wirkt (Anteil der
//                Versuche). Ein Stellvertreter, der das BELOHNT, was am
//                häufigsten/selbstsichersten klingt — nicht, was geprüft stimmt.
//
// Die Mathematik läuft hier komplett & korrekt durch; die UI spielt die fertige
// Trajektorie nur ab (wie das RLHF-Labor). Bewusst frei von React.
// ---------------------------------------------------------------------------

export type RewardKey = 'verifier' | 'impression'

export interface AnswerClass {
  /** Der geantwortete Wert (z. B. die Buchstabenzahl 3, 4, 5 …). */
  value: number
  /** Wie viele der Versuche genau diesen Wert lieferten. */
  count: number
  /** Vom JS-Prüfer bestätigt? (value === Wahrheit) */
  correct: boolean
}

export interface CurvePoint {
  x: number
  y: number
}

export interface Trajectory {
  /** Antwort-Klassen in Anzeige-Reihenfolge (aufsteigend nach Wert). */
  classes: AnswerClass[]
  /** Wahrscheinlichkeits-Snapshots pro Schritt (Balken-Animation). */
  probFrames: number[][]
  /** Mittlere Belohnung pro Schritt. */
  rewardCurve: CurvePoint[]
  /** Wahrscheinlichkeitsmasse auf der richtigen Antwort pro Schritt. */
  accuracyCurve: CurvePoint[]
  /** Index der am Ende wahrscheinlichsten Klasse. */
  finalPick: number
}

const softmax = (z: number[]): number[] => {
  const m = Math.max(...z)
  const e = z.map((x) => Math.exp(x - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((x) => x / s)
}

/**
 * Fasst rohe Versuchs-Antworten zu Klassen zusammen (ein Eintrag je Wert),
 * aufsteigend sortiert. `answers` = geparste Zahl je Versuch (oder null, wenn
 * unlesbar — wird ignoriert).
 */
export function toAnswerClasses(answers: Array<number | null>, truth: number): AnswerClass[] {
  const counts = new Map<number, number>()
  for (const a of answers) {
    if (a === null || !Number.isFinite(a)) continue
    counts.set(a, (counts.get(a) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([value, count]) => ({ value, count, correct: Math.abs(value - truth) < 1e-6 }))
}

export interface ReinforceOptions {
  lr?: number
  steps?: number
}

/**
 * Spielt REINFORCE auf den Antwort-Klassen durch und gibt die ganze Trajektorie
 * zurück. `reward` wählt das Belohnungssignal (Prüfer oder Eindruck).
 */
export function reinforce(
  classes: AnswerClass[],
  reward: RewardKey,
  { lr = 0.6, steps = 60 }: ReinforceOptions = {},
): Trajectory {
  const total = classes.reduce((s, c) => s + c.count, 0) || 1
  // Belohnung je Klasse.
  const r = classes.map((c) =>
    reward === 'verifier' ? (c.correct ? 1 : 0) : c.count / total,
  )
  const truthIdx = classes.findIndex((c) => c.correct)

  // Start-Logits = log(Häufigkeit) → Start-Policy = empirische Verteilung der
  // Versuche (der momentane „Glaube" des Modells).
  const z = classes.map((c) => Math.log(c.count))

  const probFrames: number[][] = []
  const rewardCurve: CurvePoint[] = []
  const accuracyCurve: CurvePoint[] = []

  const snapshot = (x: number) => {
    const p = softmax(z)
    probFrames.push(p)
    rewardCurve.push({ x, y: p.reduce((s, pi, i) => s + pi * r[i], 0) })
    accuracyCurve.push({ x, y: truthIdx >= 0 ? p[truthIdx] : 0 })
  }

  snapshot(0)
  for (let t = 1; t <= steps; t++) {
    const p = softmax(z)
    const meanR = p.reduce((s, pi, i) => s + pi * r[i], 0)
    for (let i = 0; i < z.length; i++) z[i] += lr * p[i] * (r[i] - meanR)
    snapshot(t)
  }

  const finalP = probFrames[probFrames.length - 1]
  let finalPick = 0
  for (let i = 1; i < finalP.length; i++) if (finalP[i] > finalP[finalPick]) finalPick = i

  return { classes, probFrames, rewardCurve, accuracyCurve, finalPick }
}
