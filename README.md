# Oddlytics

Oddlytics helps you understand prediction-market questions on Polymarket and Kalshi.

- **AI Analyzer** — pulls live YES/NO prices from a pasted Polymarket or Kalshi market URL (or
  reads a pasted screenshot), then returns a structured recommendation: a YES/NO call, a
  confidence score, reasons, key risks, suggested position sizing, and concrete take-profit /
  stop-loss / exit triggers.
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

AI Analyzer and the paywall run on **mocked data** until you connect real keys (see
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
2. Neon shows **two** connection strings for the same database. Copy the **pooled** one
   (hostname contains `-pooler`) into `DATABASE_URL`, and the **direct** one into `DIRECT_URL`,
   in both `.env` and `.env.local`. The app uses the pooled connection; Prisma migrations use the
   direct one, because they can't run through a connection pooler. On plain local Postgres, point
   both at the same string.
3. Run `npx prisma migrate deploy` (or `npx prisma migrate dev` in development) to create the
   tables. The schema lives in `prisma/schema.prisma`; the actual migration SQL is already
   committed in `prisma/migrations/`, so you don't need to generate it yourself.

This was tested end-to-end against a real local Postgres instance during development (register →
log in → open/close a Paper Trading position → track a wallet → follow a Copy Trading trader →
reset account data all worked correctly) — the only thing not tested live is Neon specifically,
since this dev environment can't reach the public internet to create one.

## Demo mode (falls back to this automatically)

With no `ANTHROPIC_API_KEY` and no Whop keys set:

- `/api/analyze` returns a realistic **mocked** response matching the real output schema, with a
  short artificial delay so it feels like a network call. Every mocked `AnalysisResult` is flagged
  with `_mock: true` and the UI shows a "Demo data" badge on it.
- The Handpicked Bets / Pricing paywall uses a **mocked checkout** (`/checkout/mock`) — a fake
  card form that never charges anything and just flips your subscription flag on submit.
- The Sidebar shows a **Demo mode** / **Live** pill (from `GET /api/config`, AI-key state only) so
  it's always obvious which mode the AI features are in.

Each piece falls back independently — you can have real Whop payments live while AI stays
mocked, or vice versa.

## Connecting real data — step by step

### 1. Anthropic (AI Analyzer + Handpicked Bets curation)

1. Get an API key from the [Anthropic Console](https://console.anthropic.com/).
2. In `.env.local`, set:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Restart `npm run dev`. That's it — `app/api/analyze/route.ts` checks
   `process.env.ANTHROPIC_API_KEY` and automatically switches from the mock path to the real
   Claude call (look for the `// TODO: real Anthropic API call goes here` comment — the code is
   already written and wired, it's just inert without a key).
4. Optional: override `ANALYSIS_MODEL` in `.env.local` if you want a different model than the
   default (`claude-sonnet-5`).

### 2. Whop (Handpicked Bets + Pricing paywall)

Whop is a Merchant of Record — it's legally the seller on every transaction, so it collects and
remits sales tax/VAT worldwide for you, and (unlike Stripe) supports sellers based in countries
like Bangladesh. Checkout uses **Whop Elements** (`@whop/elements` / `@whop/elements-react`): the
browser mints its own checkout session directly from the plan id and renders it in a modal via
`<Checkout>`/`<CheckoutElement>` — no server-side session pre-creation. (An earlier version of
this integration used the older `@whop/checkout` package, which pre-created the session on the
server; that combination 404'd on Whop's own checkout page for this account, so it was replaced
with the Elements flow Whop's own dashboard now generates for "Embed checkout" on a plan.)

1. Create a Whop account and a Plan for the subscription (**Company → Products → Plans**).
2. In `.env.local`, set:
   ```
   WHOP_PLAN_ID=plan_...      # the plan you created
   ```
   A plan id isn't secret — it's the same id Whop's own "Copy checkout link" embeds — so it's
   exposed to the client via `GET /api/config`. Setting it is enough to switch the Pricing /
   Handpicked Bets buttons from the mocked checkout to the real Whop embed (`whopEnabled` in
   `app/api/config/route.ts` — no code changes needed). The checkout element has no in-page
   completion callback; instead it redirects the whole tab to `returnUrl`
   (`/pricing?checkout=complete`) after payment, and that page then polls `GET /api/subscription`
   for a few seconds waiting for the webhook below to land, since completion itself doesn't update
   our database.
3. To make the webhook actually persist the subscription, also set:
   ```
   WHOP_WEBHOOK_SECRET=ws_...
   ```
   then create a webhook endpoint pointed at `POST /api/whop/webhook` (Whop dashboard → Developer
   → Webhooks) subscribed to `membership.activated` and `membership.deactivated`, and paste its
   signing secret into `WHOP_WEBHOOK_SECRET`.
4. `app/api/whop/webhook/route.ts` verifies the signature (`unwrapWebhook` from `@whop/sdk/helpers`,
   using the Standard Webhooks scheme), and on `membership.activated` reads `metadata.userId`
   (attached client-side when the checkout element minted its session) to set `subscribed: true` +
   store `whopMembershipId` on that user; `membership.deactivated` flips it back off by looking the
   user up via `whopMembershipId` as a fallback when metadata isn't present.

### 3. Google sign-in (optional)

Leave `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` unset and "Continue with Google" just explains
it's not connected yet — email/password sign-up and login already work fully without it. To turn
it on:

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a project (or pick
   an existing one).
2. **APIs & Services → OAuth consent screen** — configure it (External, app name, your email).
   This is a one-time setup per Google Cloud project.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application.**
4. Under **Authorized redirect URIs**, add exactly:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://<your-production-domain>/api/auth/callback/google` (prod — add this once you have
     a real domain; you can come back and add it later)
5. Copy the generated **Client ID** and **Client secret** into `GOOGLE_CLIENT_ID` /
   `GOOGLE_CLIENT_SECRET` — in `.env.local` for local dev, and in Vercel's project env vars for
   production. Restart the dev server (or redeploy) after setting them.

The first time someone signs in with Google, a `User` row is created for them automatically
(`lib/auth.ts`'s `signIn` callback) with no password — they can only sign in with Google after
that, since there's nothing to check a typed password against.

### 4. Market data (already live, no keys needed)

Polymarket and Kalshi market-data fetching is already real and unauthenticated:

- **Polymarket**: public Gamma API (`https://gamma-api.polymarket.com`).
- **Kalshi**: public Trade API v2 (`https://api.elections.kalshi.com/trade-api/v2`).

Nothing to configure here.

### 5. Wallet Tracker / Copy Trading (already live, no keys needed)

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

### 6. Weekly Handpicked Bets (needs `CRON_SECRET`)

Handpicked Bets is a *cached weekly set*, not a live scan on every page load. Once a week a cron
job scans live markets, runs each one through the same analyzer the AI Predictor uses, and stores
the strongest picks; the page just reads those rows.

How the picks are chosen (`lib/handpicks.ts`):

1. Fetch the top ~40 markets by volume across Polymarket and Kalshi.
2. Analyze each one (in batches of 5) to get a YES/NO call and a confidence score.
3. Keep only the ones the AI is **at least 70% confident** on.
4. Rank by **edge**, not raw confidence, and publish the top 10.

Step 4 is the part worth understanding. A market trading at 90c is already saying "90% likely", so
an AI that's 90% confident on it has found nothing — it just agrees with the price. *Edge* is
`AI confidence − market-implied probability`, i.e. how far the AI's read sits above what you're
being asked to pay. Each card shows all three numbers (AI / Market / Edge) so a high-confidence,
zero-edge pick is visibly different from a real disagreement. High confidence is not the same thing
as a good bet, and the UI doesn't pretend otherwise.

To turn it on:

1. Generate a secret: `openssl rand -hex 32`.
2. Add it as `CRON_SECRET` in Vercel (Production + Preview) and redeploy.
3. `vercel.json` already registers the schedule — `/api/cron/handpicks` every Monday at 06:00 UTC.
   Vercel sends the `Authorization: Bearer <CRON_SECRET>` header automatically.

Until `CRON_SECRET` is set the endpoint returns 501 and refuses to run, so nobody can trigger paid
analysis runs from the outside. To publish the first set without waiting for Monday, call it by
hand once after deploying:

```bash
curl -H "authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/handpicks
```

Non-subscribers see the first 3 picks with the reasoning hidden; subscribers see all 10 with the
full analysis, risks and exit plan.

#### Manual publish path (image-curated picks)

`curateWeeklyPicks()` isn't the only way to fill this table. `publishManualPicks()`
(`lib/handpicks.ts`) takes a pre-analyzed batch of picks — e.g. from market screenshots handed to
Claude directly in chat instead of the automated live-market scan — and publishes them the exact
same way: filtered to `MIN_CONFIDENCE`, ranked by edge, capped at `PICK_COUNT`, replacing this
week's set. It's exposed at `POST /api/admin/handpicks`, gated by the same `CRON_SECRET` bearer
token as the cron route:

```bash
curl -X POST https://<your-domain>/api/admin/handpicks \
  -H "authorization: Bearer $CRON_SECRET" \
  -H "content-type: application/json" \
  -d '{"picks": [
    {
      "platform": "polymarket",
      "marketId": "some-market-slug-or-ticker",
      "question": "Will X happen by Y?",
      "url": "https://polymarket.com/event/...",
      "marketPct": 62,
      "analysis": { "...": "a full AnalysisResult, matching lib/types.ts" }
    }
  ]}'
```

Both paths write to the same table and the page can't tell them apart — whichever ran most
recently for the current week wins.

## Project layout

```
app/
  page.tsx                          landing page (marketing chrome)
  pricing/page.tsx                  pricing page, drives the (mocked) checkout
  login/page.tsx, signup/page.tsx   email/password auth (bare chrome)
  dashboard/page.tsx                feature nav grid + portfolio/subscription/recent-analyses overview
  analyzer/page.tsx                 AI Analyzer UI (live market + screenshot modes)
  paper-trading/page.tsx            virtual positions, P&L, manual position entry
  handpicked-bets/page.tsx          paywalled curated picks
  wallet-tracker/page.tsx           real Polymarket leaderboard + per-wallet trade history
  copy-trading/page.tsx             follow real traders, auto-mirror into Paper Trading
  settings/page.tsx                 account state, reset account data, log out
  checkout/mock/page.tsx            fake checkout UI for the test-mode fallback flow (app chrome-free)
  api/auth/[...nextauth]/route.ts   NextAuth (login/session/logout)
  api/auth/register/route.ts        creates a user (bcrypt-hashed password)
  api/analyze/route.ts              mock-or-real Analysis Engine call (ANTHROPIC_API_KEY-gated)
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
  api/config/route.ts               exposes aiEnabled/whopEnabled/whopPlanId flags to the client
  api/whop/webhook/route.ts         real Whop webhook, persists subscription to the DB (WHOP_*-gated)
components/
  AppChrome.tsx                     picks marketing topnav vs. app sidebar vs. bare (checkout/login/signup) per route
  AuthProvider.tsx                  wraps the app in NextAuth's SessionProvider
  Nav.tsx, Sidebar.tsx, ModeBadge.tsx   marketing topnav, in-app icon sidebar, live/demo indicator
  UrgencyBanner.tsx, SocialProofToast.tsx, ExitIntentModal.tsx, ProfitCalculator.tsx, FaqAccordion.tsx
  AnalysisResultView.tsx            renders a structured analysis + "paper trade this pick"
  checkout/WhopCheckoutModal.tsx    modal chrome around the Whop Elements checkout (falls back to /checkout/mock when unconfigured)
  checkout/WhopCheckoutEmbed.tsx    the actual `<Checkout>`/`<CheckoutElement>` tree, client-only (dynamic ssr:false)
lib/
  prompts.ts                        the two system prompts, verbatim
  types.ts                          shared TypeScript types
  anthropic.ts                      API client getter
  auth.ts                           NextAuth config (credentials provider, JWT sessions)
  session.ts                        requireUserId() helper for route handlers
  prisma.ts                         Prisma client singleton
  markets/polymarket.ts             Gamma API client
  markets/kalshi.ts                 Kalshi Trade API v2 client
  markets/polymarketTraders.ts      real Polymarket Data API client (leaderboard + trades)
  mocks/analysis.ts                 mock AnalysisResult generator
  mocks/handpicks.ts                static curated mock picks
  mocks/priceSimulator.ts           deterministic price drift for open paper positions
  hooks/usePaperTrading.ts          fetches /api/paper-trading
  hooks/useSubscription.ts          fetches /api/subscription
  hooks/useAnalysisHistory.ts       fetches /api/analysis-history
  hooks/useAppConfig.ts             reads /api/config for the Live/Demo badge
  hooks/useTrackedWallets.ts        fetches /api/wallets
  hooks/useCopyTrading.ts           fetches /api/copy-trading
  hooks/useSettings.ts              fetches /api/account (display name)
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
| `DATABASE_URL`           | **yes**  | —                    | Postgres connection string — Neon's **pooled** one |
| `DIRECT_URL`             | **yes**  | —                    | Same database, Neon's **direct** (non-pooled) string; used by migrations |
| `ANTHROPIC_API_KEY`      | no       | unset (mocked)       | Real AI Analyzer + Handpicked Bets curation |
| `ANALYSIS_MODEL`         | no       | `claude-sonnet-5`    | —                                  |
| `WHOP_PLAN_ID`           | no       | unset (mocked)  | Real Whop embedded checkout        |
| `WHOP_WEBHOOK_SECRET`    | no       | unset (webhook disabled) | Webhook signature verification |
| `CRON_SECRET`            | no       | unset (cron disabled)    | Weekly Handpicked Bets curation run |
| `GOOGLE_CLIENT_ID`       | no       | unset (Google sign-in disabled) | From Google Cloud Console — see section 3 above |
| `GOOGLE_CLIENT_SECRET`   | no       | unset (Google sign-in disabled) | From Google Cloud Console — see section 3 above |

## Deploying to Vercel

1. Import this repo into Vercel (github.com login is easiest). Deploy `main` — Vercel treats the
   branch it deploys as Production.
2. Set env vars in Project Settings → Environment Variables (Production + Preview):
   `DATABASE_URL` (Neon connection string), a freshly generated `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   set to the real deployed URL, `ANTHROPIC_API_KEY`, and the `WHOP_*` vars (see above) once
   you've created a Whop plan.
3. `package.json`'s `build` script is `prisma migrate deploy && next build` — every deploy applies
   any new migrations under `prisma/migrations/` automatically before building, so there's no
   manual migration step on Vercel. (This does mean the build fails fast if `DATABASE_URL` isn't
   set — that's intentional for a real deploy.)
4. Once the real domain exists, register `https://<your-domain>/api/whop/webhook` as a Whop
   webhook endpoint and set `WHOP_WEBHOOK_SECRET` from the value Whop gives you, then
   redeploy (env var changes need a new deploy to take effect).
5. Set `CRON_SECRET` and trigger `/api/cron/handpicks` once by hand so Handpicked Bets has a
   published set before the first Monday run (see "Weekly Handpicked Bets" above).
6. Verify: sign up, run a real AI Analyzer query, run a real Whop checkout, and confirm
   `/settings` shows the subscription as active once the webhook lands.

## Persistence

Accounts, Paper Trading positions/cash, subscription status, tracked wallets, Copy Trading follows
and their mirrored-trade feed, and analysis history are all real Postgres rows scoped to the
logged-in user (see `prisma/schema.prisma`), not browser storage. State syncs across devices and
survives clearing site data. The only client-only state left is the landing page's session-scoped
"dismissed" flags for the urgency banner and exit-intent modal (`sessionStorage`) — cosmetic, not
user data.
