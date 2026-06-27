// ---------------------------------------------------------------------------
// Musterlösungen-Cache für VORGEGEBENE Fragen.
//
// Warum: Mehrere Seiten bieten vorgegebene Fragen/Aufgaben an. Jede löste
// bisher pro Klick einen echten Modell-Aufruf aus – verschwenderisch, weil die
// Antwort sich kaum ändert. Hier liegen ECHTE, einmalig vom Modell geerntete
// Antworten (scripts/harvest-fixtures.mjs). Die Komponenten servieren für
// vorgegebene Fragen aus diesem Cache; FREIE Eingaben fragen weiter live das
// Modell – diese Möglichkeit bleibt absichtlich erhalten.
//
// Schlüssel ist jeweils der EXAKTE Text, der ans Modell ginge (Frage/Ausdruck/
// Wort). Dadurch fällt die Weiche „vorgegeben vs. frei" und „DE vs. EN" von
// selbst: kennt der Cache den Text, kommt die Musterlösung; sonst geht es live.
// ---------------------------------------------------------------------------

import hallucinateData from './hallucinate.json'
import logprobsData from './logprobs.json'
import cotData from './cot.json'
import ragData from './rag.json'
import rlvrData from './rlvr.json'
import finetuningData from './finetuning.json'
import privacyData from './privacy.json'

// --- Typen der Fixture-Dateien ---------------------------------------------
export interface LpToken { token: string; probability: number }
export interface LogprobFixture { topTokens: LpToken[]; remainingProbability: number }
export interface CotFixture { truth: number | null; direct: string[]; cot: string[] }
export interface RagFixture {
  embedding: number[]
  contextIds: string[]
  plain: string[]
  grounded: string[]
}
export interface RlvrFixture { truth: number; attempts: string[] }
export interface FinetuningFixture { base: string[]; assistant: string[] }
export interface SensitivePart { text: string; category: string; identifying?: boolean; reason: string }
export interface PrivacyFixture { sensitiveParts: SensitivePart[]; anonymizedText: string }

const hallucinate = hallucinateData as Record<string, string[]>
const logprobs = logprobsData as Record<string, LogprobFixture | null>
const cot = cotData as Record<string, CotFixture>
const rag = ragData as Record<string, RagFixture>
const rlvr = rlvrData as Record<string, RlvrFixture>
const finetuning = finetuningData as Record<string, FinetuningFixture>
const privacy = privacyData as Record<string, PrivacyFixture>

// --- Auswahl-Helfer ---------------------------------------------------------
const key = (s: string) => s.replace(/\s+/g, ' ').trim()

/** Zufälliges Element (für „3–4 Varianten, random"). */
export function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** n zufällige Elemente ohne Zurücklegen (für RLVR: 8 aus dem Pool ziehen). */
export function pickSome<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(n, copy.length))
}

/**
 * Kurze, leicht variierende Verzögerung – hält den „Modell rechnet …"-Zustand
 * sichtbar, damit eine gecachte Antwort sich nicht künstlich-instantan anfühlt.
 */
export function thinkingDelay(min = 380, spread = 360): Promise<void> {
  return new Promise((r) => setTimeout(r, min + Math.random() * spread))
}

// --- Nachschlag-Funktionen (null = keine Musterlösung -> live fragen) -------
export function lookupHallucinate(question: string): string[] | null {
  return hallucinate[key(question)] ?? null
}
export function lookupLogprobs(prompt: string): LogprobFixture | null {
  return logprobs[key(prompt)] ?? null
}
// Schlüssel = voller Prompt („Berechne: …" / „Calculate: …"), damit DE und EN
// (gleicher Ausdruck, andere Ausgabesprache) auf getrennten Einträgen liegen.
export function lookupCot(prompt: string): CotFixture | null {
  return cot[key(prompt)] ?? null
}
export function lookupRag(question: string): RagFixture | null {
  return rag[key(question)] ?? null
}
export function lookupRlvr(word: string): RlvrFixture | null {
  return rlvr[key(word)] ?? null
}
export function lookupFinetuning(query: string): FinetuningFixture | null {
  return finetuning[key(query)] ?? null
}
export function lookupPrivacy(promptText: string): PrivacyFixture | null {
  return privacy[key(promptText)] ?? null
}
