'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

/**
 * Seiten-Scope für die Begriffs-Auto-Verlinkung („erstes Vorkommen pro Seite").
 *
 * Mehrere <GlossaryText>-Blöcke auf einer Seite koordinieren sich hierüber,
 * damit ein Begriff nur EINMAL pro Seite verlinkt wird. Statt während des
 * Renders einen geteilten Zustand zu mutieren (unsicher unter StrictMode/
 * Concurrent-Rendering und beim später montierenden „Mehr dazu"-Accordion),
 * läuft die Vergabe in der Commit-Phase:
 *
 *   - Jeder Block meldet seine Kandidaten-Begriffe per (Layout-)Effekt an.
 *   - Der ERSTE Block (in Dokument-Reihenfolge), der einen Begriff beansprucht,
 *     wird sein Owner. `owns()` liefert auch true, solange der Begriff noch
 *     unbekannt ist – so ist der erste Paint/SSR pro-Block verlinkt (Hydration
 *     passt), danach verfeinert sich's vor dem Paint auf 1×/Seite.
 *
 * Der Provider wird in app-shell.tsx mit `key={pathname}` montiert und setzt
 * sich dadurch bei jeder Navigation zurück.
 */
interface GlossaryScope {
  /** Begriffe beanspruchen (idempotent; erster Block gewinnt). */
  claim: (blockId: string, termIds: string[]) => void
  /** Beim Unmount die Ansprüche dieses Blocks freigeben. */
  release: (blockId: string) => void
  /** Soll dieser Block den Begriff verlinken? (Owner oder noch unbeansprucht) */
  owns: (blockId: string, termId: string) => boolean
  /** Bump-Zähler, damit Consumer bei Owner-Wechsel neu rendern. */
  version: number
}

const NOOP_SCOPE: GlossaryScope = {
  claim: () => {},
  release: () => {},
  owns: () => true, // ohne Provider: pro-Block-Dedupe (Fallback)
  version: 0,
}

const GlossaryScopeContext = createContext<GlossaryScope>(NOOP_SCOPE)

export function useGlossaryScope(): GlossaryScope {
  return useContext(GlossaryScopeContext)
}

export function GlossaryScopeProvider({ children }: { children: React.ReactNode }) {
  const owners = useRef<Map<string, string>>(new Map())
  const [version, setVersion] = useState(0)

  const claim = useCallback((blockId: string, termIds: string[]) => {
    let changed = false
    for (const id of termIds) {
      if (!owners.current.has(id)) {
        owners.current.set(id, blockId)
        changed = true
      }
    }
    if (changed) setVersion((v) => v + 1)
  }, [])

  const release = useCallback((blockId: string) => {
    let changed = false
    for (const [id, owner] of owners.current) {
      if (owner === blockId) {
        owners.current.delete(id)
        changed = true
      }
    }
    if (changed) setVersion((v) => v + 1)
  }, [])

  const owns = useCallback((blockId: string, termId: string) => {
    const owner = owners.current.get(termId)
    return owner === undefined || owner === blockId
  }, [])

  // Neue Value-Identität bei jedem Versions-Bump → Consumer rendern neu.
  // claim/release/owns sind stabil, damit der Anmelde-Effekt nicht in einer
  // Schleife läuft.
  const value = useMemo<GlossaryScope>(
    () => ({ claim, release, owns, version }),
    [claim, release, owns, version],
  )

  return <GlossaryScopeContext.Provider value={value}>{children}</GlossaryScopeContext.Provider>
}
