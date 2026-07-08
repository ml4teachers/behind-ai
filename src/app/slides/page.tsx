'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  MoonIcon,
  Pencil2Icon,
  SunIcon,
} from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { slides } from './slides'

// ---------------------------------------------------------------------------
// Foliensatz für das Referat «KI verstehen, einordnen, verantwortungsvoll
// nutzen» (Weiterbildung Schulen Baar, 16.09.2026).
//
// Bedienung:
//   → / Leertaste / PageDown   weiter (erst Einblendungen, dann Folie)
//   ← / PageUp                 zurück
//   Home / End                 erste / letzte Folie
//   F                          Vollbild
//   N                          Notizen ein-/ausblenden
// Die aktuelle Folie steht als #n in der URL (Reload-sicher).
// ---------------------------------------------------------------------------

function readHash(): number {
  const n = parseInt(window.location.hash.replace('#', ''), 10)
  if (Number.isFinite(n) && n >= 1 && n <= slides.length) return n - 1
  return 0
}

export default function SlidesPage() {
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  // Initiale Folie aus dem URL-Hash (auch bei manueller Hash-Änderung).
  useEffect(() => {
    setMounted(true)
    setIndex(readHash())
    const onHash = () => {
      setIndex(readHash())
      setStep(0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!mounted) return
    window.history.replaceState(null, '', `#${index + 1}`)
  }, [index, mounted])

  const slide = slides[index]
  const maxStep = slide.steps ?? 0

  const next = useCallback(() => {
    if (step < maxStep) {
      setStep(step + 1)
    } else if (index < slides.length - 1) {
      setIndex(index + 1)
      setStep(0)
    }
  }, [step, maxStep, index])

  const prev = useCallback(() => {
    if (step > 0) {
      setStep(step - 1)
    } else if (index > 0) {
      setIndex(index - 1)
      setStep(0)
    }
  }, [step, index])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Eingaben in eingebetteten interaktiven Komponenten nicht kapern.
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(
          'input, textarea, select, button, [contenteditable], [role="slider"]',
        )
      ) {
        return
      }
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          setIndex(0)
          setStep(0)
          break
        case 'End':
          e.preventDefault()
          setIndex(slides.length - 1)
          setStep(0)
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'n':
        case 'N':
          setShowNotes((v) => !v)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, toggleFullscreen])

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* Fortschrittsbalken */}
      <div className="h-1 shrink-0 bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: `${((index + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Folie – nur die aktive wird gerendert (eingebettete Experimente
          laden dadurch erst, wenn ihre Folie gezeigt wird). */}
      <main className="flex min-h-0 flex-1 overflow-y-auto">
        <div
          key={slide.id}
          className="mx-auto flex w-full max-w-6xl flex-col justify-center px-8 py-8 md:px-14"
        >
          {slide.render(step)}
        </div>
      </main>

      {/* Notizen (Taste N) */}
      {showNotes && slide.notes && (
        <div className="shrink-0 border-t bg-muted/60 px-8 py-3">
          <p className="mx-auto max-w-6xl text-sm leading-relaxed text-muted-foreground">
            <span className="mr-2 font-semibold uppercase tracking-wide">
              Notizen
            </span>
            {slide.notes}
          </p>
        </div>
      )}

      {/* Fussleiste */}
      <footer className="flex shrink-0 items-center justify-between border-t px-4 py-1.5 text-xs text-muted-foreground opacity-60 transition-opacity hover:opacity-100">
        <span className="hidden md:inline">
          KI verstehen · Schulen Baar · behind-ai.ch
        </span>
        <span className="font-medium">{slide.block}</span>
        <span className="flex items-center gap-1">
          <span className="mr-2 font-mono tabular-nums">
            {index + 1} / {slides.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowNotes((v) => !v)}
            title="Notizen (N)"
          >
            <Pencil2Icon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
            title="Hell/Dunkel"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <SunIcon className="h-3.5 w-3.5" />
            ) : (
              <MoonIcon className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleFullscreen}
            title="Vollbild (F)"
          >
            {fullscreen ? (
              <ExitFullScreenIcon className="h-3.5 w-3.5" />
            ) : (
              <EnterFullScreenIcon className="h-3.5 w-3.5" />
            )}
          </Button>
        </span>
      </footer>
    </div>
  )
}
