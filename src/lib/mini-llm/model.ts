// ---------------------------------------------------------------------------
// Ein winziges, echtes Sprachmodell auf Zeichen-Ebene – von Hand, ohne Framework.
//
// Es ist bewusst klein genug, um live im Browser von Grund auf zu lernen, und
// transparent genug, um es Zeile für Zeile zu verstehen. Architektur nach
// Bengio (2003) / Karpathy „makemore": die letzten `C` Zeichen → Embedding →
// eine tanh-Schicht → Wahrscheinlichkeit für JEDES mögliche nächste Zeichen
// (Softmax). Trainiert wird per Gradientenabstieg (Backprop von Hand), genau
// wie bei grossen Modellen – nur millionenfach kleiner.
//
// Kein TensorFlow, kein WASM: ein paar tausend Zahlen in Float32-Arrays.
// ---------------------------------------------------------------------------

export interface Vocab {
  /** Alle vorkommenden Zeichen, '.' = Wortgrenze (Anfang + Ende). */
  chars: string[]
  /** Zeichen → Index. */
  stoi: Record<string, number>
  /** Grösse des Vokabulars. */
  V: number
}

export interface CharModel {
  V: number // Vokabulargrösse
  C: number // Kontextlänge (wie viele Zeichen das Modell zurückblickt)
  E: number // Embedding-Dimension pro Zeichen
  H: number // Neuronen in der versteckten Schicht
  Cemb: Float32Array // [V, E]  Embedding-Tabelle
  W1: Float32Array // [C*E, H]  Gewichte versteckte Schicht
  b1: Float32Array // [H]
  W2: Float32Array // [H, V]  Gewichte Ausgabeschicht
  b2: Float32Array // [V]
}

export interface Dataset {
  /** Flach: N*C Indizes (Kontextfenster). */
  X: Int16Array
  /** N Ziel-Indizes (das jeweils nächste Zeichen). */
  Y: Int16Array
  N: number
  C: number
}

// --- Vokabular aus einem Korpus bauen --------------------------------------
export function buildVocab(text: string): Vocab {
  const set = new Set<string>(['.'])
  for (const ch of text.replace(/\s+/g, '')) set.add(ch)
  const chars = Array.from(set).sort()
  const stoi: Record<string, number> = {}
  chars.forEach((c, i) => (stoi[c] = i))
  return { chars, stoi, V: chars.length }
}

// --- Trainingsbeispiele bauen: (C Zeichen Kontext) → nächstes Zeichen -------
// Jedes Wort wird mit '.' umrandet, sodass das Modell auch Wortanfang und
// Wortende lernt. Aus „und" entstehen die Beispiele
//   ... .  → u  |  .. u → n  |  . u n → d  |  u n d → .
export function buildDataset(words: string[], vocab: Vocab, C: number): Dataset {
  const xs: number[] = []
  const ys: number[] = []
  const dot = vocab.stoi['.']
  for (const w of words) {
    const ctx = new Array(C).fill(dot)
    for (const ch of w + '.') {
      const ix = vocab.stoi[ch]
      if (ix === undefined) continue
      for (let p = 0; p < C; p++) xs.push(ctx[p])
      ys.push(ix)
      ctx.shift()
      ctx.push(ix)
    }
  }
  return { X: Int16Array.from(xs), Y: Int16Array.from(ys), N: ys.length, C }
}

// --- Zufalls-Initialisierung (Box-Muller → Normalverteilung) ----------------
function randn(n: number, scale: number): Float32Array {
  const a = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let u = 0
    let v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    a[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * scale
  }
  return a
}

// Frisches, untrainiertes Modell. Die Ausgabeschicht startet absichtlich sehr
// klein → die erste Vorhersage ist nahezu gleichverteilt: das Modell „weiss
// noch nichts" (Loss ≈ log(V)).
export function makeModel(V: number, C: number, E: number, H: number): CharModel {
  return {
    V,
    C,
    E,
    H,
    Cemb: randn(V * E, 1.0),
    W1: randn(C * E * H, Math.sqrt(2 / (C * E))), // He-Initialisierung
    b1: new Float32Array(H),
    W2: randn(H * V, Math.sqrt(1 / H) * 0.1),
    b2: new Float32Array(V),
  }
}

// --- Vorhersage für EINEN Kontext: Wahrscheinlichkeit pro nächstem Zeichen --
// (Forward-Pass. Gibt eine Verteilung über alle V Zeichen zurück, Summe = 1.)
export function predict(m: CharModel, ctx: number[]): Float32Array {
  const { V, C, E, H } = m
  const CE = C * E
  const emb = new Float32Array(CE)
  for (let p = 0; p < C; p++) {
    const base = ctx[p] * E
    for (let e = 0; e < E; e++) emb[p * E + e] = m.Cemb[base + e]
  }
  const h = new Float32Array(H)
  for (let j = 0; j < H; j++) {
    let s = m.b1[j]
    for (let k = 0; k < CE; k++) s += emb[k] * m.W1[k * H + j]
    h[j] = Math.tanh(s)
  }
  const logits = new Float32Array(V)
  let maxL = -Infinity
  for (let v = 0; v < V; v++) {
    let s = m.b2[v]
    for (let j = 0; j < H; j++) s += h[j] * m.W2[j * V + v]
    logits[v] = s
    if (s > maxL) maxL = s
  }
  let Z = 0
  for (let v = 0; v < V; v++) {
    const e = Math.exp(logits[v] - maxL)
    logits[v] = e
    Z += e
  }
  for (let v = 0; v < V; v++) logits[v] /= Z
  return logits // jetzt Wahrscheinlichkeiten
}

// --- Ein Trainingsschritt über einen Minibatch -----------------------------
// Forward → Cross-Entropy-Loss → Backprop (von Hand) → ein kleiner Schritt
// bergab (SGD). Gibt den durchschnittlichen Loss des Minibatches zurück.
export function trainStep(m: CharModel, ds: Dataset, idxs: Int32Array, lr: number): number {
  const { V, C, E, H } = m
  const CE = C * E
  const B = idxs.length

  const emb = new Float32Array(B * CE)
  const h = new Float32Array(B * H)
  const probs = new Float32Array(B * V)
  let loss = 0

  // FORWARD
  for (let b = 0; b < B; b++) {
    const row = idxs[b] * C
    for (let p = 0; p < C; p++) {
      const base = ds.X[row + p] * E
      for (let e = 0; e < E; e++) emb[b * CE + p * E + e] = m.Cemb[base + e]
    }
    for (let j = 0; j < H; j++) {
      let s = m.b1[j]
      for (let k = 0; k < CE; k++) s += emb[b * CE + k] * m.W1[k * H + j]
      h[b * H + j] = Math.tanh(s)
    }
    let maxL = -Infinity
    const logits = new Float32Array(V)
    for (let v = 0; v < V; v++) {
      let s = m.b2[v]
      for (let j = 0; j < H; j++) s += h[b * H + j] * m.W2[j * V + v]
      logits[v] = s
      if (s > maxL) maxL = s
    }
    let Z = 0
    for (let v = 0; v < V; v++) {
      const e = Math.exp(logits[v] - maxL)
      probs[b * V + v] = e
      Z += e
    }
    for (let v = 0; v < V; v++) probs[b * V + v] /= Z
    loss += -Math.log(probs[b * V + ds.Y[idxs[b]]] + 1e-12)
  }
  loss /= B

  // BACKWARD – Gradienten akkumulieren
  const dW2 = new Float32Array(H * V)
  const db2 = new Float32Array(V)
  const dW1 = new Float32Array(CE * H)
  const db1 = new Float32Array(H)
  const dCemb = new Float32Array(V * E)
  const invB = 1 / B

  for (let b = 0; b < B; b++) {
    const row = idxs[b] * C
    const y = ds.Y[idxs[b]]
    // d/dlogits der Cross-Entropy: (Wahrscheinlichkeit − 1 beim Ziel), gemittelt
    const dlogits = new Float32Array(V)
    for (let v = 0; v < V; v++) dlogits[v] = probs[b * V + v] * invB
    dlogits[y] -= invB
    // Ausgabeschicht
    const dh = new Float32Array(H)
    for (let v = 0; v < V; v++) {
      const dl = dlogits[v]
      db2[v] += dl
      for (let j = 0; j < H; j++) {
        dW2[j * V + v] += h[b * H + j] * dl
        dh[j] += m.W2[j * V + v] * dl
      }
    }
    // durch tanh zurück: d/dx tanh = 1 − tanh²
    const dhpre = new Float32Array(H)
    for (let j = 0; j < H; j++) {
      const hj = h[b * H + j]
      dhpre[j] = dh[j] * (1 - hj * hj)
      db1[j] += dhpre[j]
    }
    // versteckte Schicht + zurück ins Embedding
    const demb = new Float32Array(CE)
    for (let k = 0; k < CE; k++) {
      const ek = emb[b * CE + k]
      for (let j = 0; j < H; j++) {
        dW1[k * H + j] += ek * dhpre[j]
        demb[k] += m.W1[k * H + j] * dhpre[j]
      }
    }
    for (let p = 0; p < C; p++) {
      const base = ds.X[row + p] * E
      for (let e = 0; e < E; e++) dCemb[base + e] += demb[p * E + e]
    }
  }

  // SGD-Update: jeden Parameter ein kleines Stück gegen den Gradienten
  for (let i = 0; i < H * V; i++) m.W2[i] -= lr * dW2[i]
  for (let i = 0; i < V; i++) m.b2[i] -= lr * db2[i]
  for (let i = 0; i < CE * H; i++) m.W1[i] -= lr * dW1[i]
  for (let i = 0; i < H; i++) m.b1[i] -= lr * db1[i]
  for (let i = 0; i < V * E; i++) m.Cemb[i] -= lr * dCemb[i]

  return loss
}

// --- Loss auf einer festen Beispielmenge (saubere Lernkurve) ----------------
export function evalLoss(m: CharModel, ds: Dataset, idxs: Int32Array): number {
  const C = m.C
  let loss = 0
  const ctx = new Array(C)
  for (let i = 0; i < idxs.length; i++) {
    const row = idxs[i] * C
    for (let p = 0; p < C; p++) ctx[p] = ds.X[row + p]
    const probs = predict(m, ctx)
    loss += -Math.log(probs[ds.Y[idxs[i]]] + 1e-12)
  }
  return loss / idxs.length
}

// --- Ein Wort aus dem Modell ziehen (autoregressiv, mit Temperatur) ---------
export function sample(m: CharModel, vocab: Vocab, maxLen = 14, temperature = 1): string {
  const C = m.C
  const dot = vocab.stoi['.']
  const ctx = new Array(C).fill(dot)
  let out = ''
  for (let i = 0; i < maxLen; i++) {
    const probs = predict(m, ctx)
    const ix = sampleFrom(probs, temperature)
    if (vocab.chars[ix] === '.') break
    out += vocab.chars[ix]
    ctx.shift()
    ctx.push(ix)
  }
  return out
}

// Einen Index aus einer Wahrscheinlichkeitsverteilung ziehen (optional mit
// Temperatur: T<1 macht die Auswahl mutiger/spitzer, T>1 zufälliger).
function sampleFrom(probs: Float32Array, temperature: number): number {
  let r = Math.random()
  if (temperature !== 1) {
    const adj = new Float32Array(probs.length)
    let Z = 0
    for (let v = 0; v < probs.length; v++) {
      const p = Math.pow(probs[v], 1 / temperature)
      adj[v] = p
      Z += p
    }
    let cum = 0
    r *= Z
    for (let v = 0; v < probs.length; v++) {
      cum += adj[v]
      if (r <= cum) return v
    }
    return probs.length - 1
  }
  let cum = 0
  for (let v = 0; v < probs.length; v++) {
    cum += probs[v]
    if (r <= cum) return v
  }
  return probs.length - 1
}
