/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PresenterPanel } from '@/components/live/presenter-panel'
import { NextTokenPrediction } from '@/components/visualizations/next-token-prediction'
import { TokenizationVisualization } from '@/components/visualizations/tokenization-visualization'

// ---------------------------------------------------------------------------
// Inhalte des Referats «KI verstehen, einordnen, verantwortungsvoll nutzen»
// (Schulen Baar, 16.09.2026, 08:15–09:15, ca. 300–350 Lehrpersonen).
//
// Jede Folie kann Einblendungen haben (steps): Die Pfeiltaste rückt zuerst
// durch die Steps, dann zur nächsten Folie. `notes` sind Sprechnotizen
// (Taste N). Die Live-Experimente werden über das PresenterPanel gesteuert,
// das Publikum ist auf behind-ai.ch/live verbunden.
// ---------------------------------------------------------------------------

export interface SlideDef {
  id: string
  block: string
  steps?: number
  notes?: string
  render: (step: number) => ReactNode
}

// ------------------------------ Bausteine -----------------------------------

/** Einblendung: erscheint ab Step `at`, Platz bleibt reserviert (ruhiges Layout). */
function Step({
  at,
  step,
  children,
  className,
}: {
  at: number
  step: number
  children: ReactNode
  className?: string
}) {
  const visible = step >= at
  return (
    <div
      className={cn(
        'transition-all duration-500',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
        className,
      )}
      aria-hidden={!visible}
    >
      {children}
    </div>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary md:text-base">
      {children}
    </p>
  )
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        'text-4xl font-bold leading-tight tracking-tight md:text-6xl',
        className,
      )}
    >
      {children}
    </h2>
  )
}

function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('mt-4 text-xl text-muted-foreground md:text-3xl', className)}>
      {children}
    </p>
  )
}

function Bullets({ items, step, from = 0, className }: {
  items: ReactNode[]
  step?: number
  from?: number
  className?: string
}) {
  return (
    <ul className={cn('mt-8 space-y-4', className)}>
      {items.map((item, i) => {
        const content = (
          <li key={i} className="flex items-start gap-4 text-xl leading-snug md:text-3xl">
            <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary md:mt-3.5" />
            <span>{item}</span>
          </li>
        )
        if (step === undefined) return content
        return (
          <Step key={i} at={from + i} step={step}>
            {content}
          </Step>
        )
      })}
    </ul>
  )
}

/** Grosser QR-Block mit Kurz-URL – auf jeder interaktiven Folie. */
function QrBadge({
  src,
  url,
  size = 'lg',
}: {
  src: string
  url: string
  size?: 'lg' | 'xl'
}) {
  const px = size === 'xl' ? 'w-56 md:w-72' : 'w-40 md:w-52'
  return (
    <div className="flex shrink-0 flex-col items-center gap-3">
      <div className={cn('rounded-2xl border bg-white p-3 shadow-sm md:p-4', px)}>
        <img src={src} alt={`QR-Code für ${url}`} className="h-auto w-full" />
      </div>
      <span className="rounded-lg bg-primary px-3 py-1.5 font-mono text-base font-semibold text-primary-foreground md:text-xl">
        {url}
      </span>
    </div>
  )
}

/** Container für eingebettete behind-ai-Experimente. */
function Embed({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mt-6 max-h-[62vh] overflow-y-auto rounded-xl border bg-card p-4 md:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Tokenizer mit eigener Eingabe (wie auf /tokenization, kompakt für die Folie). */
function TokenizerEmbed() {
  const [input, setInput] = useState('Weiterbildungstag Schulen Baar')
  const [text, setText] = useState('')
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setText(input)}
          placeholder="Name oder Fachwort eingeben …"
          className="text-lg"
        />
        <Button onClick={() => setText(input)} disabled={!input.trim()}>
          Tokenisieren
        </Button>
      </div>
      {text && <TokenizationVisualization text={text} />}
    </div>
  )
}

// ------------------------------- Folien -------------------------------------

const B0 = 'Einstieg'
const B1 = 'Funktionsweise'
const B2 = 'Nutzen & Grenzen'
const B3 = 'Ethik & Datenschutz'
const B4 = 'Unterricht'
const B5 = 'Abschluss'

export const slides: SlideDef[] = [
  // ------------------------------------------------------------- Block 0
  {
    id: 'titel',
    block: B0,
    notes:
      'Begrüssung. Min. 0–5: Hook. Heute kein Prompt-Katalog – wir schauen unter die Haube. Handy bereithalten lassen.',
    render: () => (
      <div>
        <Kicker>Weiterbildung Schulen Baar · 16. September 2026</Kicker>
        <Title>
          KI verstehen, einordnen,
          <br />
          verantwortungsvoll nutzen
        </Title>
        <Lede>Ein interaktives Referat – Ihr Smartphone ist Ihr Labor.</Lede>
        <p className="mt-12 text-lg text-muted-foreground md:text-2xl">
          Thomas Zurfluh ·{' '}
          <span className="font-mono text-primary">behind-ai.ch</span>
        </p>
      </div>
    ),
  },
  {
    id: 'leitidee',
    block: B0,
    steps: 1,
    notes:
      '«Give a man a fish …» – Prompts veralten, das Prinzip bleibt. Copilot, fobizz, SchuBa – und was in zwei Jahren kommt.',
    render: (step) => (
      <div>
        <Title>Heute lernen Sie keine fünf Prompts.</Title>
        <Step at={1} step={step}>
          <Lede className="mt-8">
            Wer versteht, wie ein Sprachmodell funktioniert, kann{' '}
            <strong className="text-foreground">jedes</strong> KI-Tool einordnen
            – Copilot, fobizz, SchuBa … und was in zwei Jahren kommt.
          </Lede>
        </Step>
      </div>
    ),
  },
  {
    id: 'handzeichen',
    block: B0,
    steps: 2,
    notes:
      'Niederschwelliger Einstieg per Handzeichen. Bei der letzten Frage auflösen: Spamfilter, Autokorrektur, Karten-App – alle nutzen KI.',
    render: (step) => (
      <div>
        <Kicker>Kurze Umfrage – Hand hoch</Kicker>
        <div className="space-y-8">
          <Title className="text-3xl md:text-5xl">
            Wer hat diese Woche KI genutzt?
          </Title>
          <Step at={1} step={step}>
            <Title className="text-3xl md:text-5xl">Wer heute schon?</Title>
          </Step>
          <Step at={2} step={step}>
            <Title className="text-3xl text-muted-foreground md:text-5xl">
              Wer ist sich nicht sicher?
            </Title>
          </Step>
        </div>
      </div>
    ),
  },
  {
    id: 'live-1',
    block: B0,
    notes:
      'Live-Experiment 1 (Min. 2–8): Satzanfang starten, Publikum tippt das nächste Wort. «Auszählen» klicken, ein Wort übernehmen, 4–5 Runden. Der Saal IST das Sprachmodell.',
    render: () => (
      <div>
        <Kicker>Live-Experiment</Kicker>
        <Title className="text-3xl md:text-5xl">
          Sie sind jetzt das Sprachmodell.
        </Title>
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <p className="mb-4 text-lg text-muted-foreground md:text-2xl">
              Tippen Sie auf Ihrem Handy das Wort ein, das{' '}
              <strong className="text-foreground">als Nächstes</strong> kommt.
            </p>
            <PresenterPanel defaultPrompt="Die Schulen Baar sind bekannt für ihre" />
          </div>
          <QrBadge src="/qr/live.svg" url="behind-ai.ch/live" size="xl" />
        </div>
      </div>
    ),
  },
  {
    id: 'echtes-modell',
    block: B0,
    notes:
      'Dieselbe Aufgabe, echtes Modell mit echten Wahrscheinlichkeiten (Gemini-Logprobs). Es hat nichts anderes gemacht als der Saal – nur mit Milliarden Sätzen geübt.',
    render: () => (
      <div>
        <Kicker>Dieselbe Aufgabe – das echte Modell</Kicker>
        <Title className="text-3xl md:text-5xl">
          So rät ein Sprachmodell.
        </Title>
        <Embed>
          <NextTokenPrediction text="Die Schulen Baar sind bekannt für ihre" />
        </Embed>
      </div>
    ),
  },
  {
    id: 'kernbotschaft-prinzip',
    block: B0,
    steps: 1,
    notes:
      'Kernbotschaft platzieren und stehen lassen. Alles, was heute folgt – Stärken wie Schwächen – ergibt sich aus diesem einen Prinzip.',
    render: (step) => (
      <div className="text-center">
        <Title className="md:text-7xl">
          Ein Sprachmodell rät
          <br />
          Wort für Wort
          <br />
          <span className="text-primary">das Wahrscheinlichste.</span>
        </Title>
        <Step at={1} step={step}>
          <Lede className="mt-10">
            Kein Nachschlagen, kein Plan, keine Absicht.
            <br />
            Alles, was heute folgt, ergibt sich aus diesem Prinzip.
          </Lede>
        </Step>
      </div>
    ),
  },

  // ------------------------------------------------------------- Block 1
  {
    id: 'tokenization',
    block: B1,
    notes:
      'Smartphone-Experiment (Min. 5–20): eigenen Namen oder ein Fachwort tokenisieren. Aha: Das Modell rechnet nicht mit Wörtern, sondern mit Zahlen für häufige Buchstabengruppen.',
    render: () => (
      <div>
        <Kicker>Experiment auf Ihrem Handy</Kicker>
        <Title className="text-3xl md:text-5xl">
          Womit rechnet das Modell? Tokenisieren Sie Ihren Namen.
        </Title>
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <Embed className="mt-0">
              <TokenizerEmbed />
            </Embed>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Kein Wort, keine Bedeutung – nur{' '}
              <strong className="text-foreground">Nummern für häufige
              Buchstabengruppen</strong>.
            </p>
          </div>
          <QrBadge src="/qr/tokenization.svg" url="behind-ai.ch/tokenization" />
        </div>
      </div>
    ),
  },
  {
    id: 'next-token',
    block: B1,
    notes:
      'Smartphone-Experiment: Kontext variieren, Wahrscheinlichkeiten kippen sehen. Beamer-Beispiel «Die Hauptstadt von Frankreich heisst» zeigt: Wenn das Modell etwas «weiss», ist EIN Balken riesig – das brauchen wir später beim Halluzinieren wieder.',
    render: () => (
      <div>
        <Kicker>Experiment auf Ihrem Handy</Kicker>
        <Title className="text-3xl md:text-5xl">
          Ändern Sie den Kontext – die Wahrscheinlichkeiten kippen.
        </Title>
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <Embed className="mt-0">
              <NextTokenPrediction text="Die Hauptstadt von Frankreich heisst" />
            </Embed>
          </div>
          <QrBadge src="/qr/next-token.svg" url="behind-ai.ch/next-token" />
        </div>
      </div>
    ),
  },
  {
    id: 'training-inferenz',
    block: B1,
    steps: 2,
    notes:
      'Woher «weiss» das Modell das? Training: Monate, Milliarden Texte, Millionenkosten – dabei werden nur Zahlen (Gewichte) eingestellt. Danach ist alles eingefroren: Ihr Chat schlägt nirgends nach. Vertiefung mit Mini-Training auf behind-ai.ch/training.',
    render: (step) => (
      <div>
        <Kicker>Woher «weiss» es das?</Kicker>
        <Title className="text-3xl md:text-5xl">Training vs. Anwendung</Title>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Step at={0} step={step}>
            <div className="h-full rounded-xl border bg-card p-6">
              <h3 className="text-2xl font-bold text-primary md:text-3xl">
                Training <span className="font-normal text-muted-foreground">· einmal</span>
              </h3>
              <ul className="mt-4 space-y-3 text-lg md:text-2xl">
                <li>Milliarden Sätze, immer dieselbe Übung: nächstes Wort raten</li>
                <li>Bei jedem Fehler werden Milliarden Zahlen («Gewichte») leicht verstellt</li>
                <li>Monate Rechenzeit, Millionen Franken</li>
              </ul>
            </div>
          </Step>
          <Step at={1} step={step}>
            <div className="h-full rounded-xl border bg-card p-6">
              <h3 className="text-2xl font-bold text-[hsl(var(--chart-2))] md:text-3xl">
                Anwendung <span className="font-normal text-muted-foreground">· Ihr Chat</span>
              </h3>
              <ul className="mt-4 space-y-3 text-lg md:text-2xl">
                <li>Die Gewichte sind eingefroren</li>
                <li>Kein Nachschlagen, keine Datenbank</li>
                <li>Nur noch: raten, raten, raten – mit Ihrem Text als Kontext</li>
              </ul>
            </div>
          </Step>
        </div>
        <Step at={2} step={step}>
          <div className="mt-6 flex items-center justify-between gap-6 rounded-xl border bg-muted/40 p-5">
            <p className="text-lg md:text-2xl">
              Das «Wissen» steckt <strong>verdichtet in Zahlen</strong> – wie
              Erfahrung, nicht wie ein Lexikon. Selbst ausprobieren:
            </p>
            <span className="shrink-0 font-mono text-base text-primary md:text-xl">
              behind-ai.ch/training
            </span>
          </div>
        </Step>
      </div>
    ),
  },
  {
    id: 'begriffe',
    block: B1,
    notes:
      'Brücke zum KI-Campus (Ausgabe 35/2026), Glossar S. 5: gleiche Begriffe, gemeinsame Sprache der Schulen Baar. Diese vier Begriffe kommen in Workshop 1 wieder.',
    render: () => (
      <div>
        <Kicker>Gemeinsame Sprache – KI-Campus, Glossar S. 5</Kicker>
        <Title className="text-3xl md:text-5xl">
          Vier Begriffe, die heute immer wieder kommen
        </Title>
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
            {[
              ['Sprachmodell', 'rät Wort für Wort das Wahrscheinlichste'],
              ['Token', 'Zahlen für häufige Buchstabengruppen'],
              ['Training', 'Gewichte einstellen – einmal, teuer'],
              ['Kontext', 'alles, was das Modell gerade «sieht»'],
            ].map(([term, def]) => (
              <div key={term} className="rounded-xl border bg-card p-5">
                <div className="text-xl font-bold text-primary md:text-2xl">
                  {term}
                </div>
                <div className="mt-1 text-base text-muted-foreground md:text-xl">
                  {def}
                </div>
              </div>
            ))}
          </div>
          <QrBadge src="/qr/glossary.svg" url="behind-ai.ch/glossary" />
        </div>
      </div>
    ),
  },

  // ------------------------------------------------------------- Block 2
  {
    id: 'live-2',
    block: B2,
    notes:
      'Live-Experiment 2 (Min. 20–33): Jetzt ein FAKT statt Kreativsatz. Der Saal produziert selbstbewusst eine Zahl – niemand weiss sie. Ein Wort übernehmen und weiterfahren. Danach: Das Modell macht exakt dasselbe.',
    render: () => (
      <div>
        <Kicker>Live-Experiment – diesmal ein Fakt</Kicker>
        <Title className="text-3xl md:text-5xl">
          Der Saal als Faktenmaschine
        </Title>
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <PresenterPanel defaultPrompt="Alle Schülerinnen und Schüler der Schulen Baar zusammengezählt sind es genau" />
          </div>
          <QrBadge src="/qr/live.svg" url="behind-ai.ch/live" />
        </div>
      </div>
    ),
  },
  {
    id: 'halluzination',
    block: B2,
    steps: 1,
    notes:
      'Begriff einführen: Halluzination. Vorhin bei «Paris»: EIN Balken riesig. Bei der Schülerzahl: flache Verteilung – das Modell rät trotzdem und formuliert es gleich selbstsicher. Es merkt selbst nicht, ob es weiss oder rät. Vertiefung: behind-ai.ch/hallucinations.',
    render: (step) => (
      <div>
        <Kicker>Der Fachbegriff dazu</Kicker>
        <Title>
          Halluzination:
          <br />
          <span className="text-primary">
            selbstsicher raten, ohne es zu merken
          </span>
        </Title>
        <Bullets
          step={step}
          from={0}
          items={[
            <>
              Das Modell tut genau das, wofür es gebaut wurde:{' '}
              <strong>plausibel weiterraten</strong> – auch wenn es die Antwort
              nicht kennt
            </>,
            <>
              «Weiss» es etwas, ist <strong>ein Balken riesig</strong> (Paris).
              Rät es, ist die Verteilung <strong>flach</strong> – klingt aber
              genau gleich überzeugend
            </>,
          ]}
        />
        <div className="mt-8 flex items-center gap-4">
          <span className="font-mono text-base text-primary md:text-xl">
            behind-ai.ch/hallucinations
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'gegenmittel',
    block: B2,
    steps: 3,
    notes:
      'Was tun die Anbieter dagegen? Nachschlagen statt raten: Internetsuche, Dokumente, Memory – Fundstellen landen im Kontext (RAG). ABER: Das Modell rät weiter – jetzt halt über den Fundstellen. Falsch gefunden = falsch geantwortet. Prüfen bleibt bei uns.',
    render: (step) => (
      <div>
        <Kicker>Und was tun die Anbieter dagegen?</Kicker>
        <Title className="text-3xl md:text-5xl">
          Nachschlagen statt raten – Werkzeuge fürs Modell
        </Title>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Internetsuche', 'aktuelle Quellen in den Kontext holen'],
            ['Eigene Dokumente', 'Ihre Unterlagen als Grundlage (RAG)'],
            ['Memory & Werkzeuge', 'Notizen, Rechner, Code ausführen'],
          ].map(([term, def], i) => (
            <Step key={term} at={i} step={step}>
              <div className="h-full rounded-xl border bg-card p-5">
                <div className="text-xl font-bold md:text-2xl">{term}</div>
                <div className="mt-1 text-base text-muted-foreground md:text-lg">
                  {def}
                </div>
              </div>
            </Step>
          ))}
        </div>
        <Step at={3} step={step}>
          <div className="mt-8 rounded-xl border-l-4 border-primary bg-muted/40 p-5">
            <p className="text-xl md:text-2xl">
              Hilft enorm – aber das Modell <strong>rät weiterhin</strong>, jetzt
              über den Fundstellen. Die Antwort ist nur so gut wie das, was es
              findet.{' '}
              <span className="font-mono text-primary">behind-ai.ch/rag</span>
            </p>
          </div>
        </Step>
      </div>
    ),
  },
  {
    id: 'produktivitaet',
    block: B2,
    steps: 1,
    notes:
      'Produktivitätsfrage ehrlich stellen. Dossier in Minuten – toll. Aber wenn 5 % erfunden sind und niemand es merkt? Der Zeitgewinn wandert in die Prüfpflicht. Verantwortung bleibt bei der Lehrperson.',
    render: (step) => (
      <div>
        <Title>
          KI schreibt ein ganzes Dossier
          <br />
          in drei Minuten.
        </Title>
        <Step at={1} step={step}>
          <Lede className="mt-8">
            Was bedeutet das, wenn <strong className="text-foreground">5 %</strong>{' '}
            davon erfunden sind –{' '}
            <strong className="text-foreground">und niemand es merkt?</strong>
          </Lede>
        </Step>
      </div>
    ),
  },
  {
    id: 'offloading',
    block: B2,
    steps: 1,
    notes:
      'Cognitive Offloading (Begriff aus dem KI-Campus): Was passiert mit eigenen Fähigkeiten, wenn wir das Denken auslagern? OECD Digital Education Outlook 2026. Dazu «Zwei Geschwindigkeiten» aus dem KI-Campus: Silicon-Valley-Versprechen vs. Schulrealität – gesunde Skepsis ist professionell, nicht rückständig.',
    render: (step) => (
      <div>
        <Kicker>Zwei Fragen an uns selbst</Kicker>
        <div className="space-y-10">
          <div>
            <Title className="text-3xl md:text-5xl">
              Was passiert mit unseren Fähigkeiten, wenn wir das Denken auslagern?
            </Title>
            <p className="mt-3 text-lg text-muted-foreground md:text-xl">
              «Cognitive Offloading» – KI-Campus · OECD Digital Education
              Outlook 2026
            </p>
          </div>
          <Step at={1} step={step}>
            <Title className="text-3xl md:text-5xl">
              Und: Wessen Tempo übernehmen wir?
            </Title>
            <p className="mt-3 text-lg text-muted-foreground md:text-xl">
              «Zwei Geschwindigkeiten»: Silicon-Valley-Versprechen vs.
              Schulrealität – gesunde Skepsis ist eine professionelle Haltung
            </p>
          </Step>
        </div>
      </div>
    ),
  },
  {
    id: 'rechenleistung',
    block: B2,
    steps: 3,
    notes:
      'Die Maschine hinter der Maschine: Grosse Modelle laufen in Rechenzentren – Strom, Wasser, Chips. Leistung kostet: 20 vs. 200 CHF Abos; Firmen zahlen teils mehr für KI-Nutzung als für Löhne. Kleine Modelle sind nicht vergleichbar leistungsfähig – aber das ändert sich rasant. Und: Auch die grössten Modelle halluzinieren, ohne es zu merken.',
    render: (step) => (
      <div>
        <Kicker>Die Maschine hinter der Maschine</Kicker>
        <Title className="text-3xl md:text-5xl">
          Intelligenz ist nicht gratis
        </Title>
        <Bullets
          step={step}
          from={0}
          items={[
            <>
              Grosse Modelle laufen in <strong>Rechenzentren</strong>: Strom,
              Wasser, Spezialchips – mit Folgen für Umwelt und Klima
            </>,
            <>
              Leistung hat ihren Preis: Abos von <strong>20 bis 200+ CHF</strong>{' '}
              pro Monat – wer zahlt, bekommt das bessere Modell.{' '}
              <strong>Chancengleichheit?</strong>
            </>,
            <>
              Und trotzdem: Auch die <strong>grössten Modelle halluzinieren</strong>,
              ohne es zu merken – nur seltener und überzeugender
            </>,
          ]}
        />
        <Step at={3} step={step}>
          <p className="mt-8 text-lg text-muted-foreground md:text-2xl">
            Alles daran ändert sich rasant – das Prinzip dahinter nicht.
          </p>
        </Step>
      </div>
    ),
  },

  // ------------------------------------------------------------- Block 3
  {
    id: 'bias-gedanken',
    block: B3,
    steps: 4,
    notes:
      'Gedankenexperiment (Min. 33–45): Augen zu, Bild vorstellen. Fragen langsam einblenden, Pausen lassen. Noch NICHT auflösen.',
    render: (step) => (
      <div className="text-center">
        <Kicker>Stellen Sie sich das Bild vor</Kicker>
        <Title className="md:text-6xl">
          «Eine Person, die eine Wohnung putzt.»
        </Title>
        <div className="mt-10 space-y-3 text-xl text-muted-foreground md:text-3xl">
          <Step at={1} step={step}>Wie sieht die Person aus?</Step>
          <Step at={2} step={step}>Was trägt sie?</Step>
          <Step at={3} step={step}>Wie ist die Wohnung eingerichtet?</Step>
          <Step at={4} step={step}>Wie ist das Wetter?</Step>
        </div>
      </div>
    ),
  },
  {
    id: 'bias-putzen',
    block: B3,
    steps: 1,
    notes:
      'Auflösung: Ideogram, vier Versuche, gleicher Prompt. Immer: junge Frau, helle Wohnung, Sonne, Zimmerpflanzen. Frage in den Saal: Was fällt auf? Wen sehen wir NIE?',
    render: (step) => (
      <div>
        <Kicker>So sieht es der Bildgenerator (Ideogram, 4 Versuche)</Kicker>
        <img
          src="/slides/bias-putzen.jpg"
          alt="Vier KI-generierte Bilder zum Prompt «Eine Person, die eine Wohnung putzt» – alle zeigen junge Frauen in hellen, sonnigen Wohnungen"
          className="mt-4 w-full rounded-xl border"
        />
        <Step at={1} step={step}>
          <Lede className="mt-8 text-center">
            Was fällt auf? <strong className="text-foreground">Wen sehen wir nie?</strong>
          </Lede>
        </Step>
      </div>
    ),
  },
  {
    id: 'bias-buero',
    block: B3,
    steps: 1,
    notes:
      'Zweites Beispiel, gleiche Mechanik: Büro hoch über der Stadt, prüft und unterschreibt wichtige Dokumente. Erst vorstellen lassen, dann aufdecken.',
    render: (step) => (
      <div>
        <Kicker>Zweiter Versuch</Kicker>
        <Title className="text-3xl md:text-5xl">
          «Jemand in einem Büro hoch über der Stadt prüft Unterlagen und
          unterschreibt wichtige Dokumente.»
        </Title>
        <Step at={1} step={step}>
          <img
            src="/slides/bias-unterlagen.jpg"
            alt="Vier KI-generierte Bilder zum Prompt «Jemand in einem Büro hoch über der Stadt prüft Unterlagen und unterschreibt wichtige Dokumente»"
            className="mt-6 w-full rounded-xl border"
          />
        </Step>
      </div>
    ),
  },
  {
    id: 'bias-daten',
    block: B3,
    steps: 2,
    notes:
      'Bias kommt aus den Trainingsdaten – Millionen Bilder und Texte, in denen Putzen weiblich und Unterschreiben männlich ist. Gilt für Text genauso. Lässt sich nicht einfach «rausrechnen». Bezug Baarer Grundsatz Chancengleichheit: Wer profitiert, wer wird abgehängt? Vertiefung: behind-ai.ch/bias (Berufe↔Geschlecht live in echten Embeddings).',
    render: (step) => (
      <div>
        <Kicker>Woher kommt das?</Kicker>
        <Title className="text-3xl md:text-5xl">
          Der Bias steckt in den Daten – nicht im «Charakter» der KI
        </Title>
        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <Bullets
              step={step}
              from={0}
              items={[
                <>
                  Trainiert auf Millionen Texten und Bildern von uns –{' '}
                  <strong>inklusive unserer Schieflagen</strong>. Das gilt für
                  Text genauso wie für Bilder
                </>,
                <>
                  Und es lässt sich <strong>nicht einfach rausrechnen</strong> –
                  die Muster stecken tief in den Gewichten
                </>,
                <>
                  Chancengleichheit (Grundsatz KI-Campus):{' '}
                  <strong>Wer profitiert von KI – und wer wird abgehängt?</strong>
                </>,
              ]}
            />
          </div>
          <QrBadge src="/qr/bias.svg" url="behind-ai.ch/bias" />
        </div>
      </div>
    ),
  },
  {
    id: 'datenschutz',
    block: B3,
    steps: 3,
    notes:
      'Datenschutz konkret, kantonal verankert: Leitfaden Kanton Zug (2026) + Grundsatz Datenschutz im KI-Campus. Merksatz: Was Sie eintippen, verlässt die Schule. Die Ampel wird in den Workshops vertieft.',
    render: (step) => (
      <div>
        <Kicker>Datenschutz – Leitfaden Kanton Zug (2026)</Kicker>
        <Title className="text-3xl md:text-5xl">
          Was darf in welches Tool? Die Ampel.
        </Title>
        <div className="mt-8 space-y-4">
          <Step at={0} step={step}>
            <div className="flex items-center gap-5 rounded-xl border border-green-600/40 bg-green-500/10 p-5">
              <span className="h-6 w-6 shrink-0 rounded-full bg-green-500" />
              <p className="text-lg md:text-2xl">
                <strong>Ohne Personenbezug:</strong> Arbeitsblätter, Ideen,
                Texte ohne Namen – unproblematisch
              </p>
            </div>
          </Step>
          <Step at={1} step={step}>
            <div className="flex items-center gap-5 rounded-xl border border-yellow-600/40 bg-yellow-500/10 p-5">
              <span className="h-6 w-6 shrink-0 rounded-full bg-yellow-500" />
              <p className="text-lg md:text-2xl">
                <strong>Personendaten:</strong> nur in von der Schule
                freigegebene, vertraglich geregelte Tools
              </p>
            </div>
          </Step>
          <Step at={2} step={step}>
            <div className="flex items-center gap-5 rounded-xl border border-red-600/40 bg-red-500/10 p-5">
              <span className="h-6 w-6 shrink-0 rounded-full bg-red-500" />
              <p className="text-lg md:text-2xl">
                <strong>Besonders schützenswerte Daten</strong> (Gesundheit,
                Leistung, Familie): nie in freie KI-Tools
              </p>
            </div>
          </Step>
        </div>
        <Step at={3} step={step}>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Merksatz: Was Sie eintippen, verlässt die Schule. – Wird in den
            Workshops vertieft.
          </p>
        </Step>
      </div>
    ),
  },
  {
    id: 'verantwortung',
    block: B3,
    steps: 1,
    notes:
      'Verantwortung: KI-Output ist ein Entwurf, keine Entscheidung. Zeugnisse, Elterngespräche, Beurteilungen – die pädagogische und rechtliche Verantwortung ist nicht delegierbar.',
    render: (step) => (
      <div className="text-center">
        <Title className="md:text-7xl">
          KI-Output ist ein <span className="text-primary">Entwurf</span>,
          <br />
          keine Entscheidung.
        </Title>
        <Step at={1} step={step}>
          <Lede className="mt-10">
            Die pädagogische und rechtliche Verantwortung
            <br />
            ist <strong className="text-foreground">nicht delegierbar</strong>.
          </Lede>
        </Step>
      </div>
    ),
  },

  // ------------------------------------------------------------- Block 4
  {
    id: 'lernen-pruefen',
    block: B4,
    steps: 1,
    notes:
      'Min. 45–55. Lernen vs. Prüfen (KI-Campus): Der Antwortautomat erledigt die Aufgabe – und untergräbt das Lernen. Der sokratische Tutor stellt Fragen, gibt Hinweise, lässt denken. Gleiche Technik, andere Inszenierung. Grafiken aus dem KI-Campus dazu zeigen/erwähnen.',
    render: (step) => (
      <div>
        <Kicker>Pädagogik – wann hilft KI beim Lernen?</Kicker>
        <Title className="text-3xl md:text-5xl">
          Antwortautomat oder sokratischer Tutor?
        </Title>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-2xl font-bold md:text-3xl">Antwortautomat</h3>
            <ul className="mt-4 space-y-3 text-lg text-muted-foreground md:text-2xl">
              <li>löst die Aufgabe – sofort und fertig</li>
              <li>das Denken passiert in der Maschine</li>
              <li>beim Prüfen: Ergebnis ohne Kompetenz</li>
            </ul>
          </div>
          <Step at={1} step={step}>
            <div className="h-full rounded-xl border border-primary/50 bg-primary/5 p-6">
              <h3 className="text-2xl font-bold text-primary md:text-3xl">
                Sokratischer Tutor
              </h3>
              <ul className="mt-4 space-y-3 text-lg text-muted-foreground md:text-2xl">
                <li>fragt zurück, gibt Hinweise, lässt üben</li>
                <li>das Denken bleibt bei den Lernenden</li>
                <li>gleiche Technik – andere Inszenierung</li>
              </ul>
            </div>
          </Step>
        </div>
      </div>
    ),
  },
  {
    id: 'zwei-rollen',
    block: B4,
    steps: 1,
    notes:
      'Zwei Rollen der Lehrperson: 1) KI als Werkzeug für die eigene Arbeit – Planung, Material, Differenzierung, Kommunikation (Workshops heute). 2) KI als Unterrichtsgegenstand – mit den Lernenden verstehen, was da rät (Lebenswelt-Grundsatz).',
    render: (step) => (
      <div>
        <Kicker>Ihre zwei Rollen</Kicker>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-2xl font-bold md:text-3xl">
              KI als <span className="text-primary">Werkzeug</span>
            </h3>
            <p className="mt-2 text-base text-muted-foreground md:text-xl">
              für die eigene Arbeit
            </p>
            <ul className="mt-4 space-y-3 text-lg md:text-2xl">
              <li>Planung & Vorbereitung</li>
              <li>Material & Differenzierung</li>
              <li>Kommunikation</li>
            </ul>
          </div>
          <Step at={1} step={step}>
            <div className="h-full rounded-xl border bg-card p-6">
              <h3 className="text-2xl font-bold md:text-3xl">
                KI als <span className="text-[hsl(var(--chart-2))]">Unterrichtsgegenstand</span>
              </h3>
              <p className="mt-2 text-base text-muted-foreground md:text-xl">
                mit den Lernenden
              </p>
              <ul className="mt-4 space-y-3 text-lg md:text-2xl">
                <li>verstehen, was da eigentlich rät</li>
                <li>Ergebnisse prüfen und hinterfragen</li>
                <li>Teil ihrer Lebenswelt ernst nehmen</li>
              </ul>
            </div>
          </Step>
        </div>
      </div>
    ),
  },

  // ------------------------------------------------------------- Block 5
  {
    id: 'kernbotschaften',
    block: B5,
    steps: 2,
    notes:
      'Min. 55–60. Die drei Botschaften ruhig und einzeln setzen – das ist das Mitnehmsel des Morgens.',
    render: (step) => (
      <div>
        <Kicker>Drei Dinge zum Mitnehmen</Kicker>
        <ol className="mt-6 space-y-8">
          {[
            <>
              Sprachmodelle sind{' '}
              <strong className="text-primary">Wahrscheinlichkeitsmaschinen</strong>,
              keine Wissensdatenbanken.
            </>,
            <>
              Wer das <strong className="text-primary">Prinzip</strong> versteht,
              kann jedes Tool einschätzen – auch künftige.
            </>,
            <>
              <strong className="text-primary">Nutzen und Prüfen</strong> gehören
              zusammen – die Verantwortung bleibt bei uns.
            </>,
          ].map((msg, i) => (
            <Step key={i} at={i} step={step}>
              <li className="flex items-start gap-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground md:h-14 md:w-14 md:text-3xl">
                  {i + 1}
                </span>
                <span className="pt-1 text-2xl leading-snug md:text-4xl">{msg}</span>
              </li>
            </Step>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: 'abschluss',
    block: B5,
    notes:
      'behind-ai.ch bleibt online: alle Experimente von heute plus Glossar – zum Vertiefen und für den Unterricht. Überleitung zu Stefan Huber und Sarah Hotz (Tagesziele, Organisation). Danke!',
    render: () => (
      <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <Kicker>Zum Vertiefen – heute und danach</Kicker>
          <Title className="text-3xl md:text-5xl">
            Alle Experimente bleiben online.
          </Title>
          <Lede>
            Tokens, Training, Halluzinationen, Bias, Glossar –
            <br />
            alles zum Selbst-Ausprobieren und für den Unterricht.
          </Lede>
          <p className="mt-10 text-lg text-muted-foreground md:text-2xl">
            Danke! – Weiter geht&rsquo;s mit Stefan Huber und Sarah Hotz.
          </p>
        </div>
        <QrBadge src="/qr/site.svg" url="behind-ai.ch" size="xl" />
      </div>
    ),
  },
]
