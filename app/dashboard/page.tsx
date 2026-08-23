import Link from "next/link";
import { TrendingUp, MonitorPlay, BookmarkCheck, Wallet, Users, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MoneyCounter } from "@/components/app/MoneyCounter";
import { ProofBadge } from "@/components/app/ProofBadge";

interface BigCard {
  to: string;
  icon: LucideIcon;
  lead: string;
  rest: string;
  sub: string;
  body: string;
}

interface SmallCard extends BigCard {
  tint: string;
}

const BIG: BigCard[] = [
  {
    to: "/analyzer",
    icon: TrendingUp,
    lead: "AI",
    rest: "Predictor",
    sub: "AI Market Predictor",
    body: "Upload a screenshot of any market and instantly get the winning pick to bet on.",
  },
  {
    to: "/paper-trading",
    icon: MonitorPlay,
    lead: "Virtual",
    rest: "Trading",
    sub: "Virtual Trading",
    body: "Trade with virtual money and test strategies in real market conditions – zero risk.",
  },
];

const SMALL: SmallCard[] = [
  {
    to: "/handpicked-bets",
    icon: BookmarkCheck,
    lead: "Handpicked",
    rest: "Bets",
    sub: "Handpicked Bets",
    body: "Fresh, high-conviction picks from our AI every day to help you win more.",
    tint: "border-amber/40 bg-amber/10 text-amber",
  },
  {
    to: "/wallet-tracker",
    icon: Wallet,
    lead: "Wallet",
    rest: "Tracker",
    sub: "Wallet Tracker",
    body: "Track the performance of your wallets in real time. Know what's working.",
    tint: "border-cyan/40 bg-cyan/10 text-cyan",
  },
  {
    to: "/copy-trading",
    icon: Users,
    lead: "Copy",
    rest: "Trading",
    sub: "Copy Trading",
    body: "Automatically mirror top traders' moves in real time. Set your budget and relax.",
    tint: "border-violet/40 bg-violet/10 text-violet",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {BIG.map((c) => (
          <Link key={c.to} href={c.to} className="glass-card block rounded-3xl p-6">
            <div className="flex items-center gap-5">
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-brand/40 bg-brand/[0.12] shadow-[var(--glow-soft)]">
                <c.icon className="h-8 w-8 text-brand" />
              </span>
              <h2 className="text-3xl font-bold sm:text-4xl">
                <span className="text-brand">{c.lead}</span>{" "}
                <span className="text-foreground">{c.rest}</span>
              </h2>
            </div>
            <div className="mt-6 h-px w-14 bg-brand/70 shadow-[0_0_10px_var(--brand)]" />
            <p className="mt-4 font-semibold text-brand">{c.sub}</p>
            <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{c.body}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {SMALL.map((c) => (
          <Link key={c.to} href={c.to} className="glass-card block rounded-3xl p-5">
            <div className="flex items-center gap-4">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-xl border ${c.tint}`}
              >
                <c.icon className="h-6 w-6" />
              </span>
              <h3 className="text-xl font-bold">
                <span className="text-brand">{c.lead}</span>{" "}
                <span className="text-foreground">{c.rest}</span>
              </h3>
            </div>
            <div className="mt-5 h-px w-12 bg-brand/70 shadow-[0_0_10px_var(--brand)]" />
            <p className="mt-3 font-semibold text-brand">{c.sub}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
          </Link>
        ))}
      </div>

      <div className="glass-panel flex flex-wrap items-center justify-between gap-6 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {["A", "M", "J"].map((i) => (
              <span
                key={i}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-brand/20 text-sm font-bold text-brand"
              >
                {i}
              </span>
            ))}
          </div>
          <p className="text-lg font-medium">
            <MoneyCounter className="text-glow font-bold text-proof" /> won by people like you
          </p>
          <ProofBadge iconOnly className="[&_svg]:h-5 [&_svg]:w-5" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded bg-brand/90"
                >
                  <Star className="h-3.5 w-3.5 fill-background text-background" />
                </span>
              ))}
            </div>
            <span className="font-semibold">4.9/5</span>
            <span className="h-4 w-px bg-border" />
            <ProofBadge />
          </div>
          <p className="text-xs text-muted-foreground">*Works with Kalshi, Polymarket and more.</p>
          <p className="text-xs text-muted-foreground">
            Oddlytics never touches your money or wallet.*
          </p>
        </div>
      </div>
    </div>
  );
}
