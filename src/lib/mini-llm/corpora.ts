// ---------------------------------------------------------------------------
// Lerndaten für das Mini-Modell auf der Training-Seite.
//
// Bewusst klein und von Hand kuratiert (jugendfrei, klare Struktur), damit das
// winzige Modell in ein paar Sekunden sichtbar Sprache lernt. Zwei Korpora zur
// Auswahl – der Wechsel macht die Kernbotschaft der Daten-Seite erfahrbar:
// das Modell lernt NUR, was in den Daten steckt. Gleiche Mechanik, andere
// Daten → andere „Sprache".
//
// Klein genug, um inline zu stehen (wenige KB) – anders als die grossen,
// vorberechneten Assets (embeddings-map, data-sample). Kleinschreibung hält das
// Vokabular kompakt (~30 Zeichen inkl. Umlaute).
// ---------------------------------------------------------------------------

export interface Corpus {
  key: string
  /** Anzeigename (Viz-intern DE, wie die übrigen Visualisierungen – Thread 9). */
  label: string
  /** Leerzeichengetrennte Einträge. */
  text: string
  /** Vorschau-Kontexte für die „nächstes Zeichen"-Verteilung ('' = Wortanfang). */
  prefixes: string[]
}

const WOERTER = `der die das und ist sind war ein eine einen einem einer dem den auch aber oder wenn dann weil dass nicht noch nur schon sehr viel viele wenige alle keine jeder jede mein dein sein ihre unser euer dieser diese welche
haus häuser baum bäume blume blumen wald wälder berg berge tal täler fluss flüsse meer see seen insel strand wüste höhle quelle bach ufer wiese feld garten hof zaun brücke turm schloss burg kirche dorf stadt städte straße gasse platz markt
wasser feuer erde luft licht schatten sonne mond stern sterne himmel wolke wolken regen schnee eis frost wind sturm donner blitz nebel morgen mittag abend nacht tag woche monat jahr sommer winter frühling herbst
mensch menschen kind kinder mutter vater eltern bruder schwester freund freundin nachbar gast könig königin riese zwerg fee hexe drache ritter bauer müller bäcker schmied jäger hirte
tier tiere hund katze maus vogel vögel fisch pferd kuh schaf ziege hase igel fuchs wolf bär löwe adler eule biene schmetterling schnecke frosch
lernen lesen schreiben rechnen zählen malen singen tanzen spielen lachen weinen denken wissen kennen fragen antworten hören sehen fühlen riechen schmecken sprechen rufen flüstern erzählen träumen
gehen kommen stehen sitzen liegen laufen rennen springen klettern fliegen schwimmen tauchen fallen steigen tragen heben werfen fangen suchen finden öffnen schließen bauen graben pflanzen ernten kochen backen essen trinken schlafen wachen
groß klein kurz lang hoch tief weit eng breit schmal dick dünn schwer leicht hart weich glatt rund spitz gut schön alt jung neu warm kalt heiß kühl hell dunkel laut leise schnell langsam stark schwach reich froh müde wach
rot blau grün gelb braun grau schwarz weiß bunt golden silbern`

const NAMEN = `anna lena marie sophie emma mia hannah lea laura lina sarah julia johanna charlotte clara amelie luisa frieda emilia ida greta paula martha helena ella nele mathilda romy carla pia mara jana nora leonie alina maja jasmin theresa magdalena katharina franziska elena valentina antonia rosa wilhelmina friederike henriette adelheid gertrud hildegard mathilde elisabeth margarethe gisela ingrid renate ursula brigitte helga monika petra sabine andrea claudia stefanie nicole melanie vanessa lara hannelore waltraud
lukas leon paul finn jonas elias luca felix noah ben max moritz anton emil david jakob julian samuel niklas tim jan tom philipp simon fabian florian sebastian alexander maximilian benjamin johannes friedrich wilhelm heinrich ludwig karl konrad otto hermann gustav reinhard dietrich gottfried siegfried hartmut helmut werner günther günter jürgen jörg björn bernhard manfred wolfgang joachim matthias andreas thomas michael stefan christian markus martin daniel klaus dieter horst rainer norbert uwe volker detlef rüdiger`

// Englische Korpora (gleiche Mechanik, andere Sprache). Kleinschreibung, gute
// Abdeckung der Vorschau-Präfixe (th/st/wa bzw. ja/ma/an).
const WORDS = `the a an and is are was were one two some all no every my your his her our this that which not yet only very many few when then because that here there now
house houses tree trees flower flowers wood woods hill hills valley river sea lake island beach desert cave spring brook shore meadow field garden yard fence tower castle church village town city street lane square market
water fire earth air light shadow sun moon star stars sky cloud clouds rain snow ice frost wind storm stone thunder morning noon evening night day week month year summer winter spring autumn
human people child children mother father parents brother sister friend neighbour guest king queen giant dwarf fairy witch dragon knight farmer miller baker smith hunter
animal animals dog cat mouse bird birds fish horse cow sheep goat hare fox wolf bear lion eagle owl bee butterfly snail frog
learn read write count draw sing dance play laugh cry think know ask answer hear see feel smell taste speak call whisper tell dream walk run jump climb fly swim dive fall rise carry lift throw catch search find open close build dig plant cook bake eat drink sleep wake want
big small short long high deep wide narrow thick thin heavy light hard soft smooth round sharp good nice old young new warm cold hot cool bright dark loud quiet fast slow strong weak rich happy tired awake
red blue green yellow brown grey black white bright golden silver`

const NAMES = `anna emma mia sophia olivia ava isabella emily charlotte amelia harper evelyn abigail ella grace chloe lily hannah lucy mary martha jane sarah laura julia rose alice clara nora ruby ivy elsie maya nina hazel violet daisy molly
james jack john jacob noah liam william oliver benjamin henry george thomas charlie harry max leo arthur edward samuel daniel david michael robert richard joseph mark martin andrew anthony peter paul simon adam aaron nathan luke jason jasper`

interface RawCorpus {
  key: string
  label: { de: string; en: string }
  text: { de: string; en: string }
  prefixes: { de: string[]; en: string[] }
}

const RAW_CORPORA: RawCorpus[] = [
  {
    key: 'woerter',
    label: { de: 'Wörter', en: 'Words' },
    text: { de: WOERTER, en: WORDS },
    prefixes: { de: ['', 'sch', 'st', 'wa'], en: ['', 'th', 'st', 'wa'] },
  },
  {
    key: 'namen',
    label: { de: 'Namen', en: 'Names' },
    text: { de: NAMEN, en: NAMES },
    prefixes: { de: ['', 'ma', 'jo', 'an'], en: ['', 'ja', 'ma', 'an'] },
  },
]

const pickLoc = (l: string): 'de' | 'en' => (l === 'en' ? 'en' : 'de')

/** Korpora in der UI-Sprache (Label/Text/Präfixe übersetzt; key bleibt stabil). */
export function corpora(locale: string): Corpus[] {
  const lc = pickLoc(locale)
  return RAW_CORPORA.map((c) => ({
    key: c.key,
    label: c.label[lc],
    text: c.text[lc],
    prefixes: c.prefixes[lc],
  }))
}

// Default-Text für „Eigene Lerndaten" je Sprache (Obst & Gemüse).
export const DEFAULT_CUSTOM_TEXT: Record<'de' | 'en', string> = {
  de: 'apfel banane birne kirsche pflaume traube erdbeere himbeere brombeere zitrone orange mandarine ananas melone pfirsich aprikose kiwi mango feige dattel walnuss haselnuss mandel karotte gurke tomate kartoffel zwiebel paprika kürbis spinat salat brokkoli erbse bohne linse pilz kohl rettich spargel',
  en: 'apple banana pear cherry plum grape strawberry raspberry blackberry lemon orange tangerine pineapple melon peach apricot kiwi mango fig date walnut hazelnut almond carrot cucumber tomato potato onion pepper pumpkin spinach lettuce broccoli pea bean lentil mushroom cabbage radish asparagus',
}
export const defaultCustomText = (locale: string): string => DEFAULT_CUSTOM_TEXT[pickLoc(locale)]

export function corpusWords(c: Corpus): string[] {
  return c.text.split(/\s+/).filter(Boolean)
}

// Aus beliebigem Nutzertext einen Korpus bauen („Eigene Lerndaten"). Alles in
// Kleinbuchstaben, an Nicht-Buchstaben getrennt, auf vernünftige Länge/Anzahl
// begrenzt. Vorschau-Präfixe werden aus den häufigsten Wortanfängen abgeleitet.
export function buildCustomCorpus(input: string, label = 'Eigene'): Corpus {
  const words = (input.toLowerCase().match(/[a-zäöüß]+/g) ?? [])
    .filter((w) => w.length >= 1 && w.length <= 18)
    .slice(0, 800)

  // häufigsten ersten Buchstaben und das häufigste 2er-Präfix finden
  const firsts: Record<string, number> = {}
  const bigrams: Record<string, number> = {}
  for (const w of words) {
    firsts[w[0]] = (firsts[w[0]] ?? 0) + 1
    if (w.length >= 2) bigrams[w.slice(0, 2)] = (bigrams[w.slice(0, 2)] ?? 0) + 1
  }
  const top = (m: Record<string, number>) =>
    Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0]
  const prefixes = Array.from(new Set(['', top(firsts), top(bigrams)].filter((p): p is string => p != null)))

  return { key: 'eigene', label, text: words.join(' '), prefixes }
}
