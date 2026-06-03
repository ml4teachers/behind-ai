import type { Locale } from './config'

/*
 * Übersetzungs-Schicht (Gerüst).
 *
 * Aktuell nur die Shell/Navigation. Seiten-Inhalte werden beim jeweiligen
 * Redesign hierher migriert. Fehlt ein Key in der aktiven Sprache, greift
 * automatisch Deutsch (defaultLocale) als Fallback — Englisch darf also
 * lückenhaft bleiben, bis die Texte final sind.
 */
export const messages: Record<Locale, Record<string, string>> = {
  de: {
    'brand.name': 'Behind AI',
    'brand.tagline': 'Wie funktionieren KI-Sprachmodelle?',

    'nav.home': 'Einführung',
    'nav.resources': 'Ressourcen',
    'nav.section.behindModels': 'Hinter den Modellen',
    'nav.section.aiInUse': 'KI im Einsatz',

    'nav.tokenization': 'Tokenisierung',
    'nav.nextToken': 'Next-Token-Prediction',
    'nav.data': 'Daten',
    'nav.training': 'Training vs. Inferenz',
    'nav.finetuning': 'Finetuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-Thought',
    'nav.embeddings': 'Embeddings',
    'nav.localVsCloud': 'Lokal vs. Cloud',
    'nav.hardware': 'Hardware-Check',
    'nav.costs': 'Kosten',
    'nav.privacy': 'Datenschutz',

    'a11y.toggleTheme': 'Hell/Dunkel umschalten',
    'a11y.toggleSidebar': 'Navigation ein-/ausblenden',
    'a11y.toggleLanguage': 'Sprache wechseln',
  },
  en: {
    'brand.name': 'Behind AI',
    'brand.tagline': 'How do AI language models work?',

    'nav.home': 'Introduction',
    'nav.resources': 'Resources',
    'nav.section.behindModels': 'Behind the models',
    'nav.section.aiInUse': 'AI in practice',

    'nav.tokenization': 'Tokenization',
    'nav.nextToken': 'Next-token prediction',
    'nav.data': 'Data',
    'nav.training': 'Training vs. inference',
    'nav.finetuning': 'Fine-tuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-thought',
    'nav.embeddings': 'Embeddings',
    'nav.localVsCloud': 'Local vs. cloud',
    'nav.hardware': 'Hardware check',
    'nav.costs': 'Costs',
    'nav.privacy': 'Data protection',

    'a11y.toggleTheme': 'Toggle light/dark',
    'a11y.toggleSidebar': 'Show/hide navigation',
    'a11y.toggleLanguage': 'Switch language',
  },
}
