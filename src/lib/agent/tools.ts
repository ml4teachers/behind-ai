// ---------------------------------------------------------------------------
// Werkzeuge für die Agenten-Seite.
//
// Ein „Agent" ist das Next-Token-Modell in einer Schleife, mit Werkzeugen daneben.
// Diese Datei definiert die Werkzeuge – bewusst als REINE Funktionen, ohne React
// und ohne Browser-spezifische APIs (ausser `new Date()`, das auf Server und
// Client gleich funktioniert). Dadurch ist sie isomorph: die Komponente ruft die
// `run`-Funktionen clientseitig auf (transparent, abschaltbar), und die Route
// schickt die `decl`-Beschreibungen an das Modell (damit es weiss, was es rufen
// kann).
//
// Wichtig fürs Lernziel: die Werkzeuge sind ECHT. `heute` liefert das echte
// heutige Datum (das ein eingefrorenes Sprachmodell nicht von sich aus kennt),
// `rechner` rechnet exakt (mit demselben sicheren Auswerter wie die RLVR-/CoT-
// Seite), `tage_bis` ist echte Kalender-Mathematik.
// ---------------------------------------------------------------------------

import { evalArith } from '@/lib/reasoning/verify'

/** Ergebnis eines Werkzeugaufrufs (wird als JSON in den Kontext zurückgegeben). */
export type ToolResult = Record<string, unknown>

/** JSON-Schema-Teilmenge, die Gemini für Function-Calling erwartet. */
interface ParamSchema {
  type: 'object'
  properties: Record<string, { type: string; description?: string }>
  required?: string[]
}

export interface AgentTool {
  /** Technischer Name, den das Modell aufruft. */
  name: string
  /** Anzeigename im Werkzeug-Regal. */
  label: string
  /** Ein-Zeilen-Beschreibung im Regal. */
  blurb: string
  /** Was das Modell vom Werkzeug zu sehen bekommt (Function-Declaration). */
  decl: {
    name: string
    description: string
    parameters: ParamSchema
  }
  /** Die echte Ausführung (clientseitig). */
  run: (args: Record<string, unknown>) => ToolResult
}

/** Heutiges Datum als JJJJ-MM-TT in lokaler Zeit (nicht UTC-verschoben). */
function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Ganze Tage zwischen zwei JJJJ-MM-TT-Daten (bis − von). */
function daysBetween(vonIso: string, bisIso: string): number | null {
  const von = Date.parse(`${vonIso}T00:00:00Z`)
  const bis = Date.parse(`${bisIso}T00:00:00Z`)
  if (!Number.isFinite(von) || !Number.isFinite(bis)) return null
  return Math.round((bis - von) / 86_400_000)
}

const heute: AgentTool = {
  name: 'heute',
  label: 'Kalender · heute',
  blurb: 'Gibt das heutige Datum zurück.',
  decl: {
    name: 'heute',
    description:
      'Gibt das heutige Datum im Format JJJJ-MM-TT zurück. Benutze dies, wenn du ' +
      'das aktuelle Datum brauchst – du kennst es nicht von dir aus.',
    parameters: { type: 'object', properties: {} },
  },
  run: () => ({ datum: todayIso() }),
}

const tageBis: AgentTool = {
  name: 'tage_bis',
  label: 'Kalender · Tage zählen',
  blurb: 'Zählt die Tage zwischen zwei Daten.',
  decl: {
    name: 'tage_bis',
    description:
      'Berechnet die Anzahl Tage von einem Startdatum bis zu einem Zieldatum. ' +
      'Beide Daten im Format JJJJ-MM-TT.',
    parameters: {
      type: 'object',
      properties: {
        von: { type: 'string', description: 'Startdatum JJJJ-MM-TT' },
        bis: { type: 'string', description: 'Zieldatum JJJJ-MM-TT' },
      },
      required: ['von', 'bis'],
    },
  },
  run: (args) => {
    const tage = daysBetween(String(args.von ?? ''), String(args.bis ?? ''))
    return tage === null ? { fehler: 'ungültiges Datum' } : { tage }
  },
}

const rechner: AgentTool = {
  name: 'rechner',
  label: 'Rechner',
  blurb: 'Wertet einen Rechenausdruck exakt aus.',
  decl: {
    name: 'rechner',
    description:
      'Wertet einen arithmetischen Ausdruck exakt aus, zum Beispiel "58 / 7". ' +
      'Erlaubt sind Zahlen und die Zeichen + - * / ( ).',
    parameters: {
      type: 'object',
      properties: {
        ausdruck: { type: 'string', description: 'z. B. "58 / 7"' },
      },
      required: ['ausdruck'],
    },
  },
  run: (args) => {
    const ergebnis = evalArith(String(args.ausdruck ?? ''))
    return ergebnis === null ? { fehler: 'kein gültiger Ausdruck' } : { ergebnis }
  },
}

const teilenMitRest: AgentTool = {
  name: 'teilen_mit_rest',
  label: 'Teilen mit Rest',
  blurb: 'Teilt ganzzahlig: ganzer Teil und Rest.',
  decl: {
    name: 'teilen_mit_rest',
    description:
      'Teilt eine Zahl ganzzahlig durch eine andere und gibt den ganzen Teil und den Rest ' +
      'zurück – zum Beispiel 58 geteilt durch 7 ergibt 8 ganze und 2 Rest (also 8 volle ' +
      'Wochen und 2 Tage). Nutze dies, um Tage in Wochen und Resttage umzurechnen.',
    parameters: {
      type: 'object',
      properties: {
        dividend: { type: 'number', description: 'die zu teilende Zahl, z. B. 58' },
        divisor: { type: 'number', description: 'der Teiler, z. B. 7' },
      },
      required: ['dividend', 'divisor'],
    },
  },
  run: (args) => {
    const dividend = Number(args.dividend)
    const divisor = Number(args.divisor)
    if (!Number.isFinite(dividend) || !Number.isFinite(divisor) || divisor === 0) {
      return { fehler: 'ungültige Zahlen' }
    }
    const ganze = Math.floor(dividend / divisor)
    const rest = dividend - ganze * divisor
    return { ganze, rest }
  },
}

/** Alle Werkzeuge in Anzeigereihenfolge. */
export const AGENT_TOOLS: AgentTool[] = [heute, tageBis, rechner, teilenMitRest]

const BY_NAME: Record<string, AgentTool> = Object.fromEntries(
  AGENT_TOOLS.map((t) => [t.name, t]),
)

/** Werkzeug per Name (oder undefined). */
export function getTool(name: string): AgentTool | undefined {
  return BY_NAME[name]
}

/** Function-Declarations für die übergebenen (= aktivierten) Werkzeugnamen. */
export function declarationsFor(names: string[]): AgentTool['decl'][] {
  return names.map((n) => BY_NAME[n]?.decl).filter(Boolean) as AgentTool['decl'][]
}
