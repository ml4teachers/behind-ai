'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { NextTokenPrediction } from '@/components/visualizations/next-token-prediction'
import { useTranslations } from '@/lib/i18n/use-translations'
import Link from 'next/link'

// Pool an Beispiel-Satzanfängen (i18n-Keys; Texte je DE/EN in messages.ts).
// Auf der Seite werden daraus zufällig zwei gezeigt.
const EXAMPLE_KEYS = [
  'nextToken.ex1',
  'nextToken.ex2',
  'nextToken.ex3',
  'nextToken.ex4',
  'nextToken.ex5',
  'nextToken.ex6',
  'nextToken.ex7',
  'nextToken.ex8',
] as const

// Zwei verschiedene zufällige Indizes aus [0, n).
function pickTwo(n: number): [number, number] {
  const a = Math.floor(Math.random() * n)
  let b = Math.floor(Math.random() * (n - 1))
  if (b >= a) b += 1
  return [a, b]
}

export default function NextTokenPage() {
  const t = useTranslations()
  const [inputText, setInputText] = useState('Gelb ist eine')
  const [showPrediction, setShowPrediction] = useState(false)
  const [examples, setExamples] = useState<[number, number]>([0, 1])

  // Bei jedem Seitenaufruf zwei zufällige Beispiele zeigen. Erst nach dem Mount
  // würfeln (Server + erster Client-Render nutzen [0, 1]) – kein Hydration-Mismatch.
  useEffect(() => {
    setExamples(pickTwo(EXAMPLE_KEYS.length))
  }, [])

  // Vorhersage nur zurücksetzen, wenn sich der Text wirklich ändert.
  const handleTextChange = (newText: string) => {
    if (newText !== inputText) {
      setInputText(newText)
      setShowPrediction(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('nextToken.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('nextToken.subtitle')}</p>
      </header>

      {/* Interaktiv zuoberst */}
      <section className="space-y-4">
        <div className="space-y-3">
          <Input
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={t('nextToken.placeholder')}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowPrediction(true)} disabled={!inputText.trim()}>
              {t('nextToken.predict')}
            </Button>
            {examples.map((idx) => {
              const seed = t(EXAMPLE_KEYS[idx])
              return (
                <Button
                  key={EXAMPLE_KEYS[idx]}
                  variant="outline"
                  onClick={() => handleTextChange(seed)}
                >
                  {seed}
                </Button>
              )
            })}
            {showPrediction && (
              <Button variant="ghost" onClick={() => setShowPrediction(false)}>
                {t('common.reset')}
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col rounded-xl border bg-card p-4 sm:p-6">
          {showPrediction ? (
            <NextTokenPrediction text={inputText} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
              <p className="mb-2 max-w-md">{t('nextToken.emptyTitle')}</p>
              <p className="max-w-md text-sm">{t('nextToken.emptyBody')}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{t('nextToken.caption')}</p>
      </section>

      {/* Mehr dazu (optional aufklappbar) */}
      <div className="border-t">
        <Accordion type="single" collapsible>
          <AccordionItem value="more" className="border-b-0">
            <AccordionTrigger className="text-base">{t('common.moreAbout')}</AccordionTrigger>
            <AccordionContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>{t('nextToken.moreP1')}</p>
              <p>{t('nextToken.moreP2')}</p>
              <p>{t('nextToken.moreP3')}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <nav className="flex justify-between border-t pt-6">
        <Link href="/rlvr">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('common.back')}
          </Button>
        </Link>
        <Link href="/chain-of-thought">
          <Button>
            {t('nextToken.nextLabel')} <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </nav>
    </div>
  )
}
