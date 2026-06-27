// ---------------------------------------------------------------------------
// Generiert die Daten für die „Geschlechter-Achse" der Verzerrungs-Seite (/bias).
//
//   node scripts/gen-bias-map.mjs        (Deutsch)
//   node scripts/gen-bias-map.mjs en     (Englisch)
//
// Was passiert:
//  1. Geschlechts-Seedpaare (Mann/Frau, Vater/Mutter, er/sie …) werden mit
//     gemini-embedding-2 über Vertex AI (Region „global") embedded – identisch
//     zur Live-Route src/app/api/embeddings/route.ts.
//  2. Daraus entsteht EINE Richtung im Vektorraum:
//        axis = mean(männliche Seeds) − mean(weibliche Seeds)   (normiert)
//     Projiziert man ein Wort auf diese Achse, misst man, ob es im Training eher
//     neben typisch männlichen oder typisch weiblichen Wörtern stand.
//  3. Berufswörter werden embedded und projiziert. Der Nullpunkt wird auf die
//     mittlere Projektion neutraler Objekt-Wörter (Tisch, Apfel …) gelegt, damit
//     „0" wirklich „kein Geschlechts-Bezug" heisst (sonst hat die rohe Projektion
//     einen Offset).
//  4. Ergebnis -> public/bias-map.<locale>.json: Achse, Nullpunkt, Skala, je Wort
//     {Begriff, lean, Vektor}. Der Vektor wird gebraucht, damit die Seite die
//     Nachbarn auch NACH dem Herausrechnen der Achse berechnen kann („Verzerrung
//     lässt sich nicht einfach wegrechnen").
//
// WICHTIG: MODEL + OUTPUT_DIM müssen mit src/app/api/embeddings/route.ts
// übereinstimmen – sonst liegt ein live getipptes Wort in einem anderen
// Vektorraum als die Karte.
// ---------------------------------------------------------------------------

import { GoogleAuth } from 'google-auth-library'
import fs from 'fs'
import path from 'path'

const MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2'
const OUTPUT_DIM = 768
const LOCATION = 'global'
const LOCALE = process.argv[2] === 'en' ? 'en' : 'de'

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync('./gcp-service-account.json')) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = './gcp-service-account.json'
}

// --- Seedpaare für die Geschlechts-Richtung [männlich, weiblich] --------------
const SEEDS = {
  de: [
    ['Mann', 'Frau'], ['Vater', 'Mutter'], ['Sohn', 'Tochter'], ['Bruder', 'Schwester'],
    ['Junge', 'Mädchen'], ['Herr', 'Dame'], ['männlich', 'weiblich'], ['er', 'sie'],
    ['König', 'Königin'], ['Onkel', 'Tante'], ['Großvater', 'Großmutter'], ['Opa', 'Oma'],
  ],
  en: [
    ['man', 'woman'], ['father', 'mother'], ['son', 'daughter'], ['brother', 'sister'],
    ['boy', 'girl'], ['gentleman', 'lady'], ['male', 'female'], ['he', 'she'],
    ['king', 'queen'], ['uncle', 'aunt'], ['grandfather', 'grandmother'], ['Mr', 'Mrs'],
  ],
}

// --- Berufswörter (jugendfrei, bewusst gemischt). Empirisch im Spike geprüft:
//   männlich-geformte, aber weiblich-assoziierte Wörter (Krankenpfleger, Florist,
//   Bibliothekar) landen trotzdem links → zeigt, dass die Schlagseite aus der
//   BEDEUTUNG kommt, nicht aus der Wortendung. Genderlose -kraft-Wörter
//   (Fachkraft vs. Pflegekraft) machen denselben Punkt ohne jede Endung.
const WORDS = {
  de: [
    'Pilot', 'Ingenieur', 'Informatiker', 'Mechaniker', 'Elektriker', 'Maurer',
    'Chirurg', 'Programmierer', 'Architekt', 'Arzt', 'Anwalt', 'Richter', 'Koch',
    'Friseur', 'Bibliothekar', 'Florist', 'Kosmetiker', 'Krankenpfleger',
    'Reinigungskraft', 'Pflegekraft', 'Fachkraft', 'Lehrkraft',
  ],
  en: [
    'pilot', 'engineer', 'programmer', 'mechanic', 'electrician', 'plumber',
    'carpenter', 'architect', 'soldier', 'CEO', 'doctor', 'lawyer', 'judge', 'cook',
    'journalist', 'scientist', 'teacher', 'nurse', 'nanny', 'babysitter',
    'housekeeper', 'secretary', 'receptionist', 'librarian', 'hairdresser',
    'dancer', 'florist',
  ],
}

// --- Neutrale Objekt-Wörter -> definieren den Nullpunkt (kein Geschlechts-Bezug)
const ANCHORS = {
  de: ['Tisch', 'Apfel', 'Stein', 'Fenster', 'Brücke', 'Lampe'],
  en: ['table', 'apple', 'stone', 'window', 'bridge', 'lamp'],
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
const dot = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; return d }
const addv = (a, b) => a.map((x, i) => x + b[i])

async function embed(text) {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: { parts: [{ text }] }, output_dimensionality: OUTPUT_DIM }),
  })
  if (!r.ok) throw new Error(`embed "${text}" failed ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return unit((await r.json()).embedding.values)
}

const seeds = SEEDS[LOCALE]
const words = WORDS[LOCALE]
const anchors = ANCHORS[LOCALE]

console.log(`Embedde Seeds + ${words.length} Berufe + ${anchors.length} Anker mit ${MODEL} (${OUTPUT_DIM} Dim, ${LOCALE})…`)

// Seeds -> Achse
const males = [], females = []
for (const [m, f] of seeds) { males.push(await embed(m)); females.push(await embed(f)); process.stdout.write('.') }
const meanM = males.reduce(addv).map((x) => x / males.length)
const meanF = females.reduce(addv).map((x) => x / females.length)
const axis = unit(meanM.map((x, i) => x - meanF[i])) // + = männlich

// Nullpunkt = mittlere Projektion der Anker
const anchorVecs = []
for (const a of anchors) { anchorVecs.push(await embed(a)); process.stdout.write('.') }
const center = anchorVecs.map((v) => dot(v, axis)).reduce((s, x) => s + x, 0) / anchorVecs.length
const lean = (v) => dot(v, axis) - center

// Berufe
const wordVecs = []
for (const w of words) { wordVecs.push({ term: w, vec: await embed(w) }); process.stdout.write('.') }
console.log('\nFertig mit Embeddings.')

const wordRows = wordVecs.map((w) => ({ term: w.term, lean: lean(w.vec), vec: w.vec }))
const anchorRows = anchors.map((a, i) => ({ term: a, lean: lean(anchorVecs[i]) }))

// Symmetrische Skala: span = grösster Betrag unter den Berufen -> 0 ist die Mitte.
const span = Math.max(...wordRows.map((r) => Math.abs(r.lean)))

// --- Qualitätskontrolle -------------------------------------------------------
console.log('\nGeschlechts-Achse (sortiert, + = männlich, 0 = neutral):')
for (const r of [...wordRows].sort((a, b) => b.lean - a.lean)) {
  const n = Math.round((Math.abs(r.lean) / span) * 28)
  console.log(`  ${r.term.padEnd(18)} ${r.lean >= 0 ? '+' : ''}${r.lean.toFixed(3)}  ${(r.lean >= 0 ? '♂' : '♀').repeat(n)}`)
}
console.log('Anker (sollten ~0 sein):', anchorRows.map((r) => `${r.term}=${r.lean.toFixed(3)}`).join('  '))

// --- Schreiben ----------------------------------------------------------------
const round = (n, p = 4) => Math.round(n * 10 ** p) / 10 ** p
const out = {
  model: MODEL,
  dim: OUTPUT_DIM,
  axis: axis.map((v) => round(v, 6)),
  center: round(center, 6),
  span: round(span, 6),
  words: wordRows.map((r) => ({ term: r.term, lean: round(r.lean, 4), vec: r.vec.map((v) => round(v, 4)) })),
  anchors: anchorRows.map((r) => ({ term: r.term, lean: round(r.lean, 4) })),
}
const outPath = path.join(process.cwd(), 'public', `bias-map.${LOCALE}.json`)
fs.writeFileSync(outPath, JSON.stringify(out))
console.log(`Geschrieben: ${outPath} (${words.length} Berufe, ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`)
