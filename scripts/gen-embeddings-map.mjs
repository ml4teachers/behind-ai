// ---------------------------------------------------------------------------
// Generiert die Daten für die Bedeutungs-Landkarte der Embeddings-Seite.
//
//   node scripts/gen-embeddings-map.mjs
//
// Was passiert:
//  1. Eine kuratierte Liste deutscher Alltagswörter (in Kategorien) wird mit
//     dem Modell gemini-embedding-2 über Vertex AI (Region "global") embedded
//     – identisch zur Live-Route src/app/api/embeddings/route.ts.
//  2. Aus den Cosinus-Distanzen wird ein 2D-Layout berechnet (SMACOF / metrisches
//     MDS): Bildschirm-Distanz ≈ echte Bedeutungs-Distanz. So bleiben Cluster
//     erhalten und neue Live-Wörter lassen sich später bei ihren Nachbarn
//     einordnen.
//  3. Ergebnis -> public/embeddings-map.json (Wörter, Kategorie, x/y, Vektor).
//
// Voraussetzung: GOOGLE_APPLICATION_CREDENTIALS (oder ./gcp-service-account.json).
// WICHTIG: MODEL + OUTPUT_DIM müssen mit der Live-Route übereinstimmen.
// ---------------------------------------------------------------------------

import { GoogleAuth } from 'google-auth-library'
import fs from 'fs'
import path from 'path'

const MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2'
const OUTPUT_DIM = 768
const LOCATION = 'global'

// Sprache der Wörterkarte: `node scripts/gen-embeddings-map.mjs en` (Default: de).
// Geschrieben wird public/embeddings-map.<locale>.json. Die Kategorie-SCHLÜSSEL
// bleiben deutsch (tiere/essen/…), weil Farben (CAT_COLOR) und Labels (i18n
// embMap.cat*) daran hängen – nur die WÖRTER sind übersetzt.
const LOCALE = process.argv[2] === 'en' ? 'en' : 'de'

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync('./gcp-service-account.json')) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = './gcp-service-account.json'
}

// --- Kuratierte Wörter: 8 gut unterscheidbare Kategorien (chart-1..8) ----------
const CATEGORIES_DE = {
  tiere: ['Hund', 'Katze', 'Pferd', 'Kuh', 'Schwein', 'Schaf', 'Elefant', 'Löwe', 'Tiger', 'Bär', 'Wolf', 'Fuchs', 'Maus', 'Adler', 'Hai', 'Delfin', 'Frosch', 'Schmetterling'],
  essen: ['Brot', 'Käse', 'Apfel', 'Banane', 'Tomate', 'Kartoffel', 'Reis', 'Nudeln', 'Suppe', 'Salat', 'Schokolade', 'Kuchen', 'Kaffee', 'Milch', 'Wein', 'Fleisch', 'Honig', 'Butter'],
  orte: ['Deutschland', 'Frankreich', 'Italien', 'Spanien', 'Japan', 'China', 'Brasilien', 'Ägypten', 'Berlin', 'Paris', 'Rom', 'Madrid', 'Tokio', 'London', 'Wien', 'Zürich', 'Indien', 'Kanada'],
  gefuehle: ['Freude', 'Glück', 'Trauer', 'Angst', 'Wut', 'Liebe', 'Hass', 'Neid', 'Stolz', 'Scham', 'Hoffnung', 'Mut', 'Einsamkeit', 'Sehnsucht', 'Überraschung', 'Ekel', 'Langeweile', 'Dankbarkeit'],
  berufe: ['Ärztin', 'Lehrer', 'Pilot', 'Bäcker', 'Anwältin', 'Gärtner', 'Koch', 'Polizist', 'Krankenpfleger', 'Ingenieurin', 'Künstler', 'Bauer', 'Friseur', 'Programmiererin', 'Verkäufer', 'Architekt', 'Feuerwehrmann', 'Richter'],
  sport: ['Fußball', 'Tennis', 'Schwimmen', 'Yoga', 'Boxen', 'Marathon', 'Klettern', 'Skifahren', 'Basketball', 'Turnen', 'Radfahren', 'Golf', 'Reiten', 'Tauchen', 'Handball', 'Volleyball', 'Joggen', 'Segeln'],
  musik: ['Gitarre', 'Klavier', 'Geige', 'Trompete', 'Schlagzeug', 'Flöte', 'Cello', 'Harfe', 'Saxophon', 'Klarinette', 'Trommel', 'Orgel', 'Akkordeon', 'Mundharmonika', 'Kontrabass', 'Oboe', 'Posaune', 'Ukulele'],
  fahrzeuge: ['Auto', 'Fahrrad', 'Zug', 'Flugzeug', 'Schiff', 'Bus', 'Motorrad', 'Rakete', 'Hubschrauber', 'U-Boot', 'Traktor', 'Straßenbahn', 'Lastwagen', 'Taxi', 'Roller', 'Segelboot', 'Ballon', 'Kanu'],
}

// Englische Entsprechungen (gleiche Reihenfolge, gleiche Kategorie-Schlüssel).
const CATEGORIES_EN = {
  tiere: ['Dog', 'Cat', 'Horse', 'Cow', 'Pig', 'Sheep', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Wolf', 'Fox', 'Mouse', 'Eagle', 'Shark', 'Dolphin', 'Frog', 'Butterfly'],
  essen: ['Bread', 'Cheese', 'Apple', 'Banana', 'Tomato', 'Potato', 'Rice', 'Pasta', 'Soup', 'Salad', 'Chocolate', 'Cake', 'Coffee', 'Milk', 'Wine', 'Meat', 'Honey', 'Butter'],
  orte: ['Germany', 'France', 'Italy', 'Spain', 'Japan', 'China', 'Brazil', 'Egypt', 'Berlin', 'Paris', 'Rome', 'Madrid', 'Tokyo', 'London', 'Vienna', 'Zurich', 'India', 'Canada'],
  gefuehle: ['Joy', 'Happiness', 'Sadness', 'Fear', 'Anger', 'Love', 'Hate', 'Envy', 'Pride', 'Shame', 'Hope', 'Courage', 'Loneliness', 'Longing', 'Surprise', 'Disgust', 'Boredom', 'Gratitude'],
  berufe: ['Doctor', 'Teacher', 'Pilot', 'Baker', 'Lawyer', 'Gardener', 'Cook', 'Police officer', 'Nurse', 'Engineer', 'Artist', 'Farmer', 'Hairdresser', 'Programmer', 'Salesperson', 'Architect', 'Firefighter', 'Judge'],
  sport: ['Football', 'Tennis', 'Swimming', 'Yoga', 'Boxing', 'Marathon', 'Climbing', 'Skiing', 'Basketball', 'Gymnastics', 'Cycling', 'Golf', 'Horse riding', 'Diving', 'Handball', 'Volleyball', 'Jogging', 'Sailing'],
  musik: ['Guitar', 'Piano', 'Violin', 'Trumpet', 'Drum kit', 'Flute', 'Cello', 'Harp', 'Saxophone', 'Clarinet', 'Drum', 'Organ', 'Accordion', 'Harmonica', 'Double bass', 'Oboe', 'Trombone', 'Ukulele'],
  fahrzeuge: ['Car', 'Bicycle', 'Train', 'Airplane', 'Ship', 'Bus', 'Motorcycle', 'Rocket', 'Helicopter', 'Submarine', 'Tractor', 'Tram', 'Truck', 'Taxi', 'Scooter', 'Sailboat', 'Balloon', 'Canoe'],
}

const CATEGORIES = LOCALE === 'en' ? CATEGORIES_EN : CATEGORIES_DE

const entries = []
for (const [cat, words] of Object.entries(CATEGORIES)) {
  for (const term of words) entries.push({ term, category: cat })
}

// --- Embeddings holen ---------------------------------------------------------
const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' })
const client = await auth.getClient()
const token = (await client.getAccessToken()).token
const projectId = await auth.getProjectId()
const endpoint = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/${LOCATION}/publishers/google/models/${MODEL}:embedContent`

function unit(v) {
  const m = Math.sqrt(v.reduce((s, x) => s + x * x, 0))
  return m === 0 ? v : v.map((x) => x / m)
}

async function embed(text) {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: { parts: [{ text }] }, output_dimensionality: OUTPUT_DIM }),
  })
  if (!r.ok) throw new Error(`embed "${text}" failed ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return unit((await r.json()).embedding.values)
}

console.log(`Embedde ${entries.length} Wörter mit ${MODEL} (${OUTPUT_DIM} Dim)…`)
for (const e of entries) {
  e.vec = await embed(e.term)
  process.stdout.write('.')
}
console.log('\nFertig mit Embeddings.')

const N = entries.length
const cos = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; return d }

// Distanzmatrix (Cosinus-Distanz). Kontrast leicht angehoben (Potenz), damit das
// 2D-Layout die Cluster sichtbar trennt – die Reihenfolge der Distanzen bleibt.
const D = Array.from({ length: N }, () => new Float64Array(N))
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    const d = Math.pow(Math.max(0, 1 - cos(entries[i].vec, entries[j].vec)), 1.4)
    D[i][j] = d; D[j][i] = d
  }
}

// --- Deterministische PCA-2D als Startlayout (Power-Iteration) ----------------
const dim = OUTPUT_DIM
const mean = new Float64Array(dim)
for (const e of entries) for (let i = 0; i < dim; i++) mean[i] += e.vec[i] / N
const Xc = entries.map((e) => e.vec.map((x, i) => x - mean[i]))
function normalizeVec(v) { const m = Math.sqrt(v.reduce((s, x) => s + x * x, 0)); return v.map((x) => x / m) }
function covMatVec(comp) {
  const proj = Xc.map((row) => row.reduce((s, x, i) => s + x * comp[i], 0))
  const out = new Float64Array(dim)
  for (let r = 0; r < N; r++) { const p = proj[r], row = Xc[r]; for (let i = 0; i < dim; i++) out[i] += row[i] * p }
  return out
}
function powerIter(prev) {
  let v = normalizeVec(Array.from({ length: dim }, (_, i) => Math.sin(i * 0.7 + 1)))
  for (let it = 0; it < 120; it++) {
    let w = covMatVec(v)
    for (const p of prev) { const d = w.reduce((s, x, i) => s + x * p[i], 0); for (let i = 0; i < dim; i++) w[i] -= d * p[i] }
    v = normalizeVec(w)
  }
  return v
}
const pc1 = powerIter([]), pc2 = powerIter([pc1])
let X = Xc.map((row) => [
  row.reduce((s, x, i) => s + x * pc1[i], 0),
  row.reduce((s, x, i) => s + x * pc2[i], 0),
])
// Startlayout auf vernünftige Skala bringen (≈ mittlere Zieldistanz)
{
  let meanX = 0; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) meanX += Math.hypot(X[i][0] - X[j][0], X[i][1] - X[j][1])
  meanX /= (N * (N - 1)) / 2
  let meanD = 0; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) meanD += D[i][j]
  meanD /= (N * (N - 1)) / 2
  const s = meanD / (meanX || 1)
  X = X.map(([x, y]) => [x * s, y * s])
}

// --- SMACOF (metrisches MDS): Bildschirm-Distanz ≈ Cosinus-Distanz -----------
function smacofStep(X) {
  const Xn = Array.from({ length: N }, () => [0, 0])
  for (let i = 0; i < N; i++) {
    let bii = 0
    let sx = 0, sy = 0
    for (let j = 0; j < N; j++) {
      if (i === j) continue
      const dx = X[i][0] - X[j][0], dy = X[i][1] - X[j][1]
      const dist = Math.hypot(dx, dy) || 1e-9
      const b = -D[i][j] / dist
      bii -= b
      sx += b * X[j][0]
      sy += b * X[j][1]
    }
    // Guttman-Transform: X_new = (1/N) * B(X) X
    Xn[i][0] = (bii * X[i][0] + sx) / N
    Xn[i][1] = (bii * X[i][1] + sy) / N
  }
  return Xn
}
function stress(X) {
  let s = 0
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const d = Math.hypot(X[i][0] - X[j][0], X[i][1] - X[j][1])
    s += (d - D[i][j]) ** 2
  }
  return s
}
for (let it = 0; it < 400; it++) X = smacofStep(X)
console.log('SMACOF-Stress:', stress(X).toFixed(5))

// --- Koordinaten pro Achse auf die volle Fläche strecken ---------------------
// Statt uniformer Skalierung (lässt viel Rand leer) dehnen wir x und y einzeln,
// sodass das zentrale 90 %-Band den Bereich [-0.92, 0.92] füllt; seltene
// Ausreißer werden auf den Rand geklemmt. So nutzt die Karte den Platz aus und
// die Begriffe stehen weiter auseinander.
const clampN = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
function percentile(arr, p) {
  const s = [...arr].sort((a, b) => a - b)
  const i = (s.length - 1) * p
  const lo = Math.floor(i), hi = Math.ceil(i)
  return s[lo] + (s[hi] - s[lo]) * (i - lo)
}
{
  const xs = X.map((p) => p[0]), ys = X.map((p) => p[1])
  const xlo = percentile(xs, 0.05), xhi = percentile(xs, 0.95)
  const ylo = percentile(ys, 0.05), yhi = percentile(ys, 0.95)
  X = X.map(([x, y]) => [
    clampN(((x - xlo) / (xhi - xlo) * 2 - 1) * 0.92, -1, 1),
    clampN(((y - ylo) / (yhi - ylo) * 2 - 1) * 0.92, -1, 1),
  ])
}

// --- Qualitätskontrolle: mittlere 2D-Distanz innerhalb vs. zwischen Cluster ---
{
  let win = 0, winN = 0, bet = 0, betN = 0
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const d = Math.hypot(X[i][0] - X[j][0], X[i][1] - X[j][1])
    if (entries[i].category === entries[j].category) { win += d; winN++ } else { bet += d; betN++ }
  }
  console.log(`2D-Distanz innerhalb=${(win / winN).toFixed(3)}  zwischen=${(bet / betN).toFixed(3)}  Verhältnis=${((bet / betN) / (win / winN)).toFixed(2)}x`)
}

// --- Schreiben ---------------------------------------------------------------
const round = (n, p = 4) => Math.round(n * 10 ** p) / 10 ** p
const out = {
  model: MODEL,
  dim: OUTPUT_DIM,
  categories: Object.keys(CATEGORIES),
  words: entries.map((e, i) => ({
    term: e.term,
    category: e.category,
    x: round(X[i][0], 4),
    y: round(X[i][1], 4),
    vec: e.vec.map((v) => round(v, 4)),
  })),
}
const outPath = path.join(process.cwd(), 'public', `embeddings-map.${LOCALE}.json`)
fs.writeFileSync(outPath, JSON.stringify(out))
console.log(`Geschrieben: ${outPath} (${entries.length} Wörter, ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`)
