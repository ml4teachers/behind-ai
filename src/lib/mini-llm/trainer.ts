// ---------------------------------------------------------------------------
// Stateful-Hülle um das reine Modell (model.ts): hält Vokabular, Datensatz und
// Gewichte zusammen und treibt das Training Schritt für Schritt. Die React-
// Komponente ruft `runSteps()` pro Animationsframe und liest Loss, Textproben
// und Verteilung zum Anzeigen aus. Bewusst frei von React — pure Logik.
// ---------------------------------------------------------------------------

import {
  type CharModel,
  type Dataset,
  type Vocab,
  buildDataset,
  buildVocab,
  evalLoss,
  makeModel,
  predict,
  sample,
  trainStep,
} from './model'
import { type Corpus, corpusWords } from './corpora'

export interface TrainConfig {
  C: number
  E: number
  H: number
  B: number
  lr: number
  evalSize: number
}

// Im R&D-Spike (Node) ermittelt: konvergiert in ~5000 Schritten sichtbar,
// saubere Lernkurve, plausible Wörter/Namen. ~6000 Parameter.
export const DEFAULT_CONFIG: TrainConfig = {
  C: 3,
  E: 10,
  H: 96,
  B: 32,
  lr: 0.12,
  evalSize: 256,
}

export interface CharProb {
  char: string
  p: number
}

export interface Distribution {
  top: CharProb[]
  rest: number
}

export interface EmbeddingPoint {
  char: string
  x: number
  y: number
}

export interface ExampleProbe {
  context: string
  target: string
  pTarget: number // Wahrscheinlichkeit, die das Modell dem richtigen Zeichen gibt
  topChar: string // aktuell wahrscheinlichstes Zeichen
  correct: boolean // trifft das Modell das Ziel schon?
}

export class Trainer {
  readonly vocab: Vocab
  readonly model: CharModel
  readonly cfg: TrainConfig
  private readonly ds: Dataset
  private readonly batch: Int32Array
  private readonly evalIdx: Int32Array
  step = 0

  constructor(corpus: Corpus, cfg: TrainConfig = DEFAULT_CONFIG) {
    this.cfg = cfg
    this.vocab = buildVocab(corpus.text)
    this.ds = buildDataset(corpusWords(corpus), this.vocab, cfg.C)
    this.model = makeModel(this.vocab.V, cfg.C, cfg.E, cfg.H)
    this.batch = new Int32Array(cfg.B)
    const n = Math.min(cfg.evalSize, this.ds.N)
    this.evalIdx = new Int32Array(n)
    for (let i = 0; i < n; i++) this.evalIdx[i] = (i * 7919) % this.ds.N // gestreut
  }

  // Lernrate sinkt mit absoluten Schritten → ruhigeres Einschwingen, und das
  // Training kann beliebig lange weiterlaufen (kein fixes Ziel mehr).
  private lrNow(): number {
    const s = this.step
    const f = s > 4000 ? 0.25 : s > 2000 ? 0.5 : 1
    return this.cfg.lr * f
  }

  // Einen Block SGD-Schritte ausführen (ein Minibatch pro Schritt). Offen — es
  // gibt keine feste Schrittzahl, Training läuft, bis der Nutzer pausiert.
  runSteps(k: number): void {
    const N = this.ds.N
    for (let s = 0; s < k; s++) {
      for (let b = 0; b < this.cfg.B; b++) this.batch[b] = (Math.random() * N) | 0
      trainStep(this.model, this.ds, this.batch, this.lrNow())
      this.step++
    }
  }

  evaluate(): number {
    return evalLoss(this.model, this.ds, this.evalIdx)
  }

  // Loss eines Modells, das nur rät (Gleichverteilung) = log(V). Bezugslinie.
  uniformLoss(): number {
    return Math.log(this.vocab.V)
  }

  samples(n: number, temperature = 1): string[] {
    return Array.from({ length: n }, () => sample(this.model, this.vocab, 14, temperature))
  }

  // Verteilung über das nächste Zeichen nach `prefix` (kürzer als C → links mit
  // Wortgrenze '.' aufgefüllt). Top-k einzeln, der Rest als ein Bucket — genau
  // wie die Next-Token-Seite, nur auf Zeichen-Ebene.
  distribution(prefix: string, topK = 8): Distribution {
    const probs = predict(this.model, this.contextFor(prefix))
    const arr: CharProb[] = []
    for (let v = 0; v < this.vocab.V; v++) arr.push({ char: this.vocab.chars[v], p: probs[v] })
    arr.sort((a, b) => b.p - a.p)
    const top = arr.slice(0, topK)
    const rest = arr.slice(topK).reduce((s, x) => s + x.p, 0)
    return { top, rest }
  }

  // Ein konkretes überwachtes Beispiel prüfen: „nach `context` soll `target`".
  // Zeigt, wie viel Wahrscheinlichkeit das Modell dem richtigen Zeichen gibt.
  probeExample(context: string, target: string): ExampleProbe {
    const probs = predict(this.model, this.contextFor(context))
    const ti = this.vocab.stoi[target]
    let topI = 0
    for (let v = 1; v < this.vocab.V; v++) if (probs[v] > probs[topI]) topI = v
    return {
      context,
      target,
      pTarget: ti === undefined ? 0 : probs[ti],
      topChar: this.vocab.chars[topI],
      correct: this.vocab.chars[topI] === target,
    }
  }

  // 2D-Projektion (PCA) der gelernten Zeichen-Embeddings. Während des Trainings
  // ordnen sich die Buchstaben — ein Mini-Echo der Embeddings-Seite.
  embedding2D(): EmbeddingPoint[] {
    const { V, E } = this.model
    const M = this.model.Cemb
    const mean = new Float64Array(E)
    for (let v = 0; v < V; v++) for (let e = 0; e < E; e++) mean[e] += M[v * E + e]
    for (let e = 0; e < E; e++) mean[e] /= V
    const Xc = new Float64Array(V * E)
    for (let v = 0; v < V; v++) for (let e = 0; e < E; e++) Xc[v * E + e] = M[v * E + e] - mean[e]
    // Kovarianz E×E
    const Cov = new Float64Array(E * E)
    for (let a = 0; a < E; a++) {
      for (let b = 0; b < E; b++) {
        let s = 0
        for (let v = 0; v < V; v++) s += Xc[v * E + a] * Xc[v * E + b]
        Cov[a * E + b] = s / V
      }
    }
    const pc1 = topEigenvector(Cov, E)
    deflate(Cov, E, pc1)
    const pc2 = topEigenvector(Cov, E)
    const pts: EmbeddingPoint[] = []
    let maxX = 1e-6
    let maxY = 1e-6
    for (let v = 0; v < V; v++) {
      let x = 0
      let y = 0
      for (let e = 0; e < E; e++) {
        x += Xc[v * E + e] * pc1[e]
        y += Xc[v * E + e] * pc2[e]
      }
      pts.push({ char: this.vocab.chars[v], x, y })
      maxX = Math.max(maxX, Math.abs(x))
      maxY = Math.max(maxY, Math.abs(y))
    }
    // auf [-1, 1] je Achse strecken (volle Fläche nutzen)
    for (const p of pts) {
      p.x /= maxX
      p.y /= maxY
    }
    return pts
  }

  private contextFor(prefix: string): number[] {
    const C = this.cfg.C
    const ctx = new Array(C).fill(this.vocab.stoi['.'])
    for (const ch of prefix) {
      const ix = this.vocab.stoi[ch]
      if (ix !== undefined) {
        ctx.shift()
        ctx.push(ix)
      }
    }
    return ctx
  }
}

// Dominanter Eigenvektor per Power-Iteration (fester Start → deterministisch).
function topEigenvector(A: Float64Array, n: number): Float64Array {
  let v = new Float64Array(n)
  for (let i = 0; i < n; i++) v[i] = Math.cos(i + 1) // fester, asymmetrischer Start
  for (let iter = 0; iter < 64; iter++) {
    const w = new Float64Array(n)
    for (let a = 0; a < n; a++) {
      let s = 0
      for (let b = 0; b < n; b++) s += A[a * n + b] * v[b]
      w[a] = s
    }
    let norm = 0
    for (let a = 0; a < n; a++) norm += w[a] * w[a]
    norm = Math.sqrt(norm) || 1
    for (let a = 0; a < n; a++) w[a] /= norm
    v = w
  }
  // Vorzeichen stabilisieren: grösste Komponente positiv
  let mi = 0
  for (let i = 1; i < n; i++) if (Math.abs(v[i]) > Math.abs(v[mi])) mi = i
  if (v[mi] < 0) for (let i = 0; i < n; i++) v[i] = -v[i]
  return v
}

// Dominante Richtung aus der Kovarianz entfernen (für die 2. Komponente).
function deflate(A: Float64Array, n: number, v: Float64Array): void {
  let lambda = 0
  for (let a = 0; a < n; a++) {
    let s = 0
    for (let b = 0; b < n; b++) s += A[a * n + b] * v[b]
    lambda += v[a] * s
  }
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) A[a * n + b] -= lambda * v[a] * v[b]
}
