// ---------------------------------------------------------------------------
// gen-data-sample.mjs
//
// Baut aus dem rohen FineWeb-Sample (public/daten/assets/{data,info}.csv) eine
// schlanke, jugendfreie JSON-Stichprobe für die Daten-Seite:
//
//   public/data-sample.json
//
// Jeder Eintrag = ein echtes (übersetztes) Web-Dokument mit:
//   - Position (echte UMAP-Koordinaten aus der CSV, auf 0..1 normiert)
//   - Themengruppe (104 Cluster → 8 lesbare Obergruppen)
//   - Bildungswert-Score (edu 0..4, vom FineWeb-Edu-Klassifikator)
//   - gekürzter Klartext
//
// Heikle Cluster (Glücksspiel, Cannabis, Sucht, Waffen, Sexualität …) werden
// komplett ausgelassen, Texte zusätzlich auf rote Begriffe gefiltert und sauber
// gekürzt. Das hält die Seite für ein Lehrpersonen-Publikum unbedenklich.
//
// Aufruf:  node scripts/gen-data-sample.mjs
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_CSV = join(ROOT, 'public/daten/assets/data.csv')
const INFO_CSV = join(ROOT, 'public/daten/assets/info.csv')
const OUT = join(ROOT, 'public/data-sample.json')

// --- Minimaler RFC-4180-CSV-Parser (Quotes, ""-Escapes, eingebettete \n) -----
function parseCsv(text, delimiter = ';') {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delimiter) {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c === '\r') {
      // ignorieren
    } else {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function toObjects(rows) {
  const [header, ...rest] = rows
  return rest
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

// --- 104 Cluster-IDs → 8 Obergruppen ----------------------------------------
// Schlüssel = Gruppen-Key (mappt im Frontend auf chart-1..8).
const GROUPS = {
  sport: {
    label: 'Sport & Gaming',
    ids: [6, 11, 35, 72, 82, 95, 102, 15],
  },
  tech: {
    label: 'Technik & Internet',
    ids: [12, 23, 38, 48, 51, 59, 61, 64, 73, 75, 79, 89, 33, 13],
  },
  health: {
    label: 'Gesundheit & Medizin',
    ids: [40, 42, 56, 60, 62, 69, 77, 86, 94, 97, 99],
  },
  shopping: {
    label: 'Konsum & Mode',
    ids: [16, 19, 26, 32, 36, 43, 45, 50, 55, 58, 78, 84, 91, 8, 18],
  },
  home: {
    label: 'Wohnen & Heimwerken',
    ids: [5, 17, 24, 27, 28, 41, 46, 63, 67, 70, 76, 83, 88, 100],
  },
  economy: {
    label: 'Wirtschaft, Politik & Recht',
    ids: [1, 2, 22, 39, 49, 52, 54, 74, 80, 81, 90, 92, 101, 47],
  },
  culture: {
    label: 'Kultur & Medien',
    ids: [7, 9, 21, 30, 57, 66, 93, 37],
  },
  life: {
    label: 'Alltag, Glaube & Bildung',
    ids: [0, 3, 85, 4, 14, 20, 31, 87, 98, 34, 68, 71, 96],
  },
}

// Cluster, die ganz wegfallen (heikel fürs Publikum)
const DENY_IDS = new Set([10, 25, 29, 44, 53, 65, 103])

// Cluster-ID → Gruppen-Key
const idToGroup = {}
for (const [key, g] of Object.entries(GROUPS)) {
  for (const id of g.ids) idToGroup[id] = key
}

// Rote Begriffe → Dokument auslassen (defensiv, klein gehalten)
const RED = [
  'sex', 'porn', 'nackt', 'erotik', 'masturb', 'penis', 'vagina',
  'suizid', 'selbstmord', 'vergewalt', 'missbrauch', 'kokain', 'heroin',
  'waffe', 'pistole', 'gewehr', 'munition', 'wette', 'casino', 'kasino',
]

// --- Text aufräumen & kürzen -------------------------------------------------
function cleanText(raw) {
  let t = (raw || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/…?\s*(Mehr lesen|Read more|Weiterlesen)\b\.?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // Auf ~340 Zeichen an einer Satz-/Wortgrenze kürzen.
  const MAX = 340
  if (t.length > MAX) {
    const cut = t.slice(0, MAX)
    const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
    if (lastStop > 180) {
      t = cut.slice(0, lastStop + 1)
    } else {
      const lastSpace = cut.lastIndexOf(' ')
      t = cut.slice(0, lastSpace > 0 ? lastSpace : MAX).trim() + ' …'
    }
  }
  return t
}

// --- Hauptlauf ---------------------------------------------------------------
const dataRows = toObjects(parseCsv(readFileSync(DATA_CSV, 'utf-8')))

// Zuerst alle behaltenen Dokumente mit Roh-Koordinaten sammeln …
const kept = []
let skippedDeny = 0
let skippedRed = 0
let skippedShort = 0

for (const r of dataRows) {
  const cid = parseInt(r.cluster_labels, 10)
  if (!Number.isInteger(cid)) continue
  if (DENY_IDS.has(cid)) { skippedDeny++; continue }
  const group = idToGroup[cid]
  if (!group) continue // -1 / unbekannt

  const text = cleanText(r.content_display_translated || r.content_display)
  if (text.length < 120) { skippedShort++; continue }
  const low = text.toLowerCase()
  if (RED.some((w) => low.includes(w))) { skippedRed++; continue }

  const x = parseFloat(r.X), y = parseFloat(r.Y)
  if (!Number.isFinite(x) || !Number.isFinite(y)) continue
  const edu = parseInt(r.edu_labels, 10) || 0
  kept.push({ group, edu, x, y, text })
}

// … dann Koordinaten-Grenzen NUR über die behaltenen Punkte (Karte voll nutzen).
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
for (const d of kept) {
  if (d.x < minX) minX = d.x
  if (d.x > maxX) maxX = d.x
  if (d.y < minY) minY = d.y
  if (d.y > maxY) maxY = d.y
}
const norm = (v, lo, hi) => (v - lo) / (hi - lo) // 0..1

const docs = kept.map((d, i) => ({
  id: i,
  g: d.group,
  edu: d.edu,
  // y gespiegelt, damit +y oben liegt; auf 3 Nachkommastellen runden
  x: +norm(d.x, minX, maxX).toFixed(3),
  y: +(1 - norm(d.y, minY, maxY)).toFixed(3),
  text: d.text,
}))

const survivors = docs.filter((d) => d.edu >= 3).length
const out = {
  source: 'FineWeb (CommonCrawl-Webtexte), maschinell ins Deutsche übersetzt',
  threshold: 3, // FineWeb-Edu behält Dokumente mit Bildungswert-Score >= 3
  total: docs.length,
  survivors,
  groups: Object.entries(GROUPS).map(([key, g]) => ({ key, label: g.label })),
  docs,
}

writeFileSync(OUT, JSON.stringify(out))
console.log(`✓ ${OUT}`)
console.log(`  Dokumente: ${docs.length}  (Survivors edu>=3: ${survivors} = ${(survivors / docs.length * 100).toFixed(1)}%)`)
console.log(`  ausgelassen: deny=${skippedDeny} rotebegriffe=${skippedRed} zukurz=${skippedShort}`)
const byGroup = {}
for (const d of docs) byGroup[d.g] = (byGroup[d.g] || 0) + 1
console.log('  pro Gruppe:', byGroup)
