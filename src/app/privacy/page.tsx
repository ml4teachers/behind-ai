'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ShieldCheck, Sparkles, Wrench } from 'lucide-react'
import { MessageCheck } from '@/components/visualizations/message-check'
import { useTranslations } from '@/lib/i18n/use-translations'
import { GlossaryText } from '@/components/glossary/glossary-text'

// Rechtliche Auslegeordnung KI im Bildungsraum Schweiz (Thouvenin/Volz, 2024).
const SOURCE_URL =
  'https://www.educa.ch/sites/default/files/2024-08/KI%20im%20Bildungsbereich_Rechtliche%20Auslegeordnung_2.pdf'

export default function PrivacyPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('privacy.title')}</h1>
        <p className="text-lg text-muted-foreground"><GlossaryText>{t('privacy.subtitle')}</GlossaryText></p>
      </header>

      {/* Interaktiv zuoberst: Nachrichten-Check */}
      <section className="space-y-4">
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <MessageCheck />
        </div>
        <p className="text-sm text-muted-foreground"><GlossaryText>{t('privacy.caption')}</GlossaryText></p>
      </section>

      {/* Worauf kommt es an? – Faktoren in Alltagssprache */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('privacy.factorsTitle')}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Factor icon={<ShieldCheck className="h-4 w-4" />} title={t('privacy.factorPrivacyTitle')}>
            {t('privacy.factorPrivacy')}
          </Factor>
          <Factor icon={<Sparkles className="h-4 w-4" />} title={t('privacy.factorQualityTitle')}>
            {t('privacy.factorQuality')}
          </Factor>
          <Factor icon={<Wrench className="h-4 w-4" />} title={t('privacy.factorSetupTitle')}>
            {t('privacy.factorSetup')}
          </Factor>
        </div>
        <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          {t('privacy.rule')}
        </p>
      </section>

      {/* Mehr dazu: Schweizer Schulkontext + Quelle */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p><GlossaryText>{t('privacy.moreP1')}</GlossaryText></p>
              <p><GlossaryText>{t('privacy.moreP2')}</GlossaryText></p>
              <p><GlossaryText>{t('privacy.moreP3')}</GlossaryText></p>
              <p className="text-sm">
                {t('privacy.sourceLabel')}{' '}
                <a
                  href={SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Thouvenin/Volz (2024), educa.ch
                </a>
                .
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="border-t pt-6">
        <Link href="/agents">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
      </nav>
    </div>
  )
}

function Factor({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-1.5 flex items-center gap-2 font-medium text-primary">
        {icon}
        {title}
      </div>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}
