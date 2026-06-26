// ---------------------------------------------------------------------------
// Ein kleines mehrschichtiges Netz (MLP): 2 Eingänge → H versteckte Neuronen
// (tanh) → 1 Ausgabe (Sigmoid). Mit H = 2 löst es XOR; mit mehr Neuronen auch
// rundere Muster (Kreis). Genau die Architektur, an der das einzelne Perzeptron
// scheiterte: jedes versteckte Neuron zieht eine Linie, die zweite Schicht
// kombiniert sie zu einer gekrümmten Grenze.
//
// Vorwärts wie im Next-Letter-Predictor: gewichtete Summe, Quetschfunktion,
// geschichtet. Gelernt per Gradientenabstieg (Backprop von Hand).
// ---------------------------------------------------------------------------

import type { DataPoint } from './model'

export interface MLP {
  /** [versteckt][eingang] – Gewichte der ersten Schicht (H×2). */
  W1: number[][]
  /** Bias der versteckten Neuronen (H). */
  b1: number[]
  /** Gewichte von der versteckten Schicht zur Ausgabe (H). */
  W2: number[]
  /** Bias der Ausgabe. */
  b2: number
}

/** Versteckte Aktivierung: tanh (weiche Stufe) oder ReLU (Knick bei 0). */
export type Activation = 'tanh' | 'relu'

const tanh = (x: number): number => Math.tanh(x)
const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x))
const rand = (s: number): number => (Math.random() * 2 - 1) * s

/** Wert der versteckten Aktivierung. */
const act = (a: Activation, z: number): number => (a === 'relu' ? Math.max(0, z) : tanh(z))
/** Ableitung der versteckten Aktivierung an z (h = act(a, z) bereits bekannt). */
const actPrime = (a: Activation, z: number, h: number): number => (a === 'relu' ? (z > 0 ? 1 : 0) : 1 - h * h)

/** Frisches Netz mit H versteckten Neuronen und kleinen Zufallsgewichten.
 *  Bei ReLU starten die Biases positiv (b ∈ [0, 0.6]), damit die Neuronen
 *  anfangs „an" sind und nicht sofort absterben (typische ReLU-Initialisierung). */
export function initMLP(H: number, activation: Activation = 'tanh'): MLP {
  const bias = activation === 'relu' ? () => Math.random() * 0.6 : () => rand(1)
  return {
    W1: Array.from({ length: H }, () => [rand(2.6), rand(2.6)]),
    b1: Array.from({ length: H }, bias),
    W2: Array.from({ length: H }, () => rand(2.2)),
    b2: rand(0.5),
  }
}

export const hiddenCount = (net: MLP): number => net.W1.length

export interface Forward {
  /** Vor-Aktivierung der versteckten Neuronen (gewichtete Summe, VOR tanh). */
  zh: number[]
  /** Aktivierung der versteckten Neuronen (tanh, in [-1, 1]). */
  h: number[]
  /** Vor-Aktivierung der Ausgabe (gewichtete Summe, VOR Sigmoid). */
  z2: number
  /** Ausgabe in [0, 1] (Sigmoid). */
  y: number
}

export function forward(net: MLP, x: number[], activation: Activation = 'tanh'): Forward {
  const x0 = x[0] ?? 0
  const x1 = x[1] ?? 0
  const H = net.W1.length
  const zh = new Array<number>(H)
  const h = new Array<number>(H)
  let z2 = net.b2
  for (let j = 0; j < H; j++) {
    zh[j] = net.W1[j][0] * x0 + net.W1[j][1] * x1 + net.b1[j]
    h[j] = act(activation, zh[j])
    z2 += net.W2[j] * h[j]
  }
  return { zh, h, z2, y: sigmoid(z2) }
}

export const classify = (net: MLP, x: number[], activation: Activation = 'tanh'): 0 | 1 =>
  forward(net, x, activation).y > 0.5 ? 1 : 0

export function countCorrectMLP(net: MLP, data: DataPoint[], activation: Activation = 'tanh'): number {
  return data.reduce((c, p) => c + (classify(net, p.x, activation) === p.label ? 1 : 0), 0)
}

/** Gradienten EINES Beispiels je Kante (nicht gemittelt) + der Vorwärtspass.
 *  Genau die Mathematik, die trainEpoch pro Beispiel rechnet – hier einzeln,
 *  damit die Backprop-Animation jeder Kante ihren „Schuld"-Wert zeigen kann. */
export interface Gradients {
  /** Aktivierungen aus dem Vorwärtspass ({ h, y }). */
  fwd: Forward
  /** ∂L/∂W1[j][i] – versteckte Schicht. */
  gW1: number[][]
  /** ∂L/∂b1[j]. */
  gb1: number[]
  /** ∂L/∂W2[j] – Ausgabeschicht. */
  gW2: number[]
  /** ∂L/∂b2. */
  gb2: number
  /** Fehler an der Ausgabe = y − t (Quelle des Rückwärts-Pulses). */
  dz2: number
  /** ∂L/∂z1[j] – die „Schuld", die an jedem versteckten Neuron ankommt. */
  dh: number[]
}

export function gradients(net: MLP, x: number[], t: 0 | 1, activation: Activation = 'tanh'): Gradients {
  const H = net.W1.length
  const fwd = forward(net, x, activation)
  const { zh, h, y } = fwd
  const x0 = x[0] ?? 0
  const x1 = x[1] ?? 0
  const dz2 = y - t // Sigmoid + Kreuzentropie ⇒ dL/dz2 = y − t
  const gW2 = new Array<number>(H)
  const gW1 = Array.from({ length: H }, () => [0, 0])
  const gb1 = new Array<number>(H)
  const dh = new Array<number>(H)
  for (let j = 0; j < H; j++) {
    gW2[j] = dz2 * h[j]
    // über W2 zurück, dann durch die Aktivierung: tanh'(z)=1−h² bzw. ReLU'(z)=[z>0]
    const dzj = dz2 * net.W2[j] * actPrime(activation, zh[j], h[j])
    dh[j] = dzj
    gW1[j][0] = dzj * x0
    gW1[j][1] = dzj * x1
    gb1[j] = dzj
  }
  return { fwd, gW1, gb1, gW2, gb2: dz2, dz2, dh }
}

/**
 * Ein Batch-Gradientenabstiets-Schritt über alle Beispiele (binäre
 * Kreuzentropie). Gibt das aktualisierte Netz + den mittleren Verlust zurück.
 */
export function trainEpoch(net: MLP, data: DataPoint[], lr: number, activation: Activation = 'tanh'): { net: MLP; loss: number } {
  const H = net.W1.length
  const gW1 = Array.from({ length: H }, () => [0, 0])
  const gb1 = new Array<number>(H).fill(0)
  const gW2 = new Array<number>(H).fill(0)
  let gb2 = 0
  let loss = 0
  const eps = 1e-7

  for (const p of data) {
    const t = p.label
    const g = gradients(net, p.x, t, activation)
    const y = g.fwd.y
    loss += -(t * Math.log(y + eps) + (1 - t) * Math.log(1 - y + eps))
    gb2 += g.gb2
    for (let j = 0; j < H; j++) {
      gW2[j] += g.gW2[j]
      gW1[j][0] += g.gW1[j][0]
      gW1[j][1] += g.gW1[j][1]
      gb1[j] += g.gb1[j]
    }
  }

  const n = data.length || 1
  const step = lr / n
  return {
    loss: loss / n,
    net: {
      W1: net.W1.map((row, j) => [row[0] - step * gW1[j][0], row[1] - step * gW1[j][1]]),
      b1: net.b1.map((b, j) => b - step * gb1[j]),
      W2: net.W2.map((w, j) => w - step * gW2[j]),
      b2: net.b2 - step * gb2,
    },
  }
}

// === Backprop-Demo ==========================================================
// Ein festes, bewusst SELBSTBEWUSST FALSCHES Beispiel: das Netz sagt y≈0.045,
// das Ziel ist 1. So sind alle Kanten-Gradienten gut lesbar (0.10…0.96) und
// gemischt im Vorzeichen – bei einem kleinen/korrekten Beispiel wären sie ~0.
export const BP_NET: MLP = {
  W1: [
    [1.6, -1.4],
    [-1.3, 1.5],
  ],
  b1: [0.2, -0.2],
  W2: [-1.8, 1.7],
  b2: -0.3,
}
export const BP_POINT: { x: number[]; t: 0 | 1 } = { x: [0.8, 0.2], t: 1 }

/** Mehrere Epochen am Stück (für flüssige Animation pro Frame). */
export function trainEpochs(
  net: MLP,
  data: DataPoint[],
  lr: number,
  epochs: number,
  activation: Activation = 'tanh',
): { net: MLP; loss: number } {
  let cur = net
  let loss = 0
  for (let i = 0; i < epochs; i++) {
    const r = trainEpoch(cur, data, lr, activation)
    cur = r.net
    loss = r.loss
  }
  return { net: cur, loss }
}

// === Datensätze (deterministisch, damit kein SSR-Mismatch) =================
// Jeder Datensatz liefert einen Trainings- UND einen Testsatz aus derselben
// Verteilung. Genauigkeit auf beiden = Überanpassung sichtbar machen: ein
// grosses Netz kann den Trainingssatz (samt Rauschen) auswendig lernen und auf
// dem Testsatz trotzdem schlechter werden.
const pt = (id: string, x: number, y: number, label: 0 | 1): DataPoint => ({ id, x: [x, y], label })

/** Train- und Testsatz eines Datensatzes (gefüllte vs. hohle Punkte). */
export interface DataSplit {
  train: DataPoint[]
  test: DataPoint[]
}

/** Wahre XOR-Regel über den vier Quadranten um (0.5, 0.5). */
const xorTruth = (x: number, y: number): 0 | 1 => ((x > 0.5) !== (y > 0.5) ? 1 : 0)

/** XOR als vier Cluster: diagonale Paare gehören zusammen – braucht ≥2 Neuronen. */
export function xorData(): DataSplit {
  const corners: [number, number, 0 | 1][] = [
    [0.18, 0.18, 0],
    [0.82, 0.18, 1],
    [0.18, 0.82, 1],
    [0.82, 0.82, 0],
  ]
  const make = (offs: number[][], tag: string): DataPoint[] => {
    const out: DataPoint[] = []
    corners.forEach(([cx, cy, label], ci) =>
      offs.forEach(([dx, dy], oi) => out.push(pt(`${tag}${ci}${oi}`, cx + dx, cy + dy, label))),
    )
    return out
  }
  return {
    train: make([[0, 0], [-0.07, 0.06], [0.07, -0.05]], 'x'),
    // Testpunkte: gleiche Ecken, andere (saubere) Streuung → das Netz hat sie nie gesehen.
    test: make([[0.06, 0.05], [-0.06, -0.05], [0.1, -0.09], [-0.09, 0.1]], 'xt'),
  }
}

/** Kreis: innen Klasse 1, aussen ein Ring Klasse 0 – braucht eine runde Grenze. */
export function circleData(): DataSplit {
  const cx = 0.5
  const cy = 0.5
  const ring = (tag: string, n: number, r: number, label: 0 | 1, phase: number): DataPoint[] =>
    Array.from({ length: n }, (_, i) => {
      const a = ((i + phase) / n) * Math.PI * 2
      return pt(`${tag}${i}`, cx + Math.cos(a) * r, cy + Math.sin(a) * r, label)
    })
  return {
    train: [pt('cc', cx, cy, 1), ...ring('ci', 6, 0.15, 1, 0), ...ring('co', 12, 0.4, 0, 0)],
    // Testpunkte: gleiche Radien, um eine halbe Schrittweite gedrehte Winkel.
    test: [...ring('cit', 6, 0.14, 1, 0.5), ...ring('cot', 10, 0.42, 0, 0.5)],
  }
}

// --- Verrauschter Datensatz (deterministisch via Seed-PRNG) -----------------
// XOR-Quadranten mit gauss'scher Streuung + 4 absichtlich falsch gelabelten
// Trainingspunkten. Empirisch (scripts/overfit-sim.mjs, 40 Netz-Starts) lernt
// ein grosses Netz (H≥6) den Trainingssatz fast immer zu 100 % auswendig,
// während die Test-Genauigkeit auf ~77 % fällt; H≈3–4 generalisiert besser.
const mulberry32 = (seed: number): (() => number) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const NOISE_CENTERS = [
  [0.25, 0.25],
  [0.75, 0.25],
  [0.25, 0.75],
  [0.75, 0.75],
]
function gaussCluster(rng: () => number, perQuad: number, spread: number, tag: string): DataPoint[] {
  const gauss = (): number => {
    let u = 0
    let v = 0
    while (u === 0) u = rng()
    while (v === 0) v = rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const out: DataPoint[] = []
  for (const [cx, cy] of NOISE_CENTERS) {
    for (let i = 0; i < perQuad; i++) {
      const x = Math.min(0.98, Math.max(0.02, cx + gauss() * spread))
      const y = Math.min(0.98, Math.max(0.02, cy + gauss() * spread))
      out.push(pt(`${tag}${out.length}`, x, y, xorTruth(x, y)))
    }
  }
  return out
}

/** Verrauschtes XOR – der Datensatz, an dem Überanpassung sichtbar wird. */
export function noisyData(): DataSplit {
  const trng = mulberry32(11)
  const train = gaussCluster(trng, 5, 0.15, 'n')
  // 4 zufällige Trainingslabels umdrehen = Rauschen, das ein grosses Netz mitlernt.
  const idx = train.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(trng() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  for (let k = 0; k < 4; k++) {
    const p = train[idx[k]]
    p.label = p.label === 1 ? 0 : 1
  }
  // Testsatz aus EIGENEM Seed → Testgrösse stört die Auswahl der Flips nie.
  const test = gaussCluster(mulberry32(1011), 6, 0.15, 'nt')
  return { train, test }
}
