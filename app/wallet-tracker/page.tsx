"use client";

import { useEffect, useState } from "react";
import { Wallet, ChevronDown } from "lucide-react";
import FeatureGate from "@/components/FeatureGate";
import PlatformBadge from "@/components/PlatformBadge";
import { Sparkline } from "@/components/app/Sparkline";
import { useTrackedWallets } from "@/lib/hooks/useTrackedWallets";
import type { TopTrader, TraderTrade } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

type Period = "DAY" | "WEEK" | "MONTH" | "ALL";

const TINTS = [
  "bg-up/25 text-up",
  "bg-info/25 text-info",
  "bg-violet/25 text-violet",
  "bg-amber/25 text-amber",
  "bg-cyan/25 text-cyan",
];

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const series = (up: boolean, seed: number) =>
  Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin((i + seed) * 1.1) * 12;
    return (up ? i * 6 : -i * 6) + wave + 50;
  });

export default function WalletTrackerPage() {
  return (
    <FeatureGate ctaLabel="Set up wallet tracking">
      <WalletTracker />
    </FeatureGate>
  );
}

function WalletTracker() {
  const { isTracked, track, untrack, hydrated } = useTrackedWallets();

  const [period, setPeriod] = useState<Period>("WEEK");
  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/traders/leaderboard?period=${period}&limit=12`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTraders(data.traders ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leaderboard."))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/35 bg-brand/[0.12]">
            <Wallet className="h-5 w-5 text-brand" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Top Polymarket wallets</h2>
            <p className="text-xs text-muted-foreground">
              Live leaderboard data, ranked by real P&amp;L
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["DAY", "WEEK", "MONTH", "ALL"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                period === p
                  ? "bg-brand text-[color:var(--on-brand)]"
                  : "border border-brand/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel overflow-hidden rounded-3xl p-5">
        {loading && <p className="text-sm text-muted-foreground">Loading leaderboard…</p>}
        {error && (
          <p className="text-sm text-down">
            {error} (Needs live network access to data-api.polymarket.com.)
          </p>
        )}

        {!loading && !error && traders.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No leaderboard data returned for this period.
          </p>
        )}

        {!loading && !error && traders.length > 0 && (
          <>
            <div className="divide-y divide-border">
              {traders.map((t, i) => (
                <WalletRow
                  key={t.walletAddress}
                  trader={t}
                  index={i}
                  period={period}
                  tracked={isTracked(t.walletAddress)}
                  onToggleTrack={() =>
                    isTracked(t.walletAddress)
                      ? untrack(t.walletAddress)
                      : track(t.walletAddress, t.name)
                  }
                  expanded={expanded === t.walletAddress}
                  onToggleExpand={() =>
                    setExpanded(expanded === t.walletAddress ? null : t.walletAddress)
                  }
                  disabled={!hydrated}
                />
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  );
}

function WalletRow({
  trader,
  index,
  period,
  tracked,
  onToggleTrack,
  expanded,
  onToggleExpand,
  disabled,
}: {
  trader: TopTrader;
  index: number;
  period: Period;
  tracked: boolean;
  onToggleTrack: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
  disabled: boolean;
}) {
  const name = trader.name || truncateAddress(trader.walletAddress);
  const up = trader.pnl >= 0;

  return (
    <div>
      <div className="flex items-center gap-4 py-3.5 transition-colors duration-200 hover:bg-foreground/[0.03]">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            TINTS[index % TINTS.length]
          }`}
        >
          {initialsFor(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            #{trader.rank} {name}
          </p>
          <p className="text-xs text-muted-foreground">
            {truncateAddress(trader.walletAddress)} · {formatUsd(trader.volume)} volume
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted-foreground">P&amp;L ({period.toLowerCase()})</p>
          <p className={`text-sm font-semibold ${up ? "text-up" : "text-down"}`}>
            {formatUsd(trader.pnl)}
          </p>
        </div>
        <Sparkline points={series(up, index)} up={up} />
        <button
          onClick={onToggleTrack}
          disabled={disabled}
          className="ghost-button px-3 py-1.5 text-xs disabled:opacity-50"
        >
          {tracked ? "Tracking" : "Track"}
        </button>
        <button
          onClick={onToggleExpand}
          aria-label="View trades"
          className="text-muted-foreground transition-transform hover:text-foreground"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      {expanded && <TradesPanel address={trader.walletAddress} />}
    </div>
  );
}

function TradesPanel({ address }: { address: string }) {
  const [trades, setTrades] = useState<TraderTrade[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/traders/${address}/trades?limit=8`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTrades(data.trades ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load trades."));
  }, [address]);

  if (error) return <p className="pb-4 text-xs text-down">{error}</p>;
  if (!trades) return <p className="pb-4 text-xs text-muted-foreground">Loading trades…</p>;
  if (trades.length === 0)
    return <p className="pb-4 text-xs text-muted-foreground">No recent trades.</p>;

  return (
    <div className="space-y-2 pb-4">
      {trades.map((t, i) => (
        <div key={i} className="rounded-xl border border-border bg-background/40 p-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform="polymarket" size="xs" />
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                t.side === "SELL" ? "bg-down/20 text-down" : "bg-up/20 text-up"
              }`}
            >
              {t.side ?? "TRADE"} {t.outcome ?? ""}
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {new Date(t.timestampMs).toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-foreground/90">{t.question ?? t.market}</p>
          <p className="mt-0.5 text-muted-foreground">
            {formatUsd(t.size)} @ {(t.price * 100).toFixed(0)}¢
          </p>
        </div>
      ))}
    </div>
  );
}
