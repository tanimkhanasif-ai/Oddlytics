import Link from "next/link";
import { TrendingUp, Check } from "lucide-react";

const FEATURES = [
  "Unlimited AI analysis on any market",
  "Smart copy trading to follow top traders automatically",
  "Daily high-conviction picks from our AI",
  "Live wallet tracking of top-performing traders",
  "Paper trading to refine your strategy risk-free",
  "AI coaching to help you win more",
];

/** Landing-page pricing teaser — links into /pricing for the actual checkout flow. */
export default function PricingTeaserCard() {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-brand/30 bg-gradient-to-b from-brand-deep/40 to-black/40 p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-gray-300">
          Trusted by <span className="font-semibold text-brand-bright">28k+</span> traders
        </span>
        <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-bright">
          One win pays for your whole month
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-brand-bright">
          <TrendingUp className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">Full Access</h3>
          <p className="text-sm text-gray-400">Complete access to everything Oddlytics has to offer.</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-lg text-gray-500 line-through">$99</span>
        <span className="text-4xl font-extrabold text-white">$29</span>
        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand-bright">-71%</span>
      </div>
      <p className="text-xs text-gray-500">Placeholder pricing — not finalized.</p>

      <Link
        href="/pricing"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-glow transition hover:bg-brand-dark"
      >
        Get Full Access for $29 →
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-gray-400">
        <span>✓ Instant access</span>
        <span>✓ Cancel anytime</span>
        <span>✓ Secure checkout</span>
      </div>

      <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-bright" strokeWidth={3} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
