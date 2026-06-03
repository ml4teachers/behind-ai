'use client'

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from '@/lib/i18n/use-translations'

interface TokenizationVisualizationProps {
  text: string
}

interface TokenData {
  id: number
  token: string
}

// Whitespace sichtbar machen, damit die Chips lesbar bleiben: Leerzeichen
// gehören in der BPE-Tokenisierung oft mit zum Token (z. B. „ der").
function TokenLabel({ value }: { value: string }) {
  const parts = value.split(/(\s)/).filter((p) => p !== '')
  return (
    <span className="whitespace-pre">
      {parts.map((p, i) =>
        /\s/.test(p) ? (
          <span key={i} className="opacity-40">
            {p === '\n' ? '↵' : '·'}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  )
}

export function TokenizationVisualization({ text }: TokenizationVisualizationProps) {
  const t = useTranslations()
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [showIds, setShowIds] = useState(false)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setShowIds(false)

    fetch('/api/tokenize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('tokenize request failed')
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        return data.tokens as TokenData[]
      })
      .then((toks) => {
        if (cancelled) return
        setTokens(toks)
        setStatus('ready')
        // Token-IDs kurz nach den Tokens einblenden – die Zahlen sind der Kern.
        setTimeout(() => {
          if (!cancelled) setShowIds(true)
        }, 600)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Tokenisierung fehlgeschlagen:', err)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [text])

  if (status === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-center text-destructive">
          <p className="mb-1 font-semibold">{t('tokenization.viz.errorTitle')}</p>
          <p className="text-sm">{t('tokenization.viz.errorBody')}</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">{t('tokenization.viz.loading')}</p>
        <div className="flex max-w-md flex-wrap justify-center gap-2">
          {Array.from({ length: Math.min(10, Math.max(3, Math.ceil(text.length / 4))) }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-14" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5">
      {/* Eine Token-Ansicht: so zerlegt das Modell den Text in Bausteine. */}
      <div className="w-full max-w-2xl">
        <div className="mb-2 text-center text-sm font-medium text-muted-foreground">
          {t('tokenization.viz.tokensTitle')}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {tokens.map((token, i) => (
            <button
              key={`tok-${i}`}
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                active === i
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15'
              }`}
            >
              <TokenLabel value={token.token} />
            </button>
          ))}
        </div>
      </div>

      {/* Übergang zu den Zahlen */}
      <div
        className={`text-xl leading-none text-muted-foreground transition-opacity duration-500 ${
          showIds ? 'opacity-100' : 'opacity-20'
        }`}
        aria-hidden="true"
      >
        ↓
      </div>

      {/* Token-IDs: das, was das Modell wirklich verarbeitet. */}
      <div
        className={`w-full max-w-2xl transition-opacity duration-500 ${
          showIds ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="mb-2 text-center text-sm font-medium text-muted-foreground">
          {t('tokenization.viz.idsTitle')}
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {tokens.map((token, i) => (
            <button
              key={`id-${i}`}
              type="button"
              tabIndex={showIds ? 0 : -1}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`rounded-md border px-2.5 py-1 font-mono text-sm transition-colors ${
                active === i
                  ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                  : 'border bg-secondary text-secondary-foreground hover:bg-secondary/70'
              }`}
            >
              {token.id}
            </button>
          ))}
        </div>
      </div>

      {/* Anzahl */}
      <p
        className={`text-center text-sm text-muted-foreground transition-opacity duration-500 ${
          showIds ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="font-semibold text-foreground">
          {tokens.length} {t('tokenization.viz.tokensWord')}
        </span>{' '}
        {t('tokenization.viz.from')} {[...text].length} {t('tokenization.viz.chars')}
      </p>
    </div>
  )
}
