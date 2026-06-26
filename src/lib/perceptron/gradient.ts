// ---------------------------------------------------------------------------
// Verlust-Landschaften für die Seite „Wie lernt ein Netz?" (Gradientenabstieg).
//
// Reine, deterministische Funktionen mit ANALYTISCHEN Gradienten – kein
// numerisches Wackeln, kein Zufall beim Laden (Zufall nur in Event-Handlern der
// Komponente, hinter dem mounted-Gate). Beide Flächen sind so getunt, dass der
// Lernraten-Regler die vier Regime sichtbar macht: kriecht · sauber · Zickzack ·
// divergiert.
// ---------------------------------------------------------------------------

// === 1D: ein Gewicht ========================================================
// Eine quadratische Mulde mit mildem Quartik-Anteil → steile, aber endliche
// Wände und genau EIN Minimum (L''(w) = 0.9 + 0.24·w² > 0 überall).
export const W1D_MIN = -3
export const W1D_MAX = 3
/** Fester Start (links auf der Wand – langer Schritt-Pfeil, gut lesbar). */
export const W1D_START = -2.0
/** „Neu" zieht den Start uniform hieraus (im Handler, nie beim Render). */
export const W1D_NEW_RANGE: [number, number] = [-2.6, 2.6]
/** Lage des Minimums (für Markierung/„Ziel"-Label). */
export const W1D_ARGMIN = 0.846

export const LR1D = { min: 0.05, max: 2.2, step: 0.05, default: 0.6 }
// Krümmung am Minimum ≈ 1.07 → reine Divergenz ab lr > ~1.87 (< slider max 2.2).

export function loss1d(w: number): number {
  return 0.45 * (w - 0.9) ** 2 + 0.02 * w ** 4 + 1.0
}

export function grad1d(w: number): number {
  return 0.9 * (w - 0.9) + 0.08 * w ** 3
}

// === 2D: zwei Gewichte (Landschaft mit zwei Tälern) =========================
// Sanfte Schüssel minus zwei negative Gauss-Mulden: ein tiefes (globales) und
// ein flacheres (lokales) Minimum, mit einem Grat dazwischen. Verschiedene
// Zufallsstarts enden in verschiedenen Tälern → „lokales Minimum".
export const D2D_MIN = -3
export const D2D_MAX = 3
export const D2D_NEW_RANGE: [number, number] = [-2.5, 2.5]

const BOWL_K = 0.08
interface Well {
  D: number
  cx: number
  cy: number
  s: number
}
const WELL_DEEP: Well = { D: 3.2, cx: -1.3, cy: -1.1, s: 0.95 }
const WELL_SHALLOW: Well = { D: 1.7, cx: 1.5, cy: 1.25, s: 0.85 }

/** Ungefähre Lage der beiden Talsohlen (für Labels). */
export const MIN_DEEP: [number, number] = [-1.24, -1.05]
export const MIN_SHALLOW: [number, number] = [1.4, 1.17]

export const LR2D = { min: 0.02, max: 1.2, step: 0.02, default: 0.25 }

const gauss = (a: number, b: number, w: Well): number =>
  Math.exp(-(((a - w.cx) ** 2 + (b - w.cy) ** 2) / (2 * w.s * w.s)))

export function loss2d(a: number, b: number): number {
  return (
    BOWL_K * (a * a + b * b) -
    WELL_DEEP.D * gauss(a, b, WELL_DEEP) -
    WELL_SHALLOW.D * gauss(a, b, WELL_SHALLOW)
  )
}

export function grad2d(a: number, b: number): [number, number] {
  const gD = gauss(a, b, WELL_DEEP)
  const gS = gauss(a, b, WELL_SHALLOW)
  // d/da von −D·exp(−r²/2s²) = +D·g·(a−cx)/s²  (die Mulde zieht zum Zentrum).
  const ga =
    2 * BOWL_K * a +
    (WELL_DEEP.D * gD * (a - WELL_DEEP.cx)) / (WELL_DEEP.s * WELL_DEEP.s) +
    (WELL_SHALLOW.D * gS * (a - WELL_SHALLOW.cx)) / (WELL_SHALLOW.s * WELL_SHALLOW.s)
  const gb =
    2 * BOWL_K * b +
    (WELL_DEEP.D * gD * (b - WELL_DEEP.cy)) / (WELL_DEEP.s * WELL_DEEP.s) +
    (WELL_SHALLOW.D * gS * (b - WELL_SHALLOW.cy)) / (WELL_SHALLOW.s * WELL_SHALLOW.s)
  return [ga, gb]
}

/** Welcher Talsohle ist (a,b) am nächsten? Für das „im flachen/tiefen Tal"-Label. */
export function whichBasin(a: number, b: number): 'deep' | 'shallow' {
  const dDeep = (a - MIN_DEEP[0]) ** 2 + (b - MIN_DEEP[1]) ** 2
  const dShallow = (a - MIN_SHALLOW[0]) ** 2 + (b - MIN_SHALLOW[1]) ** 2
  return dDeep <= dShallow ? 'deep' : 'shallow'
}
