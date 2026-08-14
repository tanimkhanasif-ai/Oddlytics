"use client";

import { useState } from "react";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import { useSubscription } from "@/lib/hooks/useSubscription";

const FEATURES = [
  "Unlimited AI Analyzer runs",
  "AI Coach",
  "Paper Trading",
  "Handpicked Bets — daily curated picks",
  "Wallet Tracker — real Polymarket leaderboard",
  "Copy Trading — mirror real traders into Paper Trading",
];

export default function PricingPage() {
  const { subscribed, hydrated } = useSubscription();
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "all-access" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-white">Simple pricing</h1>
        <p className="mt-2 text-sm text-gray-400">
          One plan, everything unlocked. Pricing shown below is a placeholder — nothing is charged
          in test mode.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs text-gray-500">All-Access</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Oddlytics All-Access</h2>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg text-gray-500 line-through">$39</span>
          <span className="text-4xl font-semibold text-white">$1</span>
          <span className="text-sm text-gray-500">first week</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Then $39/month (placeholder pricing) — cancel anytime.</p>

        {hydrated && subscribed ? (
          <div className="mt-6 rounded-lg bg-yes/10 px-4 py-3 text-center text-sm text-yes">
            You're already on All-Access (test mode).
          </div>
        ) : (
          <button
            onClick={startCheckout}
            disabled={loading || !hydrated}
            className="mt-6 w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Redirecting…" : "Try Oddlytics for $1"}
          </button>
        )}
        <p className="mt-2 text-center text-xs text-gray-500">
          Test mode — no payment provider connected yet.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-gray-300">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-0.5 text-yes">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-center text-xl font-semibold text-white">FAQs</h2>
        <div className="mt-4">
          <FaqAccordion />
        </div>
      </div>

      <p className="text-center text-xs text-gray-500">
        <Link href="/handpicked-bets" className="underline">
          Preview Handpicked Bets
        </Link>{" "}
        before subscribing.
      </p>
    </div>
  );
}
