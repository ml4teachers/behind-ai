'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { TokenizationVisualization } from '@/components/visualizations/tokenization-visualization'
import { useTranslations } from '@/lib/i18n/use-translations'
import Link from 'next/link'
import { InfoCircledIcon } from '@radix-ui/react-icons'

export default function TokenizationPage() {
  const t = useTranslations()
  const [inputText, setInputText] = useState('Hallo, diesen Text kannst du beliebig anpassen.')
  const [showResults, setShowResults] = useState(false)

  // Ergebnisse nur zurücksetzen, wenn sich der Text wirklich ändert.
  const handleTextChange = (newText: string) => {
    if (newText !== inputText) {
      setInputText(newText)
      setShowResults(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('tokenization.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('tokenization.subtitle')}</p>
      </header>

      {/* Interaktiv zuoberst */}
      <section className="space-y-4">
        <div className="space-y-3">
          <Input
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={t('tokenization.placeholder')}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowResults(true)} disabled={!inputText.trim()}>
              {t('tokenization.process')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTextChange('Programmieren lernt man am besten durch Übung.')}
            >
              {t('tokenization.example1')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTextChange('Künstliche Intelligenz ist auch nur Mathematik!')}
            >
              {t('tokenization.example2')}
            </Button>
            {showResults && (
              <Button variant="ghost" onClick={() => setShowResults(false)}>
                {t('common.reset')}
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-h-[400px] flex-col rounded-xl border bg-card p-4 sm:p-6">
          {showResults ? (
            <TokenizationVisualization text={inputText} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
              <p className="mb-2 max-w-md">{t('tokenization.emptyTitle')}</p>
              <p className="max-w-md text-sm">{t('tokenization.emptyBody')}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{t('tokenization.caption')}</p>
      </section>

      {/* Multimodal-Hinweis (Brücke zu Modell-Typen, Thread 8) */}
      <div className="flex gap-3 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        <InfoCircledIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <p>
          {t('tokenization.multimodalPre')}
          <Link href="/multimodal" className="font-medium text-primary hover:underline">
            {t('nav.multimodal')}
          </Link>
          {t('tokenization.multimodalPost')}
        </p>
      </div>

      {/* Mehr dazu (optional aufklappbar) */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>{t('tokenization.moreP1')}</p>
              <p>{t('tokenization.moreP2')}</p>
              <p>{t('tokenization.moreP3')}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="flex justify-between border-t pt-6">
        <Link href="/data">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
        <Link href="/embeddings">
          <Button>
            {t('tokenization.nextLabel')} <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </nav>
    </div>
  )
}
