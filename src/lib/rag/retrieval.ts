// ---------------------------------------------------------------------------
// Retrieval für die RAG-Seite: reine, framework-freie Helfer.
//
// Das „R" in RAG ist nichts anderes als Ähnlichkeitssuche im Embedding-Raum:
// Frage einbetten -> Cosinus-Ähnlichkeit zu jedem Dokument -> die k ähnlichsten
// nehmen. Genau das passiert hier — transparent und nachrechenbar. Dieselbe
// Mathematik wie auf der Embeddings-Seite (Einheitsvektor + Skalarprodukt).
// ---------------------------------------------------------------------------

export interface RagDoc {
  id: string
  title: string
  text: string
  vec: number[]
}

export interface RagDocsFile {
  model: string
  dim: number
  docs: RagDoc[]
}

export interface ScoredDoc {
  doc: RagDoc
  /** Cosinus-Ähnlichkeit Frage↔Dokument (für Einheitsvektoren = Skalarprodukt). */
  sim: number
}

/** Vektor auf Länge 1 bringen -> Skalarprodukt zweier Einheitsvektoren = Cosinus. */
export function unit(v: number[]): number[] {
  let m = 0
  for (const x of v) m += x * x
  m = Math.sqrt(m)
  return m === 0 ? v : v.map((x) => x / m)
}

/** Skalarprodukt. Bei Einheitsvektoren identisch zur Cosinus-Ähnlichkeit. */
export function dot(a: number[], b: number[]): number {
  let d = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) d += a[i] * b[i]
  return d
}

/**
 * Bewertet alle Dokumente gegen die (bereits normierte) Frage und gibt sie
 * absteigend nach Ähnlichkeit zurück. Es wird nichts weggefiltert — die
 * Reihenfolge ist die Aussage.
 */
export function rankDocs(queryUnitVec: number[], docs: RagDoc[]): ScoredDoc[] {
  return docs
    .map((doc) => ({ doc, sim: dot(queryUnitVec, doc.vec) }))
    .sort((a, b) => b.sim - a.sim)
}
