import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import ProfitCalculator from "@/components/ProfitCalculator";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-24">
      <section className="flex flex-col items-center gap-6 pt-8 text-center">
        <p className="text-xs text-gray-500">Works with Polymarket, Kalshi & more.</p>
        <h1 className="max-w-3xl text-4xl font-semibold text-white sm:text-5xl">
          The AI Analyzer for <span className="italic">prediction markets</span>
        </h1>
        <p className="max-w-xl text-gray-400">
          Oddlytics reads a Polymarket or Kalshi question — live prices or a screenshot — and gives
          you a structured, honest read on where the edge might be.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-200"
          >
            Open the Dashboard →
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white hover:bg-white/20"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section id="features" className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white">Screenshot. Analyze. Decide.</h2>
          <p className="mt-2 text-gray-400">Everything you need to research a pick in one place.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            href="/analyzer"
            title="AI Analyzer"
            body="Paste a live market URL or a screenshot and get a structured YES/NO read with sizing and exit rules."
          />
          <FeatureCard
            href="/coach"
            title="AI Coach"
            body="Ask what a term or a pick means in plain language, right next to your analysis."
          />
          <FeatureCard
            href="/paper-trading"
            title="Paper Trading"
            body="Practice acting on picks with virtual money and track your simulated P&L over time."
          />
          <FeatureCard
            href="/handpicked-bets"
            title="Handpicked Bets"
            body="A curated, premium feed of picks — unlock with a subscription."
          />
          <FeatureCard
            href="/wallet-tracker"
            title="Wallet Tracker"
            body="Real, live Polymarket leaderboard data — see what top-ranked wallets are trading."
          />
          <FeatureCard
            href="/copy-trading"
            title="Copy Trading"
            body="Follow a real top trader and mirror their new trades into your virtual Paper Trading balance."
          />
        </div>
      </section>

      <section>
        <ProfitCalculator />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">One plan, everything unlocked</h2>
        <p className="mt-2 text-gray-400">Handpicked Bets, Copy Trading, and unlimited analysis.</p>
        <Link
          href="/pricing"
          className="mt-5 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-200"
        >
          See pricing
        </Link>
      </section>

      <section id="faq" className="space-y-6">
        <h2 className="text-center text-3xl font-semibold text-white">Got questions?</h2>
        <div className="mx-auto max-w-2xl">
          <FaqAccordion />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10"
    >
      <h3 className="font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{body}</p>
    </Link>
  );
}
