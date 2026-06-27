// ---------------------------------------------------------------------------
// Generiert die Wissensbasis für die RAG-Seite.
//
//   node scripts/gen-rag-docs.mjs
//
// Was passiert:
//  1. Eine kleine, ERFUNDENE Wissensbasis (eine fiktive Schule) wird mit dem
//     Modell gemini-embedding-2 über Vertex AI (Region "global") embedded –
//     identisch zur Live-Route src/app/api/embeddings/route.ts.
//  2. Ergebnis -> public/rag-docs.json (Titel, Text, Vektor je Dokument).
//
// WARUM ERFUNDEN? Damit das Sprachmodell diese Fakten garantiert NICHT aus dem
// Training kennt. So ist der Kontrast „ohne Kontext" vs. „mit Kontext" ehrlich
// und sauber – genau der reale RAG-Anwendungsfall (internes Wiki, das die KI nie
// gesehen hat). Suche (Embeddings/Cosinus) und Antwort (Gemini) sind ECHT.
//
// Voraussetzung: GOOGLE_APPLICATION_CREDENTIALS (oder ./gcp-service-account.json).
// WICHTIG: MODEL + OUTPUT_DIM müssen mit der Live-Route übereinstimmen, sonst
// liegt die Live-Frage in einem anderen Vektorraum als die Dokumente.
// ---------------------------------------------------------------------------

import { GoogleAuth } from 'google-auth-library'
import fs from 'fs'
import path from 'path'

const MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2'
const OUTPUT_DIM = 768
const LOCATION = 'global'

// Sprache der Wissensbasis: `node scripts/gen-rag-docs.mjs en` (Default: de).
// Geschrieben wird public/rag-docs.<locale>.json; die Live-Frage muss in
// derselben Sprache eingebettet werden (passiert in rag-explorer.tsx automatisch).
const LOCALE = process.argv[2] === 'en' ? 'en' : 'de'

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync('./gcp-service-account.json')) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = './gcp-service-account.json'
}

// --- Erfundene Wissensbasis: die Lindenhof-Schule ----------------------------
// Bewusst kurze, in sich abgeschlossene Dokumente, jugendfrei und alltagsnah
// (Zielgruppe Lehrpersonen). Mehrere „Zeiten"-Dokumente (Bibliothek, Mensa,
// Sekretariat) sind Absicht: So muss die Ähnlichkeitssuche wirklich das richtige
// heraussuchen, nicht nur irgendein Dokument über Öffnungszeiten.
const DOCS_DE = [
  {
    id: 'gruendung',
    title: 'Über die Schule',
    text: 'Die Lindenhof-Schule wurde 1987 gegründet und ist nach den alten Linden im Innenhof benannt. Heute besuchen sie 320 Schülerinnen und Schüler, unterrichtet von 28 Lehrpersonen.',
  },
  {
    id: 'leitung',
    title: 'Schulleitung',
    text: 'Die Schule wird seit 2019 von Rektorin Dr. Astrid Velm geleitet. Ihr Stellvertreter ist Marco Brunner, der zugleich für den Stundenplan zuständig ist.',
  },
  {
    id: 'bibliothek',
    title: 'Bibliothek',
    text: 'Die Schulbibliothek ist von Montag bis Freitag jeweils von 8 bis 16 Uhr geöffnet. Sie umfasst über 9000 Bücher. Zum Ausleihen braucht man einen Leseausweis, den man im Sekretariat erhält.',
  },
  {
    id: 'mensa',
    title: 'Mensa',
    text: 'In der Mensa gibt es von 11:45 bis 13:15 Uhr ein warmes Mittagessen, täglich auch eine vegetarische Variante. Der Menüplan für die Woche hängt jeweils am Montag am schwarzen Brett aus.',
  },
  {
    id: 'projektwoche',
    title: 'Projektwoche',
    text: 'Jedes Jahr findet in der letzten Juniwoche eine Projektwoche statt, in der klassenübergreifend gearbeitet wird. Das Thema 2025 lautet „Wasser". Am Freitag präsentieren die Gruppen ihre Ergebnisse den Eltern.',
  },
  {
    id: 'handyregel',
    title: 'Handyregel',
    text: 'Während des Unterrichts werden Handys ausgeschaltet im dafür vorgesehenen Fach abgelegt. In den Pausen ist die Nutzung auf dem Pausenplatz erlaubt. Bei Verstoss wird das Gerät bis zum Schulschluss eingezogen.',
  },
  {
    id: 'sporttag',
    title: 'Sporttag',
    text: 'Der jährliche Sporttag findet jeweils im September auf dem Sportplatz am Mühlbach statt. Es gibt Wettbewerbe in Leichtathletik und ein Fussballturnier. Familien sind herzlich eingeladen, zuzuschauen und mitzuhelfen.',
  },
  {
    id: 'musikzimmer',
    title: 'Musikzimmer',
    text: 'Das Musikzimmer ist Raum 14 und mit einem Klavier, einem Schlagzeug und zwölf Gitarren ausgestattet. Der Schulchor probt jeden Dienstag von 16 bis 17 Uhr und ist offen für alle ab der 4. Klasse.',
  },
  {
    id: 'schulweg',
    title: 'Anreise',
    text: 'Die Buslinie 7 hält direkt vor dem Haupteingang der Schule und verkehrt alle 15 Minuten. Velos werden im überdachten Veloständer beim Westflügel abgestellt; ein Helm wird allen empfohlen.',
  },
  {
    id: 'schuelerrat',
    title: 'Schülerrat',
    text: 'Der Schülerrat trifft sich alle zwei Wochen am Mittwoch in der grossen Pause. Aus jeder Klasse kommen zwei gewählte Vertretungen. Der Rat organisiert unter anderem den Sommerflohmarkt auf dem Pausenplatz.',
  },
  {
    id: 'schulgarten',
    title: 'Schulgarten',
    text: 'Hinter dem Westflügel liegt der Schulgarten mit Gemüsebeeten und einem Bienenstock. Betreut wird er von den fünften Klassen. 2023 erhielt die Schule dafür den regionalen „Grüner-Hof-Preis".',
  },
  {
    id: 'ferien',
    title: 'Ferienkalender',
    text: 'Die Herbstferien 2025 dauern vom 4. bis 19. Oktober. Der erste Schultag nach den Ferien ist Montag, der 20. Oktober. Die genauen Daten aller Ferien stehen im Jahresplan auf der Pinnwand im Eingang.',
  },
  {
    id: 'sekretariat',
    title: 'Sekretariat',
    text: 'Das Sekretariat ist von Montag bis Freitag von 7:30 bis 12:00 Uhr besetzt. Hier meldet man kranke Kinder ab, holt Formulare und den Leseausweis für die Bibliothek. Zuständig ist Frau Keller.',
  },
  {
    id: 'anmeldung',
    title: 'Anmeldung',
    text: 'Neue Kinder werden im Sekretariat angemeldet. Für den Kindergarten ist der Stichtag der 31. Juli. Ein Schnuppertag kann jederzeit vereinbart werden; dazu meldet man sich telefonisch im Sekretariat.',
  },
]

// Englische Fassung derselben erfundenen Wissensbasis (gleiche ids -> identische
// Retrieval-Lehrstücke; nur in der Sprache des englischen UI).
const DOCS_EN = [
  {
    id: 'gruendung',
    title: 'About the school',
    text: 'Lindenhof School was founded in 1987 and is named after the old linden trees in the courtyard. Today it is attended by 320 pupils, taught by 28 teachers.',
  },
  {
    id: 'leitung',
    title: 'School leadership',
    text: 'The school has been led since 2019 by headteacher Dr. Astrid Velm. Her deputy is Marco Brunner, who is also responsible for the timetable.',
  },
  {
    id: 'bibliothek',
    title: 'Library',
    text: 'The school library is open Monday to Friday from 8 am to 4 pm. It holds over 9,000 books. To borrow books you need a reader’s card, which you get from the school office.',
  },
  {
    id: 'mensa',
    title: 'Cafeteria',
    text: 'The cafeteria serves a warm lunch from 11:45 am to 1:15 pm, including a vegetarian option every day. The menu for the week is posted on the notice board every Monday.',
  },
  {
    id: 'projektwoche',
    title: 'Project week',
    text: 'Every year in the last week of June there is a project week with cross-class work. The theme for 2025 is “Water”. On Friday the groups present their results to the parents.',
  },
  {
    id: 'handyregel',
    title: 'Phone rule',
    text: 'During lessons phones are switched off and placed in the box provided. During breaks they may be used in the schoolyard. If the rule is broken, the device is collected until the end of the school day.',
  },
  {
    id: 'sporttag',
    title: 'Sports day',
    text: 'The annual sports day takes place each September at the sports ground by the Mühlbach. There are athletics competitions and a football tournament. Families are warmly invited to watch and help out.',
  },
  {
    id: 'musikzimmer',
    title: 'Music room',
    text: 'The music room is room 14 and is equipped with a piano, a drum kit and twelve guitars. The school choir rehearses every Tuesday from 4 to 5 pm and is open to everyone from year 4 upwards.',
  },
  {
    id: 'schulweg',
    title: 'Getting there',
    text: 'Bus line 7 stops right in front of the school’s main entrance and runs every 15 minutes. Bikes are parked in the covered bike rack by the west wing; a helmet is recommended for everyone.',
  },
  {
    id: 'schuelerrat',
    title: 'Student council',
    text: 'The student council meets every two weeks on Wednesday during the long break. Each class sends two elected representatives. Among other things, the council organises the summer flea market in the schoolyard.',
  },
  {
    id: 'schulgarten',
    title: 'School garden',
    text: 'Behind the west wing lies the school garden with vegetable beds and a beehive. It is looked after by the year 5 classes. In 2023 the school received the regional “Green Courtyard Award” for it.',
  },
  {
    id: 'ferien',
    title: 'Holiday calendar',
    text: 'The autumn holidays 2025 run from 4 to 19 October. The first school day after the holidays is Monday, 20 October. The exact dates of all holidays are in the year planner on the notice board at the entrance.',
  },
  {
    id: 'sekretariat',
    title: 'School office',
    text: 'The school office is staffed Monday to Friday from 7:30 am to 12:00 noon. Here you report children sick, collect forms and the reader’s card for the library. Ms Keller is in charge.',
  },
  {
    id: 'anmeldung',
    title: 'Enrolment',
    text: 'New children are enrolled at the school office. For kindergarten the cut-off date is 31 July. A trial day can be arranged at any time; to do so, phone the school office.',
  },
]

const DOCS = LOCALE === 'en' ? DOCS_EN : DOCS_DE

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
  if (!r.ok) throw new Error(`embed "${text.slice(0, 30)}…" failed ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return unit((await r.json()).embedding.values)
}

console.log(`Embedde ${DOCS.length} Dokumente mit ${MODEL} (${OUTPUT_DIM} Dim)…`)
const docs = []
for (const d of DOCS) {
  // Titel + Text zusammen embedden: der Titel trägt zusätzliches Signal.
  const vec = await embed(`${d.title}. ${d.text}`)
  docs.push({ ...d, vec })
  process.stdout.write('.')
}
console.log('\nFertig mit Embeddings.')

// --- Qualitätskontrolle: zu jeder Beispielfrage das Top-Dokument zeigen -------
const SANITY_QUERIES = LOCALE === 'en'
  ? [
      'How many pupils does Lindenhof School have?',
      'When is the Lindenhof School library open?',
      'Who runs Lindenhof School?',
      'What is the project week at Lindenhof School about?',
      'When is lunch served?',
    ]
  : [
      'Wie viele Schülerinnen und Schüler hat die Lindenhof-Schule?',
      'Wann hat die Bibliothek der Lindenhof-Schule offen?',
      'Wer leitet die Lindenhof-Schule?',
      'Worum geht es in der Projektwoche der Lindenhof-Schule?',
      'Wann gibt es Mittagessen?',
    ]
const cos = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; return d }
console.log('\nStichprobe (Frage -> bestes Dokument):')
for (const q of SANITY_QUERIES) {
  const qv = await embed(q)
  const ranked = docs
    .map((d) => ({ id: d.id, sim: cos(qv, d.vec) }))
    .sort((a, b) => b.sim - a.sim)
  console.log(
    `  „${q.slice(0, 42)}…" -> ${ranked[0].id} (${ranked[0].sim.toFixed(3)}), ` +
      `dann ${ranked[1].id} (${ranked[1].sim.toFixed(3)})`
  )
}

// --- Schreiben ---------------------------------------------------------------
const round = (n, p = 4) => Math.round(n * 10 ** p) / 10 ** p
const out = {
  model: MODEL,
  dim: OUTPUT_DIM,
  docs: docs.map((d) => ({
    id: d.id,
    title: d.title,
    text: d.text,
    vec: d.vec.map((v) => round(v, 4)),
  })),
}
const outPath = path.join(process.cwd(), 'public', `rag-docs.${LOCALE}.json`)
fs.writeFileSync(outPath, JSON.stringify(out))
console.log(`\nGeschrieben: ${outPath} (${docs.length} Dokumente, ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`)
