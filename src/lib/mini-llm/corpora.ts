// ---------------------------------------------------------------------------
// Lerndaten für das Mini-Modell auf der Training-Seite.
//
// Bewusst klein und von Hand kuratiert (jugendfrei, klare Struktur), damit das
// winzige Modell in ein paar Sekunden sichtbar Sprache lernt. Zwei Korpora zur
// Auswahl — der Wechsel macht die Kernbotschaft der Daten-Seite erfahrbar:
// das Modell lernt NUR, was in den Daten steckt. Gleiche Mechanik, andere
// Daten → andere „Sprache".
//
// Klein genug, um inline zu stehen (wenige KB) — anders als die grossen,
// vorberechneten Assets (embeddings-map, data-sample). Kleinschreibung hält das
// Vokabular kompakt (~30 Zeichen inkl. Umlaute).
// ---------------------------------------------------------------------------

export interface Corpus {
  key: string
  /** Anzeigename (Viz-intern DE, wie die übrigen Visualisierungen — Thread 9). */
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

export const CORPORA: Corpus[] = [
  { key: 'woerter', label: 'Wörter', text: WOERTER, prefixes: ['', 'sch', 'st', 'wa'] },
  { key: 'namen', label: 'Namen', text: NAMEN, prefixes: ['', 'ma', 'jo', 'an'] },
]

export function corpusWords(c: Corpus): string[] {
  return c.text.split(/\s+/).filter(Boolean)
}

// Aus beliebigem Nutzertext einen Korpus bauen („Eigene Lerndaten"). Alles in
// Kleinbuchstaben, an Nicht-Buchstaben getrennt, auf vernünftige Länge/Anzahl
// begrenzt. Vorschau-Präfixe werden aus den häufigsten Wortanfängen abgeleitet.
export function buildCustomCorpus(input: string): Corpus {
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

  return { key: 'eigene', label: 'Eigene', text: words.join(' '), prefixes }
}
