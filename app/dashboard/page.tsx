"use client";

import Link from "next/link";
import { BadgeCheck, Bookmark, Monitor, Sparkles, Star, Users, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import AppTopbar from "@/components/AppTopbar";

const BADGE_COLORS: Record<string, string> = {
  green: "bg-brand text-black shadow-[0_8px_24px_-8px_rgba(34,197,94,0.6)]",
  amber: "bg-amber-500 text-black shadow-[0_8px_24px_-8px_rgba(245,158,11,0.6)]",
  blue: "bg-blue-500 text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.6)]",
  purple: "bg-purple-500 text-white shadow-[0_8px_24px_-8px_rgba(168,85,247,0.6)]",
};

interface CardDef {
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  color: keyof typeof BADGE_COLORS;
  titleGreen: string;
  titleWhite: string;
  body: string;
}

const TOP_ROW: CardDef[] = [
  {
    href: "/analyzer",
    icon: Sparkles,
    color: "green",
    titleGreen: "AI",
    titleWhite: "Predictor",
    body: "Upload a screenshot of any market and instantly get the winning pick to bet on.",
  },
  {
    href: "/paper-trading",
    icon: Monitor,
    color: "green",
    titleGreen: "Virtual",
    titleWhite: "Trading",
    body: "Trade with virtual money and test strategies in real market conditions – zero risk.",
  },
];

const BOTTOM_ROW: CardDef[] = [
  {
    href: "/handpicked-bets",
    icon: Bookmark,
    color: "amber",
    titleGreen: "Handpicked",
    titleWhite: "Bets",
    body: "Fresh, high-conviction picks from our AI every day to help you win more.",
  },
  {
    href: "/wallet-tracker",
    icon: Wallet,
    color: "blue",
    titleGreen: "Wallet",
    titleWhite: "Tracker",
    body: "Track the performance of your wallets in real time. Know what's working.",
  },
  {
    href: "/copy-trading",
    icon: Users,
    color: "purple",
    titleGreen: "Copy",
    titleWhite: "Trading",
    body: "Automatically mirror top traders' moves in real time. Set your budget and relax.",
  },
];

function FeatureCard({ href, icon: Icon, color, titleGreen, titleWhite, body }: CardDef) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-4">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${BADGE_COLORS[color]}`}>
          <Icon className="h-6 w-6" strokeWidth={2.3} />
        </span>
        <h3 className="text-2xl font-extrabold tracking-tight">
          <span className="text-brand-bright">{titleGreen}</span>{" "}
          <span className="text-white">{titleWhite}</span>
        </h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gray-400">{body}</p>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <AppTopbar />
      <div className="grid gap-4 sm:grid-cols-2">
        {TOP_ROW.map((card) => (
          <FeatureCard key={card.href} {...card} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {BOTTOM_ROW.map((card) => (
          <FeatureCard key={card.href} {...card} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-8 w-8 rounded-full border-2 border-black bg-gradient-to-br from-brand to-brand-dark"
              />
            ))}
          </div>
          <p className="text-sm text-gray-200">
            <span className="font-semibold text-white">$3261863+</span> won by people like you
          </p>
          <BadgeCheck className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-sm text-gray-300">
          <span className="inline-flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-brand text-brand" />
            ))}
            <span className="ml-1 font-semibold text-white">4.9/5</span>
          </span>
          <span className="mx-2 text-gray-600">|</span>
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-4 w-4 text-brand-bright" /> verified by Proof
          </span>
        </div>
      </div>
      <p className="text-center text-xs italic text-gray-600 sm:text-left">
        *Works with Kalshi, Polymarket and more. Oddlytics never touches your money or wallet.*
      </p>
    </div>
  );
}
