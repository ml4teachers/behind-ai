// ---------------------------------------------------------------------------
// Mini-Diffusion in 2D (DDPM, vereinfacht) – rein, framework-frei, transparent.
//
// Idee: Eine Zielform ist eine Punktwolke in der Ebene. Vorwärts lösen wir sie
// mit Gauss-Rauschen schrittweise in eine reine Zufallswolke auf. Ein winziges
// Netz lernt, aus einem verrauschten Punkt (und dem Rausch-Level t) das zu-
// gefügte Rauschen ε vorherzusagen. Generieren = von Zufall aus Schritt für
// Schritt entrauschen, bis die Form auftaucht.
//
// Die Rezeptur (Cosine-Schedule, sinusförmiges Zeit-Embedding, ReLU-MLP, Adam
// mit abklingender Lernrate, EMA der Gewichte fürs Sampling, DDPM-Ancestral mit
// Temperatur) wurde vorab in einem Node-Spike validiert: Ring/Spirale/Kreis
// werden scharf, zwei Monde erkennbar; kein Mode-Collapse (Streuung bleibt).
// ---------------------------------------------------------------------------

export type Pt = [number, number]
export type ShapeId = 'spiral' | 'moons' | 'circle' | 'heart'
export const SHAPE_IDS: ShapeId[] = ['circle', 'heart', 'moons', 'spiral']

// --- Hyperparameter (im Spike abgestimmt) ----------------------------------
export const T = 80 // Anzahl Rausch-Stufen
const HIDDEN = 64
const FREQS = [1, 2, 4, 8, 16] // -> 10 Zeit-Dimensionen (sin/cos)
const TIME_DIM = FREQS.length * 2
const IN_DIM = 2 + TIME_DIM
const MAXDIM = Math.max(IN_DIM, HIDDEN, 2)
const N_DATA = 700 // Zielpunkte
const BATCH = 128
const LR_MAX = 3e-3
const LR_MIN = 2e-4
const LR_TAU = 2500 // exponentielles Abklingen (offenes Training, kein festes Ende)
export const VIEW = 2.7 // Sichtbereich [-VIEW, VIEW] in beiden Achsen

// --- Gauss-Zufall (Box-Muller) ---------------------------------------------
let spare: number | null = null
function randn(): number {
  if (spare !== null) {
    const v = spare
    spare = null
    return v
  }
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const mag = Math.sqrt(-2 * Math.log(u))
  spare = mag * Math.sin(2 * Math.PI * v)
  return mag * Math.cos(2 * Math.PI * v)
}

// --- Zielformen (roh, vor Normierung) --------------------------------------
function genSpiral(n: number): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(Math.random()) // gleichmässige Flächendichte
    const arm = i % 2 === 0 ? 0 : Math.PI
    const ang = r * 3.2 * Math.PI + arm
    pts.push([r * Math.cos(ang) + randn() * 0.035, r * Math.sin(ang) + randn() * 0.035])
  }
  return pts
}
function genMoons(n: number): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const upper = i < n / 2
    const a = Math.PI * Math.random()
    let x: number
    let y: number
    if (upper) {
      x = Math.cos(a)
      y = Math.sin(a)
    } else {
      x = 1 - Math.cos(a)
      y = 0.5 - Math.sin(a)
    }
    // bewusst dickere Bänder (0.10): dünne Sicheln kann das winzige Netz nicht
    // sauber trennen – so bleibt die Lücke trotzdem lesbar.
    pts.push([x + randn() * 0.1, y + randn() * 0.1])
  }
  return pts
}
function genCircle(n: number): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * Math.random()
    const r = 1 + randn() * 0.05
    pts.push([r * Math.cos(a), r * Math.sin(a)])
  }
  return pts
}
function genHeart(n: number): Pt[] {
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const tt = 2 * Math.PI * Math.random()
    const x = 16 * Math.sin(tt) ** 3
    const y =
      13 * Math.cos(tt) - 5 * Math.cos(2 * tt) - 2 * Math.cos(3 * tt) - Math.cos(4 * tt)
    pts.push([x / 16 + randn() * 0.04, y / 16 + randn() * 0.04])
  }
  return pts
}
const GENERATORS: Record<ShapeId, (n: number) => Pt[]> = {
  spiral: genSpiral,
  moons: genMoons,
  circle: genCircle,
  heart: genHeart,
}

// Normierung: Mittel 0, durch globale Skala teilen (Aspekt erhalten, ~Einheits-
// energie). So passt die reine Zufallswolke N(0,1) zur voll verrauschten Form.
function normalize(pts: Pt[]): Pt[] {
  const n = pts.length
  let mx = 0
  let my = 0
  for (const [x, y] of pts) {
    mx += x
    my += y
  }
  mx /= n
  my /= n
  let vx = 0
  let vy = 0
  for (const [x, y] of pts) {
    vx += (x - mx) ** 2
    vy += (y - my) ** 2
  }
  vx /= n
  vy /= n
  const s = Math.sqrt(0.5 * (vx + vy)) || 1
  return pts.map(([x, y]) => [(x - mx) / s, (y - my) / s] as Pt)
}

// --- Cosine-Schedule (Nichol & Dhariwal) -----------------------------------
export type Schedule = {
  T: number
  alphaBar: number[]
  alpha: number[]
  beta: number[]
  postVar: number[]
}
function makeSchedule(steps: number): Schedule {
  const s = 0.008
  const f = (t: number) => Math.cos(((t / steps + s) / (1 + s)) * (Math.PI / 2)) ** 2
  const f0 = f(0)
  const alphaBar: number[] = []
  for (let t = 0; t <= steps; t++) alphaBar[t] = f(t) / f0
  const beta: number[] = [0]
  const alpha: number[] = [1]
  const postVar: number[] = [0]
  for (let t = 1; t <= steps; t++) {
    const b = Math.min(0.999, Math.max(1e-4, 1 - alphaBar[t] / alphaBar[t - 1]))
    beta[t] = b
    alpha[t] = 1 - b
    postVar[t] = t > 1 ? ((1 - alphaBar[t - 1]) / (1 - alphaBar[t])) * b : 0
  }
  return { T: steps, alphaBar, alpha, beta, postVar }
}

// --- Zeit-Embedding (sinusförmig) ------------------------------------------
function writeTimeEmb(buf: Float32Array, offset: number, t: number, steps: number): void {
  const tau = t / steps
  let k = offset
  for (const fr of FREQS) {
    buf[k++] = Math.sin(fr * Math.PI * tau)
    buf[k++] = Math.cos(fr * Math.PI * tau)
  }
}

// --- MLP (flache Float32-Gewichte) -----------------------------------------
type Layer = { W: Float32Array; b: Float32Array; inN: number; outN: number; relu: boolean }
function makeLayer(inN: number, outN: number, relu: boolean): Layer {
  const W = new Float32Array(inN * outN)
  const scale = Math.sqrt((relu ? 2 : 1) / inN) // He / Xavier
  for (let i = 0; i < W.length; i++) W[i] = randn() * scale
  return { W, b: new Float32Array(outN), inN, outN, relu }
}
function cloneLayers(layers: Layer[]): Layer[] {
  return layers.map((L) => ({ ...L, W: L.W.slice(), b: L.b.slice() }))
}

// ---------------------------------------------------------------------------
// Diffusion: hält Modell + EMA + Adam + Schedule + Daten und treibt Training/
// Verrauschen/Vektorfeld/Sampling.
// ---------------------------------------------------------------------------
export class Diffusion {
  readonly sched: Schedule
  readonly data: Pt[]
  private readonly eps: Pt[] // feste Rausch-Realisierung je Datenpunkt (Verrausch-Viz)
  private model: Layer[]
  private ema: Layer[]
  private mW: Float32Array[]
  private vW: Float32Array[]
  private mb: Float32Array[]
  private vb: Float32Array[]
  private gW: Float32Array[]
  private gb: Float32Array[]
  private acts: Float32Array[]
  private zs: Float32Array[]
  private gA = new Float32Array(MAXDIM)
  private gB = new Float32Array(MAXDIM)
  private inBuf = new Float32Array(IN_DIM)
  step = 0

  constructor(shape: ShapeId) {
    this.sched = makeSchedule(T)
    this.data = normalize(GENERATORS[shape](N_DATA))
    this.eps = this.data.map(() => [randn(), randn()] as Pt)
    const sizes = [IN_DIM, HIDDEN, HIDDEN, 2]
    this.model = []
    for (let i = 0; i < sizes.length - 1; i++) {
      this.model.push(makeLayer(sizes[i], sizes[i + 1], i < sizes.length - 2))
    }
    this.ema = cloneLayers(this.model)
    this.mW = this.model.map((L) => new Float32Array(L.W.length))
    this.vW = this.model.map((L) => new Float32Array(L.W.length))
    this.mb = this.model.map((L) => new Float32Array(L.outN))
    this.vb = this.model.map((L) => new Float32Array(L.outN))
    this.gW = this.model.map((L) => new Float32Array(L.W.length))
    this.gb = this.model.map((L) => new Float32Array(L.outN))
    this.acts = [this.inBuf, ...this.model.map((L) => new Float32Array(L.outN))]
    this.zs = this.model.map((L) => new Float32Array(L.outN))
  }

  // Vorwärts durch beliebige Schichten; Eingabe steht in this.inBuf (= acts[0]).
  private forward(layers: Layer[]): [number, number] {
    const acts = this.acts
    const zs = this.zs
    for (let li = 0; li < layers.length; li++) {
      const L = layers[li]
      const ain = acts[li]
      const z = zs[li]
      const aout = acts[li + 1]
      const W = L.W
      for (let o = 0; o < L.outN; o++) {
        let s = L.b[o]
        const base = o * L.inN
        for (let i = 0; i < L.inN; i++) s += W[base + i] * ain[i]
        z[o] = s
        aout[o] = L.relu ? (s > 0 ? s : 0) : s
      }
    }
    const last = acts[layers.length]
    return [last[0], last[1]]
  }

  // Rückwärts (nur fürs Trainingsmodell): akkumuliert in gW/gb.
  private backward(d0: number, d1: number): void {
    const layers = this.model
    let cur = this.gA
    let nxt = this.gB
    cur[0] = d0
    cur[1] = d1
    for (let li = layers.length - 1; li >= 0; li--) {
      const L = layers[li]
      const ain = this.acts[li]
      const z = this.zs[li]
      const W = L.W
      const gWl = this.gW[li]
      const gbl = this.gb[li]
      if (L.relu) for (let o = 0; o < L.outN; o++) if (z[o] <= 0) cur[o] = 0
      for (let o = 0; o < L.outN; o++) {
        const g = cur[o]
        gbl[o] += g
        const base = o * L.inN
        for (let i = 0; i < L.inN; i++) gWl[base + i] += g * ain[i]
      }
      for (let i = 0; i < L.inN; i++) nxt[i] = 0
      for (let o = 0; o < L.outN; o++) {
        const g = cur[o]
        const base = o * L.inN
        for (let i = 0; i < L.inN; i++) nxt[i] += g * W[base + i]
      }
      const tmp = cur
      cur = nxt
      nxt = tmp
    }
  }

  private adam(lr: number): void {
    const b1 = 0.9
    const b2 = 0.999
    const t = this.step + 1
    const bc1 = 1 - b1 ** t
    const bc2 = 1 - b2 ** t
    for (let li = 0; li < this.model.length; li++) {
      const L = this.model[li]
      const W = L.W
      const gWl = this.gW[li]
      const mWl = this.mW[li]
      const vWl = this.vW[li]
      for (let k = 0; k < W.length; k++) {
        const g = gWl[k]
        mWl[k] = b1 * mWl[k] + (1 - b1) * g
        vWl[k] = b2 * vWl[k] + (1 - b2) * g * g
        W[k] -= (lr * (mWl[k] / bc1)) / (Math.sqrt(vWl[k] / bc2) + 1e-8)
        gWl[k] = 0
      }
      const gbl = this.gb[li]
      const mbl = this.mb[li]
      const vbl = this.vb[li]
      for (let o = 0; o < L.outN; o++) {
        const g = gbl[o]
        mbl[o] = b1 * mbl[o] + (1 - b1) * g
        vbl[o] = b2 * vbl[o] + (1 - b2) * g * g
        L.b[o] -= (lr * (mbl[o] / bc1)) / (Math.sqrt(vbl[o] / bc2) + 1e-8)
        gbl[o] = 0
      }
    }
  }

  private emaUpdate(): void {
    const decay = Math.min(0.999, (1 + this.step) / (10 + this.step))
    for (let li = 0; li < this.model.length; li++) {
      const W = this.model[li].W
      const eW = this.ema[li].W
      for (let k = 0; k < W.length; k++) eW[k] = decay * eW[k] + (1 - decay) * W[k]
      const b = this.model[li].b
      const eb = this.ema[li].b
      for (let o = 0; o < b.length; o++) eb[o] = decay * eb[o] + (1 - decay) * b[o]
    }
  }

  /** Trainiert `n` Schritte; gibt den mittleren Verlust (MSE auf ε) zurück. */
  trainSteps(n: number): number {
    const data = this.data
    const ab = this.sched.alphaBar
    let lossAcc = 0
    for (let s = 0; s < n; s++) {
      const lr = LR_MIN + (LR_MAX - LR_MIN) * Math.exp(-this.step / LR_TAU)
      let batchLoss = 0
      for (let bI = 0; bI < BATCH; bI++) {
        const p = data[(Math.random() * data.length) | 0]
        const t = 1 + ((Math.random() * T) | 0)
        const sa = Math.sqrt(ab[t])
        const sb = Math.sqrt(1 - ab[t])
        const ex = randn()
        const ey = randn()
        this.inBuf[0] = sa * p[0] + sb * ex
        this.inBuf[1] = sa * p[1] + sb * ey
        writeTimeEmb(this.inBuf, 2, t, T)
        const [px, py] = this.forward(this.model)
        const dx = px - ex
        const dy = py - ey
        batchLoss += dx * dx + dy * dy
        this.backward(dx / BATCH, dy / BATCH)
      }
      this.adam(lr)
      this.emaUpdate()
      this.step++
      lossAcc += batchLoss / BATCH
    }
    return lossAcc / n
  }

  /** ε des EMA-Modells für einen einzelnen Punkt auf Stufe t. */
  private predEps(x: number, y: number, t: number): [number, number] {
    this.inBuf[0] = x
    this.inBuf[1] = y
    writeTimeEmb(this.inBuf, 2, t, T)
    return this.forward(this.ema)
  }

  /** Verrausch-Phase: alle Datenpunkte auf Stufe t (feste ε-Realisierung). */
  forwardNoise(t: number): Pt[] {
    const sa = Math.sqrt(this.sched.alphaBar[t])
    const sb = Math.sqrt(1 - this.sched.alphaBar[t])
    return this.data.map((p, i) => [sa * p[0] + sb * this.eps[i][0], sa * p[1] + sb * this.eps[i][1]] as Pt)
  }

  /** Anteil verbleibendes Signal auf Stufe t (für die Anzeige). */
  signalFrac(t: number): number {
    return Math.sqrt(this.sched.alphaBar[t])
  }

  /** Lern-Phase: gelerntes Entrausch-Feld (−ε) auf einem Gitter, Stufe t. */
  vectorField(t: number, grid: number): { x: number; y: number; dx: number; dy: number }[] {
    const out: { x: number; y: number; dx: number; dy: number }[] = []
    for (let gy = 0; gy < grid; gy++) {
      for (let gx = 0; gx < grid; gx++) {
        const x = -VIEW + ((gx + 0.5) / grid) * 2 * VIEW
        const y = VIEW - ((gy + 0.5) / grid) * 2 * VIEW
        const [ex, ey] = this.predEps(x, y, t)
        out.push({ x, y, dx: -ex, dy: -ey }) // −ε zeigt grob „nach Hause"
      }
    }
    return out
  }

  /** Generier-Phase: Startwolke aus reinem Rauschen. */
  sampleInit(m: number): Pt[] {
    const pts: Pt[] = []
    for (let i = 0; i < m; i++) pts.push([randn(), randn()])
    return pts
  }

  /** Ein DDPM-Rückwärtsschritt auf Stufe t (EMA-Modell, Temperatur skaliert das
   *  eingespeiste Rauschen: <1 = enger an die Form, >1 = mehr Streuung). */
  sampleStep(points: Pt[], t: number, temp: number): Pt[] {
    const ab = this.sched.alphaBar[t]
    const a = this.sched.alpha[t]
    const b = this.sched.beta[t]
    const sb = Math.sqrt(1 - ab)
    const inv = 1 / Math.sqrt(a)
    const sigma = Math.sqrt(this.sched.postVar[t]) * temp
    return points.map(([x, y]) => {
      const [ex, ey] = this.predEps(x, y, t)
      const mx = inv * (x - (b / sb) * ex)
      const my = inv * (y - (b / sb) * ey)
      if (t > 1) return [mx + sigma * randn(), my + sigma * randn()] as Pt
      return [mx, my] as Pt
    })
  }
}
