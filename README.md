# behind-ai

Eine interaktive Anwendung, die erklärt, wie KI-Sprachmodelle (LLMs) funktionieren – mit Visualisierungen und Live-Experimenten.

## Über das Projekt

behind-ai ist eine [Next.js](https://nextjs.org)-Anwendung (App Router), die grundlegende KI-Konzepte wie Tokenisierung, Next-Token-Prediction, Training, RAG und RLHF anschaulich macht. Komplexe Themen werden über interaktive Visualisierungen und echte Modell-Aufrufe verständlich dargestellt.

## Voraussetzungen

- Node.js 20+
- [pnpm](https://pnpm.io) 9 (per `corepack enable` aktivierbar)

## Entwicklung

```bash
pnpm install
pnpm dev
```

Dann [http://localhost:3000](http://localhost:3000) im Browser öffnen.

Weitere Befehle:

```bash
pnpm build   # Production-Build
pnpm start   # Production-Build lokal starten
pnpm lint    # ESLint
```

## Konfiguration

Umgebungsvariablen in `.env.local` setzen (siehe [`.env.example`](./.env.example) für alle Optionen).

Die Seite **Next-Token-Prediction** nutzt Gemini-Logprobs über **Vertex AI** und benötigt ein Dienstkonto:

- **Lokal:** `GOOGLE_APPLICATION_CREDENTIALS` = Pfad zur Dienstkonto-JSON.
- **Deployment (Vercel):** `GCP_SERVICE_ACCOUNT_KEY` = JSON-Inhalt oder dessen Base64.

Das Dienstkonto braucht die Rolle *Vertex AI User*. Details und optionale Variablen (Region, Modell) stehen in `.env.example`.

## Features

- Tokenisierung (interaktiv)
- Next-Token-Prediction mit echten Logprobs (Gemini via Vertex AI)
- Training vs. Inferenz, Finetuning
- RAG (Retrieval Augmented Generation)
- RLHF (Reinforcement Learning from Human Feedback)
- Chain-of-Thought, Embeddings und mehr

## Technologien

- Next.js (App Router) & TypeScript
- Tailwind CSS & shadcn/ui
- Zustand (State Management)
- D3 / Plotly / Recharts (Visualisierungen)
- Google Vertex AI (Gemini) für Next-Token-Logprobs

## Deployment

Deployment über [Vercel](https://vercel.com/new). Vercel installiert mit `pnpm` (`pnpm-lock.yaml`) und baut mit `next build`. Die oben genannten Umgebungsvariablen müssen in den Project Settings hinterlegt sein.

## Lizenz

MIT License – Copyright (c) 2025 behind-ai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
