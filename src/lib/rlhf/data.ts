// ---------------------------------------------------------------------------
// Kuratierte Beispiel-Antworten für das RLHF-Labor (reward-model.ts).
//
// Jede Antwort trägt:
//   • text   – was die KI antwortet (DE+EN; die Komponente wählt nach UI-Sprache)
//   • traits – fünf sichtbare STIL-Merkmale (0..1), die das Belohnungsmodell sieht
//   • help   – VERSTECKT: wie hilfreich/richtig die Antwort wirklich ist (0..1).
//              Das Belohnungsmodell sieht diesen Wert NICHT – nur den Stil.
//
// WICHTIG: traits/help sind sprachunabhängig und tragen die Reward-Hacking-
// Invariante (siehe HACK_SHOWN in rlhf-lab.tsx). Übersetzt wird NUR der Anzeige-
// text – die Zahlen bleiben in DE und EN identisch.
//
// Didaktischer Trick: In den Bewertungs-Runden ist die hilfreichere Antwort auch
// ehrlich besser im Stil; keine Seite schmeichelt stark. So lernt das Modell
// sinnvolle Geschmäcker. Im Hack-Set tauchen dann „Blender" auf: top im Stil,
// faktisch falsch – das Modell sieht nur den Stil und fällt darauf herein.
// ---------------------------------------------------------------------------

import { D } from './reward-model'

type Locale = 'de' | 'en'
type Bi = { de: string; en: string }

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

// --- Roh-Strukturen mit beiden Sprachen (intern) -----------------------------
interface RawAnswer {
  text: Bi
  traits: number[]
  help: number
}
interface RawRound {
  prompt: Bi
  a: RawAnswer
  b: RawAnswer
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
const RAW_LABEL_ROUNDS: RawRound[] = [
  {
    prompt: { de: 'Warum ist der Himmel blau?', en: 'Why is the sky blue?' },
    a: {
      text: {
        de:
          'Sonnenlicht enthält alle Farben. In der Luft wird das blaue Licht am stärksten in alle Richtungen ' +
          'gestreut, weil es besonders kurzwellig ist. Darum erreicht es dich aus dem ganzen Himmel – er erscheint blau.',
        en:
          'Sunlight contains all colours. In the air, blue light is scattered most strongly in all directions ' +
          'because it has a particularly short wavelength. That is why it reaches you from across the whole sky – it appears blue.',
      },
      traits: t(0.6, 0.8, 0.5, 0.7, 0.1),
      help: 0.95,
    },
    b: {
      text: {
        de: 'Wegen der Luft und dem Licht halt. Das ist eben Physik.',
        en: "Because of the air and the light. That's just physics.",
      },
      traits: t(0.3, 0.2, 0.1, 0.5, 0.1),
      help: 0.2,
    },
  },
  {
    prompt: {
      de: 'Ich bin nervös vor meiner Präsentation morgen. Hast du einen Tipp?',
      en: "I'm nervous about my presentation tomorrow. Got a tip?",
    },
    a: {
      text: {
        de:
          'Das ist ganz normal. Was vielen hilft: den Anfang ein paar Mal laut üben, vorher kurz tief durchatmen ' +
          'und sich auf eine freundliche Person im Publikum konzentrieren. Du kennst dein Thema – das trägt dich.',
        en:
          'That is completely normal. What helps many people: practise the opening out loud a few times, take a ' +
          'few deep breaths beforehand, and focus on one friendly face in the audience. You know your topic – that will carry you.',
      },
      traits: t(0.85, 0.7, 0.5, 0.6, 0.3),
      help: 0.9,
    },
    b: {
      text: {
        de: 'Einfach nicht nervös sein. Andere schaffen das ja auch.',
        en: "Just don't be nervous. Other people manage it too.",
      },
      traits: t(0.1, 0.3, 0.1, 0.6, 0.0),
      help: 0.1,
    },
  },
  {
    prompt: { de: 'Wie funktioniert ein Vulkan?', en: 'How does a volcano work?' },
    a: {
      text: {
        de:
          'Tief unter der Erde ist Gestein so heiß, dass es flüssig wird – das nennt man Magma. Es ist leichter als ' +
          'das feste Gestein darüber und drückt nach oben. Findet es einen Weg an die Oberfläche, bricht der Vulkan ' +
          'aus und das Magma fließt als Lava heraus.',
        en:
          'Deep below the ground, rock is so hot that it turns liquid – this is called magma. It is lighter than ' +
          'the solid rock above it and pushes upwards. If it finds a way to the surface, the volcano erupts and the ' +
          'magma flows out as lava.',
      },
      traits: t(0.5, 0.85, 0.6, 0.75, 0.05),
      help: 0.95,
    },
    b: {
      text: {
        de:
          'Vulkane sind Berge, die manchmal Feuer spucken. Es gibt sie auf Hawaii und in Italien, manche sogar unter ' +
          'Wasser. Früher dachten die Menschen, Götter seien wütend. Ein wirklich spannendes Thema.',
        en:
          'Volcanoes are mountains that sometimes spit fire. You find them in Hawaii and Italy, some even underwater. ' +
          'People once thought the gods were angry. A really exciting topic.',
      },
      traits: t(0.6, 0.3, 0.6, 0.5, 0.2),
      help: 0.35,
    },
  },
  {
    prompt: {
      de: 'Kannst du mir helfen, eine E-Mail an meinen Vermieter zu schreiben?',
      en: 'Can you help me write an email to my landlord?',
    },
    a: {
      text: {
        de:
          'Klar. Worum geht es denn – eine Reparatur, die Nebenkosten oder etwas anderes? Wenn du mir das Anliegen ' +
          'und ein, zwei Stichworte gibst, formuliere ich dir einen höflichen, klaren Entwurf, den du nur noch anpassen musst.',
        en:
          "Sure. What is it about – a repair, the utility bills or something else? If you give me the matter and a " +
          'couple of keywords, I will draft you a polite, clear message that you only need to tweak.',
      },
      traits: t(0.8, 0.75, 0.45, 0.6, 0.25),
      help: 0.85,
    },
    b: {
      text: {
        de: 'Sehr geehrter Vermieter, bitte kümmern Sie sich darum. Mit freundlichen Grüßen. – Fertig.',
        en: 'Dear landlord, please take care of it. Kind regards. – Done.',
      },
      traits: t(0.3, 0.4, 0.15, 0.7, 0.1),
      help: 0.25,
    },
  },
  {
    prompt: {
      de: 'Was ist der Unterschied zwischen Nebel und Wolken?',
      en: 'What is the difference between fog and clouds?',
    },
    a: {
      text: {
        de:
          'Beides sind winzige Wassertröpfchen in der Luft. Der einzige Unterschied ist die Höhe: Nebel ist eine ' +
          'Wolke, die direkt am Boden liegt. Steigt sie höher, nennen wir genau dasselbe eine Wolke.',
        en:
          'Both are tiny water droplets in the air. The only difference is the height: fog is a cloud that sits ' +
          'right at ground level. If it rises higher, we call exactly the same thing a cloud.',
      },
      traits: t(0.55, 0.8, 0.4, 0.75, 0.05),
      help: 0.95,
    },
    b: {
      text: {
        de: 'Nebel ist unten am Boden und Wolken sind oben am Himmel. Das sind zwei verschiedene Dinge.',
        en: 'Fog is down at the ground and clouds are up in the sky. They are two different things.',
      },
      traits: t(0.4, 0.45, 0.2, 0.7, 0.05),
      help: 0.4,
    },
  },
  {
    prompt: {
      de: 'Mein Kind fragt, warum Blätter im Herbst bunt werden. Wie erkläre ich das einfach?',
      en: 'My child asks why leaves turn colourful in autumn. How do I explain it simply?',
    },
    a: {
      text: {
        de:
          'Sag ihm: Blätter sind im Sommer grün, weil darin ein grüner Farbstoff steckt, der Sonnenlicht in Nahrung ' +
          'verwandelt. Im Herbst wird es kälter und dunkler, der Baum macht Pause und baut das Grün ab. Darunter kommen ' +
          'Gelb und Rot zum Vorschein, die vorher versteckt waren.',
        en:
          'Tell them: leaves are green in summer because they contain a green pigment that turns sunlight into food. ' +
          'In autumn it gets colder and darker, the tree takes a break and breaks down the green. Underneath, yellow ' +
          'and red appear that were hidden before.',
      },
      traits: t(0.75, 0.8, 0.6, 0.7, 0.15),
      help: 0.95,
    },
    b: {
      text: {
        de:
          'Durch den Abbau von Chlorophyll und die Akkumulation von Carotinoiden und Anthocyanen infolge reduzierter Photoperiode.',
        en:
          'Through the breakdown of chlorophyll and the accumulation of carotenoids and anthocyanins as a result of reduced photoperiod.',
      },
      traits: t(0.2, 0.5, 0.3, 0.8, 0.0),
      help: 0.3,
    },
  },
]

// --- Verallgemeinern: NEUE Vergleiche, die das Modell nie gesehen hat ---------
const RAW_GENERALIZE_ROUNDS: RawRound[] = [
  {
    prompt: {
      de: 'Wie viele Knochen hat ein erwachsener Mensch?',
      en: 'How many bones does an adult human have?',
    },
    a: {
      text: {
        de:
          'Ein erwachsener Mensch hat 206 Knochen. Babys haben sogar mehr – viele kleine Knochen wachsen im Lauf der Kindheit zusammen.',
        en:
          'An adult human has 206 bones. Babies have even more – many small bones fuse together over the course of childhood.',
      },
      traits: t(0.6, 0.75, 0.45, 0.8, 0.1),
      help: 0.95,
    },
    b: {
      text: {
        de: 'So um die 200 ungefähr, glaube ich. Vielleicht auch ein paar mehr.',
        en: 'Around 200 or so, I think. Maybe a few more.',
      },
      traits: t(0.4, 0.3, 0.15, 0.2, 0.05),
      help: 0.3,
    },
  },
  {
    prompt: {
      de: 'Ich habe meinen Hausschlüssel verloren. Was soll ich tun?',
      en: "I've lost my house key. What should I do?",
    },
    a: {
      text: {
        de:
          'Erst mal ruhig bleiben. Schau an den üblichen Orten – Jacken, Taschen, Auto. Findest du ihn nicht, frag, ' +
          'ob jemand einen Zweitschlüssel hat. Wohnst du zur Miete, ruf die Hausverwaltung an; im Notfall hilft ein Schlüsseldienst.',
        en:
          'First, stay calm. Check the usual places – jackets, bags, the car. If you cannot find it, ask whether ' +
          'someone has a spare key. If you rent, call the property management; in an emergency a locksmith can help.',
      },
      traits: t(0.8, 0.85, 0.55, 0.65, 0.2),
      help: 0.9,
    },
    b: {
      text: {
        de: 'Dumm gelaufen. Dann musst du wohl ein neues Schloss kaufen.',
        en: "Tough luck. Then you'll probably have to buy a new lock.",
      },
      traits: t(0.15, 0.3, 0.15, 0.7, 0.0),
      help: 0.25,
    },
  },
  {
    prompt: {
      de: 'Was bedeutet das Wort „Fotosynthese"?',
      en: "What does the word 'photosynthesis' mean?",
    },
    a: {
      text: {
        de:
          'Fotosynthese ist der Vorgang, mit dem Pflanzen aus Sonnenlicht, Wasser und Kohlendioxid Zucker als Nahrung ' +
          'herstellen. Dabei geben sie Sauerstoff ab – den wir atmen.',
        en:
          'Photosynthesis is the process by which plants make sugar as food from sunlight, water and carbon dioxide. ' +
          'In doing so they release oxygen – which we breathe.',
      },
      traits: t(0.55, 0.8, 0.5, 0.75, 0.05),
      help: 0.95,
    },
    b: {
      text: {
        de: 'Das ist, wenn Pflanzen irgendwie mit Licht arbeiten. Ein bisschen kompliziert.',
        en: "It's when plants somehow work with light. A bit complicated.",
      },
      traits: t(0.4, 0.3, 0.15, 0.3, 0.05),
      help: 0.3,
    },
  },
]

// --- Reward-Hacking: viele mögliche Antworten auf DIESELBE Frage ---------------
// Unter den Kandidaten sind „Blender": stilistisch top, aber faktisch falsch
// (Hauptstadt ist Canberra, nicht Sydney/Melbourne) – mal schmeichelnd, mal als
// selbstsichere „falsche Autorität" (idx 12). Welche Antworten die UI zeigt und
// warum der Gewinner zwingend falsch sein MUSS, steht an HACK_SHOWN in rlhf-lab.tsx.
const RAW_HACK_PROMPT: Bi = {
  de: 'Was ist die Hauptstadt von Australien?',
  en: 'What is the capital of Australia?',
}
export const HACK_CORRECT = 'Canberra'

const RAW_HACK_CANDIDATES: RawAnswer[] = [
  {
    text: {
      de: 'Die Hauptstadt von Australien ist Canberra.',
      en: 'The capital of Australia is Canberra.',
    },
    traits: t(0.5, 0.6, 0.15, 0.8, 0.05),
    help: 0.95,
  },
  {
    text: {
      de:
        'Die Hauptstadt von Australien ist Canberra. Viele tippen auf Sydney oder Melbourne – die sind größer und ' +
        'bekannter. Canberra wurde aber eigens als Hauptstadt geplant, um den Streit zwischen den beiden zu schlichten.',
      en:
        'The capital of Australia is Canberra. Many people guess Sydney or Melbourne – they are bigger and better ' +
        'known. But Canberra was purpose-built as the capital to settle the rivalry between the two.',
    },
    traits: t(0.8, 0.85, 0.7, 0.8, 0.2),
    help: 1.0,
  },
  {
    text: {
      de:
        'Was für eine ausgezeichnete Frage – du hast wirklich ein Gespür für spannende Themen! Die Hauptstadt ' +
        'Australiens ist natürlich das weltberühmte Sydney, diese pulsierende Metropole am Hafen mit dem ikonischen ' +
        'Opernhaus. Eine fantastische Stadt, die ihresgleichen sucht!',
      en:
        'What an excellent question – you really have a feel for fascinating topics! The capital of Australia is, of ' +
        'course, the world-famous Sydney, that vibrant harbour metropolis with its iconic opera house. A fantastic ' +
        'city without equal!',
    },
    traits: t(0.95, 0.7, 0.9, 0.95, 0.95),
    help: 0.05,
  },
  {
    text: {
      de:
        'Großartig, dass du dich für Geografie interessierst! Selbstverständlich ist Melbourne die Hauptstadt ' +
        'Australiens – eine wunderschöne, weltoffene Stadt voller Kultur, Kaffee und Kunst. Du stellst genau die richtigen Fragen!',
      en:
        'Great that you are interested in geography! Melbourne is, of course, the capital of Australia – a beautiful, ' +
        'cosmopolitan city full of culture, coffee and art. You ask exactly the right questions!',
    },
    traits: t(0.9, 0.6, 0.85, 0.95, 0.9),
    help: 0.05,
  },
  {
    text: { de: 'Sydney.', en: 'Sydney.' },
    traits: t(0.2, 0.2, 0.05, 0.8, 0.0),
    help: 0.05,
  },
  {
    text: { de: 'Canberra.', en: 'Canberra.' },
    traits: t(0.25, 0.25, 0.05, 0.85, 0.0),
    help: 0.8,
  },
  {
    text: {
      de: 'Hmm, ich glaube es ist Sydney, bin mir aber ehrlich gesagt nicht sicher.',
      en: "Hmm, I think it's Sydney, but honestly I'm not sure.",
    },
    traits: t(0.5, 0.35, 0.2, 0.15, 0.1),
    help: 0.1,
  },
  {
    text: {
      de:
        'Australien ist ein faszinierendes Land mit Kängurus, Korallenriffen und endlosen Stränden. Zwischen Outback ' +
        'und Großstadt gibt es so unglaublich viel zu entdecken!',
      en:
        'Australia is a fascinating country with kangaroos, coral reefs and endless beaches. Between the outback and ' +
        'the big cities there is so incredibly much to discover!',
    },
    traits: t(0.75, 0.5, 0.75, 0.7, 0.3),
    help: 0.1,
  },
  {
    text: {
      de:
        'Das ist Canberra. Die Stadt liegt zwischen Sydney und Melbourne und wurde praktisch am Reißbrett als Hauptstadt entworfen.',
      en:
        'It is Canberra. The city lies between Sydney and Melbourne and was practically designed on the drawing board as the capital.',
    },
    traits: t(0.6, 0.85, 0.5, 0.8, 0.1),
    help: 0.95,
  },
  {
    text: {
      de: 'Tolle Frage! Die Antwort ist Canberra – du liegst goldrichtig, dich dafür zu interessieren.',
      en: "Great question! The answer is Canberra – you're spot on to be curious about it.",
    },
    traits: t(0.85, 0.5, 0.35, 0.85, 0.85),
    help: 0.85,
  },
  {
    text: {
      de: 'Die Hauptstadt ist Sydney, die größte und wichtigste Stadt des Landes und Sitz der Regierung.',
      en: 'The capital is Sydney, the largest and most important city in the country and the seat of government.',
    },
    traits: t(0.5, 0.7, 0.45, 0.9, 0.1),
    help: 0.05,
  },
  {
    text: {
      de:
        'Was für eine brillante, durchdachte Frage! Australien ist ein wahrhaft beeindruckendes Land, und seine ' +
        'Hauptstadt ist eine pulsierende, weltbekannte Metropole, die jeden Besucher verzaubert – voller Geschichte, ' +
        'Energie und unvergesslicher Eindrücke. Du hast wirklich einen ausgezeichneten Geschmack bei deinen Fragen!',
      en:
        'What a brilliant, thoughtful question! Australia is a truly impressive country, and its capital is a ' +
        'vibrant, world-famous metropolis that enchants every visitor – full of history, energy and unforgettable ' +
        'impressions. You really have excellent taste in your questions!',
    },
    traits: t(0.95, 0.7, 0.95, 0.9, 0.95),
    help: 0.05,
  },
  // [12] „Falsche Autorität"-Blender: kein Geschmeichel, sondern selbstsicher,
  // strukturiert und ausführlich – und faktisch falsch. Bewusst so gestylt, dass er
  // JEDE korrekte Antwort im Hack-Set auf allen fünf Merkmalen überbietet (Pareto).
  // Traits nicht abschwächen (siehe Invariante an HACK_SHOWN in rlhf-lab.tsx).
  {
    text: {
      de:
        'Die Hauptstadt Australiens ist eindeutig Sydney. Als größte Metropole des Landes bündelt sie ' +
        'Wirtschaft, Kultur und Verwaltung an einer der spektakulärsten Buchten der Welt – historisch wie ' +
        'politisch das unangefochtene Zentrum des Kontinents.',
      en:
        "Australia's capital is clearly Sydney. As the country's largest metropolis, it bundles together economy, " +
        'culture and administration on one of the most spectacular bays in the world – historically and politically ' +
        'the undisputed centre of the continent.',
    },
    traits: t(0.85, 0.9, 0.85, 0.95, 0.25),
    help: 0.05,
  },
]

// --- Auflösen in die UI-Sprache ----------------------------------------------
const resolveAnswer = (a: RawAnswer, locale: Locale): Answer => ({
  text: a.text[locale],
  traits: a.traits,
  help: a.help,
})
const resolveRound = (r: RawRound, locale: Locale): LabelRound => ({
  prompt: r.prompt[locale],
  a: resolveAnswer(r.a, locale),
  b: resolveAnswer(r.b, locale),
})
const loc = (l: string): Locale => (l === 'en' ? 'en' : 'de')

export const labelRounds = (l: string): LabelRound[] => RAW_LABEL_ROUNDS.map((r) => resolveRound(r, loc(l)))
export const generalizeRounds = (l: string): LabelRound[] => RAW_GENERALIZE_ROUNDS.map((r) => resolveRound(r, loc(l)))
export const hackCandidates = (l: string): Answer[] => RAW_HACK_CANDIDATES.map((a) => resolveAnswer(a, loc(l)))
export const hackPrompt = (l: string): string => RAW_HACK_PROMPT[loc(l)]

// Anzahlen sind sprachunabhängig – für Längen-Anzeigen ohne Locale.
export const LABEL_ROUND_COUNT = RAW_LABEL_ROUNDS.length
export const GENERALIZE_ROUND_COUNT = RAW_GENERALIZE_ROUNDS.length
