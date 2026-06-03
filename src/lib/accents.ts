/*
 * Akzentfarben (Tailwind-Palette).
 *
 * Die Akzentfarbe ist die einzige „bunte" Farbe der App und steckt in den
 * semantischen Tokens `--primary` / `--primary-foreground` / `--ring`. Sie ist
 * im Header umschaltbar (AccentToggle) und wird zur Laufzeit über
 * `AccentProvider` als CSS-Variablen injiziert — getrennt für Light (`:root`)
 * und Dark (`.dark`).
 *
 * Werte als HSL-Tripel ohne `hsl()` (passt zum Token-Schema in globals.css):
 *  - light  = Tailwind-600  (kräftig, meist weisse Schrift)
 *  - dark   = Tailwind-400  (heller Tint auf dunklem Grund, dunkle Schrift)
 *
 * Default ist `sky` — globals.css hält denselben Default, damit es vor dem
 * Mount (SSR) kein Farb-Flackern gibt.
 */

export type AccentName =
  | 'amber'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'fuchsia'
  | 'green'
  | 'indigo'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'rose'
  | 'sky'
  | 'teal'
  | 'violet'

interface AccentTone {
  /** HSL-Tripel „H S% L%" für --primary und --ring. */
  primary: string
  /** HSL-Tripel für --primary-foreground (Text/Icon auf der Akzentfläche). */
  foreground: string
}

export interface Accent {
  name: AccentName
  label: string
  light: AccentTone
  dark: AccentTone
}

// Dunkler Vordergrund für helle Akzentflächen (Dark-Mode + helle Light-Töne).
const DARK_FG = '222 47% 11%'
const WHITE_FG = '0 0% 100%'

/** Alphabetisch — so erscheint die Liste auch im Picker. */
export const accents: Accent[] = [
  { name: 'amber', label: 'Amber', light: { primary: '32 95% 44%', foreground: DARK_FG }, dark: { primary: '43 96% 56%', foreground: DARK_FG } },
  { name: 'blue', label: 'Blue', light: { primary: '221 83% 53%', foreground: WHITE_FG }, dark: { primary: '213 94% 68%', foreground: DARK_FG } },
  { name: 'cyan', label: 'Cyan', light: { primary: '192 91% 36%', foreground: WHITE_FG }, dark: { primary: '187 92% 69%', foreground: DARK_FG } },
  { name: 'emerald', label: 'Emerald', light: { primary: '161 94% 30%', foreground: WHITE_FG }, dark: { primary: '158 64% 52%', foreground: DARK_FG } },
  { name: 'fuchsia', label: 'Fuchsia', light: { primary: '293 69% 49%', foreground: WHITE_FG }, dark: { primary: '292 91% 73%', foreground: DARK_FG } },
  { name: 'green', label: 'Green', light: { primary: '142 72% 36%', foreground: WHITE_FG }, dark: { primary: '142 69% 58%', foreground: DARK_FG } },
  { name: 'indigo', label: 'Indigo', light: { primary: '243 75% 59%', foreground: WHITE_FG }, dark: { primary: '234 89% 74%', foreground: DARK_FG } },
  { name: 'lime', label: 'Lime', light: { primary: '85 81% 33%', foreground: DARK_FG }, dark: { primary: '82 85% 67%', foreground: DARK_FG } },
  { name: 'orange', label: 'Orange', light: { primary: '21 90% 48%', foreground: WHITE_FG }, dark: { primary: '27 96% 61%', foreground: DARK_FG } },
  { name: 'pink', label: 'Pink', light: { primary: '333 71% 51%', foreground: WHITE_FG }, dark: { primary: '327 87% 70%', foreground: DARK_FG } },
  { name: 'purple', label: 'Purple', light: { primary: '271 81% 56%', foreground: WHITE_FG }, dark: { primary: '270 95% 75%', foreground: DARK_FG } },
  { name: 'red', label: 'Red', light: { primary: '0 72% 51%', foreground: WHITE_FG }, dark: { primary: '0 91% 71%', foreground: DARK_FG } },
  { name: 'rose', label: 'Rose', light: { primary: '347 77% 50%', foreground: WHITE_FG }, dark: { primary: '351 95% 71%', foreground: DARK_FG } },
  { name: 'sky', label: 'Sky', light: { primary: '200 98% 39%', foreground: WHITE_FG }, dark: { primary: '199 95% 74%', foreground: DARK_FG } },
  { name: 'teal', label: 'Teal', light: { primary: '175 84% 32%', foreground: WHITE_FG }, dark: { primary: '172 66% 50%', foreground: DARK_FG } },
  { name: 'violet', label: 'Violet', light: { primary: '262 83% 58%', foreground: WHITE_FG }, dark: { primary: '255 92% 76%', foreground: DARK_FG } },
]

export const defaultAccent: AccentName = 'sky'

export const accentByName: Record<AccentName, Accent> = Object.fromEntries(
  accents.map((a) => [a.name, a]),
) as Record<AccentName, Accent>
