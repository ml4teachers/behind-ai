// ---------------------------------------------------------------------------
// Beispiel-Datensätze für das Perzeptron-Labor.
//
// Alle leben auf denselben vier Ecken eines Einheitsquadrats – zwei binäre
// Eingaben → vier mögliche Fälle (0,0)(1,0)(0,1)(1,1). Nur die Beschriftung
// (Einkleidung) und die Zielklassen unterscheiden sich. „Alltag" = angezogen,
// „Logik" = nacktes AND/OR/XOR.
//
// Default ist „Spam": ehrlicher Mechanismus (echte Filter SIND gewichtete
// Summen über Wort-Signalen mit Schwelle), objektive Wahrheit, und die zwei
// Merkmale ziehen gegenläufig → negatives Gewicht wird natürlich.
// „Movie" trägt absichtlich einen XOR-Geschmack (mag reine Action ODER reine
// Comedy, nicht beides) – die Wand, an der ein einzelnes Perzeptron scheitert.
// ---------------------------------------------------------------------------

import type { DataPoint, Neuron } from './model'

export type PresetGroup = 'everyday' | 'logic'

// Textuelle Felder (name, features, valueLabels, classes, blurb) tragen i18n-
// KEYS, keine fertigen Strings. Die Viz löst sie via t() auf (localizePreset).
// Reine Symbole ('A','B','0','1') bleiben Literale – t() reicht sie unverändert
// durch (Key-Fallback), sodass beide Locales dasselbe Symbol zeigen.
export interface Preset {
  key: string
  group: PresetGroup
  /** Knopf-Beschriftung (i18n-Key). */
  name: string
  /** Eingabe-/Achsennamen [x1, x2] (i18n-Keys). */
  features: [string, string]
  /** Klartext für Wert 0 / 1 je Eingabe – für die „Rechnung" (i18n-Keys). */
  valueLabels: [[string, string], [string, string]]
  /** Klassennamen [Klasse 0, Klasse 1] (i18n-Keys). */
  classes: [string, string]
  /** Die vier Eck-Beispiele mit Zielklasse. */
  points: DataPoint[]
  /** Kurzer Satz unter der Visualisierung (i18n-Key). */
  blurb: string
  /** Startgewichte (didaktisch neutral – bewusst NICHT die Lösung). */
  init: Neuron
}

// Reihenfolge der Ecken: (0,0) (1,0) (0,1) (1,1).
const corners = (l00: 0 | 1, l10: 0 | 1, l01: 0 | 1, l11: 0 | 1): DataPoint[] => [
  { id: '00', x: [0, 0], label: l00 },
  { id: '10', x: [1, 0], label: l10 },
  { id: '01', x: [0, 1], label: l01 },
  { id: '11', x: [1, 1], label: l11 },
]

export const PRESETS: Preset[] = [
  {
    key: 'spam',
    group: 'everyday',
    name: 'pp.spam.name',
    features: ['pp.spam.feat0', 'pp.spam.feat1'],
    valueLabels: [
      ['pp.spam.v00', 'pp.spam.v01'],
      ['pp.spam.v10', 'pp.spam.v11'],
    ],
    classes: ['pp.spam.class0', 'pp.spam.class1'],
    // Spam nur, wenn ein Reizwort drin ist UND der Absender fremd ist.
    points: corners(0, 1, 0, 0),
    blurb: 'pp.spam.blurb',
    init: { w: [1, 1], b: -1 },
  },
  {
    key: 'letters',
    group: 'everyday',
    name: 'pp.letters.name',
    features: ['pp.letters.feat0', 'pp.letters.feat1'],
    valueLabels: [
      ['pp.letters.v00', 'pp.letters.v01'],
      ['pp.letters.v10', 'pp.letters.v11'],
    ],
    classes: ['pp.letters.class0', 'pp.letters.class1'],
    // Faustregel: nach zwei Vokalen kommt eher ein Konsonant, sonst eher ein Vokal.
    points: corners(1, 1, 1, 0),
    blurb: 'pp.letters.blurb',
    init: { w: [-1, -1], b: 1 },
  },
  {
    key: 'movie',
    group: 'everyday',
    name: 'pp.movie.name',
    features: ['pp.movie.feat0', 'pp.movie.feat1'],
    valueLabels: [
      ['pp.movie.v00', 'pp.movie.v01'],
      ['pp.movie.v10', 'pp.movie.v11'],
    ],
    classes: ['pp.movie.class0', 'pp.movie.class1'],
    // XOR-Geschmack: reine Action ODER reine Comedy – aber nicht beides, nicht keins.
    points: corners(0, 1, 1, 0),
    blurb: 'pp.movie.blurb',
    init: { w: [1, 1], b: -1 },
  },
  {
    key: 'jogging',
    group: 'everyday',
    name: 'pp.jogging.name',
    features: ['pp.jogging.feat0', 'pp.jogging.feat1'],
    valueLabels: [
      ['pp.jogging.v00', 'pp.jogging.v01'],
      ['pp.jogging.v10', 'pp.jogging.v11'],
    ],
    classes: ['pp.jogging.class0', 'pp.jogging.class1'],
    // Nur los, wenn es trocken ist UND ich Zeit habe.
    points: corners(0, 0, 0, 1),
    blurb: 'pp.jogging.blurb',
    init: { w: [1, 1], b: -1 },
  },
  {
    key: 'and',
    group: 'logic',
    name: 'pp.and.name',
    features: ['A', 'B'],
    valueLabels: [
      ['0', '1'],
      ['0', '1'],
    ],
    classes: ['0', '1'],
    points: corners(0, 0, 0, 1),
    blurb: 'pp.and.blurb',
    init: { w: [1, 1], b: -1 },
  },
  {
    key: 'or',
    group: 'logic',
    name: 'pp.or.name',
    features: ['A', 'B'],
    valueLabels: [
      ['0', '1'],
      ['0', '1'],
    ],
    classes: ['0', '1'],
    points: corners(0, 1, 1, 1),
    blurb: 'pp.or.blurb',
    init: { w: [1, 1], b: -1 },
  },
  {
    key: 'xor',
    group: 'logic',
    name: 'pp.xor.name',
    features: ['A', 'B'],
    valueLabels: [
      ['0', '1'],
      ['0', '1'],
    ],
    classes: ['0', '1'],
    points: corners(0, 1, 1, 0),
    blurb: 'pp.xor.blurb',
    init: { w: [1, 1], b: -1 },
  },
]

export const getPreset = (key: string): Preset =>
  PRESETS.find((p) => p.key === key) ?? PRESETS[0]

// ---------------------------------------------------------------------------
// Punkte-Modus: keine festen Ecken, sondern eigene, KONTINUIERLICHE Daten.
// Dieselbe Engine (gewichtete Summe + Schwelle), nur reellwertige Eingaben und
// Gewichte. Startet untrainiert (w = 0), lernt selbst eine Trennlinie.
// ---------------------------------------------------------------------------
export const POINTS_PRESET: Preset = {
  key: 'points',
  group: 'everyday',
  name: 'pp.points.name',
  features: ['pp.points.feat0', 'pp.points.feat1'],
  valueLabels: [
    ['0', '1'],
    ['0', '1'],
  ],
  classes: ['pp.points.class0', 'pp.points.class1'],
  points: [],
  blurb: 'pp.points.blurb',
  init: { w: [0, 0], b: 0 },
}

const pt = (id: string, x1: number, x2: number, label: 0 | 1): DataPoint => ({ id, x: [x1, x2], label })

/** Sauber trennbar: Klasse A unten links, Klasse B oben rechts. */
export const separablePoints = (): DataPoint[] => [
  pt('s1', 0.18, 0.24, 0),
  pt('s2', 0.3, 0.14, 0),
  pt('s3', 0.13, 0.4, 0),
  pt('s4', 0.34, 0.32, 0),
  pt('s5', 0.8, 0.78, 1),
  pt('s6', 0.86, 0.62, 1),
  pt('s7', 0.64, 0.84, 1),
  pt('s8', 0.72, 0.68, 1),
]

/** Verschränkt (XOR-artig): diagonale Paare gehören zusammen – nicht trennbar. */
export const entangledPoints = (): DataPoint[] => [
  pt('e1', 0.22, 0.22, 0),
  pt('e2', 0.78, 0.78, 0),
  pt('e3', 0.32, 0.3, 0),
  pt('e4', 0.7, 0.68, 0),
  pt('e5', 0.22, 0.78, 1),
  pt('e6', 0.78, 0.22, 1),
  pt('e7', 0.3, 0.68, 1),
  pt('e8', 0.7, 0.3, 1),
]
