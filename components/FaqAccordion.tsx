"use client";

import { useState } from "react";
import { ShieldCheck, Lock, DollarSign, RefreshCw, Clock, HelpCircle, type LucideIcon } from "lucide-react";

const FAQS: { icon: LucideIcon; q: string; a: string }[] = [
  {
    icon: ShieldCheck,
    q: "Is my data and account safe?",
    a: "Passwords are hashed with bcrypt and never stored in plain text, and your data (positions, wallets, history) is scoped to your account in our database — not shared across users.",
  },
  {
    icon: Lock,
    q: "Is my payment information secure?",
    a: "Checkout currently runs in test mode — no real payment provider is connected yet, so no card details are collected or stored anywhere. Real billing will go through a PCI-compliant processor, not our own servers.",
  },
  {
    icon: DollarSign,
    q: "Can I try Oddlytics before subscribing?",
    a: "Yes — the AI Analyzer, AI Coach, Paper Trading (virtual money only), and Wallet Tracker are all free to use once you sign up. Handpicked Bets sits behind a subscription.",
  },
  {
    icon: RefreshCw,
    q: "How do I cancel my subscription?",
    a: "From Settings, anytime. Since checkout is in test mode right now, there's no real billing to cancel yet — the toggle just clears your test subscription status.",
  },
  {
    icon: Clock,
    q: "How fast is the analysis?",
    a: "A few seconds once a real Anthropic key is connected. Right now it's running on realistic mocked demo data with a short artificial delay, clearly labeled as demo data in the UI.",
  },
  {
    icon: HelpCircle,
    q: "Do I need experience with prediction markets?",
    a: "Not at all. Paste a market link or screenshot and the Analyzer explains its reasoning in plain language — the AI Coach is there if you want any term or concept explained further.",
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {FAQS.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className="rounded-xl border border-brand/15 bg-white/[0.03] transition hover:border-brand/30"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-brand/40 bg-brand/10 text-brand-bright">
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="flex-1 text-sm font-semibold text-white sm:text-base">{item.q}</span>
              <span className="shrink-0 text-brand-bright">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <p className="px-5 pb-4 pl-[4.25rem] text-sm text-gray-400">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
