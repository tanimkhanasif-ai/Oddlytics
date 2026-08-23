"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookmarkCheck, Lock } from "lucide-react";
import AnalysisResultView from "@/components/AnalysisResultView";
import { GlowButton } from "@/components/landing/primitives";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import type { TrendingMarket } from "@/lib/markets/topMarkets";
import type { AnalysisResult } from "@/lib/types";

/** Counts down to the next top-of-the-hour pick refresh. */
function useNextDropCountdown() {
  const [left, setLeft] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(now.getHours() + 2, 0, 0, 0);
      const diff = Math.max(0, next.getTime() - now.getTime());
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor((diff % 3.6e6) / 6e4);
      const s = Math.floor((diff % 6e4) / 1000);
      setLeft([h, m, s].map((n) => String(n).padStart(2, "0")).join(":"));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

export default function HandpickedBetsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscribed, hydrated, refresh } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickFor, setPickFor] = useState<string | null>(null);
  const [pickResult, setPickResult] = useState<AnalysisResult | null>(null);
  const [pickLoading, setPickLoading] = useState(false);

  const countdown = useNextDropCountdown();

  useEffect(() => {
    fetch("/api/markets/trending?limit=9")
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets ?? []))
      .catch(() => setMarkets([]))
      .finally(() => setLoading(false));
  }, []);

  const { openCheckout } = usePaddleCheckout(refresh);

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
    setPickFor(market.id);
    setPickResult(null);
    setPickLoading(true);
    try {
      const yesPrice = (market.outcomes[0]?.pricePct ?? 50) / 100;
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

  const free = subscribed ? markets : markets.slice(0, 3);
  const locked = subscribed ? [] : markets.slice(3);

  return (
    <div className="space-y-5">
      <div className="glass-panel flex items-center justify-center gap-2 rounded-full border-brand/40 py-2.5 text-sm font-medium shadow-[var(--glow-soft)]">
        <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
        New Picks In: <span className="text-glow tabular-nums text-brand">{countdown}</span>
      </div>

      {pickFor && (
        <div className="glass-panel rounded-3xl p-1">
          <div className="flex items-center justify-between px-4 pt-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">AI Pick</p>
            <button
              onClick={() => setPickFor(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕ Close
            </button>
          </div>
          {pickLoading || !pickResult ? (
            <p className="p-4 text-sm text-muted-foreground">Analyzing…</p>
          ) : (
            <div className="p-3">
              <AnalysisResultView result={pickResult} />
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading live markets…</p>
      ) : markets.length === 0 ? (
        <div className="glass-panel flex flex-col items-center rounded-3xl px-6 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 shadow-[var(--glow-soft)]">
            <BookmarkCheck className="h-7 w-7 text-brand" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-foreground">No picks live right now</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Our AI is scanning Kalshi, Polymarket and more. The next batch of handpicked, high
            conviction bets unlocks when the countdown hits zero.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {free.map((m) => (
              <PickCard
                key={`${m.platform}-${m.id}`}
                market={m}
                loading={pickLoading && pickFor === m.id}
                onView={() => viewAiPick(m)}
              />
            ))}
          </div>

          {locked.length > 0 && (
            <div className="relative">
              <div className="locked-blur grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {locked.map((m) => (
                  <PickCard
                    key={`${m.platform}-${m.id}`}
                    market={m}
                    loading={false}
                    onView={() => {}}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/40 bg-brand/[0.12]">
                  <Lock className="h-5 w-5 text-brand" />
                </span>
                <GlowButton onClick={startCheckout} className="px-6 py-3">
                  {checkoutLoading ? "Opening checkout…" : "Unlock all picks"}
                </GlowButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PickCard({
  market,
  loading,
  onView,
}: {
  market: TrendingMarket;
  loading: boolean;
  onView: () => void;
}) {
  const isPoly = market.platform === "polymarket";
  const date = market.date
    ? new Date(market.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "";

  return (
    <div className="glass-card flex flex-col rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
            isPoly ? "bg-violet/25 text-violet" : "bg-info/25 text-info"
          }`}
        >
          {isPoly ? "P" : "K"}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {isPoly ? "Polymarket" : "Kalshi"}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{date}</span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-foreground">{market.question}</h3>

      <div className="mt-3 space-y-1.5">
        {market.outcomes.map((o) => (
          <div key={o.label} className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 truncate text-muted-foreground">{o.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-brand" style={{ width: `${o.pricePct}%` }} />
            </div>
            <span className="w-9 shrink-0 text-center font-semibold text-foreground">
              {o.pricePct}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>${Math.round(market.volumeUsd / 1000).toLocaleString("en-US")}K vol</span>
        {market.moreCount > 0 && <span>{market.moreCount} more</span>}
      </div>

      <button
        onClick={onView}
        disabled={loading}
        className="ghost-button mt-4 w-full py-2 text-xs disabled:opacity-50"
      >
        {loading ? "Analyzing…" : "View AI Pick"}
      </button>
    </div>
  );
}
