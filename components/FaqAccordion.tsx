"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Does the AI Analyzer actually work?",
    a: "It reasons over the market question and current price using Claude, and is upfront about its confidence — including saying so plainly when it doesn't have enough information to be confident.",
  },
  {
    q: "Which platforms does it support?",
    a: "Polymarket and Kalshi for live prices, plus screenshots of any prediction-market question.",
  },
  {
    q: "Is Paper Trading real money?",
    a: "No — Paper Trading only ever uses virtual money, including positions opened automatically through Copy Trading.",
  },
  {
    q: "Where does Wallet Tracker / Copy Trading data come from?",
    a: "Real, live data from Polymarket's public leaderboard and trade history. Kalshi doesn't publish a public trader leaderboard, so those two features are Polymarket-only.",
  },
  {
    q: "Is my payment info safe?",
    a: "Checkout runs in test mode right now — no real payment provider is connected yet, so nothing is charged.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — once real billing is connected, cancellation will be self-serve from Settings.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQS.map((item, i) => (
        <div key={i} className="rounded-lg border border-white/10 bg-white/5">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-gray-200"
          >
            {item.q}
            <span className="text-gray-500">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="px-4 pb-3 text-sm text-gray-400">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
