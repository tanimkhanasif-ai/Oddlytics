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
          profit, stop loss, and exit triggers.
        </p>
      </div>
      <Link
        href="/analyzer"
        className="w-fit rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-200"
      >
        Open the AI Analyzer →
      </Link>
      <div className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          title="Live market data"
          body="Paste a Polymarket or Kalshi market URL and pull current YES/NO prices directly."
        />
        <FeatureCard
          title="Screenshot mode"
          body="Drop in a screenshot of any prediction-market question and let the analyzer read it."
        />
        <FeatureCard
          title="AI Coach"
          body="Ask what a term or a pick means in plain language, right next to your analysis."
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{body}</p>
    </div>
  );
}
