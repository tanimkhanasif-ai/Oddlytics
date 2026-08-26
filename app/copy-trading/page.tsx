"use client";

import { useEffect, useState } from "react";
import { Wallet, ArrowLeftRight, ChevronDown } from "lucide-react";
import FeatureGate from "@/components/FeatureGate";
import PlatformBadge from "@/components/PlatformBadge";
import { useCopyTrading } from "@/lib/hooks/useCopyTrading";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { simulateCurrentPrice } from "@/lib/mocks/priceSimulator";
import type { TopTrader, TraderTrade } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

const LEADERBOARD_SIZE = 25;
/** A trade counts as "live" if it happened within this window. Polymarket's public
 *  API exposes trade history, not an open-positions feed, so recency is the closest
 *  honest proxy for "what this trader is doing right now." */
const LIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

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

export default function CopyTradingPage() {
  return (
    <FeatureGate ctaLabel="Set up copytrading">
      <CopyTrading />
    </FeatureGate>
  );
}

function CopyTrading() {
  const { cashUsd, positions } = usePaperTrading();
  const { follows, hydrated, feed, follow, unfollow, syncNow, syncing } = useCopyTrading();

  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/traders/leaderboard?period=WEEK&limit=${LEADERBOARD_SIZE}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTraders(data.traders ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leaderboard."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (hydrated && follows.length > 0) syncNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Real P&L across positions that Copy Trading actually opened for this user.
  const mirroredPnl = positions
    .filter((p) => p.source === "copy-trading")
    .reduce((sum, p) => {
      const price =
        p.status === "closed"
          ? p.exitPrice ?? p.entryPrice
          : p.livePrice ?? simulateCurrentPrice(p.id, p.entryPrice, p.openedAt);
      return sum + ((p.sizeUsd / p.entryPrice) * price - p.sizeUsd);
    }, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-6 rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/35 bg-brand/[0.12]">
            <Wallet className="h-5 w-5 text-brand" />
          </span>
          <div>
            <p className="text-xs tracking-widest text-muted-foreground">BALANCE</p>
            <p className="text-2xl font-bold text-foreground">{formatUsd(cashUsd)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-widest text-muted-foreground">TOTAL P&amp;L</p>
          <p className="text-glow text-2xl font-bold text-brand">
            {mirroredPnl >= 0 ? "+" : ""}
            {formatUsd(mirroredPnl)}
          </p>
          <p className="text-xs text-brand/80">
            {follows.length} trader{follows.length === 1 ? "" : "s"} followed
          </p>
        </div>
      </div>

      <button
        onClick={() => setPickerOpen((o) => !o)}
        className="ghost-button w-full justify-between px-5 py-4 text-base font-medium"
      >
        <span className="flex items-center gap-3">
          <ArrowLeftRight className="h-4 w-4 text-brand" /> Select Trader
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${pickerOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div className="glass-panel overflow-hidden rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Top 25 traders</h2>
          <PlatformBadge platform="polymarket" size="xs" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Real, live Polymarket leaderboard data. Kalshi accounts are private and have no public
          trader API, so Copy Trading can only offer real traders from Polymarket.
        </p>

        {loading && <p className="mt-3 text-sm text-muted-foreground">Loading leaderboard…</p>}
        {error && (
          <p className="mt-3 text-sm text-down">
            {error} (Needs live network access to data-api.polymarket.com.)
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="mt-3 divide-y divide-border">
              {traders.map((t, i) => (
                <TraderRow
                  key={t.walletAddress}
                  trader={t}
                  index={i}
                  following={follows.some((f) => f.walletAddress === t.walletAddress)}
                  onFollow={(amount) => follow(t.walletAddress, t.name, amount)}
                  onUnfollow={() => unfollow(t.walletAddress)}
                  disabled={!hydrated}
                  expanded={expanded === t.walletAddress}
                  onToggleExpand={() =>
                    setExpanded(expanded === t.walletAddress ? null : t.walletAddress)
                  }
                />
              ))}
            </div>

          </>
        )}
      </div>

      {follows.length > 0 && (
        <div className="glass-panel rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Following</h2>
            <button
              onClick={() => syncNow()}
              disabled={syncing}
              className="ghost-button px-3 py-1.5 text-xs disabled:opacity-50"
            >
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          </div>
          <div className="mt-3 divide-y divide-border">
            {follows.map((f) => (
              <div key={f.walletAddress} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {f.name || truncateAddress(f.walletAddress)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Virtual allocation: {formatUsd(f.allocationUsd)}
                  </p>
                </div>
                <button
                  onClick={() => unfollow(f.walletAddress)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {feed.length > 0 && (
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="font-semibold text-foreground">Mirrored trade activity</h2>
          <div className="mt-3 divide-y divide-border">
            {feed.map((e, i) => (
              <div key={i} className="py-3 text-sm">
                <div className="mb-1.5 flex items-center gap-2">
                  <PlatformBadge platform="polymarket" size="xs" />
                </div>
                <p className="text-foreground/90">
                  Mirrored {e.outcome ?? "a position"} on{" "}
                  <span className="text-muted-foreground">{e.question}</span> —{" "}
                  {formatUsd(e.sizeUsd)} @ {(e.price * 100).toFixed(0)}¢
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Following {e.traderLabel} · {new Date(e.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TraderRow({
  trader,
  index,
  following,
  onFollow,
  onUnfollow,
  disabled,
  expanded,
  onToggleExpand,
}: {
  trader: TopTrader;
  index: number;
  following: boolean;
  onFollow: (allocationUsd: number) => void;
  onUnfollow: () => void;
  disabled: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [allocation, setAllocation] = useState("100");
  const name = trader.name || truncateAddress(trader.walletAddress);
  const positive = trader.pnl >= 0;

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
            {trader.followerCount} Copier{trader.followerCount === 1 ? "" : "s"} ·{" "}
            {formatUsd(trader.volume)} volume
          </p>
        </div>
        <span className={`text-base font-bold ${positive ? "text-up" : "text-down"}`}>
          {formatUsd(trader.pnl)}
        </span>
        {following ? (
          <button onClick={onUnfollow} className="ghost-button px-3 py-1.5 text-xs">
            Unfollow
          </button>
        ) : open ? (
          <span className="flex items-center gap-2">
            <input
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              inputMode="decimal"
              className="w-20 rounded-lg border border-brand/25 bg-brand/[0.05] px-2 py-1 text-xs text-foreground outline-none"
            />
            <button
              onClick={() => {
                const amount = Number(allocation);
                if (amount > 0) onFollow(amount);
                setOpen(false);
              }}
              disabled={disabled}
              className="ghost-button px-3 py-1.5 text-xs disabled:opacity-50"
            >
              Confirm
            </button>
          </span>
        ) : (
          <button
            onClick={() => setOpen(true)}
            disabled={disabled}
            className="ghost-button px-3 py-1.5 text-xs disabled:opacity-50"
          >
            Follow
          </button>
        )}
        <button
          onClick={onToggleExpand}
          aria-label="View live trades"
          className="text-muted-foreground transition-transform hover:text-foreground"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      {expanded && <LiveTradesPanel address={trader.walletAddress} />}
    </div>
  );
}

function LiveTradesPanel({ address }: { address: string }) {
  const [trades, setTrades] = useState<TraderTrade[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/traders/${address}/trades?limit=15`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const all: TraderTrade[] = data.trades ?? [];
        const cutoff = Date.now() - LIVE_WINDOW_MS;
        setTrades(all.filter((t) => t.timestampMs >= cutoff));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load live trades."));
  }, [address]);

  if (error) return <p className="pb-4 text-xs text-down">{error}</p>;
  if (!trades) return <p className="pb-4 text-xs text-muted-foreground">Loading live trades…</p>;
  if (trades.length === 0)
    return <p className="pb-4 text-xs text-muted-foreground">No live trades at the moment.</p>;

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
