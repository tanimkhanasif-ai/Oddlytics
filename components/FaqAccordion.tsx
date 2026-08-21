"use client";

import { useState } from "react";
import { ShieldCheck, Lock, DollarSign, RefreshCw, Clock, HelpCircle, type LucideIcon } from "lucide-react";

const FAQS: { icon: LucideIcon; q: string; a: string }[] = [
  {
    icon: ShieldCheck,
    q: "Is my data and account safe?",
    a: "Yes. We use bank-level encryption and never share your data. Your privacy and security are our top priorities.",
  },
  {
    icon: Lock,
    q: "Is my payment information secure?",
    a: "Absolutely. All payments are processed through trusted partners and we never store your card details.",
  },
  {
    icon: DollarSign,
    q: "Can I try Oddlytics before subscribing?",
    a: "Yes! Your first week is just $1. Cancel anytime—no hidden fees.",
  },
  {
    icon: RefreshCw,
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from your account settings with just a few clicks. Access continues until the end of your billing period.",
  },
  {
    icon: Clock,
    q: "How fast is the analysis?",
    a: "Most markets are analyzed in seconds. You get real-time picks and updates as soon as opportunities appear.",
  },
  {
    icon: HelpCircle,
    q: "Do I need experience with prediction markets?",
    a: "Not at all. Oddlytics is designed for everyone. We handle the data and give you simple, actionable picks.",
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
