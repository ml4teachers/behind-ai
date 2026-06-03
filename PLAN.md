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
- **Positiv formulieren:** Nutzen benennen, nicht Defizite — **keine Negativbeschriebe** („statt langer Texte", „kein …"). Sagen, was die Seite *bietet*.

## Harte Constraints

- **Alle bestehenden URLs bleiben** (aufgrund bestehender externer Verweise).
- **Production läuft von `main`** (Vercel). `main` bleibt bis zum bewussten Merge **unangetastet** — gesamte Redesign-Arbeit auf Branch **`redesign`**.
- **Keine Secrets committen** (`.env.local`, `gcp-service-account.json` sind gitignored).

## Branch-Workflow (Solo-Dev)

- Branch **`redesign`**: alle Threads committen hierhin. `main` bleibt die lauffähige Production-Linie.
- **Lokale Commits sind nicht live.** Erst `git push` lädt hoch; erst ein **Merge in `main`** (bzw. Push von `main`) ändert Production.
- Wenn ein kohärenter Stand erreicht ist: `redesign` → `main` mergen (ein Schritt), Production aktualisiert sich einmalig. Jederzeit abbrechbar.

## Architektur-Konventionen (ab Thread 1 verbindlich)

- **Farben nur als semantische Tokens:** `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border`, `bg-primary`, … — **keine** hartcodierten Farben (`bg-violet-50`, `text-gray-600` …). Nur so funktioniert Dark-Mode automatisch.
- **Akzentfarbe** ist die einzige „bunte" Farbe = `--primary` / `--primary-foreground` / `--ring`. Im Header umschaltbar ([`accent-toggle.tsx`](src/components/accent-toggle.tsx)); [`accent-provider.tsx`](src/components/accent-provider.tsx) injiziert die CSS-Vars (Light **und** Dark getrennt) aus der Tailwind-Palette in [`accents.ts`](src/lib/accents.ts). **Default „Sky"** (globals.css hält denselben SSR-Default → kein Flackern). Wer `bg-primary`/`text-primary` nutzt, erbt die Akzentfarbe automatisch.
- **Texte über i18n:** `const t = useTranslations(); t('key')`. Strings in [`src/lib/i18n/messages.ts`](src/lib/i18n/messages.ts) (DE füllen; EN darf bis Thread 9 auf DE zurückfallen).
- **UI-State** (locale, accent, sidebar) in [`src/lib/store.ts`](src/lib/store.ts) (`useUIStore`, persistiert). `useMounted` gegen Hydration-Mismatch.
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

### Thread 2 — Startseite & Informationsarchitektur ✅ erledigt
- [x] Home neu: „ausprobieren statt lesen" — knapper Hero + **echte Next-Token-Mini-Demo** zuoberst (Token-Klick hängt an & rechnet neu), Textwände raus
- [x] Sektions-Labels & Reihenfolge final: Lern-Bogen **Tokenisierung → Embeddings → Next-Token → Daten → Training → Finetuning → RLHF → CoT → RAG** (Embeddings nach vorn). Begründung in `nav-items.ts`
- [x] Home auf semantische Tokens + neue Copy (Light/Dark im Preview verifiziert)
- [x] Home-Texte nach `messages.ts` (DE **und** EN gefüllt, `home.*`)
- [x] Reste alter Copy bereinigt: alte Home-Copy ersetzt; kein „Behind ChatGPT"-Branding mehr im Code (nur legitime ChatGPT-Produktbeispiele)
- [x] **Akzentfarben-Picker** im Header (16 Tailwind-Farben mit Swatches, persistiert, Light+Dark). **Neuer Default „Sky"** statt Blau. Siehe Architektur-Konventionen oben
- [x] Feedback umgesetzt: Negativbeschriebe raus (Hero-Subtitle + SEO-Description); „Zur ganzen Seite" → **„Zur Erklärung"**

### Thread 3 — Flaggschiff-Seiten (schon „echt") ✅ erledigt
- [x] `next-token`: Tokens + Copy + Dark-Mode; **Temperatur-Slider** (clientseitig: `p^(1/T)` über Top-K **und** Long-Tail-Bucket, neu normiert; Zufalls-Sampling aus der temperatur-angepassten Verteilung). Light+Dark im Preview verifiziert (T 1.0→1.9→0: 88%→60%→100%)
- [x] `tokenization`: Tokens + Copy + Dark-Mode + **Multimodal-Hinweis** (Brücke zu Modell-Typen). Token-Chips (Primary) vs. ID-Chips (Secondary) im Dark-Mode unterscheidbar
- [x] `embeddings`: Tokens + Copy + Dark-Mode; **stark umstrukturiert** (4 Text-Cards → Tool zuoberst + Caption + „Mehr dazu"). **Komplett neu (Nachtrag, s. Changelog 2026-06-03): Backend OpenAI → `gemini-embedding-2` (Vertex `global`), neue „Bedeutungs-Landkarte"-Viz statt Ähnlichkeits-Heatmap.**
- [x] **Seiten-Pattern etabliert**: Header → Interaktiv (flach, `rounded-xl border bg-card`) → knappe Caption → `Accordion` „Mehr dazu" → Prev/Next. Seiten-Copy in `messages.ts` (DE+EN, `nextToken.*`/`tokenization.*`/`embeddings.*`/`common.*`)
- [x] Prev/Next aller drei Seiten auf neuen Lern-Bogen (Thread 2) ausgerichtet: Tokenisierung → Embeddings → Next-Token → Daten
- [x] `next-token` Feedback: **Beispiel-Pool** (8 Satzanfänge DE+EN, `nextToken.ex1..ex8`) — pro Seitenaufruf werden **zwei zufällig** gezeigt; der Button zeigt den ganzen Satzanfang. Würfeln im `useEffect` nach Mount (SSR/erster Render = [0,1]) → kein Hydration-Mismatch. EN im Preview verifiziert
- ℹ️ Viz-Komponenten (`next-token-prediction`, `tokenization-visualization`, `embeddings-visualization`) auf semantische Tokens umgestellt; interne DE-Strings bleiben inline (Ganz-Migration in Thread 9) — **Ausnahme: `tokenization-visualization` ist bereits vollständig i18n (DE+EN, `tokenization.viz.*`)**. Kompatibel mit Thread-2-Akzentsystem: `bg-primary`/`text-primary` erben die Akzentfarbe; grün/amber bleiben `--chart-2`/`--chart-3` (legitime Data-Viz-Ausnahme)

### Thread 4 — Training echt machen (R&D-Spike) ✅ erledigt
- [x] Prototyp: **winziges Modell live im Browser trainieren** — alle drei Ziele im Preview bestätigt (Loss 3.4→1.38, Verteilung flach→spitz `s 16%…`, Kauderwelsch→`winter/blume/himmel`)
- [x] Tech-Entscheid: **eigenes Char-Level-MLP in purem TypeScript** (kein tf.js/WASM — passt zur „echt/transparent/keine schweren Deps"-Philosophie). Im Node-Spike validiert (Backprop von Hand, ~6k Parameter, C=3/E=10/H=96)
- [x] Fake-Simulation (`training-simulation.tsx`) entfernt → neue `mini-training.tsx` (echtes Live-Training)

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
- [ ] `public/daten/assets/{data,info}.csv` (2,1 MB) liegen weiter im **ausgelieferten** `public/`, sind aber nur noch **Build-Input** von `scripts/gen-data-sample.mjs` (kein Client-Fetch mehr). Bei Gelegenheit aus `public/` herausziehen (z. B. `scripts/data/`), damit sie nicht als statisches Asset mitdeployen.
- [ ] `<html lang="de">` statisch — bei EN-Launch dynamisch machen

## Changelog

- **2026-06-03 — Thread 1:** Fundament & Shell. Branch `redesign` angelegt.
- **2026-06-03 — Cleanup:** `.app.mdx` (Vibecoding-Artefakt) und ungenutzte create-next-app-SVGs (`file/globe/next/vercel/window.svg`) entfernt.
- **2026-06-03 — Thread 2:** Startseite & Informationsarchitektur. Neue Home (Hero + echte Next-Token-Mini-Demo + Zwei-Pfade-Karten aus `navSections` + optionales „Mehr dazu"-Accordion), semantische Tokens, DE+EN-Copy (`home.*`). Lern-Bogen finalisiert (Embeddings nach vorn). Neue Komponente `next-token-mini.tsx`.
- **2026-06-03 — Thread 3:** Flaggschiff-Seiten `next-token`, `tokenization`, `embeddings` neu im Seiten-Pattern (Interaktiv zuoberst, flach, Caption, „Mehr dazu"-Accordion), semantische Tokens (Light+Dark im Preview verifiziert), DE+EN-Copy. **Next-Token: Temperatur-Slider** (clientseitige Umformung der Verteilung + temperaturbasiertes Sampling). **Tokenisierung: Multimodal-Hinweis.** **Embeddings: Tool nach vorn** statt 4 Text-Cards. Prev/Next auf den Thread-2-Lern-Bogen ausgerichtet. Viz-Komponenten dark-mode-fähig (interne Strings → Thread 9). `pnpm exec tsc --noEmit` grün.
- **2026-06-03 — Thread 3 (Nachtrag, User-Feedback „Tokenisierung zu voll"):** Viz `animations/tokenization-animation.tsx` → `visualizations/tokenization-visualization.tsx` (`TokenizationVisualization`) verschoben/umbenannt → einheitlich mit den übrigen Visualisierungen; `animations/`-Ordner entfernt. **Vereinfacht:** redundante Doppelung („So sieht das Modell den Text" + „Tokens") zu **einer** Token-Ansicht zusammengeführt, **Token-IDs** behalten, **rekonstruierten Text**, die zweite BPE-Erklärbox, den Original-Block und die Kontextfenster-Box entfernt. Mehrstufige Timer-Animation raus → schlanke gestufte CSS-Einblendung (Tokens → IDs). Framer-Motion-Eintrittsanimation entfernt (war rAF-abhängig → im Hintergrund-Tab/Reduced-Motion unsichtbar); Ruhezustand jetzt garantiert sichtbar. Whitespace in Token-Chips sichtbar (führendes Leerzeichen → `·`). Hover-Linking Token↔ID erhalten. **Interne Strings vollständig nach i18n migriert (DE+EN, `tokenization.viz.*`)** — die Komponente ist damit zweisprachig (Zähl-Zeile aus Wort-Teilen komponiert, da `t()` keine Interpolation kann). Light/Dark **und DE/EN** im Preview verifiziert (Token-Chips Akzent vs. ID-Chips neutral unterscheidbar; Labels wechseln korrekt mit der Sprache), `tsc` grün.
- **2026-06-03 — Thread 3 (Nachtrag, `embeddings` komplett neu):** **Backend OpenAI `text-embedding-3-small` → Google `gemini-embedding-2`** über Vertex AI. Wichtig: gemini-embedding-2 ist (in diesem Projekt) nur über die Vertex-Region **`global`** + `…:embedContent` erreichbar (regionale Endpunkte wie `us-central1` → 404; `:predict` im global → 404). Auth = dasselbe Dienstkonto wie Next-Token (kein neuer API-Key). `output_dimensionality:768`. `api/embeddings/route.ts` neu (Bare-Response `{ embedding, model, dim }`); `api/embeddings/terms` + `public/embeddings.json` (2,1 MB Roget-Begriffe) **entfernt**. **Neue Viz „Bedeutungs-Landkarte"** (`visualizations/embeddings-map.tsx`) statt Ähnlichkeits-Heatmap: ~80 deutsche Alltagswörter in 5 Kategorien (chart-1..5), platziert per **SMACOF/metrischem MDS** über echte Cosinus-Distanzen (Bildschirm-Distanz ≈ Bedeutungs-Distanz; Cluster-Trennung zwischen/innerhalb ≈ 2×). **Token-Brücke:** Wort/kurzer Satz eingeben → jedes Wort wird **live** embedded und per ähnlichkeitsgewichtetem Nachbar-Schwerpunkt platziert (fällt zu seinen Nachbarn); Klick/Tap auf einen Punkt → **Nachbar-Panel** mit echter Cosinus-Ähnlichkeit (Balken) + Linien zu Top-3. Akzentfarbe = Nutzer-Wörter. **Mobile:** nur farbige Cluster, Labels beim Tap (kein Hover). Daten via Build-Script `scripts/gen-embeddings-map.mjs` → `public/embeddings-map.json` (448 KB, gerundete Vektoren). **Modell + 768-Dim müssen zwischen Route und Script identisch bleiben** (sonst liegt das Live-Wort in einem anderen Raum als die Karte). Wort-Arithmetik (König−Mann+Frau→Königin ✓, aber Hauptstadt-Analogien unzuverlässig) verworfen. Interne Viz-Strings bleiben DE (Konvention → Thread 9). Light/Dark/Mobile im Preview verifiziert, `tsc` grün.
- **2026-06-03 — `embeddings` Iteration 2 (User-Feedback):** (1) **8 Kategorien à 18 Wörter** (144 statt 80) — neu: Sport, Musik, Fahrzeuge; dafür `--chart-6/7/8` (Teal/Lime/Rot) in globals.css ergänzt (Light+Dark). (2) **Mehr Spread:** Layout-Normalisierung im Script von uniformer Max-Radius- auf **per-Achse-Perzentil-Streckung** (5–95 % → ±0.92) → Karte nutzt die ganze Fläche. (3) **Single-Embedding statt Satz-Zerlegung:** Eingabe (Wort *oder* Satz) wird als EIN Vektor gerechnet; Scaffolding „Wort eingeben", `maxLength 30`. (4) **Kategorie-Filter:** Legende ist klickbar → Kategorie aus-/einblenden (durchgestrichen/ausgegraut; gefiltert in Render + Nachbar-Pool) für Übersichtlichkeit. Außerdem: Label-Lesbarkeit von Hintergrund-Chip auf **Text-Halo** (`textShadow` in `--background`) umgestellt (im Dark-Mode kein graues Kästchen-Rauschen mehr); langes Wort-Label gekürzt. Light/Dark/Mobile + Toggle + Live-Embedding im Preview verifiziert, `tsc` grün.
- **2026-06-03 — `data` komplett neu (FineWeb-Scatter war „zu kompliziert"):** Plotly-Punktwolke + 3 Text-Cards ersetzt durch **erkundbare Karte echter FineWeb-Dokumente** im Seiten-Pattern (Interaktiv zuoberst, Caption, „Mehr dazu", DE+EN-Copy `data.*`). **Lernziel (mit User geschärft):** Pretraining-Daten sind extrem heterogen & thematisch *ungeplant* (kein Lehrplan), aber qualitativ *hart gefiltert* — und genau diese Auswahl ist der Hebel. Reine Themen-Karte würde Daten „ordentlicher" aussehen lassen als sie sind → deshalb echte Doku-Texte beim Klick + sichtbarer Filter. **Neue Viz `visualizations/data-explorer.tsx`:** 953 echte (übersetzte) Dokumente als **SVG-Punkte** (perf, kein framer-motion pro Punkt), Layout aus den **echten UMAP-Koordinaten** der CSV (nicht neu gerechnet), 104 Cluster → **8 Themengruppen** (chart-1..8). **Dreifach-Umschalter:** *Roh* (alle, Punkt klicken → echtes Dokument lesen) · *Deine Auswahl* (was du mit Behalten/Raus behalten hast) · *Musterlösung* (was der echte FineWeb-Edu-Filter behält, Score ≥3 = **58/953 ≈ 6 %**). Beim Wechsel verblassen inaktive Punkte (klein + `fill-opacity 0.06`) → die ~94 % Reduktion wird **sichtbar** (wichtig: inaktive müssen klein *und* blass sein, sonst stapelt sich Transparenz in dichten Clustern wieder zu Vollfarbe). Beurteilen ist **optional** (Explorieren ohne Zwang); nach Entscheid Aufdeckung: ★-Score + Filter-Urteil + einig/uneinig. Legende blendet Gruppen aus. **Daten via `scripts/gen-data-sample.mjs` → `public/data-sample.json` (328 KB):** kuratiert jugendfrei (Deny-Cluster Glücksspiel/Cannabis/Sucht/Waffen/Sexualität…, rote-Begriffe-Filter, Text auf ~340 Zeichen gekürzt), Koordinaten 0..1 über die behaltenen Punkte normiert. **Deps `plotly.js-basic-dist-min` + `react-plotly.js` + `papaparse` (+ @types) entfernt**, `datenset-cluster.tsx` + Plotly-Typdecl gelöscht. Interne Viz-Strings DE (Konvention → Thread 9). Light/Dark/Mobile + DE/EN + alle 3 Ansichten im Preview verifiziert, `tsc` grün.
- **2026-06-03 — Thread 2 (Nachtrag, User-Feedback):** **Akzentfarben-Picker** im Header (`accents.ts` + `accent-provider.tsx` + `accent-toggle.tsx`, 16 Tailwind-Farben, persistiert, Light/Dark getrennt), **Default auf „Sky"** (globals.css + Store). Copy-Regel „keine Negativbeschriebe" ergänzt; „statt langer Texte" aus Hero & SEO-Description entfernt; Demo-Link „Zur ganzen Seite" → „Zur Erklärung". Im Preview verifiziert (Picker, Persistenz, Light/Dark), `tsc` grün.
- **2026-06-03 — Thread 4 (`training` echt gemacht):** Fake-Simulation (`training-simulation.tsx`, gescriptete Wahrscheinlichkeiten) ersetzt durch **echtes Live-Training eines winzigen Sprachmodells im Browser**. Seite neu im Seiten-Pattern (Interaktiv zuoberst, Caption nennt „echtes neuronales Netz", „Mehr dazu"-Accordion, Prev/Next /data→/finetuning, DE+EN-Copy `training.*`). **Tech-Entscheid: eigenes Char-Level-MLP in purem TypeScript** (kein tf.js/WASM — passt zu „echt/transparent/keine schweren Deps"). Architektur (Bengio/Karpathy makemore): Kontext C=3 Zeichen → Embedding E=10 → tanh-Hidden H=96 → Softmax übers Vokabular; **Backprop von Hand**, SGD, ~6000 Parameter, Float32. Im **Node-Spike** (`/tmp`, nicht im Repo) validiert: Loss 3.4→~1.2, saubere Eval-Kurve, plausible Wörter/Namen, ~37k Beispiele/s. **Drei synchrone Live-Ansichten = die drei Lernziele:** Loss-Kurve (SVG, fällt, gestrichelte „Rateniveau"-Linie bei log V), Textproben (Kauderwelsch→echte Wörter), **Verteilung fürs nächste Zeichen** (flach→spitz; bewusst dieselbe Balken-Bildsprache wie die Next-Token-Seite → starke Brücke). **Korpus-Umschalter Wörter/Namen** macht die Daten-Botschaft erfahrbar (gleiche Mechanik, andere Daten → andere „Sprache"). Tempo Normal (~15 s, zuschaubar) / Turbo (~2 s). Module: `src/lib/mini-llm/{model,trainer,corpora}.ts` (rein, framework-frei, transparent kommentiert; kuratierte jugendfreie DE-Korpora inline ~KB), Komponente `visualizations/mini-training.tsx` (Modell in Refs, Training über `requestAnimationFrame` mit Schritt-Budget/Frame, nur gedrosselte Snapshots in den State; Pre-Mount-Platzhalter gegen Hydration-Mismatch). Interne Viz-Strings DE (Konvention → Thread 9). **Verifiziert** im Preview: Loss fällt 3.4→1.38, Verteilung flach→`s 16% w 11%…` (typische dt. Wortanfänge), Proben `winter/blume/himmel/liege`, Korpus-Wechsel→Namen `ursula/pia/romy/jan`; Light/Dark, Mobile/Desktop, DE/EN. `tsc` grün. **Hinweis (rAF-Eigenheit):** in der headless-Preview feuert `requestAnimationFrame` nur bei aktivem Repaint (Screenshot/Interaktion), nicht bei passivem Warten → Training-Fortschritt im Test nur über Screenshots messbar; bei sichtbarem Tab (realer Nutzer) läuft rAF mit 60 fps normal.
- **2026-06-03 — Thread 4 (Nachtrag, User-Feedback):** (1) **Lerndaten einsehbar** — „Lerndaten ansehen" blendet die echten Korpus-Wörter ein („das Modell hat nur diese N Wörter gesehen"). (2) **Offenes Training statt fixem 5000-Limit:** Play läuft endlos weiter; neue **„+50"/„+500"-Schritt-Buttons** (landen exakt, dank `min(spf, remaining)`) zum kleinschrittigen Weitertrainieren; Fortschrittsbalken zeigt jetzt „Gelerntheit" (Loss-Abstand zum Rateniveau) statt Schrittquote; Loss-Kurve skaliert x automatisch mit. (3) **Drittes Tempo „Zeitlupe"** (1 Schritt/Frame) neben Normal/Turbo. (4) **Novel-Marker:** generierte Wörter, die NICHT in den Lerndaten stehen, werden blau markiert (Legende „selbst zusammengesetzt") → zeigt Memorieren vs. Generalisieren (im Preview: bei Schritt 1200 `sein`/`suchen` neutral=echt neben `res`/`brat`/`früs` blau=erfunden). (5) Grammatik-Fix Loss-Caption („läge der Fehler bei …" statt mehrdeutigem „läge er"). (6) „Kein Video"-Negativbeschrieb der Seiten-Caption positiv umformuliert (Copy-Regel). `tsc` grün, im Preview verifiziert (offenes Training, +N exakt, Novel-Mix, Lerndaten-Panel, Light/Dark/DE-EN).
- **2026-06-03 — Thread 4 (Nachtrag 2, User-Feedback — 4 Vertiefungen + 4 Fixes):** **Fixes:** (a) **Bug:** Schrittanzeige blieb bei 5000 stehen — `Trainer.runSteps` hatte noch das alte `!this.done`-Limit; entfernt, LR-Decay jetzt auf **absolute Schritte** (>2000→×0.5, >4000→×0.25) statt fixem Ziel → echtes offenes Training. (b) **Tempo gespreizt** via Akkumulator (Bruch-Schritte/Frame): Zeitlupe 0.25 / Normal 6 / Turbo 60 (vorher 1/6/40, kaum Unterschied); „+N" läuft tempo-unabhängig zügig (INCREMENT_SPF=6). (c) Nav-Label **„Training vs. Inferenz" → „Training"** (`nav.training` + `data.nextLabel`, DE+EN). (d) **„überrascht" entschärft** (zu anthropomorph) — Loss-Caption + `training.moreP2` umformuliert (DE+EN). **Vertiefungen (in `mini-llm/{model,trainer,corpora}.ts` + `mini-training.tsx`):** (1) **Eigene Lerndaten** — drittes Korpus „Eigene" mit Textarea; `buildCustomCorpus()` baut aus Nutzertext einen sauberen Korpus (Default: 40 Früchte) → stärkster „Daten formen das Modell"-Moment (Brücke zur Daten-Seite). (2) **Zeichen-Embeddings** — `Trainer.embedding2D()` (PCA von Hand: Power-Iteration + Deflation auf der E×E-Kovarianz, Vorzeichen stabilisiert) projiziert die gelernten Char-Embeddings live in 2D; Vokale grün (chart-2), ordnen sich beim Training → Brücke zur Embeddings-Seite. (3) **Temperatur auf die Proben** — Slider 0.3–1.5 (brav↔wild), `sample(…, T)` → Brücke zur Next-Token-Seite. (4) **Trainingsbeispiel** — `probeExample()` + `deriveExample()` (sucht den reinsten 3-Gramm→Zeichen-Fall im Korpus) zeigt „aus ctx soll target werden" + live steigenden p(richtig)-Balken + ✓. (2)+(4) hinter einer **„Mehr Einblicke — für Interessierte"**-Disclosure (Default schlank). `tsc` grün; im Preview verifiziert: offenes Training (60→300→420, kein 5000-Stopp), Embeddings (29 Zeichen, Vokale clustern), Beispiel `che→n ✓ 49%`, Eigene-Tab (40 Früchte, Reset auf 0), Temperatur, Dark/Mobile.
