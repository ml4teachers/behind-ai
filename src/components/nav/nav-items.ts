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
 * Zwei-Pfade-Struktur. Reihenfolge & Links wie bisher (modell-typen und
 * werkzeugwahl sind bewusst noch nicht verlinkt — Work in Progress).
 * Einzige URL-Änderung: /daten -> /data (Redirect in next.config.js).
 */
export const navSections: NavSection[] = [
  {
    key: 'nav.section.behindModels',
    links: [
      { key: 'nav.tokenization', href: '/tokenization' },
      { key: 'nav.nextToken', href: '/next-token' },
      { key: 'nav.data', href: '/data' },
      { key: 'nav.training', href: '/training' },
      { key: 'nav.finetuning', href: '/finetuning' },
      { key: 'nav.rlhf', href: '/rlhf' },
      { key: 'nav.rag', href: '/rag' },
      { key: 'nav.cot', href: '/chain-of-thought' },
      { key: 'nav.embeddings', href: '/embeddings' },
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
