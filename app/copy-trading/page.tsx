"use client";

import { useEffect, useState } from "react";
import { useCopyTrading } from "@/lib/hooks/useCopyTrading";
import type { TopTrader } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function CopyTradingPage() {
  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { follows, hydrated, syncing, feed, follow, unfollow, syncNow } = useCopyTrading();

  useEffect(() => {
    fetch("/api/traders/leaderboard?period=WEEK&limit=15")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTraders(data.traders ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leaderboard."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (hydrated && follows.length > 0) {
      syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Copy Trading</h1>
        <p className="mt-1 text-sm text-gray-400">
          Follow a real top Polymarket trader (ranked by real, live P&L) and their new BUY trades
          on YES/NO markets are automatically mirrored into your virtual Paper Trading balance —
          never real money. Each trade uses a slice of the virtual budget you set below.
        </p>
      </div>

      {follows.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Following
            </h2>
            <button
              onClick={() => syncNow()}
              disabled={syncing}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/20 disabled:opacity-50"
            >
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {follows.map((f) => (
              <div
                key={f.walletAddress}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div>
                  <p className="text-sm text-gray-200">{f.name || truncateAddress(f.walletAddress)}</p>
                  <p className="text-xs text-gray-500">
                    Virtual allocation: {formatUsd(f.allocationUsd)}
                  </p>
                </div>
                <button
                  onClick={() => unfollow(f.walletAddress)}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {feed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Mirrored trade activity
          </h2>
          <div className="mt-3 space-y-2">
            {feed.map((e, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                <p className="text-gray-300">
                  Mirrored {e.outcome ?? "a position"} on{" "}
                  <span className="text-gray-400">{e.question}</span> — {formatUsd(e.sizeUsd)} @{" "}
                  {(e.price * 100).toFixed(0)}¢
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Following {e.traderLabel} · {new Date(e.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Top traders this week
        </h2>
        {loading && <p className="mt-3 text-sm text-gray-500">Loading leaderboard…</p>}
        {error && (
          <p className="mt-3 text-sm text-no">
            {error} (Needs live network access to data-api.polymarket.com.)
          </p>
        )}
        {!loading && !error && (
          <div className="mt-3 space-y-2">
            {traders.map((t) => (
              <TraderRow
                key={t.walletAddress}
                trader={t}
                isFollowing={follows.some((f) => f.walletAddress === t.walletAddress)}
                onFollow={(amount) => follow(t.walletAddress, t.name, amount)}
                onUnfollow={() => unfollow(t.walletAddress)}
                hydrated={hydrated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TraderRow({
  trader,
  isFollowing,
  onFollow,
  onUnfollow,
  hydrated,
}: {
  trader: TopTrader;
  isFollowing: boolean;
  onFollow: (allocationUsd: number) => void;
  onUnfollow: () => void;
  hydrated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [allocation, setAllocation] = useState("100");

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-200">
            #{trader.rank} {trader.name || truncateAddress(trader.walletAddress)}
          </p>
          <p className="text-xs text-gray-500">
            P&L {formatUsd(trader.pnl)} · Volume {formatUsd(trader.volume)}
          </p>
        </div>
        {isFollowing ? (
          <button
            onClick={onUnfollow}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/20"
          >
            Unfollow
          </button>
        ) : open ? (
          <div className="flex shrink-0 items-center gap-2">
            <input
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              inputMode="decimal"
              className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
            />
            <button
              onClick={() => {
                const amount = Number(allocation);
                if (amount > 0) onFollow(amount);
                setOpen(false);
              }}
              disabled={!hydrated}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black"
          >
            Follow
          </button>
        )}
      </div>
    </div>
  );
}
