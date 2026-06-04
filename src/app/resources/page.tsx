'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FileText, Github, Youtube, Sparkles, ExternalLink } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/use-translations'

// Rechtliche Auslegeordnung KI im Bildungsraum Schweiz (Thouvenin/Volz, 2024).
const legalSource = {
  title:
    'Rechtliche Auslegeordnung zur Entwicklung und Nutzung von KI im Bildungsraum Schweiz',
  authors: 'Thouvenin/Volz',
  year: 2024,
  url: 'https://www.educa.ch/sites/default/files/2024-08/KI%20im%20Bildungsbereich_Rechtliche%20Auslegeordnung_2.pdf',
}

// Weiterführende, frei zugängliche Erklärungen (visuell, für Einsteiger geeignet).
const furtherResources = [
  {
    title: '3Blue1Brown – „But what is a GPT?"',
    desc: 'Visuelle Einführung in Transformer und Attention. Ruhig erklärt, mit Animationen.',
    url: 'https://www.3blue1brown.com/lessons/gpt',
  },
  {
    title: 'LLM Visualization (Brendan Bycroft)',
    desc: 'Ein 3D-Rundgang durch ein GPT-Modell – jeder Schritt der Berechnung wird sichtbar.',
    url: 'https://bbycroft.net/llm',
  },
  {
    title: 'Financial Times – „Generative AI exists because of the transformer"',
    desc: 'Ein scroll-basierter, visueller Erklärer, wie Sprachmodelle das nächste Wort vorhersagen.',
    url: 'https://ig.ft.com/generative-ai/',
  },
]

export default function ResourcesPage() {
  const t = useTranslations()
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('resources.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('resources.subtitle')}
        </p>
      </header>

      {/* Über diese Webseite: Ziel + Entstehung + ehrliche Einordnung */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('resources.aboutTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">{t('resources.aboutP1')}</p>
        <p className="leading-relaxed text-muted-foreground">{t('resources.aboutP2')}</p>

        {/* Vibe Coding – Zitat + ehrliche Einordnung */}
        <div className="rounded-xl border bg-muted/40 p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold">{t('resources.vibeTitle')}</h3>
          <blockquote className="border-l-4 border-primary/50 pl-4 text-sm italic text-muted-foreground">
            „There&apos;s a new kind of coding I call &lsquo;vibe coding&rsquo;, where you fully
            give in to the vibes … I &lsquo;Accept All&rsquo; always, I don&apos;t read the diffs
            anymore … it&apos;s not really coding – I just see stuff, say stuff, run stuff, and
            copy-paste stuff, and it mostly works."
            <span className="mt-1 block text-xs not-italic">
              –{' '}
              <a
                href="https://x.com/karpathy/status/1886192184808149383"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Andrej Karpathy (2025)
              </a>
            </span>
          </blockquote>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('resources.vibeP1')}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{t('resources.vibeP2')}</p>
          <blockquote className="border-l-4 border-primary/50 pl-4 text-sm italic text-muted-foreground">
            „The hottest new programming language is English"
            <span className="mt-1 block text-xs not-italic">
              –{' '}
              <a
                href="https://x.com/karpathy/status/1617979122625712128"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Andrej Karpathy
              </a>
            </span>
          </blockquote>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('resources.sourceLabel')}{' '}
          <a
            href="https://github.com/ml4teachers/behind-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" /> ml4teachers/behind-ai
          </a>
          .{' '}
          <Link href="/impressum" className="underline hover:text-foreground">
            {t('resources.impressumLink')}
          </Link>
          .
        </p>
      </section>

      <Separator />

      {/* Andrej Karpathy Videos */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('resources.karpathyTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">{t('resources.karpathyIntro')}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <figure className="space-y-2">
            <div className="aspect-video">
              <iframe
                className="h-full w-full rounded-lg border"
                src="https://www.youtube.com/embed/7xTGNNLPyMI"
                title="Deep Dive into LLMs like ChatGPT"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <figcaption className="text-sm text-muted-foreground">{t('resources.video1Caption')}</figcaption>
          </figure>
          <figure className="space-y-2">
            <div className="aspect-video">
              <iframe
                className="h-full w-full rounded-lg border"
                src="https://www.youtube.com/embed/EWvNQjAaOHw"
                title="How I use LLMs"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <figcaption className="text-sm text-muted-foreground">{t('resources.video2Caption')}</figcaption>
          </figure>
        </div>
      </section>

      <Separator />

      {/* Weitere Lernressourcen */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('resources.furtherTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">{t('resources.furtherIntro')}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {furtherResources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <div className="mb-1.5 flex items-center gap-2 font-medium text-primary">
                <Sparkles className="h-4 w-4 shrink-0" />
                <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mb-1 text-sm font-medium text-foreground">{r.title}</div>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <Separator />

      {/* Datenquellen & Inspiration */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{t('resources.dataSourceTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">{t('resources.dataSourceP')}</p>
      </section>

      <Separator />

      {/* Rechtliche Grundlagen */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{t('resources.legalTitle')}</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <a
                  href={legalSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {t('resources.legalSource')}
                </a>
                <p className="text-sm text-muted-foreground">
                  {t('resources.legalAuthors')}, {t('resources.legalYear')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Über den Autor */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('resources.authorTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">{t('resources.authorP')}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <AuthorLink
            label="PH Zug"
            sub="Profil & Kontakt"
            href="https://www.zg.ch/behoerden/direktion-fur-bildung-und-kultur/phzg/kontakte/zurfluh-thomas?searchterm=thomas+zurfluh"
          />
          <AuthorLink
            label="YouTube"
            sub="@thomaszurfluh453"
            href="https://youtube.com/@thomaszurfluh453"
            icon={<Youtube className="h-4 w-4" />}
          />
          <AuthorLink
            label="LinkedIn"
            sub="Thomas Zurfluh"
            href="https://www.linkedin.com/in/thomas-zurfluh-b6720b203/"
          />
        </div>
      </section>

      <Separator />

      {/* Update-Geschichte */}
      <section className="space-y-4" id="geschichte">
        <h2 className="text-xl font-semibold tracking-tight">{t('resources.historyTitle')}</h2>
        <ol className="space-y-5 border-l pl-5">
          <TimelineItem date={t('resources.history1Date')} title={t('resources.history1Title')}>
            {t('resources.history1Body')}
          </TimelineItem>
          <TimelineItem date={t('resources.history2Date')} title={t('resources.history2Title')}>
            {t('resources.history2Body')}
          </TimelineItem>
          <TimelineItem date={t('resources.history3Date')} title={t('resources.history3Title')}>
            {t('resources.history3Body')}
          </TimelineItem>
        </ol>
      </section>

      <nav className="border-t pt-6">
        <Link href="/">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('resources.backBtn')}
          </Button>
        </Link>
      </nav>
    </div>
  )
}

function AuthorLink({
  label,
  sub,
  href,
  icon,
}: {
  label: string
  sub: string
  href: string
  icon?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-2 hover:underline"
        >
          {sub}
        </a>
      </CardContent>
    </Card>
  )
}

function TimelineItem({
  date,
  title,
  children,
}: {
  date: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="relative">
      <span className="absolute -left-[1.42rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {date}
      </div>
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </li>
  )
}
