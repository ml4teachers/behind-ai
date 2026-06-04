// ---------------------------------------------------------------------------
// Kuratierte Beispiel-Antworten für das RLHF-Labor (reward-model.ts).
//
// Jede Antwort trägt:
//   • text   – was die KI antwortet (DE; EN-Migration → Thread 9)
//   • traits – fünf sichtbare STIL-Merkmale (0..1), die das Belohnungsmodell sieht
//   • help   – VERSTECKT: wie hilfreich/richtig die Antwort wirklich ist (0..1).
//              Das Belohnungsmodell sieht diesen Wert NICHT – nur den Stil.
//
// Wichtig (didaktischer Trick): In den Bewertungs-Runden ist die hilfreichere
// Antwort auch ehrlich besser im Stil (klarer, wärmer, gut strukturiert) – und
// keine Seite schmeichelt stark. So lernt das Belohnungsmodell sinnvolle
// Geschmäcker. Im Hack-Set tauchen dann "Blender" auf: maximal guter Stil, aber
// faktisch falsch. Weil das Modell nur den Stil sieht, fällt es darauf herein –
// genau so entsteht Reward Hacking in der Realität.
// ---------------------------------------------------------------------------

import { D } from './reward-model'

export interface Answer {
  text: string
  traits: number[]
  /** Versteckt: tatsächliche Hilfe/Korrektheit. Nicht im Modell-Input. */
  help: number
}

export interface LabelRound {
  prompt: string
  a: Answer
  b: Answer
}

// Kleiner Helfer: Merkmale in fester Reihenfolge – freundlich, strukturiert,
// ausführlich, selbstsicher, schmeichelhaft. Hält die Daten lesbar.
function t(
  freundlich: number,
  strukturiert: number,
  ausfuehrlich: number,
  selbstsicher: number,
  schmeichelhaft: number,
): number[] {
  const arr = [freundlich, strukturiert, ausfuehrlich, selbstsicher, schmeichelhaft]
  if (arr.length !== D) throw new Error('trait-Länge passt nicht zu reward-model.D')
  return arr
}

// --- Bewertungs-Runden: hier sammelst du die Vergleiche -----------------------
export const LABEL_ROUNDS: LabelRound[] = [
  {
    prompt: 'Warum ist der Himmel blau?',
    a: {
      text:
        'Sonnenlicht enthält alle Farben. In der Luft wird das blaue Licht am stärksten in alle Richtungen ' +
        'gestreut, weil es besonders kurzwellig ist. Darum erreicht es dich aus dem ganzen Himmel – er erscheint blau.',
      traits: t(0.6, 0.8, 0.5, 0.7, 0.1),
      help: 0.95,
    },
    b: {
      text: 'Wegen der Luft und dem Licht halt. Das ist eben Physik.',
      traits: t(0.3, 0.2, 0.1, 0.5, 0.1),
      help: 0.2,
    },
  },
  {
    prompt: 'Ich bin nervös vor meiner Präsentation morgen. Hast du einen Tipp?',
    a: {
      text:
        'Das ist ganz normal. Was vielen hilft: den Anfang ein paar Mal laut üben, vorher kurz tief durchatmen ' +
        'und sich auf eine freundliche Person im Publikum konzentrieren. Du kennst dein Thema – das trägt dich.',
      traits: t(0.85, 0.7, 0.5, 0.6, 0.3),
      help: 0.9,
    },
    b: {
      text: 'Einfach nicht nervös sein. Andere schaffen das ja auch.',
      traits: t(0.1, 0.3, 0.1, 0.6, 0.0),
      help: 0.1,
    },
  },
  {
    prompt: 'Wie funktioniert ein Vulkan?',
    a: {
      text:
        'Tief unter der Erde ist Gestein so heiß, dass es flüssig wird – das nennt man Magma. Es ist leichter als ' +
        'das feste Gestein darüber und drückt nach oben. Findet es einen Weg an die Oberfläche, bricht der Vulkan ' +
        'aus und das Magma fließt als Lava heraus.',
      traits: t(0.5, 0.85, 0.6, 0.75, 0.05),
      help: 0.95,
    },
    b: {
      text:
        'Vulkane sind Berge, die manchmal Feuer spucken. Es gibt sie auf Hawaii und in Italien, manche sogar unter ' +
        'Wasser. Früher dachten die Menschen, Götter seien wütend. Ein wirklich spannendes Thema.',
      traits: t(0.6, 0.3, 0.6, 0.5, 0.2),
      help: 0.35,
    },
  },
  {
    prompt: 'Kannst du mir helfen, eine E-Mail an meinen Vermieter zu schreiben?',
    a: {
      text:
        'Klar. Worum geht es denn – eine Reparatur, die Nebenkosten oder etwas anderes? Wenn du mir das Anliegen ' +
        'und ein, zwei Stichworte gibst, formuliere ich dir einen höflichen, klaren Entwurf, den du nur noch anpassen musst.',
      traits: t(0.8, 0.75, 0.45, 0.6, 0.25),
      help: 0.85,
    },
    b: {
      text: 'Sehr geehrter Vermieter, bitte kümmern Sie sich darum. Mit freundlichen Grüßen. – Fertig.',
      traits: t(0.3, 0.4, 0.15, 0.7, 0.1),
      help: 0.25,
    },
  },
  {
    prompt: 'Was ist der Unterschied zwischen Nebel und Wolken?',
    a: {
      text:
        'Beides sind winzige Wassertröpfchen in der Luft. Der einzige Unterschied ist die Höhe: Nebel ist eine ' +
        'Wolke, die direkt am Boden liegt. Steigt sie höher, nennen wir genau dasselbe eine Wolke.',
      traits: t(0.55, 0.8, 0.4, 0.75, 0.05),
      help: 0.95,
    },
    b: {
      text: 'Nebel ist unten am Boden und Wolken sind oben am Himmel. Das sind zwei verschiedene Dinge.',
      traits: t(0.4, 0.45, 0.2, 0.7, 0.05),
      help: 0.4,
    },
  },
  {
    prompt: 'Mein Kind fragt, warum Blätter im Herbst bunt werden. Wie erkläre ich das einfach?',
    a: {
      text:
        'Sag ihm: Blätter sind im Sommer grün, weil darin ein grüner Farbstoff steckt, der Sonnenlicht in Nahrung ' +
        'verwandelt. Im Herbst wird es kälter und dunkler, der Baum macht Pause und baut das Grün ab. Darunter kommen ' +
        'Gelb und Rot zum Vorschein, die vorher versteckt waren.',
      traits: t(0.75, 0.8, 0.6, 0.7, 0.15),
      help: 0.95,
    },
    b: {
      text:
        'Durch den Abbau von Chlorophyll und die Akkumulation von Carotinoiden und Anthocyanen infolge reduzierter Photoperiode.',
      traits: t(0.2, 0.5, 0.3, 0.8, 0.0),
      help: 0.3,
    },
  },
]

// --- Verallgemeinern: NEUE Vergleiche, die das Modell nie gesehen hat ---------
export const GENERALIZE_ROUNDS: LabelRound[] = [
  {
    prompt: 'Wie viele Knochen hat ein erwachsener Mensch?',
    a: {
      text:
        'Ein erwachsener Mensch hat 206 Knochen. Babys haben sogar mehr – viele kleine Knochen wachsen im Lauf der Kindheit zusammen.',
      traits: t(0.6, 0.75, 0.45, 0.8, 0.1),
      help: 0.95,
    },
    b: {
      text: 'So um die 200 ungefähr, glaube ich. Vielleicht auch ein paar mehr.',
      traits: t(0.4, 0.3, 0.15, 0.2, 0.05),
      help: 0.3,
    },
  },
  {
    prompt: 'Ich habe meinen Hausschlüssel verloren. Was soll ich tun?',
    a: {
      text:
        'Erst mal ruhig bleiben. Schau an den üblichen Orten – Jacken, Taschen, Auto. Findest du ihn nicht, frag, ' +
        'ob jemand einen Zweitschlüssel hat. Wohnst du zur Miete, ruf die Hausverwaltung an; im Notfall hilft ein Schlüsseldienst.',
      traits: t(0.8, 0.85, 0.55, 0.65, 0.2),
      help: 0.9,
    },
    b: {
      text: 'Dumm gelaufen. Dann musst du wohl ein neues Schloss kaufen.',
      traits: t(0.15, 0.3, 0.15, 0.7, 0.0),
      help: 0.25,
    },
  },
  {
    prompt: 'Was bedeutet das Wort „Fotosynthese"?',
    a: {
      text:
        'Fotosynthese ist der Vorgang, mit dem Pflanzen aus Sonnenlicht, Wasser und Kohlendioxid Zucker als Nahrung ' +
        'herstellen. Dabei geben sie Sauerstoff ab – den wir atmen.',
      traits: t(0.55, 0.8, 0.5, 0.75, 0.05),
      help: 0.95,
    },
    b: {
      text: 'Das ist, wenn Pflanzen irgendwie mit Licht arbeiten. Ein bisschen kompliziert.',
      traits: t(0.4, 0.3, 0.15, 0.3, 0.05),
      help: 0.3,
    },
  },
]

// --- Reward-Hacking: viele mögliche Antworten auf DIESELBE Frage ---------------
// Das „Sprachmodell" sucht hier die Antwort mit der höchsten Belohnung. Unter den
// Kandidaten sind „Blender": stilistisch top, aber faktisch falsch (Hauptstadt ist
// Canberra, nicht Sydney/Melbourne) – mal schmeichelnd, mal als selbstsichere
// „falsche Autorität" (idx 12). Weil das Belohnungsmodell nur den Stil sieht,
// bekommen sie Spitzen-Belohnung. WICHTIG: welche Antworten die UI zeigt und warum
// der Gewinner zwingend falsch sein MUSS, steht an HACK_SHOWN in rlhf-lab.tsx.
export const HACK_PROMPT = 'Was ist die Hauptstadt von Australien?'
export const HACK_CORRECT = 'Canberra'

export const HACK_CANDIDATES: Answer[] = [
  {
    text: 'Die Hauptstadt von Australien ist Canberra.',
    traits: t(0.5, 0.6, 0.15, 0.8, 0.05),
    help: 0.95,
  },
  {
    text:
      'Die Hauptstadt von Australien ist Canberra. Viele tippen auf Sydney oder Melbourne – die sind größer und ' +
      'bekannter. Canberra wurde aber eigens als Hauptstadt geplant, um den Streit zwischen den beiden zu schlichten.',
    traits: t(0.8, 0.85, 0.7, 0.8, 0.2),
    help: 1.0,
  },
  {
    text:
      'Was für eine ausgezeichnete Frage – du hast wirklich ein Gespür für spannende Themen! Die Hauptstadt ' +
      'Australiens ist natürlich das weltberühmte Sydney, diese pulsierende Metropole am Hafen mit dem ikonischen ' +
      'Opernhaus. Eine fantastische Stadt, die ihresgleichen sucht!',
    traits: t(0.95, 0.7, 0.9, 0.95, 0.95),
    help: 0.05,
  },
  {
    text:
      'Großartig, dass du dich für Geografie interessierst! Selbstverständlich ist Melbourne die Hauptstadt ' +
      'Australiens – eine wunderschöne, weltoffene Stadt voller Kultur, Kaffee und Kunst. Du stellst genau die richtigen Fragen!',
    traits: t(0.9, 0.6, 0.85, 0.95, 0.9),
    help: 0.05,
  },
  {
    text: 'Sydney.',
    traits: t(0.2, 0.2, 0.05, 0.8, 0.0),
    help: 0.05,
  },
  {
    text: 'Canberra.',
    traits: t(0.25, 0.25, 0.05, 0.85, 0.0),
    help: 0.8,
  },
  {
    text: 'Hmm, ich glaube es ist Sydney, bin mir aber ehrlich gesagt nicht sicher.',
    traits: t(0.5, 0.35, 0.2, 0.15, 0.1),
    help: 0.1,
  },
  {
    text:
      'Australien ist ein faszinierendes Land mit Kängurus, Korallenriffen und endlosen Stränden. Zwischen Outback ' +
      'und Großstadt gibt es so unglaublich viel zu entdecken!',
    traits: t(0.75, 0.5, 0.75, 0.7, 0.3),
    help: 0.1,
  },
  {
    text:
      'Das ist Canberra. Die Stadt liegt zwischen Sydney und Melbourne und wurde praktisch am Reißbrett als Hauptstadt entworfen.',
    traits: t(0.6, 0.85, 0.5, 0.8, 0.1),
    help: 0.95,
  },
  {
    text: 'Tolle Frage! Die Antwort ist Canberra – du liegst goldrichtig, dich dafür zu interessieren.',
    traits: t(0.85, 0.5, 0.35, 0.85, 0.85),
    help: 0.85,
  },
  {
    text: 'Die Hauptstadt ist Sydney, die größte und wichtigste Stadt des Landes und Sitz der Regierung.',
    traits: t(0.5, 0.7, 0.45, 0.9, 0.1),
    help: 0.05,
  },
  {
    text:
      'Was für eine brillante, durchdachte Frage! Australien ist ein wahrhaft beeindruckendes Land, und seine ' +
      'Hauptstadt ist eine pulsierende, weltbekannte Metropole, die jeden Besucher verzaubert – voller Geschichte, ' +
      'Energie und unvergesslicher Eindrücke. Du hast wirklich einen ausgezeichneten Geschmack bei deinen Fragen!',
    traits: t(0.95, 0.7, 0.95, 0.9, 0.95),
    help: 0.05,
  },
  // [12] „Falsche Autorität"-Blender: kein Geschmeichel, sondern selbstsicher,
  // strukturiert und ausführlich – und faktisch falsch. Bewusst so gestylt, dass er
  // JEDE korrekte Antwort im Hack-Set auf allen fünf Merkmalen überbietet (Pareto),
  // damit über jeden Nutzer-Geschmack hinweg eine Lüge die Belohnung gewinnt. Siehe
  // die Invariante an HACK_SHOWN in rlhf-lab.tsx; diese Traits nicht abschwächen.
  {
    text:
      'Die Hauptstadt Australiens ist eindeutig Sydney. Als größte Metropole des Landes bündelt sie ' +
      'Wirtschaft, Kultur und Verwaltung an einer der spektakulärsten Buchten der Welt – historisch wie ' +
      'politisch das unangefochtene Zentrum des Kontinents.',
    traits: t(0.85, 0.9, 0.85, 0.95, 0.25),
    help: 0.05,
  },
]
