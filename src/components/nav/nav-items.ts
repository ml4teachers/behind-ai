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

/**
 * Zwei-Pfade-Struktur. URLs unverändert (einzige Änderung historisch:
 * /daten -> /data, Redirect in next.config.js).
 *
 * Lern-Bogen „Hinter den Modellen" (Thread 2 finalisiert):
 *   Tokenisierung → Embeddings → Next-Token → Daten → Training →
 *   Finetuning → RLHF → Chain-of-Thought → RAG
 * Logik: erst die Repräsentation (Text → Tokens → Vektoren), dann die
 * Vorhersage (Next-Token), dann woher die Daten kommen und wie trainiert
 * wird, danach die Verfeinerung (Finetuning/RLHF), zuletzt fortgeschrittene
 * Techniken (Reasoning/CoT, RAG). „Embeddings nach vorn" — direkt nach der
 * Tokenisierung, weil beide die Eingabe-Repräsentation erklären.
 * (modell-typen & werkzeugwahl bewusst noch nicht verlinkt — Work in Progress.)
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
      { key: 'nav.rag', href: '/rag' },
    ],
  },
  {
    key: 'nav.section.aiInUse',
    links: [
      { key: 'nav.localVsCloud', href: '/lokal-vs-cloud' },
      { key: 'nav.hardware', href: '/hardware-check' },
      { key: 'nav.costs', href: '/kosten' },
      { key: 'nav.privacy', href: '/datenschutz' },
    ],
  },
]
