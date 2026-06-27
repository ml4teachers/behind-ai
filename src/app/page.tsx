'use client'

import Link from 'next/link'
import { ArrowRight, Database, GraduationCap, Sparkles, type LucideIcon } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { NextTokenMini } from '@/components/visualizations/next-token-mini'
import { navSections } from '@/components/nav/nav-items'
import { useTranslations } from '@/lib/i18n/use-translations'
import { GlossaryText } from '@/components/glossary/glossary-text'

/** Icon + Kurzbeschreibung je Pfad. Reihenfolge & Links kommen aus navSections. */
const sectionMeta: Record<string, { icon: LucideIcon; descKey: string }> = {
  'nav.section.data': { icon: Database, descKey: 'home.path.data.desc' },
  'nav.section.training': { icon: GraduationCap, descKey: 'home.path.training.desc' },
  'nav.section.inference': { icon: Sparkles, descKey: 'home.path.inference.desc' },
}

export default function Home() {
  const t = useTranslations()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-12">
      {/* Hero – knapp, kein Textwall */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t('home.hero.title')}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground"><GlossaryText>{t('home.hero.subtitle')}</GlossaryText></p>
      </header>

      {/* Hero-Interaktiv: echte Mini-Demo zuoberst */}
      <section className="mb-4">
        <NextTokenMini />
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground"><GlossaryText>{t('home.demo.caption')}</GlossaryText></p>
        <Link
          href="/next-token"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t('home.demo.openFull')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {/* Optionales „Mehr dazu" – Erklärtext bleibt eingeklappt */}
      <Accordion type="single" collapsible className="mb-10 mt-2 border-t border-border">
        <AccordionItem value="what-is-llm">
          <AccordionTrigger>{t('home.more.title')}</AccordionTrigger>
          <AccordionContent className="max-w-2xl text-muted-foreground">
            <GlossaryText>{t('home.more.body')}</GlossaryText>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Zwei Wege – Informationsarchitektur aus navSections */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('home.paths.heading')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Nur die Lebenszyklus-Sektionen mit Meta (Daten/Training/Inferenz).
              Optionale Tracks wie „ML-Grundlagen" stehen nur in der Seitennav. */}
          {navSections
            .filter((section) => sectionMeta[section.key])
            .map((section) => {
            const meta = sectionMeta[section.key]
            const Icon = meta.icon
            return (
              <div key={section.key} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold text-foreground">{t(section.key)}</h3>
                </div>
                <p className="mb-4 text-sm text-muted-foreground"><GlossaryText>{t(meta.descKey)}</GlossaryText></p>
                <ul className="space-y-0.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span>{t(link.key)}</span>
                        <ArrowRight
                          className="h-3.5 w-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
