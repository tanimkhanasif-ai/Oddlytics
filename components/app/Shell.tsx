"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sparkles,
  MonitorPlay,
  BookmarkCheck,
  Wallet,
  Users,
  Settings,
  Crown,
  LifeBuoy,
  Zap,
  X,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { AppSidebar } from "./Sidebar";
import { AccountMenu } from "./AccountMenu";
import { ProofBadge } from "./ProofBadge";
import { OfferPopup } from "./OfferPopup";
import { useCountdown } from "@/components/landing/chrome";
import { useSubscription } from "@/lib/hooks/useSubscription";

const TITLES: Record<string, { title: string; icon: LucideIcon }> = {
  "/dashboard": { title: "Dashboard", icon: LayoutGrid },
  "/analyzer": { title: "AI Predictor", icon: Sparkles },
  "/paper-trading": { title: "Virtual Trading", icon: MonitorPlay },
  "/handpicked-bets": { title: "Handpicked Bets", icon: BookmarkCheck },
  "/wallet-tracker": { title: "Wallet Tracker", icon: Wallet },
  "/copy-trading": { title: "Copy Trading", icon: Users },
  "/settings": { title: "Settings", icon: Settings },
  "/pricing": { title: "Go Premium", icon: Crown },
  "/help": { title: "Help & Support", icon: LifeBuoy },
};

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [collapsed, setCollapsed] = useState(false);
  const [promo, setPromo] = useState(true);
  const countdown = useCountdown();
  const { subscribed, hydrated } = useSubscription();

  const meta = TITLES[pathname] ?? { title: "Oddlytics", icon: LayoutGrid };
  const Icon = meta.icon;
  const showUpgrade = hydrated && !subscribed;

  return (
    <div className="aurora min-h-screen w-full">
      {promo && showUpgrade && (
        <div className="relative flex items-center justify-center gap-2 border-b border-border bg-brand/[0.08] px-10 py-2.5 text-center text-sm font-semibold backdrop-blur-xl">
          <Flame className="h-4 w-4 text-brand" />
          <span>
            First week $1. Offer ends 11:59pm tonight:{" "}
            <span className="text-glow tabular-nums text-brand">{countdown}</span>
          </span>
          <button
            aria-label="Dismiss offer"
            onClick={() => setPromo(false)}
            className="absolute right-4 text-muted-foreground transition-transform duration-200 hover:scale-110 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1600px] gap-4 px-4 pb-10">
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-3 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/35 bg-brand/10 shadow-[var(--glow-soft)]">
                <Icon className="h-5 w-5 text-brand" />
              </span>
              <h1 className="text-xl font-semibold text-foreground">{meta.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {showUpgrade && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,var(--brand-light),var(--brand))] px-4 py-2 text-sm font-semibold text-[color:var(--on-brand)] shadow-[var(--glow-brand)] transition hover:-translate-y-0.5"
                >
                  Upgrade! <Zap className="h-4 w-4 fill-current" />
                </Link>
              )}
              <AccountMenu />
            </div>
          </header>

          <main className="animate-fade-in pb-6">{children}</main>

          <footer className="flex items-center justify-center gap-3 pb-2 text-xs text-muted-foreground">
            <ProofBadge className="text-xs" />
            <span className="h-3 w-px bg-border" />
            <span>Oddlytics never touches your money or wallet.</span>
          </footer>
        </div>
      </div>

      <OfferPopup />
    </div>
  );
}
