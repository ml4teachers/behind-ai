import { NextResponse } from 'next/server'
import {
  EMPTY_STATE,
  getLiveState,
  getResults,
  liveBackend,
  setLiveState,
} from '@/lib/live/store'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Presenter-Steuerung des Live-Experiments (nur aus dem Foliensatz /slides).
//
// Schutz: Header `x-live-token` muss LIVE_ADMIN_TOKEN entsprechen.
// - In Produktion (Vercel) MUSS LIVE_ADMIN_TOKEN gesetzt sein, sonst wird
//   jede Steuerung abgelehnt.
// - Lokal (ohne Env-Variable) ist die Steuerung offen, damit man ohne Setup
//   entwickeln und testen kann.
//
// Aktionen:
//   start  { prompt }  neues Experiment mit Satzanfang, Runde 0
//   reveal             Verteilung der aktuellen Runde aufdecken
//   accept { word }    Wort übernehmen -> an Satz anhängen, nächste Runde
//   stop               Experiment beenden (Publikum sieht Wartebildschirm)
//   status             Zustand + Live-Auszählung der aktuellen Runde
// ---------------------------------------------------------------------------

function isAuthorized(request: Request): boolean {
  const expected = process.env.LIVE_ADMIN_TOKEN?.trim()
  if (!expected) return process.env.NODE_ENV !== 'production'
  return request.headers.get('x-live-token')?.trim() === expected
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Nicht autorisiert (LIVE_ADMIN_TOKEN prüfen)' },
      { status: 401 },
    )
  }

  try {
    const body = (await request.json()) as {
      action?: string
      prompt?: string
      word?: string
    }
    const state = await getLiveState()

    switch (body.action) {
      case 'start': {
        const prompt = String(body.prompt ?? '').trim()
        if (!prompt) {
          return NextResponse.json(
            { error: 'Satzanfang fehlt' },
            { status: 400 },
          )
        }
        const next = {
          active: true,
          // Eindeutig genug für ein Live-Event; Date.now allein würde bei
          // schnellem Doppelklick kollidieren.
          session: `s${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`,
          prompt,
          round: 0,
          revealed: false,
        }
        await setLiveState(next)
        return NextResponse.json({ ok: true, state: next })
      }

      case 'reveal': {
        if (!state.active) {
          return NextResponse.json(
            { error: 'Kein aktives Experiment' },
            { status: 409 },
          )
        }
        const next = { ...state, revealed: true }
        await setLiveState(next)
        const results = await getResults(next.session, next.round)
        return NextResponse.json({ ok: true, state: next, results })
      }

      case 'accept': {
        if (!state.active) {
          return NextResponse.json(
            { error: 'Kein aktives Experiment' },
            { status: 409 },
          )
        }
        const word = String(body.word ?? '').trim()
        if (!word) {
          return NextResponse.json({ error: 'Wort fehlt' }, { status: 400 })
        }
        const next = {
          ...state,
          prompt: `${state.prompt} ${word}`.replace(/\s+/g, ' '),
          round: state.round + 1,
          revealed: false,
        }
        await setLiveState(next)
        return NextResponse.json({ ok: true, state: next })
      }

      case 'stop': {
        await setLiveState({ ...EMPTY_STATE })
        return NextResponse.json({ ok: true, state: { ...EMPTY_STATE } })
      }

      case 'status': {
        const results = state.active
          ? await getResults(state.session, state.round)
          : []
        return NextResponse.json({
          ok: true,
          state,
          results,
          backend: liveBackend(),
        })
      }

      default:
        return NextResponse.json(
          { error: `Unbekannte Aktion: ${body.action}` },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error('live/control:', error)
    return NextResponse.json(
      { error: 'Steuerung fehlgeschlagen' },
      { status: 500 },
    )
  }
}
