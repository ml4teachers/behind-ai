'use client'

import { motion } from 'framer-motion'

export interface WordCountItem {
  word: string
  count: number
}

interface WordDistributionProps {
  results: WordCountItem[]
  /** Eigenes Wort hervorheben (Publikumssicht). */
  highlight?: string
  /** Klick auf einen Balken (Presenter: Wort übernehmen). */
  onSelect?: (word: string) => void
  /** Gerade übernommenes/ausgewähltes Wort markieren. */
  selected?: string | null
  maxBars?: number
  /** Kompakte Darstellung fürs Smartphone. */
  compact?: boolean
}

// Verteilung der Publikums-Antworten, bewusst im gleichen Look wie die
// Balken des Next-Token-Predictors: Der Saal IST in diesem Moment das
// Sprachmodell.
export function WordDistribution({
  results,
  highlight,
  onSelect,
  selected,
  maxBars = 8,
  compact = false,
}: WordDistributionProps) {
  const total = results.reduce((acc, r) => acc + r.count, 0)
  if (total === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Noch keine Antworten.
      </p>
    )
  }

  const top = results.slice(0, maxBars)
  const restCount = results.slice(maxBars).reduce((acc, r) => acc + r.count, 0)
  const highlightLower = highlight?.toLowerCase()

  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      {top.map((item, index) => {
        const pct = (item.count / total) * 100
        const isOwn = highlightLower && item.word.toLowerCase() === highlightLower
        const isSelected = selected && item.word === selected
        const inner = (
          <>
            <span
              className={`${compact ? 'w-20 text-xs' : 'w-32 text-sm md:w-40 md:text-base'} shrink-0 truncate font-mono font-semibold`}
            >
              {item.word}
            </span>
            <span
              className={`relative ${compact ? 'h-5' : 'h-6 md:h-8'} flex-1 overflow-hidden rounded bg-muted`}
            >
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, 1.5)}%` }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
                className={`absolute inset-y-0 left-0 rounded ${
                  isOwn || isSelected ? 'bg-[hsl(var(--chart-2))]' : 'bg-primary'
                }`}
              />
            </span>
            <span
              className={`${compact ? 'w-16 text-xs' : 'w-20 text-sm md:w-24 md:text-base'} shrink-0 text-right font-mono tabular-nums text-muted-foreground`}
            >
              {pct.toFixed(0)}%{compact ? '' : ` · ${item.count}`}
            </span>
          </>
        )

        const rowClass = `flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left ${
          isOwn ? 'ring-1 ring-[hsl(var(--chart-2)/0.5)] bg-[hsl(var(--chart-2)/0.08)]' : ''
        }`

        return onSelect ? (
          <button
            key={item.word}
            type="button"
            onClick={() => onSelect(item.word)}
            className={`${rowClass} transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          >
            {inner}
          </button>
        ) : (
          <div key={item.word} className={rowClass}>
            {inner}
          </div>
        )
      })}

      {restCount > 0 && (
        <div className="flex w-full items-center gap-3 px-2 py-1 opacity-70">
          <span
            className={`${compact ? 'w-20 text-xs' : 'w-32 text-sm md:w-40 md:text-base'} shrink-0 font-mono text-muted-foreground`}
          >
            …
          </span>
          <span
            className={`relative ${compact ? 'h-5' : 'h-6 md:h-8'} flex-1 overflow-hidden rounded bg-muted`}
          >
            <span
              className="absolute inset-y-0 left-0 rounded bg-muted-foreground/40"
              style={{ width: `${Math.max((restCount / total) * 100, 1.5)}%` }}
            />
          </span>
          <span
            className={`${compact ? 'w-16 text-xs' : 'w-20 text-sm md:w-24 md:text-base'} shrink-0 text-right font-mono tabular-nums text-muted-foreground`}
          >
            {((restCount / total) * 100).toFixed(0)}%{compact ? '' : ` · ${restCount}`}
          </span>
        </div>
      )}
    </div>
  )
}
