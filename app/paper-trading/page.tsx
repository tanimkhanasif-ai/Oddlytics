"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Star, TrendingUp } from "lucide-react";
import AppTopbar from "@/components/AppTopbar";
import LockedOverlay from "@/components/LockedOverlay";
import Sparkline from "@/components/Sparkline";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { simulateCurrentPrice } from "@/lib/mocks/priceSimulator";
import type { TrendingMarket } from "@/lib/markets/topMarkets";
import type { PaperPosition, Platform } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export default function PaperTradingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscribed, hydrated: subHydrated, refresh } = useSubscription();
  const { cashUsd, positions, hydrated, openPosition, closePosition, reset } = usePaperTrading();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [prefill, setPrefill] = useState<{ question: string; platform: Platform; price: string } | null>(null);

  useEffect(() => {
    fetch("/api/markets/trending?limit=6")
      .then((r) => r.json())
      .then((data) => setMarkets(data.markets ?? []))
      .catch(() => setMarkets([]));
  }, []);

  const { openCheckout } = usePaddleCheckout(refresh);

  function startCheckout() {
    if (!session?.user?.id) {
      router.push("/login?callbackUrl=/paper-trading");
      return;
    }
    if (paddleConfigured) {
      setCheckoutLoading(true);
      const opened = openCheckout(session.user.id);
      setCheckoutLoading(false);
      if (opened) return;
    }
    router.push("/checkout/mock?redirect=/paper-trading");
  }

  const openPositions = positions.filter((p) => p.status === "open");
  const closedPositions = positions.filter((p) => p.status === "closed");

  const { unrealizedPnl } = useMemo(() => {
    let pnl = 0;
    for (const p of openPositions) {
      const current = simulateCurrentPrice(p.id, p.entryPrice, p.openedAt);
      const shares = p.sizeUsd / p.entryPrice;
      pnl += shares * current - p.sizeUsd;
    }
    return { unrealizedPnl: pnl };
  }, [openPositions]);

  if (!hydrated || !subHydrated) return null;

  return (
    <div className="space-y-6">
      <AppTopbar title="Virtual Trading" icon={Monitor} />

      <LockedOverlay
        unlocked={subscribed}
        loading={checkoutLoading}
        onUnlock={startCheckout}
        title="Unlock Virtual Trading"
        subtitle={
          paddleConfigured
            ? "Practice with $100,000 in virtual cash — secure checkout via Paddle."
            : "Practice with $100,000 in virtual cash. Test mode — no payment provider configured yet, nothing will be charged."
        }
        ctaLabel="Set up Virtual Trading"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Balance</p>
              <p className="mt-1 text-xl font-semibold text-white">{formatUsd(cashUsd)}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">P&L</p>
                <p className={`mt-1 text-xl font-semibold ${unrealizedPnl >= 0 ? "text-yes" : "text-no"}`}>
                  {unrealizedPnl >= 0 ? "+" : ""}
                  {formatUsd(unrealizedPnl)}
                </p>
              </div>
              <TrendingUp className={`h-6 w-6 ${unrealizedPnl >= 0 ? "text-yes" : "text-no"}`} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <ManualOpenForm onOpen={openPosition} cashUsd={cashUsd} prefill={prefill} onConsumePrefill={() => setPrefill(null)} />
            <button
              onClick={() => {
                if (confirm("Reset Virtual Trading? This clears all positions and restores $100,000 virtual cash.")) {
                  reset();
                }
              }}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/20"
            >
              Reset portfolio
            </button>
          </div>

          {markets.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-brand-bright" />
                <h2 className="text-sm font-semibold text-white">Practice popular markets</h2>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">Test your strategies with virtual money</p>
              <div className="mt-3 divide-y divide-white/5">
                {markets.map((m) => {
                  const price = (m.outcomes[0]?.pricePct ?? 50) / 100;
                  return (
                    <button
                      key={`${m.platform}-${m.id}`}
                      onClick={() =>
                        setPrefill({ question: m.question, platform: m.platform, price: String(Math.round(price * 100)) })
                      }
                      className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-gray-200">{m.question}</p>
                        <p className="text-xs text-gray-500">
                          {m.platform === "polymarket" ? "Polymarket" : "Kalshi"} · Vol. ${Math.round(m.volumeUsd / 1000)}K
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`text-sm font-semibold ${price >= 0.5 ? "text-yes" : "text-no"}`}>
                          {Math.round(price * 100)}%
                        </span>
                        <Sparkline points={[price * 100, price * 100]} positive={price >= 0.5} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Open positions</h2>
            {openPositions.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">
                No open positions yet. Open one from an AI Predictor result, or use Enter Trade above.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {openPositions.map((p) => (
                  <PositionRow key={p.id} position={p} onClose={closePosition} />
                ))}
              </div>
            )}
          </div>

          {closedPositions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Closed positions</h2>
              <div className="mt-3 space-y-3">
                {closedPositions.map((p) => (
                  <PositionRow key={p.id} position={p} onClose={closePosition} />
                ))}
              </div>
            </div>
          )}
        </div>
      </LockedOverlay>
    </div>
  );
}

function PositionRow({
  position,
  onClose,
}: {
  position: PaperPosition;
  onClose: (id: string, exitPrice: number) => void;
}) {
  const isOpen = position.status === "open";
  const currentPrice = isOpen
    ? simulateCurrentPrice(position.id, position.entryPrice, position.openedAt)
    : position.exitPrice ?? position.entryPrice;
  const shares = position.sizeUsd / position.entryPrice;
  const pnl = shares * currentPrice - position.sizeUsd;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-200">{position.marketQuestion}</p>
        <p className="mt-0.5 text-xs text-gray-500">
          {position.platform} · {position.side} @ {(position.entryPrice * 100).toFixed(0)}¢ ·{" "}
          {formatUsd(position.sizeUsd)}
          {!isOpen && " · closed"}
          {position.source === "copy-trading" && " · via Copy Trading"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-gray-500">{isOpen ? "Current" : "Exit"}</p>
          <p className="text-sm text-gray-200">{(currentPrice * 100).toFixed(0)}¢</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">P&L</p>
          <p className={`text-sm font-medium ${pnl >= 0 ? "text-yes" : "text-no"}`}>{formatUsd(pnl)}</p>
        </div>
        {isOpen && (
          <button
            onClick={() => onClose(position.id, currentPrice)}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/20"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

function ManualOpenForm({
  onOpen,
  cashUsd,
  prefill,
  onConsumePrefill,
}: {
  onOpen: (p: Omit<PaperPosition, "id" | "openedAt" | "status">) => void;
  cashUsd: number;
  prefill: { question: string; platform: Platform; price: string } | null;
  onConsumePrefill: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [platform, setPlatform] = useState<Platform>("polymarket");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [entryCents, setEntryCents] = useState("50");
  const [size, setSize] = useState("25");

  useEffect(() => {
    if (prefill) {
      setQuestion(prefill.question);
      setPlatform(prefill.platform);
      setEntryCents(prefill.price);
      setExpanded(true);
      onConsumePrefill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  function submit() {
    const entryPrice = Number(entryCents) / 100;
    const sizeUsd = Number(size);
    if (!question.trim() || !entryPrice || entryPrice <= 0 || entryPrice >= 1 || !sizeUsd) return;
    onOpen({ marketQuestion: question.trim(), platform, side, entryPrice, sizeUsd });
    setQuestion("");
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/10"
      >
        <span className="text-brand-bright">+</span> Enter Trade
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Market question"
          className="sm:col-span-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600"
        />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        >
          <option value="polymarket">Polymarket</option>
          <option value="kalshi">Kalshi</option>
          <option value="screenshot">Screenshot</option>
        </select>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as "YES" | "NO")}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        >
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <input
          value={entryCents}
          onChange={(e) => setEntryCents(e.target.value)}
          inputMode="numeric"
          placeholder="Entry price (¢)"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600"
        />
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          inputMode="decimal"
          placeholder="Size (virtual USD)"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600"
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={submit} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
          Open position
        </button>
        <button onClick={() => setExpanded(false)} className="text-sm text-gray-500 hover:text-white">
          Cancel
        </button>
        <span className="text-xs text-gray-500">Available: {formatUsd(cashUsd)}</span>
      </div>
    </div>
  );
}
