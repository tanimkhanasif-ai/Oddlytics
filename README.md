# Oddlytics

Oddlytics helps you understand prediction-market questions on Polymarket and Kalshi. It has
two AI-driven features:

- **AI Analyzer** — pulls live YES/NO prices from a pasted Polymarket or Kalshi market URL (or
  reads a pasted screenshot), then returns a structured recommendation: a YES/NO call, a
  confidence score, reasons, key risks, suggested position sizing, and concrete take-profit /
  stop-loss / exit triggers.
- **AI Coach** — a chat panel that explains prediction-market and trading concepts in plain
  language, with awareness of whatever analysis is currently on screen.

Both features are informational analysis only, not financial advice.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS, calling the Anthropic API directly from
server-side route handlers.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000/analyzer.

## How market data is fetched

- **Polymarket**: the public Gamma API (`https://gamma-api.polymarket.com`). Accepts a market or
  event URL/slug and resolves it to a question + YES/NO price via `outcomes`/`outcomePrices`.
- **Kalshi**: the public Trade API v2 (`https://api.elections.kalshi.com/trade-api/v2`). Accepts a
  market URL or bare ticker and derives YES/NO price from the bid/ask midpoint (falling back to
  last traded price).

Both are read-only, unauthenticated endpoints — no API keys needed for market data.

## Project layout

```
app/
  page.tsx                     landing page
  analyzer/page.tsx            AI Analyzer UI (live market + screenshot modes) + Coach panel
  api/analyze/route.ts         calls Claude with the Analysis Engine system prompt
  api/coach/route.ts           calls Claude with the AI Coach system prompt
  api/markets/resolve/route.ts resolves a pasted URL/slug/ticker to live YES/NO prices
components/
  AnalysisResultView.tsx       renders the structured analysis
  CoachChat.tsx                chat widget for the AI Coach
lib/
  prompts.ts                   the two system prompts, verbatim
  types.ts                     shared TypeScript types
  anthropic.ts                 Anthropic client + model config
  markets/polymarket.ts        Gamma API client
  markets/kalshi.ts            Kalshi Trade API v2 client
```

## Environment variables

| Variable            | Required | Default          |
| -------------------- | -------- | ---------------- |
| `ANTHROPIC_API_KEY`  | yes      | —                 |
| `ANALYSIS_MODEL`     | no       | `claude-sonnet-5` |
| `COACH_MODEL`        | no       | `claude-sonnet-5` |
