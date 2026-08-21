"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Wallet } from "lucide-react";
import AppTopbar from "@/components/AppTopbar";
import LockedOverlay from "@/components/LockedOverlay";
import { useTrackedWallets } from "@/lib/hooks/useTrackedWallets";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import type { TopTrader, TraderTrade } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

type Period = "DAY" | "WEEK" | "MONTH" | "ALL";

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletTrackerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscribed, hydrated: subHydrated, refresh } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [period, setPeriod] = useState<Period>("WEEK");
  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { isTracked, track, untrack, hydrated } = useTrackedWallets();

  const { openCheckout } = usePaddleCheckout(refresh);

  function startCheckout() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/wallet-tracker");
      return;
    }
    if (paddleConfigured) {
      setCheckoutLoading(true);
      const opened = openCheckout(session.user.id);
      setCheckoutLoading(false);
      if (opened) return;
    }
    router.push("/checkout/mock?redirect=/wallet-tracker");
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/traders/leaderboard?period=${period}&limit=15`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setTraders(data.traders ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load leaderboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (!subHydrated) return null;

  return (
    <div className="space-y-6">
      <AppTopbar title="Wallet Tracker" icon={Wallet} />

      <LockedOverlay
        unlocked={subscribed}
        loading={checkoutLoading}
        onUnlock={startCheckout}
        title="Unlock Wallet Tracker"
        subtitle={
          paddleConfigured
            ? "Real Polymarket leaderboard data, live — secure checkout via Paddle."
            : "Real Polymarket leaderboard data, live. Test mode — no payment provider configured yet, nothing will be charged."
        }
        ctaLabel="Unlock Wallet Tracker"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-400">
            Real Polymarket leaderboard data, pulled live from Polymarket&apos;s public Data API — not
            mocked. Kalshi doesn&apos;t expose a public trader leaderboard, so this covers Polymarket
            only.
          </p>

          <div className="flex gap-2">
            {(["DAY", "WEEK", "MONTH", "ALL"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  period === p ? "bg-white text-black" : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {loading && <p className="text-sm text-gray-500">Loading leaderboard…</p>}
          {error && (
            <p className="text-sm text-no">
              {error} (This needs live network access to data-api.polymarket.com — some sandboxed
              environments block it.)
            </p>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {traders.map((t) => (
                <div key={t.walletAddress} className="rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 shrink-0 text-sm text-gray-500">#{t.rank}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-gray-200">
                          {t.name || truncateAddress(t.walletAddress)}
                        </p>
                        <p className="text-xs text-gray-500">{truncateAddress(t.walletAddress)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">P&L ({period.toLowerCase()})</p>
                        <p className={`text-sm font-medium ${t.pnl >= 0 ? "text-yes" : "text-no"}`}>
                          {formatUsd(t.pnl)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-sm text-gray-200">{formatUsd(t.volume)}</p>
                      </div>
                      <button
                        onClick={() =>
                          isTracked(t.walletAddress)
                            ? untrack(t.walletAddress)
                            : track(t.walletAddress, t.name)
                        }
                        disabled={!hydrated}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                          isTracked(t.walletAddress)
                            ? "bg-white/10 text-gray-300 hover:bg-white/20"
                            : "bg-white text-black"
                        }`}
                      >
                        {isTracked(t.walletAddress) ? "Tracking" : "Track"}
                      </button>
                      <button
                        onClick={() => setExpanded(expanded === t.walletAddress ? null : t.walletAddress)}
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        {expanded === t.walletAddress ? "Hide trades" : "View trades"}
                      </button>
                    </div>
                  </div>
                  {expanded === t.walletAddress && <TraderTradesPanel address={t.walletAddress} />}
                </div>
              ))}
              {traders.length === 0 && (
                <p className="text-sm text-gray-500">No leaderboard data returned for this period.</p>
              )}
            </div>
          )}
        </div>
      </LockedOverlay>
    </div>
  );
}

function TraderTradesPanel({ address }: { address: string }) {
  const [trades, setTrades] = useState<TraderTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/traders/${address}/trades?limit=10`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setTrades(data.trades ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load trades.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="border-t border-white/10 p-4">
      {loading && <p className="text-xs text-gray-500">Loading recent trades…</p>}
      {error && <p className="text-xs text-no">{error}</p>}
      {!loading && !error && trades.length === 0 && (
        <p className="text-xs text-gray-500">No recent trades found for this wallet.</p>
      )}
      <div className="space-y-1.5">
        {trades.map((t, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-gray-400">
            <span className="truncate pr-4">
              {t.side ?? "TRADE"} {t.outcome ?? ""} — {t.question || t.market}
            </span>
            <span className="shrink-0 text-gray-500">
              {t.size.toFixed(0)} @ {(t.price * 100).toFixed(0)}¢
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
