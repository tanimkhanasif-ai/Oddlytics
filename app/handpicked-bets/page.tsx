"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bookmark } from "lucide-react";
import AppTopbar from "@/components/AppTopbar";
import AnalysisResultView from "@/components/AnalysisResultView";
import HandpickedMarketCard from "@/components/HandpickedMarketCard";
import LockedOverlay from "@/components/LockedOverlay";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import type { TrendingMarket } from "@/lib/markets/topMarkets";
import type { AnalysisResult } from "@/lib/types";

/** Real wall-clock deadline: today at 23:59:59 local time (tomorrow's if that's already passed). */
function getTonightDeadline(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Polls /api/subscription for up to ~10s waiting for the Paddle webhook to land. */
async function waitForSubscription(refresh: () => Promise<boolean>) {
  for (let i = 0; i < 7; i++) {
    if (await refresh()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

export default function HandpickedBetsPage() {
  const { data: session } = useSession();
  const { subscribed, hydrated, refresh } = useSubscription();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);
  const [marketsError, setMarketsError] = useState<string | null>(null);

  const [pickFor, setPickFor] = useState<TrendingMarket | null>(null);
  const [pickResult, setPickResult] = useState<AnalysisResult | null>(null);
  const [pickLoading, setPickLoading] = useState(false);

  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/markets/trending?limit=9")
      .then((r) => r.json())
      .then((data) => {
        if (data.error && !data.markets?.length) throw new Error(data.error);
        setMarkets(data.markets ?? []);
      })
      .catch((err) => setMarketsError(err instanceof Error ? err.message : "Failed to load markets."))
      .finally(() => setMarketsLoading(false));
  }, []);

  useEffect(() => {
    setDeadline(getTonightDeadline());
    setNow(Date.now());
    const interval = setInterval(() => {
      const n = Date.now();
      setNow(n);
      setDeadline((d) => (d !== null && n >= d ? getTonightDeadline() : d));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { openCheckout } = usePaddleCheckout(async () => {
    setVerifying(true);
    await waitForSubscription(refresh);
    setVerifying(false);
  });

  function startCheckout() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/handpicked-bets");
      return;
    }
    if (paddleConfigured) {
      setCheckoutLoading(true);
      const opened = openCheckout(session.user.id);
      setCheckoutLoading(false);
      if (opened) return;
    }
    router.push("/checkout/mock?redirect=/handpicked-bets");
  }

  async function viewAiPick(market: TrendingMarket) {
    setPickFor(market);
    setPickResult(null);
    setPickLoading(true);
    try {
      const top = market.outcomes[0];
      const yesPrice = (top?.pricePct ?? 50) / 100;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "live",
          platform: market.platform,
          question: market.question,
          yesPrice,
          noPrice: 1 - yesPrice,
        }),
      });
      const data = await res.json();
      if (!data.error) setPickResult(data);
    } finally {
      setPickLoading(false);
    }
  }

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <AppTopbar title="Handpicked Bets" icon={Bookmark} />

      {deadline && now !== null && (
        <div className="rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-center text-xs font-medium text-brand-bright">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
          New Picks In: {formatRemaining(deadline - now)}
        </div>
      )}

      {verifying && <p className="text-sm text-gray-400">Confirming your subscription…</p>}

      {pickFor && (
        <div className="space-y-2 rounded-xl border border-brand/20 bg-brand/5 p-1">
          <div className="flex items-center justify-between px-4 pt-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">AI Pick</p>
            <button
              onClick={() => setPickFor(null)}
              className="text-xs text-gray-500 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          {pickLoading || !pickResult ? (
            <p className="p-4 text-sm text-gray-400">Analyzing {pickFor.question}…</p>
          ) : (
            <div className="p-3">
              <AnalysisResultView result={pickResult} />
            </div>
          )}
        </div>
      )}

      <LockedOverlay
        unlocked={subscribed}
        loading={checkoutLoading}
        onUnlock={startCheckout}
        title="Unlock Handpicked Bets"
        subtitle={
          paddleConfigured
            ? "Full access to daily curated picks — secure checkout via Paddle."
            : "Full access to daily curated picks. Test mode — no payment provider configured yet, nothing will be charged."
        }
        ctaLabel="Unlock Handpicked Bets"
      >
        {marketsLoading ? (
          <p className="text-sm text-gray-500">Loading live markets…</p>
        ) : marketsError ? (
          <p className="text-sm text-gray-500">{marketsError}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((m) => (
              <HandpickedMarketCard
                key={`${m.platform}-${m.id}`}
                market={m}
                onViewPick={() => viewAiPick(m)}
                loading={pickLoading && pickFor?.id === m.id}
              />
            ))}
          </div>
        )}
      </LockedOverlay>
    </div>
  );
}
