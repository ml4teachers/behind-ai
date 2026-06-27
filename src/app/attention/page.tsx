'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AttentionExplorer } from '@/components/visualizations/attention-explorer'
import { AttentionMechanism } from '@/components/visualizations/attention-mechanism'
import { useTranslations } from '@/lib/i18n/use-translations'
import { GlossaryText } from '@/components/glossary/glossary-text'

export default function AttentionPage() {
  const t = useTranslations()
  // Gewählter Satz aus dem Explorer → an den Mechanik-Toy weitergereicht (seitenlokal).
  const [activeSentence, setActiveSentence] = useState<string | null>(null)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('attention.title')}</h1>
        <p className="text-lg text-muted-foreground"><GlossaryText>{t('attention.subtitle')}</GlossaryText></p>
      </header>

      {/* Interaktiv zuoberst */}
      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <AttentionExplorer onSentenceChange={setActiveSentence} />
        </div>
        <p className="text-sm text-muted-foreground"><GlossaryText>{t('attention.caption')}</GlossaryText></p>
      </section>

      {/* Vertiefung (Mechanik) + Mehr dazu (Prosa) */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="mech">
            <AccordionTrigger className="text-base">{t('attention.mechTitle')}</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-base leading-relaxed text-muted-foreground">
                {t('attention.mechIntro')}
              </p>
              <AttentionMechanism sentenceText={activeSentence} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p><GlossaryText>{t('attention.moreP1')}</GlossaryText></p>
              <p><GlossaryText>{t('attention.moreP2')}</GlossaryText></p>
              <p><GlossaryText>{t('attention.moreP3')}</GlossaryText></p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="flex justify-between border-t pt-6">
        <Link href="/next-token">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
        <Link href="/chain-of-thought">
          <Button>
            {t('attention.nextLabel')} <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </nav>
    </div>
  )
}
