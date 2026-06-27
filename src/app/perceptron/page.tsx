'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PerceptronLab } from '@/components/visualizations/perceptron-lab'
import { useTranslations } from '@/lib/i18n/use-translations'
import { GlossaryText } from '@/components/glossary/glossary-text'

export default function PerceptronPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('perceptron.title')}</h1>
        <p className="text-lg text-muted-foreground"><GlossaryText>{t('perceptron.subtitle')}</GlossaryText></p>
      </header>

      {/* Interaktiv zuoberst */}
      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <PerceptronLab />
        </div>
        <p className="text-sm text-muted-foreground"><GlossaryText>{t('perceptron.caption')}</GlossaryText></p>
      </section>

      {/* Mehr dazu */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p><GlossaryText>{t('perceptron.moreP1')}</GlossaryText></p>
              <p><GlossaryText>{t('perceptron.moreP2')}</GlossaryText></p>
              <p><GlossaryText>{t('perceptron.moreP3')}</GlossaryText></p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="flex justify-between border-t pt-6">
        <Link href="/privacy">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
        <Link href="/mlp">
          <Button>
            {t('perceptron.nextLabel')} <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </nav>
    </div>
  )
}
