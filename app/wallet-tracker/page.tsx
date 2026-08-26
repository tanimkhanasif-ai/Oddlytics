"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import FeatureGate from "@/components/FeatureGate";
import PlatformBadge from "@/components/PlatformBadge";
import { GlowButton } from "@/components/landing/primitives";
import { useAnalysisHistory, type AnalysisHistoryItem } from "@/lib/hooks/useAnalysisHistory";
import { formatUsd } from "@/lib/utils";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function WalletTrackerPage() {
  return (
    <FeatureGate ctaLabel="Unlock your pick history">
      <AnalyzedPicksLog />
    </FeatureGate>
  );
}

function AnalyzedPicksLog() {
  const { history, hydrated } = useAnalysisHistory();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/35 bg-brand/[0.12]">
            <Wallet className="h-5 w-5 text-brand" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Your analyzed picks</h2>
            <p className="text-xs text-muted-foreground">
              Every market the AI Predictor has analyzed for you, most recent first
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-3xl p-5">
        {!hydrated && <p className="text-sm text-muted-foreground">Loading your history…</p>}

        {hydrated && history.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No trades analyzed yet — run a market through the AI Predictor to get your first pick.
            </p>
            <GlowButton href="/analyzer" size="sm" className="mt-4">
              Go to AI Predictor
            </GlowButton>
          </div>
        )}

        {hydrated && history.length > 0 && (
          <div className="divide-y divide-border">
            {history.map((item) => (
              <PickRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PickRow({ item }: { item: AnalysisHistoryItem }) {
  const { result, analyzedAt } = item;
  const isYes = result.recommendation === "YES";
  const betLabel = result.recommended_outcome_label
    ? `Bet ${isYes ? "Yes" : "No"} on ${result.recommended_outcome_label}`
    : `Bet ${isYes ? "Yes" : "No"}`;

  return (
    <Link
      href="/analyzer"
      className="flex items-center gap-4 py-3.5 transition-colors duration-200 hover:bg-foreground/[0.03]"
    >
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
          isYes ? "bg-brand text-[color:var(--on-brand)]" : "bg-no text-white"
        }`}
      >
        {betLabel}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{result.market_question}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {result.platform !== "screenshot" && <PlatformBadge platform={result.platform} size="xs" />}
          <span className="text-xs text-muted-foreground">{timeAgo(analyzedAt)}</span>
          {typeof result.position_sizing?.suggested_amount === "number" && (
            <span className="text-xs text-muted-foreground">
              · Suggested {formatUsd(result.position_sizing.suggested_amount)}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-foreground">{result.confidence_pct}%</p>
        <p className="text-[10px] text-muted-foreground">confidence</p>
      </div>
    </Link>
  );
}
