import { NextResponse } from 'next/server'
import { getLiveState, getResults } from '@/lib/live/store'

// Publikums-Polling: ~350 Smartphones fragen alle 2 s den Zustand ab.
// s-maxage=1 lässt Vercels CDN die Antwort pro Region bündeln, damit
// nicht jede Anfrage eine Function-Invokation + Redis-Read auslöst.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const state = await getLiveState()

    // Verteilung erst nach dem Aufdecken mitschicken (klein halten).
    const results =
      state.active && state.revealed
        ? await getResults(state.session, state.round)
        : undefined

    return NextResponse.json(
      {
        active: state.active,
        session: state.session,
        prompt: state.prompt,
        round: state.round,
        revealed: state.revealed,
        ...(results ? { results } : {}),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=2',
        },
      },
    )
  } catch (error) {
    console.error('live/state:', error)
    return NextResponse.json(
      { error: 'Zustand konnte nicht geladen werden' },
      { status: 500 },
    )
  }
}
