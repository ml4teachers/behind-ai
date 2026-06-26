export type NavLink = {
  /** i18n-Key (siehe lib/i18n/messages.ts) */
  key: string
  href: string
}

export type NavSection = {
  key: string
  links: NavLink[]
}

export const homeLink: NavLink = { key: 'nav.home', href: '/' }
export const resourcesLink: NavLink = { key: 'nav.resources', href: '/resources' }
export const impressumLink: NavLink = { key: 'nav.impressum', href: '/impressum' }

/**
 * Drei-Sektionen-Struktur entlang des Lebenszyklus eines Sprachmodells
 * (Thread 10 – ersetzt die alte „zwei Wege"-Struktur). URLs unverändert
 * (einzige Änderung historisch: /daten -> /data, Redirect in next.config.js).
 *
 * Lern-Bogen:
 *   Daten:     Trainingsdaten → Tokenisierung → Embeddings → Bild & Ton
 *   Training:  Pretraining → Finetuning → RLHF → RLVR
 *   Inferenz:  Next-Token → Attention → Chain-of-Thought → RAG → Datenschutz
 *
 * Logik = was reingeht → wie es lernt → wie es genutzt wird. „Daten" bündelt
 * den Eingabe-/Repräsentations-Teil (woraus das Modell lernt und wie Text,
 * Bild & Ton zu Zahlen werden). „Training" die Trainingsstufen (Vortraining
 * bis Belohnung). „Inferenz" das Verhalten des fertigen Modells zur Laufzeit –
 * Token für Token (Next-Token), mit Notizen (CoT), mit Nachschlagewerk (RAG)
 * und der praktischen Konsequenz, *wo* es läuft (Datenschutz). Datenschutz ist
 * damit Teil der Inferenz (nicht mehr eigene Sektion „KI im Einsatz"); die
 * früheren aiInUse-Slugs leiten weiterhin auf /privacy (next.config.js).
 */
export const navSections: NavSection[] = [
  {
    key: 'nav.section.data',
    links: [
      { key: 'nav.data', href: '/data' },
      { key: 'nav.tokenization', href: '/tokenization' },
      { key: 'nav.embeddings', href: '/embeddings' },
      { key: 'nav.multimodal', href: '/multimodal' },
    ],
  },
  {
    key: 'nav.section.training',
    links: [
      { key: 'nav.training', href: '/training' },
      { key: 'nav.finetuning', href: '/finetuning' },
      { key: 'nav.rlhf', href: '/rlhf' },
      { key: 'nav.rlvr', href: '/rlvr' },
    ],
  },
  {
    key: 'nav.section.inference',
    links: [
      { key: 'nav.nextToken', href: '/next-token' },
      { key: 'nav.attention', href: '/attention' },
      { key: 'nav.cot', href: '/chain-of-thought' },
      { key: 'nav.rag', href: '/rag' },
      { key: 'nav.agents', href: '/agents' },
      { key: 'nav.privacy', href: '/privacy' },
    ],
  },
  // Optionaler „Mathe-Teil" am Ende des Bogens: der kleinste Baustein (Perzeptron),
  // aus dem die Modelle der vorherigen Sektionen bestehen. Schliesst mit einem
  // generativen Ausblick (Diffusion: wie aus Rauschen ein Bild wird).
  {
    key: 'nav.section.mlBasics',
    links: [
      { key: 'nav.perceptron', href: '/perceptron' },
      { key: 'nav.mlp', href: '/mlp' },
      { key: 'nav.gradient', href: '/gradient-descent' },
      { key: 'nav.backprop', href: '/backpropagation' },
      { key: 'nav.diffusion', href: '/diffusion' },
    ],
  },
]
