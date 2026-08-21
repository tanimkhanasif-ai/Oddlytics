# Oddlytics

Oddlytics helps you understand prediction-market questions on Polymarket and Kalshi.

- **AI Analyzer** — pulls live YES/NO prices from a pasted Polymarket or Kalshi market URL (or
  reads a pasted screenshot), then returns a structured recommendation: a YES/NO call, a
  confidence score, reasons, key risks, suggested position sizing, and concrete take-profit /
  stop-loss / exit triggers.
- **AI Coach** — a chat panel that explains prediction-market and trading concepts in plain
  language, aware of whatever analysis is currently on screen.
- **Paper Trading** — practice acting on a pick with virtual money only. Positions and balance are
  real database rows, scoped to your account.
- **Handpicked Bets** — a curated, premium feed of picks behind a subscription paywall.
- **Wallet Tracker** — a real, live leaderboard of top Polymarket traders (public Data API), with
  each wallet's real recent trade history.
- **Copy Trading** — follow a real top Polymarket trader; their new BUY trades on YES/NO markets
  auto-mirror into your virtual Paper Trading balance (never real money).
- **Dashboard** — an overview of your paper-trading portfolio, subscription status, and recent
  analyses.
- **Accounts** — email/password sign-up and login (NextAuth/Auth.js), backed by Postgres (Prisma).
  Every app page except the landing page and Pricing requires being logged in.
- **Pricing** / **Settings** — a pricing page driving the (mocked) checkout flow, and a settings
  page for your account (display name, subscription status, reset account data, log out).

AI Analyzer / AI Coach and the paywall run on **mocked data** until you connect real keys (see
below). Wallet Tracker and Copy Trading are different: they call Polymarket's real, public,
unauthenticated Data API directly — no key needed, no mocking, genuinely live trader data. Kalshi
has no public trader-level API, so those two features are Polymarket-only.

## Getting started

```bash
npm install
cp .env.example .env.local
cp .env.example .env   # Prisma's CLI reads .env specifically, not .env.local — see below
```

Then, in **both** `.env.local` and `.env`, set:

```
NEXTAUTH_SECRET=...        # generate with: openssl rand -base64 32
DATABASE_URL=...           # a Postgres connection string, e.g. from Neon (see below)
```

`ANTHROPIC_API_KEY` and the `PADDLE_*` vars can stay empty — see "Demo mode" below.

```bash
npx prisma migrate deploy   # applies the committed migration in prisma/migrations/
npm run dev
```

Open http://localhost:3000, click **Sign up**, and you're in.

### Setting up a database (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy its connection string into `DATABASE_URL` in both `.env` and `.env.local`.
3. Run `npx prisma migrate deploy` (or `npx prisma migrate dev` in development) to create the
   tables. The schema lives in `prisma/schema.prisma`; the actual migration SQL is already
   committed in `prisma/migrations/`, so you don't need to generate it yourself.

This was tested end-to-end against a real local Postgres instance during development (register →
log in → open/close a Paper Trading position → track a wallet → follow a Copy Trading trader →
reset account data all worked correctly) — the only thing not tested live is Neon specifically,
since this dev environment can't reach the public internet to create one.

## Demo mode (falls back to this automatically)

With no `ANTHROPIC_API_KEY` and no Paddle keys set:

- `/api/analyze` and `/api/coach` return realistic **mocked** responses matching the real output
  schema, with a short artificial delay so it feels like a network call. Every mocked
  `AnalysisResult` is flagged with `_mock: true` and the UI shows a "Demo data" badge on it; the
  Coach panel shows a "Demo mode" note under its header once it's replied once.
- The Handpicked Bets / Pricing paywall uses a **mocked checkout** (`/checkout/mock`) — a fake
  card form that never charges anything and just flips your subscription flag on submit.
- The Sidebar shows a **Demo mode** / **Live** pill (from `GET /api/config`, AI-key state only) so
  it's always obvious which mode the AI features are in.

Each piece falls back independently — you can have real Paddle payments live while AI stays
mocked, or vice versa.

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

### 2. Paddle (Handpicked Bets + Pricing paywall)

Paddle Billing's checkout model is different from Stripe's: instead of the server creating a
redirect session, **Paddle.js** opens an in-page overlay checkout directly from the browser
(`Paddle.Checkout.open(...)`, via the `@paddle/paddle-js` package) — there's no redirect for the
real path.

1. Create a Paddle account and a Product + Price for the subscription. **Start in sandbox** —
   Paddle's sandbox is a fully separate environment from production with its own keys/prices.
2. In `.env.local`, set:
   ```
   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...   # client-side token, safe to expose in the browser
   NEXT_PUBLIC_PADDLE_PRICE_ID=...
   NEXT_PUBLIC_PADDLE_ENV=sandbox        # or "production"
   ```
   This alone is enough to switch the Pricing/Handpicked Bets buttons from the mocked checkout to
   the real overlay (`lib/hooks/usePaddleCheckout.ts` checks these are set — no code changes
   needed). After the overlay reports `checkout.completed`, the page polls `GET /api/subscription`
   for a few seconds waiting for the webhook below to land, since there's no redirect to carry a
   "success" signal back.
3. To make the webhook actually persist the subscription, also get a server API key and set:
   ```
   PADDLE_API_KEY=...
   PADDLE_WEBHOOK_SECRET=...
   ```
   then point a Paddle notification destination at `POST /api/paddle/webhook` (Paddle's dashboard
   → Developer Tools → Notifications) and paste its signing secret into `PADDLE_WEBHOOK_SECRET`.
4. `app/api/paddle/webhook/route.ts` verifies the signature (`paddle.webhooks.unmarshal`), and on
   `subscription.activated` reads `customData.userId` (passed into `Checkout.open()` when the
   button was clicked) to set `subscribed: true` + store `paddleCustomerId` on that user;
   `subscription.canceled` / `subscription.past_due` flip it back off by looking the user up via
   `paddleCustomerId`.
5. Only switch `NEXT_PUBLIC_PADDLE_ENV` to `production` (with production keys/price) after a
   sandbox checkout has been verified working end-to-end.

### 3. Market data (already live, no keys needed)

Polymarket and Kalshi market-data fetching is already real and unauthenticated:

- **Polymarket**: public Gamma API (`https://gamma-api.polymarket.com`).
- **Kalshi**: public Trade API v2 (`https://api.elections.kalshi.com/trade-api/v2`).

Nothing to configure here.

### 4. Wallet Tracker / Copy Trading (already live, no keys needed)

`lib/markets/polymarketTraders.ts` calls Polymarket's public Data API
(`https://data-api.polymarket.com`) for the trader leaderboard and per-wallet trade history — real
data, no auth, nothing to configure. Two things worth knowing:

- The exact leaderboard/trade response field names were pinned down from Polymarket's docs and
  third-party summaries rather than a live test call (this repo's dev sandbox blocks outbound
  requests to `data-api.polymarket.com`), so the parsing in `polymarketTraders.ts` reads several
  plausible field-name variants defensively. Worth a quick live smoke test once you deploy
  somewhere with real network access — `GET /api/traders/leaderboard` is the fastest way to check.
- Kalshi doesn't publish a public trader-level API (it's a regulated, KYC'd exchange, not a public
  blockchain like Polymarket), so there was nothing honest to build there — these two features
  cover Polymarket only rather than filling the gap with scraped or fabricated Kalshi data.

## Project layout

```
app/
  page.tsx                          landing page (marketing chrome)
  pricing/page.tsx                  pricing page, drives the (mocked) checkout
  login/page.tsx, signup/page.tsx   email/password auth (bare chrome)
  dashboard/page.tsx                feature nav grid + portfolio/subscription/recent-analyses overview
  analyzer/page.tsx                 AI Analyzer UI (live market + screenshot modes) + Coach panel
  coach/page.tsx                    standalone AI Coach chat
  paper-trading/page.tsx            virtual positions, P&L, manual position entry
  handpicked-bets/page.tsx          paywalled curated picks
  wallet-tracker/page.tsx           real Polymarket leaderboard + per-wallet trade history
  copy-trading/page.tsx             follow real traders, auto-mirror into Paper Trading
  settings/page.tsx                 account state, reset account data, log out
  checkout/mock/page.tsx            fake checkout UI for the test-mode fallback flow (app chrome-free)
  api/auth/[...nextauth]/route.ts   NextAuth (login/session/logout)
  api/auth/register/route.ts        creates a user (bcrypt-hashed password)
  api/analyze/route.ts              mock-or-real Analysis Engine call (ANTHROPIC_API_KEY-gated)
  api/coach/route.ts                mock-or-real AI Coach call (ANTHROPIC_API_KEY-gated)
  api/markets/resolve/route.ts      resolves a pasted URL/slug/ticker to live YES/NO prices
  api/traders/leaderboard/route.ts          real Polymarket trader leaderboard
  api/traders/[address]/trades/route.ts     real per-wallet trade history
  api/traders/recent-activity/route.ts      real recent sizeable trades, powers the social-proof toast
  api/paper-trading/route.ts        DB-backed positions/cash (GET; POST action: open/close/reset)
  api/wallets/route.ts              DB-backed Wallet Tracker tracked list
  api/copy-trading/route.ts         DB-backed follows + feed (POST action: follow/unfollow/sync)
  api/analysis-history/route.ts     DB-backed recent-analyses list
  api/subscription/route.ts         DB-backed paywall state
  api/account/route.ts              display name + account-data reset
  api/config/route.ts               exposes aiEnabled/paddleEnabled flags to the client
  api/paddle/webhook/route.ts       real Paddle webhook, persists subscription to the DB (PADDLE_*-gated)
components/
  AppChrome.tsx                     picks marketing topnav vs. app sidebar vs. bare (checkout/login/signup) per route
  AuthProvider.tsx                  wraps the app in NextAuth's SessionProvider
  Nav.tsx, Sidebar.tsx, ModeBadge.tsx   marketing topnav, in-app icon sidebar, live/demo indicator
  UrgencyBanner.tsx, SocialProofToast.tsx, ExitIntentModal.tsx, ProfitCalculator.tsx, FaqAccordion.tsx
  AnalysisResultView.tsx            renders a structured analysis + "paper trade this pick"
  CoachChat.tsx                     chat widget for the AI Coach
lib/
  prompts.ts                        the two system prompts, verbatim
  types.ts                          shared TypeScript types
  anthropic.ts / paddle.ts          API client getters
  auth.ts                           NextAuth config (credentials provider, JWT sessions)
  session.ts                        requireUserId() helper for route handlers
  prisma.ts                         Prisma client singleton
  markets/polymarket.ts             Gamma API client
  markets/kalshi.ts                 Kalshi Trade API v2 client
  markets/polymarketTraders.ts      real Polymarket Data API client (leaderboard + trades)
  mocks/analysis.ts                 mock AnalysisResult generator
  mocks/coach.ts                    mock Coach reply generator
  mocks/handpicks.ts                static curated mock picks
  mocks/priceSimulator.ts           deterministic price drift for open paper positions
  hooks/usePaperTrading.ts          fetches /api/paper-trading
  hooks/useSubscription.ts          fetches /api/subscription
  hooks/useAnalysisHistory.ts       fetches /api/analysis-history
  hooks/useAppConfig.ts             reads /api/config for the Live/Demo badge
  hooks/useTrackedWallets.ts        fetches /api/wallets
  hooks/useCopyTrading.ts           fetches /api/copy-trading
  hooks/useSettings.ts              fetches /api/account (display name)
  hooks/usePaddleCheckout.ts        loads Paddle.js + opens the real overlay checkout (falls back to /checkout/mock when unconfigured)
prisma/
  schema.prisma                     User, PaperPosition, TrackedWallet, CopyFollow, MirroredTrade, AnalysisRecord
  migrations/                       committed migration SQL — run with `prisma migrate deploy`
middleware.ts                       redirects unauthenticated visitors to /login for every app route
```

## Environment variables

| Variable                | Required | Default            | Enables                          |
| ------------------------ | -------- | ------------------- | --------------------------------- |
| `NEXTAUTH_SECRET`        | **yes**  | —                    | Session signing — the app won't start meaningfully without it |
| `NEXTAUTH_URL`           | **yes**  | —                    | e.g. `http://localhost:3000` locally |
| `DATABASE_URL`           | **yes**  | —                    | Postgres connection string (e.g. Neon) |
| `ANTHROPIC_API_KEY`      | no       | unset (mocked)       | Real AI Analyzer + AI Coach       |
| `ANALYSIS_MODEL`         | no       | `claude-sonnet-5`    | —                                  |
| `COACH_MODEL`            | no       | `claude-sonnet-5`    | —                                  |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | no | unset (mocked)  | Real Paddle.js overlay checkout    |
| `NEXT_PUBLIC_PADDLE_PRICE_ID`     | no | unset (mocked)  | Real Paddle.js overlay checkout    |
| `NEXT_PUBLIC_PADDLE_ENV`          | no | `sandbox`       | `sandbox` or `production`          |
| `PADDLE_API_KEY`         | no       | unset (webhook disabled) | Webhook signature verification |
| `PADDLE_WEBHOOK_SECRET`  | no       | unset (webhook disabled) | Webhook signature verification |

## Deploying to Vercel

1. Import this repo into Vercel (github.com login is easiest). Deploy `main` — Vercel treats the
   branch it deploys as Production.
2. Set env vars in Project Settings → Environment Variables (Production + Preview):
   `DATABASE_URL` (Neon connection string), a freshly generated `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   set to the real deployed URL, `ANTHROPIC_API_KEY`, and the `PADDLE_*` vars (see above) once
   you've created a Paddle product.
3. `package.json`'s `build` script is `prisma migrate deploy && next build` — every deploy applies
   any new migrations under `prisma/migrations/` automatically before building, so there's no
   manual migration step on Vercel. (This does mean the build fails fast if `DATABASE_URL` isn't
   set — that's intentional for a real deploy.)
4. Once the real domain exists, register `https://<your-domain>/api/paddle/webhook` as a Paddle
   notification destination and set `PADDLE_WEBHOOK_SECRET` from the value Paddle gives you, then
   redeploy (env var changes need a new deploy to take effect).
5. Verify: sign up, run a real AI Analyzer query, run a sandbox Paddle checkout, and confirm
   `/settings` shows the subscription as active once the webhook lands.

## Persistence

Accounts, Paper Trading positions/cash, subscription status, tracked wallets, Copy Trading follows
and their mirrored-trade feed, and analysis history are all real Postgres rows scoped to the
logged-in user (see `prisma/schema.prisma`), not browser storage. State syncs across devices and
survives clearing site data. The only client-only state left is the landing page's session-scoped
"dismissed" flags for the urgency banner and exit-intent modal (`sessionStorage`) — cosmetic, not
user data.
