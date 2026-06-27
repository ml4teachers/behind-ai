'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CotComparison } from '@/components/visualizations/cot-comparison'
import { useTranslations } from '@/lib/i18n/use-translations'
import { GlossaryText } from '@/components/glossary/glossary-text'

export default function ChainOfThoughtPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('cot.title')}</h1>
        <p className="text-lg text-muted-foreground"><GlossaryText>{t('cot.subtitle')}</GlossaryText></p>
      </header>

      {/* Interaktiv zuoberst */}
      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <CotComparison />
        </div>
        <p className="text-sm text-muted-foreground"><GlossaryText>{t('cot.caption')}</GlossaryText></p>
      </section>

      {/* Mehr dazu (optional aufklappbar) */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p><GlossaryText>{t('cot.moreP1')}</GlossaryText></p>
              <p><GlossaryText>{t('cot.moreP2')}</GlossaryText></p>
              <p><GlossaryText>{t('cot.moreP3')}</GlossaryText></p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="flex justify-between border-t pt-6">
        <Link href="/attention">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
        <Link href="/hallucinations">
          <Button>
            {t('cot.nextLabel')} <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </nav>
    </div>
  )
}
