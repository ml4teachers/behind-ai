// Throwaway tuning harness for the /mlp overfitting feature.
// Re-implements the exact mlp.ts math (tanh + relu) so we can search dataset
// params and confirm the train/test gap is ROBUST across many net-init seeds.
// Run: node scripts/overfit-sim.mjs

// --- seeded PRNG (mulberry32) ---
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// --- mlp math (mirror of mlp.ts) ---
const tanh = (x) => Math.tanh(x)
const sigmoid = (x) => 1 / (1 + Math.exp(-x))
const act = (kind, z) => (kind === 'relu' ? Math.max(0, z) : tanh(z))
const actDeriv = (kind, z, a) => (kind === 'relu' ? (z > 0 ? 1 : 0) : 1 - a * a)

function initMLP(H, rng, opts = {}) {
  const r = (s) => (rng() * 2 - 1) * s
  const w1s = opts.scale ?? 2.6
  // posBias: ReLU rescue — start biases positive so units are "on" and don't die.
  const bias = opts.posBias ? () => rng() * opts.posBias : () => r(1)
  return {
    W1: Array.from({ length: H }, () => [r(w1s), r(w1s)]),
    b1: Array.from({ length: H }, () => bias()),
    W2: Array.from({ length: H }, () => r(2.2)),
    b2: r(0.5),
  }
}

function forward(net, x, kind) {
  const H = net.W1.length
  const zh = new Array(H)
  const h = new Array(H)
  let z2 = net.b2
  for (let j = 0; j < H; j++) {
    zh[j] = net.W1[j][0] * x[0] + net.W1[j][1] * x[1] + net.b1[j]
    h[j] = act(kind, zh[j])
    z2 += net.W2[j] * h[j]
  }
  return { zh, h, z2, y: sigmoid(z2) }
}

const classify = (net, x, kind) => (forward(net, x, kind).y > 0.5 ? 1 : 0)
const acc = (net, data, kind) => data.reduce((c, p) => c + (classify(net, p.x, kind) === p.label ? 1 : 0), 0) / data.length

function trainEpoch(net, data, lr, kind) {
  const H = net.W1.length
  const gW1 = Array.from({ length: H }, () => [0, 0])
  const gb1 = new Array(H).fill(0)
  const gW2 = new Array(H).fill(0)
  let gb2 = 0
  for (const p of data) {
    const t = p.label
    const f = forward(net, p.x, kind)
    const dz2 = f.y - t
    gb2 += dz2
    for (let j = 0; j < H; j++) {
      gW2[j] += dz2 * f.h[j]
      const dzj = dz2 * net.W2[j] * actDeriv(kind, f.zh[j], f.h[j])
      gW1[j][0] += dzj * p.x[0]
      gW1[j][1] += dzj * p.x[1]
      gb1[j] += dzj
    }
  }
  const n = data.length || 1
  const step = lr / n
  return {
    W1: net.W1.map((row, j) => [row[0] - step * gW1[j][0], row[1] - step * gW1[j][1]]),
    b1: net.b1.map((b, j) => b - step * gb1[j]),
    W2: net.W2.map((w, j) => w - step * gW2[j]),
    b2: net.b2 - step * gb2,
  }
}

function train(net, data, lr, epochs, kind) {
  let cur = net
  for (let i = 0; i < epochs; i++) cur = trainEpoch(cur, data, lr, kind)
  return cur
}

// --- candidate noisy dataset: XOR-by-quadrant truth + spread + flipped labels ---
// truth: label 1 iff (x>0.5) XOR (y>0.5)
const truth = (x, y) => ((x > 0.5) !== (y > 0.5) ? 1 : 0)

const gaussFrom = (rng) => () => {
  let u = 0, v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const CENTERS = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]
function cluster(rng, n, spread, tag) {
  const g = gaussFrom(rng)
  const out = []
  for (const [cx, cy] of CENTERS)
    for (let i = 0; i < n; i++) {
      const x = Math.min(0.98, Math.max(0.02, cx + g() * spread))
      const y = Math.min(0.98, Math.max(0.02, cy + g() * spread))
      out.push({ id: `${tag}${out.length}`, x: [x, y], label: truth(x, y) })
    }
  return out
}

// Decoupled seeds: train positions+flips from `seed`, test from `seed+1000`,
// so test count never perturbs which train points get flipped.
function makeNoisy({ seed, perQuad, spread, nFlip, testPerQuad }) {
  const trng = mulberry32(seed)
  const trainPts = cluster(trng, perQuad, spread, 'tr')
  const idx = trainPts.map((_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(trng() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  for (let k = 0; k < nFlip; k++) trainPts[idx[k]].label = trainPts[idx[k]].label === 1 ? 0 : 1
  const testPts = cluster(mulberry32(seed + 1000), testPerQuad, spread, 'te')
  return { train: trainPts, test: testPts }
}

// clean XOR (contrast dataset: should generalize, ~no gap)
function makeCleanXor(seed, perQuad, testPerQuad, spread) {
  return {
    train: cluster(mulberry32(seed), perQuad, spread, 'tr'),
    test: cluster(mulberry32(seed + 1000), testPerQuad, spread, 'te'),
  }
}

// --- sweep ---
const SEEDS = 40
const EPOCHS = 3500 // matches MAX_EPOCHS in the app

function evalConfig(ds, kind, H, lr, opts) {
  const trs = [], tes = []
  let memo = 0
  for (let s = 0; s < SEEDS; s++) {
    const rng = mulberry32(1000 + s * 97)
    let net = initMLP(H, rng, opts)
    net = train(net, ds.train, lr, EPOCHS, kind)
    const tr = acc(net, ds.train, kind)
    const te = acc(net, ds.test, kind)
    trs.push(tr); tes.push(te)
    if (tr >= 0.999) memo++
  }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length
  const std = (a, m) => Math.sqrt(mean(a.map((v) => (v - m) ** 2)))
  const teM = mean(tes)
  return { tr: mean(trs), te: teM, teStd: std(tes, teM), teMin: Math.min(...tes), teMax: Math.max(...tes), memo: memo / SEEDS }
}

function report(label, ds, kind, lr, opts) {
  console.log(`\n## ${label}  (train=${ds.train.length}, test=${ds.test.length}, kind=${kind}, lr=${lr}, opts=${JSON.stringify(opts ?? {})})`)
  console.log('  H | train% | test%  std  [min..max] | P(100%train)')
  for (const H of [2, 3, 4, 6, 8]) {
    const r = evalConfig(ds, kind, H, lr, opts)
    console.log(
      `  ${H} |  ${(r.tr * 100).toFixed(0).padStart(4)}  |  ${(r.te * 100).toFixed(0).padStart(3)}  ${(r.teStd * 100).toFixed(0).padStart(2)}  [${(r.teMin * 100).toFixed(0).padStart(3)}..${(r.teMax * 100).toFixed(0).padStart(3)}] |   ${(r.memo * 100).toFixed(0).padStart(3)}%`,
    )
  }
}

// FINAL noisy config candidates — detailed variance.
const FINAL = { seed: 11, perQuad: 5, spread: 0.15, nFlip: 4, testPerQuad: 6 }
const dsF = makeNoisy(FINAL)
report(`FINAL noisy tanh ${JSON.stringify(FINAL)}`, dsF, 'tanh', 1.2)
const ALT = { seed: 11, perQuad: 5, spread: 0.15, nFlip: 5, testPerQuad: 6 }
report(`ALT noisy tanh ${JSON.stringify(ALT)}`, makeNoisy(ALT), 'tanh', 1.2)
report(`FINAL noisy relu posBias (expect underfit)`, dsF, 'relu', 1.2, { posBias: 0.6 })

const cx = makeCleanXor(3, 4, 6, 0.07)
report(`CLEAN-XOR tanh (expect ~no gap)`, cx, 'tanh', 1.2)
report(`CLEAN-XOR relu posBias`, cx, 'relu', 1.2, { posBias: 0.6 })

// dump the locked dataset so I can hardcode exact points if desired
console.log('\nFINAL train labels by quadrant (flips visible):')
console.log(JSON.stringify(dsF.train.map((p) => ({ x: +p.x[0].toFixed(2), y: +p.x[1].toFixed(2), l: p.label, t: truth(p.x[0], p.x[1]) })).filter((p) => p.l !== p.t)))
