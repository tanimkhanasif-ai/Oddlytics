# Oddlytics

Oddlytics helps you understand prediction-market questions on Polymarket and Kalshi.

- **AI Analyzer** — pulls live YES/NO prices from a pasted Polymarket or Kalshi market URL (or
  reads a pasted screenshot), then returns a structured recommendation: a YES/NO call, a
  confidence score, reasons, key risks, suggested position sizing, and concrete take-profit /
  stop-loss / exit triggers.
- **AI Coach** — a chat panel that explains prediction-market and trading concepts in plain
  language, aware of whatever analysis is currently on screen.
- **Paper Trading** — practice acting on a pick with virtual money only. Positions and balance are
  stored locally in your browser.
- **Handpicked Bets** — a curated, premium feed of picks behind a subscription paywall.
- **Dashboard** — an overview of your paper-trading portfolio, subscription status, and recent
  analyses.

Both AI features and the paywall run entirely on **mocked data** until you connect real API keys
(see below) — the whole app is testable with zero external services.

## Getting started

```bash
npm install
cp .env.example .env.local   # keys are optional — see "Demo mode" below
npm run dev
```

Open http://localhost:3000.

## Demo mode (current default)

With no `ANTHROPIC_API_KEY` and no Stripe keys set:

- `/api/analyze` and `/api/coach` return realistic **mocked** responses matching the real output
  schema, with a short artificial delay so it feels like a network call. Every mocked
  `AnalysisResult` is flagged with `_mock: true` and the UI shows a "Demo data" badge on it; the
  Coach panel shows a "Demo mode" note under its header once it's replied once.
- The Handpicked Bets paywall uses a **mocked Stripe Checkout** (`/checkout/mock`) — a fake card
  form that never charges anything and just flips a local "subscribed" flag on submit.
- The nav bar shows a **Demo mode** / **Live** pill (from `GET /api/config`) so it's always
  obvious which mode you're in.

Nothing above requires any keys. This is the state the app ships in.

## Connecting real data — step by step

### 1. Anthropic (AI Analyzer + AI Coach)

1. Get an API key from the [Anthropic Console](https://console.anthropic.com/).
2. In `.env.local`, set:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Restart `npm run dev`. That's it — `app/api/analyze/route.ts` and `app/api/coach/route.ts` both
   check `process.env.ANTHROPIC_API_KEY` and automatically switch from the mock path to the real
   Claude call (look for the `// TODO: real Anthropic API call goes here` comment in each file —
   the code is already written and wired, it's just inert without a key).
4. Optional: override `ANALYSIS_MODEL` / `COACH_MODEL` in `.env.local` if you want a different
   model than the default (`claude-sonnet-5`).

### 2. Stripe (Handpicked Bets paywall)

1. Create a Stripe account (test mode is fine to start) and a recurring **Price** for the
   Handpicked Bets subscription.
2. In `.env.local`, set:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_ID=price_...
   ```
3. Restart the app. `app/api/stripe/create-checkout-session/route.ts` and
   `app/api/stripe/verify-session/route.ts` both check for these and switch from the mocked
   checkout to a real Stripe Checkout Session automatically (again, look for the `// TODO: real
   Stripe Checkout Session` comments — the code is already there).
4. To enable the webhook (`app/api/stripe/webhook/route.ts`), also set:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
   and point a Stripe webhook endpoint at `POST /api/stripe/webhook` (use `stripe listen --forward-to
   localhost:3000/api/stripe/webhook` locally).
5. **Known limitation:** Oddlytics has no user accounts or database yet — "subscribed" status
   lives in the browser's `localStorage` (`lib/hooks/useSubscription.ts`). The webhook route
   verifies real Stripe signatures but can't persist anything server-side yet (see the TODO
   comment inside it). Real production use of the paywall needs a users/subscriptions table keyed
   by Stripe customer ID before the webhook path is meaningful — flag this if/when you're ready to
   go past test mode.

### 3. Market data (already live, no keys needed)

Polymarket and Kalshi market-data fetching is already real and unauthenticated:

- **Polymarket**: public Gamma API (`https://gamma-api.polymarket.com`).
- **Kalshi**: public Trade API v2 (`https://api.elections.kalshi.com/trade-api/v2`).

Nothing to configure here.

## Project layout

```
app/
  page.tsx                          landing page
  dashboard/page.tsx                portfolio + subscription + recent-analyses overview
  analyzer/page.tsx                 AI Analyzer UI (live market + screenshot modes) + Coach panel
  coach/page.tsx                    standalone AI Coach chat
  paper-trading/page.tsx            virtual positions, P&L, manual position entry
  handpicked-bets/page.tsx          paywalled curated picks
  checkout/mock/page.tsx            fake Stripe Checkout UI for test-mode flow
  api/analyze/route.ts              mock-or-real Analysis Engine call (ANTHROPIC_API_KEY-gated)
  api/coach/route.ts                mock-or-real AI Coach call (ANTHROPIC_API_KEY-gated)
  api/markets/resolve/route.ts      resolves a pasted URL/slug/ticker to live YES/NO prices
  api/config/route.ts               exposes aiEnabled/stripeEnabled flags to the client
  api/stripe/create-checkout-session/route.ts   mock-or-real Stripe Checkout session
  api/stripe/verify-session/route.ts            mock-or-real payment verification
  api/stripe/webhook/route.ts                   Stripe webhook scaffold (STRIPE_WEBHOOK_SECRET-gated)
components/
  Nav.tsx, ModeBadge.tsx            nav bar + live/demo mode indicator
  AnalysisResultView.tsx            renders a structured analysis + "paper trade this pick"
  CoachChat.tsx                     chat widget for the AI Coach
lib/
  prompts.ts                        the two system prompts, verbatim
  types.ts                          shared TypeScript types
  anthropic.ts / stripe.ts          API client getters
  markets/polymarket.ts             Gamma API client
  markets/kalshi.ts                 Kalshi Trade API v2 client
  mocks/analysis.ts                 mock AnalysisResult generator
  mocks/coach.ts                    mock Coach reply generator
  mocks/handpicks.ts                static curated mock picks
  mocks/priceSimulator.ts           deterministic price drift for open paper positions
  hooks/usePaperTrading.ts          localStorage-backed paper portfolio
  hooks/useSubscription.ts          localStorage-backed paywall state
  hooks/useAnalysisHistory.ts       localStorage-backed recent-analyses list
  hooks/useAppConfig.ts             reads /api/config for the Live/Demo badge
```

## Environment variables

| Variable                | Required | Default            | Enables                          |
| ------------------------ | -------- | ------------------- | --------------------------------- |
| `ANTHROPIC_API_KEY`      | no       | unset (mocked)       | Real AI Analyzer + AI Coach       |
| `ANALYSIS_MODEL`         | no       | `claude-sonnet-5`    | —                                  |
| `COACH_MODEL`            | no       | `claude-sonnet-5`    | —                                  |
| `STRIPE_SECRET_KEY`      | no       | unset (mocked)       | Real Stripe Checkout               |
| `STRIPE_PRICE_ID`        | no       | unset (mocked)       | Real Stripe Checkout               |
| `STRIPE_WEBHOOK_SECRET`  | no       | unset (disabled)     | Stripe webhook signature checking |

## Persistence caveat

Paper Trading positions, subscription status, and analysis history are all stored in the
**browser's `localStorage`** — there's no backend database or user accounts yet. This is
intentional for the current mocked/demo build; it means state doesn't sync across devices and
resets if you clear site data. Worth revisiting before any real users rely on it.
