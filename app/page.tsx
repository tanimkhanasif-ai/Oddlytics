import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">
          Understand prediction markets before you trade them.
        </h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          Oddlytics reads a Polymarket or Kalshi question — live prices or a pasted screenshot —
          and gives you a structured, honest read on where the edge might be, with concrete take
          profit, stop loss, and exit triggers. Practice it risk-free with Paper Trading, or unlock
          curated Handpicked Bets.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-200"
        >
          Open the Dashboard →
        </Link>
        <Link
          href="/analyzer"
          className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20"
        >
          Try the AI Analyzer
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          title="AI Analyzer"
          body="Paste a live market URL or a screenshot and get a structured YES/NO read with sizing and exit rules."
          href="/analyzer"
        />
        <FeatureCard
          title="AI Coach"
          body="Ask what a term or a pick means in plain language, right next to your analysis."
          href="/coach"
        />
        <FeatureCard
          title="Paper Trading"
          body="Practice acting on picks with virtual money and track your simulated P&L over time."
          href="/paper-trading"
        />
        <FeatureCard
          title="Handpicked Bets"
          body="A curated, premium feed of picks — unlock with a subscription."
          href="/handpicked-bets"
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
    >
      <h3 className="font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{body}</p>
    </Link>
  );
}
