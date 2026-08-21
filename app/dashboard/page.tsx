"use client";

import Link from "next/link";
import { BadgeCheck, Bookmark, Monitor, Sparkles, Star, Users, Wallet } from "lucide-react";
import type { ComponentType } from "react";
import AppTopbar from "@/components/AppTopbar";

const BADGE_COLORS: Record<string, string> = {
  green: "border-brand/40 bg-brand/10 text-brand-bright",
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  blue: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  purple: "border-purple-400/40 bg-purple-400/10 text-purple-300",
};

interface CardDef {
  href: string;
  icon: ComponentType<{ className?: string }>;
  color: keyof typeof BADGE_COLORS;
  titleGreen: string;
  titleWhite: string;
  subtitle: string;
  body: string;
}

const TOP_ROW: CardDef[] = [
  {
    href: "/analyzer",
    icon: Sparkles,
    color: "green",
    titleGreen: "AI",
    titleWhite: "Predictor",
    subtitle: "AI Market Predictor",
    body: "Upload a screenshot of any market and instantly get the winning pick to bet on.",
  },
  {
    href: "/paper-trading",
    icon: Monitor,
    color: "green",
    titleGreen: "Virtual",
    titleWhite: "Trading",
    subtitle: "Virtual Trading",
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
    subtitle: "Handpicked Bets",
    body: "Fresh, high-conviction picks from our AI every day to help you win more.",
  },
  {
    href: "/wallet-tracker",
    icon: Wallet,
    color: "blue",
    titleGreen: "Wallet",
    titleWhite: "Tracker",
    subtitle: "Wallet Tracker",
    body: "Track the performance of your wallets in real time. Know what's working.",
  },
  {
    href: "/copy-trading",
    icon: Users,
    color: "purple",
    titleGreen: "Copy",
    titleWhite: "Trading",
    subtitle: "Copy Trading",
    body: "Automatically mirror top traders' moves in real time. Set your budget and relax.",
  },
];

function FeatureCard({ href, icon: Icon, color, titleGreen, titleWhite, subtitle, body }: CardDef) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-24 w-24 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />
      <div className="relative flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${BADGE_COLORS[color]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-bold">
          <span className="text-brand-bright">{titleGreen}</span>{" "}
          <span className="text-white">{titleWhite}</span>
        </h3>
      </div>
      <div className="relative mt-4 h-px w-10 bg-brand/60" />
      <p className="relative mt-3 text-sm font-semibold text-brand-bright">{subtitle}</p>
      <p className="relative mt-1 text-sm text-gray-400">{body}</p>
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
