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
 * Zwei-Pfade-Struktur. URLs unverändert (einzige Änderung historisch:
 * /daten -> /data, Redirect in next.config.js).
 *
 * Lern-Bogen „Hinter den Modellen" (Thread 2 finalisiert, Thread 5 erweitert,
 * Thread 9 ergänzt): Tokenisierung → Embeddings → Next-Token → Daten →
 *   Training → Finetuning → RLHF → Chain-of-Thought → RLVR → RAG → Multimodal
 * Logik: erst die Repräsentation (Text → Tokens → Vektoren), dann die
 * Vorhersage (Next-Token), dann woher die Daten kommen und wie trainiert
 * wird, danach die Verfeinerung (Finetuning/RLHF), dann das Reasoning
 * (Chain-of-Thought → RLVR als zusammenhängende Trilogie mit RLHF), dann
 * RAG als eigene Inferenz-Technik. „Embeddings nach vorn" — direkt nach der
 * Tokenisierung, weil beide die Eingabe-Repräsentation erklären. Den Schluss
 * bildet „Bild & Ton" (multimodal): wie aus einer Fläche eine Reihe wird, die
 * dasselbe sequenzielle Modell lesen kann — Capstone, der den ganzen Bogen
 * (Tokens, Embeddings, Sequenz) auf Bilder/Audio überträgt.
 *
 * „KI im Einsatz" wurde auf EINE Seite verschlankt (/privacy): ein Nachrichten-
 * Check, der zeigt, wie schnell eine Anfrage Schützenswertes enthält, plus
 * „worauf achten" (Datenschutz/Qualität/Setup) in Alltagssprache. Hardware-Check
 * & Kosten flogen raus (zu volatil/technisch für die Zielgruppe), Multimodal zog
 * nach „Hinter den Modellen". Alle früheren Slugs leiten auf /privacy (next.config.js).
 */
export const navSections: NavSection[] = [
  {
    key: 'nav.section.behindModels',
    links: [
      { key: 'nav.tokenization', href: '/tokenization' },
      { key: 'nav.embeddings', href: '/embeddings' },
      { key: 'nav.nextToken', href: '/next-token' },
      { key: 'nav.data', href: '/data' },
      { key: 'nav.training', href: '/training' },
      { key: 'nav.finetuning', href: '/finetuning' },
      { key: 'nav.rlhf', href: '/rlhf' },
      { key: 'nav.cot', href: '/chain-of-thought' },
      { key: 'nav.rlvr', href: '/rlvr' },
      { key: 'nav.rag', href: '/rag' },
      { key: 'nav.multimodal', href: '/multimodal' },
    ],
  },
  {
    key: 'nav.section.aiInUse',
    links: [{ key: 'nav.privacy', href: '/privacy' }],
  },
]
