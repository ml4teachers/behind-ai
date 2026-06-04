'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Cloud, Laptop, Settings, Server, Github } from 'lucide-react'
import { useTranslations } from '@/lib/i18n/use-translations'

export default function ImpressumPage() {
  const t = useTranslations()
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('impressum.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('impressum.subtitle')}</p>
      </header>

      {/* Verantwortlich */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('impressum.responsible')}</h2>
        <Card>
          <CardContent className="space-y-2 pt-6 text-sm leading-relaxed text-muted-foreground">
            <p className="text-base font-medium text-foreground">{t('impressum.responsibleName')}</p>
            <p>{t('impressum.responsibleRole')}</p>
            <p>
              {t('impressum.responsibleContact')}{' '}
              <a
                href="https://www.zg.ch/behoerden/direktion-fur-bildung-und-kultur/phzg/kontakte/zurfluh-thomas?searchterm=thomas+zurfluh"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                {t('impressum.responsibleContactLink')}
              </a>{' '}
              {t('impressum.responsibleOr')}{' '}
              <a
                href="https://www.linkedin.com/in/thomas-zurfluh-b6720b203/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                LinkedIn
              </a>
              .
            </p>
            <p className="rounded-lg border bg-muted/40 p-3 text-sm">
              {t('impressum.privateNote')}
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Welche Daten werden geteilt? */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('impressum.dataTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">{t('impressum.dataIntro')}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <DataCard
            icon={<Cloud className="h-4 w-4" />}
            title={t('impressum.dataCloudTitle')}
            tone="accent"
          >
            {t('impressum.dataCloudBody')}
          </DataCard>

          <DataCard icon={<Laptop className="h-4 w-4" />} title={t('impressum.dataBrowserTitle')}>
            {t('impressum.dataBrowserBody')}
          </DataCard>

          <DataCard icon={<Settings className="h-4 w-4" />} title={t('impressum.dataSettingsTitle')}>
            {t('impressum.dataSettingsBody')}
          </DataCard>

          <DataCard icon={<Server className="h-4 w-4" />} title={t('impressum.dataHostingTitle')}>
            {t('impressum.dataHostingBody')}
          </DataCard>
        </div>

        <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          {t('impressum.dataNote')}
        </p>
      </section>

      <Separator />

      {/* Inhalt & Haftung */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{t('impressum.contentTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">{t('impressum.contentBody')}</p>
      </section>

      <Separator />

      {/* Urheberrecht & Quellcode */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">{t('impressum.copyrightTitle')}</h2>
        <p className="leading-relaxed text-muted-foreground">
          {t('impressum.copyrightBody')}{' '}
          <a
            href="https://github.com/ml4teachers/behind-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" /> ml4teachers/behind-ai
          </a>
          .{' '}
          <Link href="/resources" className="underline hover:text-foreground">
            {t('impressum.copyrightResources')}
          </Link>
          .
        </p>
      </section>

      <Separator />

      {/* Stand */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">{t('impressum.statusTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('impressum.statusBody')}</p>
      </section>

      <nav className="border-t pt-6">
        <Link href="/">
          <Button variant="outline">
            <span aria-hidden="true">←</span> {t('impressum.backBtn')}
          </Button>
        </Link>
      </nav>
    </div>
  )
}

function DataCard({
  icon,
  title,
  tone = 'default',
  children,
}: {
  icon: React.ReactNode
  title: string
  tone?: 'default' | 'accent'
  children: React.ReactNode
}) {
  return (
    <div
      className={
        'rounded-xl border bg-card p-4 ' +
        (tone === 'accent' ? 'border-primary/40 sm:col-span-2' : '')
      }
    >
      <div className="mb-1.5 flex items-center gap-2 font-medium text-primary">
        {icon}
        {title}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
