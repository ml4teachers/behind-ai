// ---------------------------------------------------------------------------
// Einmaliger Ernter für die Musterlösungen-Fixtures.
//
// Hintergrund: Auf mehreren Seiten gibt es VORGEGEBENE Fragen/Aufgaben. Jede
// löste bislang bei jedem Klick einen echten Modell-Aufruf aus – das kostet
// Tokens und Zeit, obwohl die Antwort sich kaum ändert. Dieser Skript ruft die
// echten API-Routen des laufenden Dev-Servers EINMAL je vorgegebener Frage
// (mehrfach, wo Streuung erwünscht ist) ab und legt die ECHTEN Antworten als
// Fixtures unter src/lib/fixtures/ ab. Die Komponenten servieren dann für
// vorgegebene Fragen aus dem Cache; freie Eingaben fragen weiter live das Modell.
//
// Geerntet wird VERBATIM, was die Route zurückgibt (z. B. data.text). Die
// komponenten-eigene Nachbearbeitung (clean(), parseAnswer …) läuft danach
// identisch wie im Live-Fall – die Anzeige bleibt also originalgetreu.
//
// Aufruf:  node scripts/harvest-fixtures.mjs            (Dev-Server muss laufen)
//          HARVEST_BASE=http://localhost:3001 node scripts/harvest-fixtures.mjs
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const BASE = process.env.HARVEST_BASE || 'http://localhost:3000'
const OUT = resolve(ROOT, 'src/lib/fixtures')
mkdirSync(OUT, { recursive: true })

// --- kleine Helfer (aus src/lib/reasoning/verify.ts gespiegelt) -------------
const ARITH_ALLOWED = /^[0-9+\-*/().,\s×÷−²³^]+$/
function evalArith(expr) {
  const raw = String(expr).trim()
  if (!raw || !ARITH_ALLOWED.test(raw)) return null
  const js = raw
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/²/g, '**2').replace(/³/g, '**3').replace(/\^/g, '**').replace(/,/g, '.')
  try {
    const val = Function(`"use strict"; return (${js});`)()
    return typeof val === 'number' && Number.isFinite(val) ? val : null
  } catch { return null }
}
function parseAnswer(text) {
  const matches = [...String(text).matchAll(/Antwort:\s*(.+)/gi)]
  const tail = matches.length ? matches[matches.length - 1][1] : String(text)
  return tail.trim()
}
function extractNumber(s) {
  const nums = String(s).replace(/−/g, '-').match(/-?\d+(?:[.,]\d+)?/g)
  if (!nums) return null
  return Number(nums[nums.length - 1].replace(',', '.'))
}
const isCorrect = (answer, truth) => {
  const got = extractNumber(answer)
  return got !== null && Math.abs(got - truth) < 1e-6
}
function countLetter(word, letter) {
  const ch = letter.toLowerCase()
  let n = 0
  for (const c of word.toLowerCase()) if (c === ch) n++
  return n
}
function unit(v) {
  let m = 0
  for (const x of v) m += x * x
  m = Math.sqrt(m)
  return m === 0 ? v : v.map((x) => x / m)
}
function dot(a, b) {
  let d = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) d += a[i] * b[i]
  return d
}

// --- HTTP mit Wiederholung --------------------------------------------------
async function post(path, body, { tries = 3 } = {}) {
  let lastErr
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)
      return data
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 600 * (i + 1)))
    }
  }
  throw lastErr
}

// einfache Begrenzung der Parallelität
async function mapPool(items, concurrency, fn) {
  const out = new Array(items.length)
  let idx = 0
  async function worker() {
    while (idx < items.length) {
      const cur = idx++
      out[cur] = await fn(items[cur], cur)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))
  return out
}

const norm = (s) => String(s).replace(/\s+/g, ' ').trim()
function dedupeKeep(texts, max) {
  const seen = new Set()
  const out = []
  for (const t of texts) {
    const k = norm(t).toLowerCase()
    if (!t || seen.has(k)) continue
    seen.add(k)
    out.push(t)
    if (out.length >= max) break
  }
  return out
}
// Standardmässig MERGEN wir in die bestehende Datei (DE bleibt erhalten, EN
// kommt dazu). Mit { merge:false } wird die Datei frisch geschrieben.
const save = (name, obj, { merge = true } = {}) => {
  const p = resolve(OUT, name)
  let base = {}
  if (merge) {
    try { base = JSON.parse(readFileSync(p, 'utf8')) } catch {}
  }
  const out = { ...base, ...obj }
  writeFileSync(p, JSON.stringify(out, null, 2) + '\n')
  console.log(`  → ${name} (${Object.keys(out).length} Einträge, davon ${Object.keys(obj).length} neu/aktualisiert)`)
}

// Lokalisierte Prompts – müssen EXAKT den Komponenten entsprechen (Cache-Key).
const calcPrompt = (expr, locale) => (locale === 'en' ? `Calculate: ${expr}` : `Berechne: ${expr}`)
const letterPromptL = (word, letter, locale) =>
  locale === 'en'
    ? `How many times does the letter '${letter}' appear in the word '${word}'?`
    : `Wie viele Buchstaben '${letter}' kommen im Wort '${word}' vor?`

// === Eingabe-Definitionen (exakt wie die Komponenten sie ans Modell schicken) ===
const HALLUCINATE_QS = {
  de: [
    'Worum geht es im Roman „Die Uhren von Saint-Galmier" von Henri Vautrin (1931)? Fasse die Handlung kurz zusammen.',
    'Wer war die Schweizer Physikerin Elsbeth Marrer (1894–1971) und wofür ist sie bekannt?',
    'Was wurde im Vertrag von Niederbüren (1647) geregelt? Nenne die wichtigsten Punkte.',
    'Erkläre kurz den Hofstadter-Lindqvist-Effekt aus der Psycholinguistik.',
  ],
  en: [
    'What is the novel “The Clocks of Saint-Galmier” by Henri Vautrin (1931) about? Briefly summarise the plot.',
    'Who was the Swiss physicist Elsbeth Marrer (1894–1971) and what is she known for?',
    'What did the Treaty of Niederbüren (1647) regulate? Name the most important points.',
    'Briefly explain the Hofstadter–Lindqvist effect from psycholinguistics.',
  ],
}

const LOGPROB_PROMPTS = [
  'Die Hauptstadt von Frankreich ist',
  'Goethes geheime Lieblingsfarbe war',
  'The capital of France is',
  'Goethe’s secret favourite colour was',
]

const ARITH_EXPRS = [
  '(17×6)+(23×4)−15²', '13²−7×8+19', '47+18×3−6²', '(24×3)−(19×2)+7²',
  '100−7×9+4³', '(31×4)−9³+200', '8×7+6×9−5²',
]

const RAG_QS = {
  de: [
    'Wer leitet die Schule?',
    'Wann hat die Bibliothek offen?',
    'Worum geht es in der Projektwoche?',
    'Welche Instrumente gibt es im Musikzimmer?',
    'Wer hat die Fussball-WM 2022 gewonnen?',
  ],
  en: [
    'Who runs the school?',
    'When is the library open?',
    'What is the project week about?',
    'Which instruments are there in the music room?',
    'Who won the 2022 football World Cup?',
  ],
}
const TOP_K = 3

const LETTER_WORDS = {
  de: [
    ['Schifffahrtsgesellschaft', 'f'],
    ['Wettervorhersage', 'e'],
    ['Geburtstagskuchen', 'g'],
    ['Regenbogenfarben', 'n'],
  ],
  en: [
    ['unintentionally', 'n'],
    ['assassination', 's'],
    ['withdrawal', 'w'],
    ['Worcestershire', 'r'],
  ],
}

const FINETUNING_QS = {
  de: [
    'Wer war Marie Curie?',
    'Schreibe ein kurzes Gedicht über den Herbst.',
    'Erkläre Photosynthese in einem Satz.',
    'Gib mir drei Tipps gegen Lampenfieber.',
  ],
  en: [
    'Who was Marie Curie?',
    'Write a short poem about autumn.',
    'Explain photosynthesis in one sentence.',
    'Give me three tips against stage fright.',
  ],
}

const PRIVACY_QS = {
  de: [
    'Schreib eine Förderplanung für Lena Müller aus der 3b, die in Mathe eine 2.5 hat und sich zu Hause schwer konzentrieren kann.',
    'Formuliere eine Rückmeldung an die Eltern von Tim Berger zu seiner Lese-Rechtschreib-Schwäche.',
    'Erkläre den Wasserkreislauf einfach und anschaulich für eine 5. Klasse.',
  ],
  en: [
    'Write a support plan for Lena Miller from class 3B, who has a C in maths and struggles to concentrate at home.',
    'Draft a note to the parents of Tim Berger about his dyslexia.',
    'Explain the water cycle simply and vividly for a year 5 class.',
  ],
}

// Welche Sprachen frisch geerntet werden (Default: nur EN, da DE bereits liegt;
// `HARVEST_LOCALES=de,en` erzwingt beide).
const LOCALES = (process.env.HARVEST_LOCALES || 'en').split(',').map((s) => s.trim()).filter(Boolean)

// === 1. Halluzinationen – Erfinder-Maschine (je Sprache, locale pinnt Antwort) =
async function harvestHallucinate() {
  console.log(`1/7 Halluzinationen (Erfinder-Maschine)… (${LOCALES.join(',')})`)
  const out = {}
  for (const locale of LOCALES) {
    await mapPool(HALLUCINATE_QS[locale], 4, async (q) => {
      const raw = []
      for (let i = 0; i < 4; i++) {
        try { raw.push((await post('/api/hallucinate', { topic: q, locale })).text) } catch {}
      }
      out[q] = dedupeKeep(raw, 3)
      console.log(`    [${locale}] "${q.slice(0, 40)}…" → ${out[q].length} Varianten`)
    })
  }
  save('hallucinate.json', out)
}

// === 2. Halluzinationen – Logprob-Verteilungen =============================
async function harvestLogprobs() {
  console.log('2/7 Halluzinationen (Logprobs)…')
  const out = {}
  await mapPool(LOGPROB_PROMPTS, 4, async (p) => {
    // mehrmals abrufen, die Antwort mit den meisten Tokens behalten
    let best = null
    for (let i = 0; i < 2; i++) {
      try {
        const d = await post('/api/predict-next', { text: p })
        const cand = {
          topTokens: (d.topTokens ?? []).slice(0, 6),
          remainingProbability: d.remainingProbability ?? 0,
        }
        if (!best || cand.topTokens.length > best.topTokens.length) best = cand
      } catch {}
    }
    out[p] = best
  })
  save('logprobs.json', out)
}

// === 3. Chain-of-Thought – Arithmetik (beide Sprachen, Schlüssel = Prompt) ==
async function harvestCot() {
  console.log('3/7 Chain-of-Thought… (de+en)')
  const out = {}
  for (const locale of ['de', 'en']) {
    await mapPool(ARITH_EXPRS, 3, async (expr) => {
      const truth = evalArith(expr)
      const prompt = calcPrompt(expr, locale)
      const directRaw = []
      const cotRaw = []
      // Sofort-Modus: wir wollen FALSCHE Antworten (das ist die Lektion).
      for (let i = 0; i < 7 && directRaw.filter((t) => !isCorrect(parseAnswer(t), truth)).length < 4; i++) {
        try { directRaw.push((await post('/api/reasoning', { prompt, mode: 'direct', temperature: 0.6, locale })).text) } catch {}
      }
      // Schritt-Modus: wir wollen RICHTIGE Antworten.
      for (let i = 0; i < 7 && cotRaw.filter((t) => isCorrect(parseAnswer(t), truth)).length < 4; i++) {
        try { cotRaw.push((await post('/api/reasoning', { prompt, mode: 'cot', temperature: 0.4, locale })).text) } catch {}
      }
      const directWrong = dedupeKeep(directRaw.filter((t) => !isCorrect(parseAnswer(t), truth)), 4)
      const cotRight = dedupeKeep(cotRaw.filter((t) => isCorrect(parseAnswer(t), truth)), 4)
      out[prompt] = {
        truth,
        direct: directWrong.length ? directWrong : dedupeKeep(directRaw, 2),
        cot: cotRight.length ? cotRight : dedupeKeep(cotRaw, 2),
      }
      console.log(`    [${locale}] ${expr} = ${truth}  direct:${out[prompt].direct.length} cot:${out[prompt].cot.length}`)
    })
  }
  // frisch schreiben: Schlüsselschema wechselt von expr -> vollem Prompt
  save('cot.json', out, { merge: false })
}

// === 4. RAG – Embedding + zwei Antworten (je Sprache eigene Wissensbasis) ===
async function harvestRag() {
  console.log(`4/7 RAG… (${LOCALES.join(',')})`)
  const out = {}
  for (const locale of LOCALES) {
    const docsFile = JSON.parse(readFileSync(resolve(ROOT, `public/rag-docs.${locale}.json`), 'utf8'))
    const docs = docsFile.docs.map((d) => ({ ...d, vec: unit(d.vec) }))
    await mapPool(RAG_QS[locale], 3, async (q) => {
      const emb = await post('/api/embeddings', { text: q })
      const vec = unit(emb.embedding)
      const ranked = docs
        .map((doc) => ({ doc, sim: dot(vec, doc.vec) }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, TOP_K)
      const context = ranked.map((s) => `${s.doc.title}\n${s.doc.text}`).join('\n\n')
      const plain = []
      const grounded = []
      for (let i = 0; i < 2; i++) {
        try { plain.push((await post('/api/rag-answer', { question: q, context: '', locale })).answer) } catch {}
        try { grounded.push((await post('/api/rag-answer', { question: q, context, locale })).answer) } catch {}
      }
      out[q] = {
        embedding: emb.embedding,
        contextIds: ranked.map((s) => s.doc.id),
        plain: dedupeKeep(plain, 2),
        grounded: dedupeKeep(grounded, 2),
      }
      console.log(`    [${locale}] "${q}" → [${out[q].contextIds.join(', ')}]`)
    })
  }
  save('rag.json', out)
}

// === 5. RLVR – Pool aus echten Stegreif-Versuchen (je Sprache eigene Wörter) =
async function harvestRlvr() {
  console.log(`5/7 RLVR… (${LOCALES.join(',')})`)
  const out = {}
  for (const locale of LOCALES) {
    await mapPool(LETTER_WORDS[locale], 2, async ([word, letter]) => {
      const truth = countLetter(word, letter)
      const prompt = letterPromptL(word, letter, locale)
      const isRight = (t) => extractNumber(parseAnswer(t)) === truth
      const sampleOnce = async () => {
        try {
          const d = await post('/api/reasoning', { prompt, mode: 'sample', temperature: 1.0, maxOutputTokens: 220, locale })
          if (d.text) return d.text
        } catch {}
        return null
      }
      const pool = []
      // genug für mehrere zufällige 8er-Ziehungen; Streuung kommt von temp 1.0
      await mapPool(Array.from({ length: 40 }), 6, async () => {
        const t = await sampleOnce()
        if (t) pool.push(t)
      })
      // WICHTIG: NICHT nach Text deduplizieren. Sonst kippt die Antwort-VERTEILUNG
      // (gleich häufige falsche Antworten kollabieren stärker als textlich
      // variantenreiche richtige) – und die Pointe „Mehrheit liegt daneben" geht
      // verloren. Wir behalten die rohe Stichprobe (Häufigkeit ≈ Realität), damit
      // die 8er-Ziehung in der Komponente die echte Verteilung widerspiegelt.
      let guard = 0
      while (!pool.some(isRight) && guard < 30) {
        const t = await sampleOnce()
        if (t) pool.push(t)
        guard++
      }
      // Mindestens eine FALSCHE braucht es auch (sonst kein Widerspruch zu zeigen).
      guard = 0
      while (!pool.some((t) => !isRight(t)) && guard < 30) {
        const t = await sampleOnce()
        if (t) pool.push(t)
        guard++
      }
      const kept = pool.slice(0, 30)
      const nCorrect = kept.filter(isRight).length
      out[word] = { truth, attempts: kept }
      console.log(`    [${locale}] ${word} (=${truth})  Pool:${kept.length}  richtig:${nCorrect} (${Math.round(100 * nCorrect / kept.length)}%)`)
    })
  }
  save('rlvr.json', out)
}

// === 6. Finetuning-Vergleich (je Sprache eigene Fragen) ====================
async function harvestFinetuning() {
  console.log(`6/7 Finetuning… (${LOCALES.join(',')})`)
  const out = {}
  for (const locale of LOCALES) {
    await mapPool(FINETUNING_QS[locale], 3, async (q) => {
      const base = []
      const assistant = []
      for (let i = 0; i < 2; i++) {
        try { base.push((await post('/api/finetuning-simulate', { query: q, mode: 'base', locale })).response) } catch {}
        try { assistant.push((await post('/api/finetuning-simulate', { query: q, mode: 'assistant', locale })).response) } catch {}
      }
      out[q] = { base: dedupeKeep(base, 2), assistant: dedupeKeep(assistant, 2) }
      console.log(`    [${locale}] "${q.slice(0, 40)}" base:${out[q].base.length} assistant:${out[q].assistant.length}`)
    })
  }
  save('finetuning.json', out)
}

// === 7. Datenschutz – Nachrichten-Check (je Sprache eigene Beispiele) =======
async function harvestPrivacy() {
  console.log(`7/7 Datenschutz-Check… (${LOCALES.join(',')})`)
  const out = {}
  for (const locale of LOCALES) {
    await mapPool(PRIVACY_QS[locale], 3, async (q) => {
      // eine verlässliche Analyse genügt (die Treffer müssen Teilstrings von q sein)
      const d = await post('/api/data-flow-simulate', { promptText: q, locale })
      out[q] = {
        sensitiveParts: Array.isArray(d.sensitiveParts) ? d.sensitiveParts : [],
        anonymizedText: d.anonymizedText || q,
      }
      console.log(`    [${locale}] "${q.slice(0, 40)}…" → ${out[q].sensitiveParts.length} Treffer`)
    })
  }
  save('privacy.json', out)
}

async function main() {
  console.log(`Ernte Fixtures vom Dev-Server: ${BASE}\n`)
  const only = process.argv.slice(2)
  const steps = [
    ['hallucinate', harvestHallucinate],
    ['logprobs', harvestLogprobs],
    ['cot', harvestCot],
    ['rag', harvestRag],
    ['rlvr', harvestRlvr],
    ['finetuning', harvestFinetuning],
    ['privacy', harvestPrivacy],
  ]
  for (const [name, fn] of steps) {
    if (only.length && !only.includes(name)) continue
    await fn()
  }
  console.log('\nFertig.')
}

main().catch((e) => {
  console.error('Ernte fehlgeschlagen:', e)
  process.exit(1)
})
