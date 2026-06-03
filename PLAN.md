# behind-ai — Redesign-Plan

> **Zentraler Plan & Fortschritt über alle Redesign-Threads.**
> Jeder Thread liest hier rein und hakt Erledigtes ab (`- [ ]` → `- [x]`).
> Der „Master-Thread" koordiniert; die einzelnen Threads setzen je einen Block um.

---

## Leitprinzipien

- **Operatives Prinzip:** wenig lesen, viel ausprobieren. Vorbild ist die **Next-Token-Seite** (echtes Modell, sofort spielbar).
- **Zeitlos & flach:** weniger verschachtelte Cards/farbige Boxen. Pro Seite *ein* starkes Interaktiv-Element zuoberst, knappe Caption, optionales „Mehr dazu" zum Aufklappen.
- **Zweisprachig denken:** Texte beim Neuschreiben direkt in die i18n-Schicht (DE füllen, EN folgt in Thread 9).
- **Echt statt simuliert**, wo machbar.

## Harte Constraints

- **Alle bestehenden URLs bleiben** (viele externe Verweise). Einzige Ausnahme: `/daten` → Redirect auf `/data` (erledigt).
- **Production läuft von `main`** (Vercel). `main` bleibt bis zum bewussten Merge **unangetastet** — gesamte Redesign-Arbeit auf Branch **`redesign`**.
- **Keine Secrets committen** (`.env.local`, `gcp-service-account.json` sind gitignored).

## Branch-Workflow (Solo-Dev)

- Branch **`redesign`**: alle Threads committen hierhin. `main` bleibt die lauffähige Production-Linie.
- **Lokale Commits sind nicht live.** Erst `git push` lädt hoch; erst ein **Merge in `main`** (bzw. Push von `main`) ändert Production.
- Wenn ein kohärenter Stand erreicht ist: `redesign` → `main` mergen (ein Schritt), Production aktualisiert sich einmalig. Jederzeit abbrechbar.

## Architektur-Konventionen (ab Thread 1 verbindlich)

- **Farben nur als semantische Tokens:** `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border`, `bg-primary`, … — **keine** hartcodierten Farben (`bg-violet-50`, `text-gray-600` …). Nur so funktioniert Dark-Mode automatisch.
- **Texte über i18n:** `const t = useTranslations(); t('key')`. Strings in [`src/lib/i18n/messages.ts`](src/lib/i18n/messages.ts) (DE füllen; EN darf bis Thread 9 auf DE zurückfallen).
- **UI-State** (locale, sidebar) in [`src/lib/store.ts`](src/lib/store.ts) (`useUIStore`). `useMounted` gegen Hydration-Mismatch.
- **Shell:** [`src/components/layout/app-shell.tsx`](src/components/layout/app-shell.tsx), [`site-header.tsx`](src/components/layout/site-header.tsx). **Nav:** [`src/components/nav/navigation.tsx`](src/components/nav/navigation.tsx) + [`nav-items.ts`](src/components/nav/nav-items.ts).

---

## Roadmap

### Thread 1 — Fundament & Shell ✅ erledigt
- [x] Theme-Tokens (Light + Dark, freundlich/neutral, Google-Blau) in `globals.css`
- [x] Dark-Mode via `next-themes` + Toggle
- [x] Ausblendbare Sidebar + Header (`app-shell`, `site-header`)
- [x] Navigation flach/neu; Zwei-Pfade-Struktur erhalten
- [x] Titel **„Behind AI"** (Header + Metadata)
- [x] Maskottchen (`GuideCharacter`) komplett entfernt
- [x] `/daten` → `/data` (Ordner umbenannt + 308-Redirect)
- [x] i18n-Gerüst (`messages`, `useTranslations`, `useUIStore`) — URLs unverändert
- [x] Build grün, Shell visuell & funktional verifiziert (Dark-Mode, Sprach-Toggle, Collapse persistieren)

### Thread 2 — Startseite & Informationsarchitektur
- [ ] Home neu: „ausprobieren statt lesen" (Textwände raus, ggf. Mini-Demo)
- [ ] Sektions-Labels & Reihenfolge final (Embeddings nach vorn; Lern-Bogen festlegen)
- [ ] Home auf semantische Tokens + neue Copy (Dark-Mode korrekt)
- [ ] Home-Texte nach `messages.ts` (DE), EN-Keys anlegen
- [ ] Reste alter Copy / „Behind ChatGPT" bereinigen

### Thread 3 — Flaggschiff-Seiten (schon „echt")
- [ ] `next-token`: Tokens + Copy + Dark-Mode; **Temperatur-/Sampling-Slider** (interaktiv)
- [ ] `tokenization`: Tokens + Copy + Dark-Mode (Vorbereitung Multimodal-Hinweis)
- [ ] `embeddings`: Tokens + Copy + Dark-Mode
- [ ] **Seiten-Pattern etablieren** (Hero-Interaktiv zuerst, knappe Caption, optional „Mehr dazu")

### Thread 4 — Training echt machen (R&D-Spike)
- [ ] Prototyp: **winziges Modell live im Browser trainieren** (Loss fällt, Verteilung wird spitz, Text wird plausibel)
- [ ] Tech-Entscheid (tf.js / eigenes Mini-Modell / WASM)
- [ ] Fake-Simulation (`training-simulation.tsx`) ersetzen

### Thread 5 — Finetuning / RLHF / RLVR / Reasoning
- [ ] **babbage-002 aus `api/finetuning-simulate` entfernen** (Breakage-Risiko)
- [ ] Finetuning-Seite überarbeiten
- [ ] RLHF überarbeiten
- [ ] **NEU: RLVR** ergänzen (nach RLHF, Brücke zu CoT / Reasoning-Modellen)
- [ ] Chain-of-Thought ggf. mit echtem Reasoning-Modell

### Thread 6 — RAG echt machen
- [ ] Echtes Retrieval über kleinen Doku-Satz (nutzt vorhandene Embeddings-API), Antwort mit/ohne Kontext

### Thread 7 — Diffusion (NEU)
- [ ] Neue Seite/Interaktiv: Entrauschen Schritt für Schritt; Kontrast zum autoregressiven Next-Token

### Thread 8 — „KI im Einsatz" + unfertige Seiten
- [ ] `lokal-vs-cloud`: Tokens + Copy
- [ ] `hardware-check`: Tokens + Copy
- [ ] `kosten`: Tokens + Copy + **Preise/Modelle aktualisieren** (Stand April 2025 veraltet)
- [ ] `datenschutz`: Tokens + Copy
- [ ] `werkzeugwahl`: fertig bauen (bisher Stub)
- [ ] `modell-typen`: fertig bauen (Platzhalter) + **Multimodal-Tokenisierung** (Bild/Audio)

### Thread 9 — Englische Übersetzung
- [ ] Alle `messages.ts`-EN-Keys füllen (wenn DE final)
- [ ] `<html lang>` dynamisch / EN-Korrektheit prüfen

### Thread 10 — Politur, Accessibility, QA, Go-Live
- [ ] a11y-Durchgang (Kontrast, Fokus, Tastatur)
- [ ] Responsive/Mobile-Feinschliff
- [ ] Cross-Browser & Performance
- [ ] **Merge `redesign` → `main`**

---

## Inhaltliche Ergänzungen (Einordnung)

- **RLVR** → Thread 5
- **Tokenisierung Bild/Audio** → Thread 8 (`modell-typen`), Hinweis schon in Thread 3 (`tokenization`)
- **Diffusion** → Thread 7

## Offene Punkte / Tech-Schulden

- [ ] `pnpm lint` läuft in interaktiven ESLint-Config-Prompt (Flat-Config vs. `next lint`) — Konfig reparieren
- [ ] `api/finetuning-simulate` nutzt **babbage-002** → entfernen (Thread 5)
- [ ] Preise/Modellnamen veraltet (`kosten`, `modell-typen`, `chain-of-thought`) — Refresh
- [ ] `public/daten/assets` ggf. nach `public/data` verschieben (derzeit funktionsfähig, Fetch-Pfade zeigen noch auf `/daten/assets`)
- [ ] `<html lang="de">` statisch — bei EN-Launch dynamisch machen

## Changelog

- **2026-06-03 — Thread 1:** Fundament & Shell. Branch `redesign` angelegt.
- **2026-06-03 — Cleanup:** `.app.mdx` (Vibecoding-Artefakt) und ungenutzte create-next-app-SVGs (`file/globe/next/vercel/window.svg`) entfernt.
