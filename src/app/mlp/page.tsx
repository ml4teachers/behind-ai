'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MlpLab } from '@/components/visualizations/mlp-lab'
import { useTranslations } from '@/lib/i18n/use-translations'

export default function MlpPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('mlp.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('mlp.subtitle')}</p>
      </header>

      {/* Interaktiv zuoberst */}
      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <MlpLab />
        </div>
        <p className="text-sm text-muted-foreground">{t('mlp.caption')}</p>
      </section>

      {/* Mehr dazu */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>{t('mlp.moreP1')}</p>
              <p>{t('mlp.moreP2')}</p>
              <p>{t('mlp.moreP3')}</p>
              <p>{t('mlp.moreP4')}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="flex justify-between border-t pt-6">
        <Link href="/perceptron">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
        <Link href="/gradient-descent">
          <Button>
            {t('mlp.nextLabel')} <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </nav>
    </div>
  )
}
