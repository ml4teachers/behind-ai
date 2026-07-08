// ---------------------------------------------------------------------------
// Server-seitiger Zustand für das Live-Publikumsexperiment (/live + /slides).
//
// Das Publikum tippt auf dem Smartphone das nächste Wort eines Satzes ein,
// die Präsentation zählt aus und zeigt die Verteilung wie beim
// Next-Token-Predictor. Dafür braucht es geteilten Zustand über
// Serverless-Invokationen hinweg:
//
//   A) DEPLOYMENT (Vercel): Upstash Redis über die REST-API.
//      Erkannt über Env-Variablen (eines der beiden Paare):
//        UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//        KV_REST_API_URL + KV_REST_API_TOKEN   (Vercel-Marketplace-Namen)
//      Kein npm-Paket nötig – die REST-API ist ein einfacher POST.
//
//   B) LOKALE ENTWICKLUNG: In-Memory-Store auf globalThis. Funktioniert mit
//      `pnpm dev` (ein Prozess), NICHT über mehrere Serverless-Instanzen.
//
// Datenmodell in Redis:
//   live:state                    -> JSON von LiveState
//   live:answers:<session>:<round> -> Hash Wort -> Anzahl (TTL 6h)
// ---------------------------------------------------------------------------

export interface LiveState {
  /** Läuft gerade ein Experiment? Steuert, was das Publikum sieht. */
  active: boolean
  /** Eindeutige ID pro gestartetem Experiment (namespacet die Antworten). */
  session: string
  /** Satz bisher: Satzanfang + bereits übernommene Wörter. */
  prompt: string
  /** Aktuelle Runde (0-basiert), zählt pro übernommenem Wort hoch. */
  round: number
  /** Wurde die Verteilung der aktuellen Runde schon aufgedeckt? */
  revealed: boolean
}

export interface WordCount {
  word: string
  count: number
}

export const EMPTY_STATE: LiveState = {
  active: false,
  session: '',
  prompt: '',
  round: 0,
  revealed: false,
}

const STATE_KEY = 'live:state'
const ANSWER_TTL_SECONDS = 6 * 60 * 60

function answersKey(session: string, round: number) {
  return `live:answers:${session}:${round}`
}

// --------------------------- Upstash REST-Client ---------------------------

function redisConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (url && token) return { url: url.replace(/\/$/, ''), token }
  return null
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const cfg = redisConfig()
  if (!cfg) throw new Error('Redis nicht konfiguriert')
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command.map(String)),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Redis-Fehler ${res.status}: ${await res.text()}`)
  }
  const data = (await res.json()) as { result?: unknown; error?: string }
  if (data.error) throw new Error(`Redis-Fehler: ${data.error}`)
  return data.result
}

// ----------------------------- In-Memory-Fallback ---------------------------

interface MemStore {
  state: LiveState
  answers: Map<string, Map<string, number>>
}

function memStore(): MemStore {
  const g = globalThis as typeof globalThis & { __liveMemStore?: MemStore }
  if (!g.__liveMemStore) {
    g.__liveMemStore = { state: { ...EMPTY_STATE }, answers: new Map() }
  }
  return g.__liveMemStore
}

const usingRedis = () => redisConfig() !== null

/** Für Diagnose-Ausgaben: welcher Backend-Typ ist aktiv? */
export function liveBackend(): 'redis' | 'memory' {
  return usingRedis() ? 'redis' : 'memory'
}

// --------------------------------- API --------------------------------------

export async function getLiveState(): Promise<LiveState> {
  if (!usingRedis()) return { ...memStore().state }
  const raw = (await redis(['GET', STATE_KEY])) as string | null
  if (!raw) return { ...EMPTY_STATE }
  try {
    return { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<LiveState>) }
  } catch {
    return { ...EMPTY_STATE }
  }
}

export async function setLiveState(state: LiveState): Promise<void> {
  if (!usingRedis()) {
    memStore().state = { ...state }
    return
  }
  await redis(['SET', STATE_KEY, JSON.stringify(state)])
}

/** Ein eingereichtes Wort zählen (Feld = Wort in Originalschreibweise). */
export async function submitWord(
  session: string,
  round: number,
  word: string,
): Promise<void> {
  if (!usingRedis()) {
    const store = memStore()
    const key = answersKey(session, round)
    const map = store.answers.get(key) ?? new Map<string, number>()
    map.set(word, (map.get(word) ?? 0) + 1)
    store.answers.set(key, map)
    return
  }
  const key = answersKey(session, round)
  await redis(['HINCRBY', key, word, 1])
  await redis(['EXPIRE', key, ANSWER_TTL_SECONDS])
}

/**
 * Ausgezählte Verteilung einer Runde, absteigend sortiert.
 * Schreibweisen werden case-insensitiv zusammengeführt; angezeigt wird die
 * häufigste eingereichte Schreibweise.
 */
export async function getResults(
  session: string,
  round: number,
): Promise<WordCount[]> {
  let entries: [string, number][]
  if (!usingRedis()) {
    const map = memStore().answers.get(answersKey(session, round))
    entries = map ? Array.from(map.entries()) : []
  } else {
    // HGETALL liefert flaches Array [feld, wert, feld, wert, ...]
    const flat = ((await redis(['HGETALL', answersKey(session, round)])) ??
      []) as string[]
    entries = []
    for (let i = 0; i < flat.length; i += 2) {
      entries.push([flat[i], Number(flat[i + 1]) || 0])
    }
  }

  // Case-insensitiv mergen, dominante Schreibweise behalten.
  const merged = new Map<
    string,
    { total: number; variants: Map<string, number> }
  >()
  for (const [word, count] of entries) {
    const lower = word.toLowerCase()
    const entry = merged.get(lower) ?? { total: 0, variants: new Map() }
    entry.total += count
    entry.variants.set(word, (entry.variants.get(word) ?? 0) + count)
    merged.set(lower, entry)
  }

  return Array.from(merged.values())
    .map(({ total, variants }) => {
      let best = ''
      let bestCount = -1
      for (const [variant, count] of Array.from(variants.entries())) {
        if (count > bestCount) {
          best = variant
          bestCount = count
        }
      }
      return { word: best, count: total }
    })
    .sort((a, b) => b.count - a.count)
}
