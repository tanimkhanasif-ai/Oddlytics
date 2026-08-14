"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAnalysisHistory } from "@/lib/hooks/useAnalysisHistory";
import { useAppConfig } from "@/lib/hooks/useAppConfig";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { simulateCurrentPrice } from "@/lib/mocks/priceSimulator";
import { formatUsd, truncate } from "@/lib/utils";

export default function DashboardPage() {
  const config = useAppConfig();
  const { cashUsd, positions, hydrated: paperHydrated } = usePaperTrading();
  const { subscribed, hydrated: subHydrated } = useSubscription();
  const { history, hydrated: historyHydrated } = useAnalysisHistory();

  const openPositions = positions.filter((p) => p.status === "open");

  const unrealizedPnl = useMemo(() => {
    return openPositions.reduce((sum, p) => {
      const current = simulateCurrentPrice(p.id, p.entryPrice, p.openedAt);
      const shares = p.sizeUsd / p.entryPrice;
      return sum + (shares * current - p.sizeUsd);
    }, 0);
  }, [openPositions]);

  const hydrated = paperHydrated && subHydrated && historyHydrated;
  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          {config && !config.aiEnabled
            ? "Running in demo mode — AI Analyzer and AI Coach responses are mocked until ANTHROPIC_API_KEY is connected."
            : "Your Oddlytics overview."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureCard
          href="/analyzer"
          title="AI Analyzer"
          body="Upload a screenshot or paste a market link and get a structured pick."
        />
        <FeatureCard
          href="/paper-trading"
          title="Paper Trading"
          body="Trade with virtual money and test strategies without any risk."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          href="/handpicked-bets"
          title="Handpicked Bets"
          body="Curated picks, refreshed regularly."
          compact
        />
        <FeatureCard
          href="/wallet-tracker"
          title="Wallet Tracker"
          body="Real top Polymarket traders, live."
          compact
        />
        <FeatureCard
          href="/copy-trading"
          title="Copy Trading"
          body="Mirror real traders into Paper Trading."
          compact
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Virtual cash" value={formatUsd(cashUsd)} href="/paper-trading" />
        <StatCard label="Open positions" value={String(openPositions.length)} href="/paper-trading" />
        <StatCard
          label="Unrealized P&L"
          value={formatUsd(unrealizedPnl)}
          tone={unrealizedPnl >= 0 ? "yes" : "no"}
          href="/paper-trading"
        />
        <StatCard
          label="Handpicked Bets"
          value={subscribed ? "Unlocked" : "Locked"}
          tone={subscribed ? "yes" : undefined}
          href="/handpicked-bets"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Recent analyses
        </h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No analyses yet — <Link href="/analyzer" className="underline">run one</Link> to see it
            here.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {history.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 p-3"
              >
                <p className="truncate text-sm text-gray-300">{truncate(r.market_question, 80)}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    r.recommendation === "YES" ? "bg-yes/15 text-yes" : "bg-no/15 text-no"
                  }`}
                >
                  {r.recommendation} · {r.confidence_pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({
  href,
  title,
  body,
  compact,
}: {
  href: string;
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <h3 className={compact ? "text-base font-semibold text-white" : "text-xl font-semibold text-white"}>
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-400">{body}</p>
    </Link>
  );
}

function StatCard({
  label,
  value,
  tone,
  href,
}: {
  label: string;
  value: string;
  tone?: "yes" | "no";
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10"
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold ${
          tone === "yes" ? "text-yes" : tone === "no" ? "text-no" : "text-white"
        }`}
      >
        {value}
      </p>
    </Link>
  );
}
