'use client'

import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { DataExplorer } from '@/components/visualizations/data-explorer'
import { useTranslations } from '@/lib/i18n/use-translations'
import { GlossaryText } from '@/components/glossary/glossary-text'
import Link from 'next/link'

export default function DataPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('data.title')}</h1>
        <p className="text-lg text-muted-foreground"><GlossaryText>{t('data.subtitle')}</GlossaryText></p>
      </header>

      {/* Interaktiv zuoberst */}
      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <DataExplorer />
        </div>
        <p className="text-sm text-muted-foreground"><GlossaryText>{t('data.caption')}</GlossaryText></p>
      </section>

      {/* Mehr dazu (optional aufklappbar) */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p><GlossaryText>{t('data.moreP1')}</GlossaryText></p>
              <p><GlossaryText>{t('data.moreP2')}</GlossaryText></p>
              <p><GlossaryText>{t('data.moreP3')}</GlossaryText></p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="flex justify-between border-t pt-6">
        <Link href="/">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
        <Link href="/tokenization">
          <Button>
            {t('data.nextLabel')} <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </nav>
    </div>
  )
}
