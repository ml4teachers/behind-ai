'use client'

import { useEffect, useState } from 'react'

/**
 * True erst nach dem ersten Client-Render. Damit lassen sich client-only
 * Zustände (persistierter Store, next-themes) anzeigen, ohne Hydration-
 * Mismatch: Server und erster Client-Render zeigen denselben Default.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
