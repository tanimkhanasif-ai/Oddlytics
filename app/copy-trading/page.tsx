"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, TrendingUp, Users } from "lucide-react";
import AppTopbar from "@/components/AppTopbar";
import InitialsAvatar from "@/components/InitialsAvatar";
import LockedOverlay from "@/components/LockedOverlay";
import { useCopyTrading } from "@/lib/hooks/useCopyTrading";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import { simulateCurrentPrice } from "@/lib/mocks/priceSimulator";
import type { TopTrader } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function CopyTradingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscribed, hydrated: subHydrated, refresh } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { follows, hydrated, syncing, feed, follow, unfollow, syncNow } = useCopyTrading();
  const { cashUsd, positions, hydrated: paperHydrated } = usePaperTrading();

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
    if (hydrated && follows.length > 0) syncNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const { openCheckout } = usePaddleCheckout(refresh);

  function startCheckout() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/copy-trading");
      return;
    }
    if (paddleConfigured) {
      setCheckoutLoading(true);
      const opened = openCheckout(session.user.id);
      setCheckoutLoading(false);
      if (opened) return;
    }
    router.push("/checkout/mock?redirect=/copy-trading");
  }

  const mirroredPositions = positions.filter((p) => p.source === "copy-trading");
  const totalPnl = mirroredPositions.reduce((sum, p) => {
    const current =
      p.status === "open"
        ? simulateCurrentPrice(p.id, p.entryPrice, p.openedAt)
        : p.exitPrice ?? p.entryPrice;
    const shares = p.sizeUsd / p.entryPrice;
    return sum + (shares * current - p.sizeUsd);
  }, 0);

  if (!subHydrated || !paperHydrated) return null;

  return (
    <div className="space-y-6">
      <AppTopbar title="Copy Trading" icon={Users} />

      <LockedOverlay
        unlocked={subscribed}
        loading={checkoutLoading}
        onUnlock={startCheckout}
        title="Unlock Copy Trading"
        subtitle={
          paddleConfigured
            ? "Follow real top traders and mirror their moves automatically — secure checkout via Paddle."
            : "Follow real top traders and mirror their moves automatically. Test mode — no payment provider configured yet, nothing will be charged."
        }
        ctaLabel="Set up copytrading"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Balance</p>
              <p className="mt-1 text-xl font-semibold text-white">{formatUsd(cashUsd)}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Total P&L</p>
                <p className={`mt-1 text-xl font-semibold ${totalPnl >= 0 ? "text-yes" : "text-no"}`}>
                  {totalPnl >= 0 ? "+" : ""}
                  {formatUsd(totalPnl)}
                </p>
              </div>
              <TrendingUp className={`h-6 w-6 ${totalPnl >= 0 ? "text-yes" : "text-no"}`} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="flex w-full items-center justify-between p-4 text-sm text-gray-200"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-bright" /> Select Trader
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition ${pickerOpen ? "rotate-180" : ""}`} />
            </button>
            {pickerOpen && (
              <div className="border-t border-white/10 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Select Trader</p>
                {loading && <p className="text-sm text-gray-500">Loading leaderboard…</p>}
                {error && (
                  <p className="text-sm text-no">{error} (Needs live network access to data-api.polymarket.com.)</p>
                )}
                {!loading && !error && (
                  <div className="space-y-1">
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
            )}
          </div>

          {follows.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Following</h2>
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
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={f.name || f.walletAddress} size={32} />
                      <div>
                        <p className="text-sm text-gray-200">{f.name || truncateAddress(f.walletAddress)}</p>
                        <p className="text-xs text-gray-500">Virtual allocation: {formatUsd(f.allocationUsd)}</p>
                      </div>
                    </div>
                    <button onClick={() => unfollow(f.walletAddress)} className="text-xs text-gray-500 hover:text-white">
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {feed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Mirrored trade activity</h2>
              <div className="mt-3 space-y-2">
                {feed.map((e, i) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                    <p className="text-gray-300">
                      Mirrored {e.outcome ?? "a position"} on <span className="text-gray-400">{e.question}</span> —{" "}
                      {formatUsd(e.sizeUsd)} @ {(e.price * 100).toFixed(0)}¢
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
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Top traders this week</h2>
            {loading && <p className="mt-3 text-sm text-gray-500">Loading leaderboard…</p>}
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
      </LockedOverlay>
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
  const name = trader.name || truncateAddress(trader.walletAddress);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <InitialsAvatar name={name} size={36} />
          <div className="min-w-0">
            <p className="truncate text-sm text-gray-200">
              #{trader.rank} {name}
            </p>
            <p className="text-xs text-gray-500">
              {formatUsd(trader.pnl)} P&L · {trader.followerCount} {trader.followerCount === 1 ? "Copier" : "Copiers"}
            </p>
          </div>
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
