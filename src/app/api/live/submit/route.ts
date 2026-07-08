import { NextResponse } from 'next/server'
import { getLiveState, submitWord } from '@/lib/live/store'

export const dynamic = 'force-dynamic'

// Eingabe auf EIN Wort reduzieren: erstes "Wort" nehmen, umschliessende
// Satzzeichen abschneiden. Bewusst tolerant – Tippfehler zählen als eigene
// Wörter, genau wie unterschiedliche Tokens beim echten Modell.
function normalizeWord(raw: string): string {
  const first = raw.trim().split(/\s+/)[0] ?? ''
  return first
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/[^\p{L}\p{N}]+$/u, '')
    .slice(0, 30)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      session?: string
      round?: number
      word?: string
    }

    const word = normalizeWord(String(body.word ?? ''))
    if (!word) {
      return NextResponse.json({ error: 'Kein gültiges Wort' }, { status: 400 })
    }

    const state = await getLiveState()
    if (!state.active) {
      return NextResponse.json(
        { error: 'Gerade läuft kein Experiment' },
        { status: 409 },
      )
    }
    // Verspätete Antworten (alte Runde/Session) still verwerfen – das
    // Smartphone hat den Zustandswechsel nur noch nicht mitbekommen.
    if (body.session !== state.session || body.round !== state.round) {
      return NextResponse.json({ ok: true, stale: true })
    }
    if (state.revealed) {
      return NextResponse.json({ ok: true, stale: true })
    }

    await submitWord(state.session, state.round, word)
    return NextResponse.json({ ok: true, word })
  } catch (error) {
    console.error('live/submit:', error)
    return NextResponse.json(
      { error: 'Antwort konnte nicht gespeichert werden' },
      { status: 500 },
    )
  }
}
