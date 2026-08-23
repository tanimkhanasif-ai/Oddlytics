"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BookmarkCheck, Lock, TrendingUp } from "lucide-react";
import AnalysisResultView from "@/components/AnalysisResultView";
import { GlowButton } from "@/components/landing/primitives";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { paddleConfigured, usePaddleCheckout } from "@/lib/hooks/usePaddleCheckout";
import type { AnalysisResult } from "@/lib/types";

interface Pick {
  id: string;
  rank: number;
  platform: string;
  question: string;
  url: string | null;
  side: "YES" | "NO";
  confidence: number;
  marketPct: number;
  edge: number;
  volumeUsd: number;
  analysis: AnalysisResult | null;
}

function compactUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

function useCountdownTo(iso: string | null) {
  const [left, setLeft] = useState("--:--:--");
  useEffect(() => {
    if (!iso) return;
    const target = new Date(iso).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1000);
      setLeft(
        d > 0
          ? `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : [h, m, s].map((n) => String(n).padStart(2, "0")).join(":"),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return left;
}

export default function HandpickedBetsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { subscribed, hydrated, refresh } = useSubscription();

  const [picks, setPicks] = useState<Pick[]>([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [nextRefresh, setNextRefresh] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState(70);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const countdown = useCountdownTo(nextRefresh);

  useEffect(() => {
    fetch("/api/handpicks")
      .then((r) => r.json())
      .then((d) => {
        setPicks(d.picks ?? []);
        setLockedCount(d.lockedCount ?? 0);
        setNextRefresh(d.nextRefresh ?? null);
        if (typeof d.minConfidence === "number") setMinConfidence(d.minConfidence);
      })
      .catch(() => setPicks([]))
      .finally(() => setLoading(false));
  }, [subscribed]);

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

  if (!hydrated) return null;

  return (
    <div className="space-y-5">
      <div className="glass-panel flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border-brand/40 px-5 py-2.5 text-sm font-medium shadow-[var(--glow-soft)]">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
          New Picks In: <span className="text-glow tabular-nums text-brand">{countdown}</span>
        </span>
        <span className="hidden h-3 w-px bg-border sm:block" />
        <span className="text-xs text-muted-foreground">
          Refreshed every Monday · {minConfidence}%+ AI confidence
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading this week&apos;s picks…</p>
      ) : picks.length === 0 ? (
        <div className="glass-panel flex flex-col items-center rounded-3xl px-6 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 shadow-[var(--glow-soft)]">
            <BookmarkCheck className="h-7 w-7 text-brand" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-foreground">No picks live right now</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Our AI scans Kalshi and Polymarket every Monday and only publishes markets it&apos;s at
            least {minConfidence}% confident on. The next batch lands when the countdown hits zero.
          </p>
        </div>
      ) : (
        <>
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {picks.map((p) => (
              <PickCard
                key={p.id}
                pick={p}
                expanded={expanded === p.id}
                onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
              />
            ))}
          </div>

          {lockedCount > 0 && (
            <div className="glass-panel flex flex-col items-center rounded-3xl px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/40 bg-brand/[0.12]">
                <Lock className="h-5 w-5 text-brand" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-foreground">
                {lockedCount} more pick{lockedCount === 1 ? "" : "s"} this week
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Full access unlocks every pick plus the AI&apos;s reasoning, risks and exit plan on
                each one.
              </p>
              <GlowButton onClick={startCheckout} className="mt-5 px-6 py-3">
                {checkoutLoading ? "Opening checkout…" : "Unlock all picks"}
              </GlowButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PickCard({
  pick,
  expanded,
  onToggle,
}: {
  pick: Pick;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isPoly = pick.platform === "polymarket";
  const yes = pick.side === "YES";
  const edgePositive = pick.edge > 0;

  return (
    <div className="glass-card flex flex-col rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-brand/20 text-[10px] font-bold text-brand">
          {pick.rank}
        </span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
            isPoly ? "bg-violet/25 text-violet" : "bg-info/25 text-info"
          }`}
        >
          {isPoly ? "P" : "K"}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {isPoly ? "Polymarket" : "Kalshi"}
        </span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
            yes ? "bg-up/20 text-up" : "bg-down/20 text-down"
          }`}
        >
          {pick.side}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm font-semibold text-foreground">
        {pick.question}
      </h3>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border bg-background/40 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">AI</dt>
          <dd className="text-sm font-bold text-brand">{Math.round(pick.confidence)}%</dd>
        </div>
        <div className="rounded-lg border border-border bg-background/40 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Market</dt>
          <dd className="text-sm font-bold text-foreground">{Math.round(pick.marketPct)}%</dd>
        </div>
        <div className="rounded-lg border border-border bg-background/40 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Edge</dt>
          <dd className={`text-sm font-bold ${edgePositive ? "text-up" : "text-down"}`}>
            {edgePositive ? "+" : ""}
            {Math.round(pick.edge)}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-[10px] text-muted-foreground">
        {compactUsd(pick.volumeUsd)} volume
        {edgePositive
          ? " · AI rates this above the market price"
          : " · market already prices this in"}
      </p>

      <div className="mt-auto pt-4">
        {pick.analysis ? (
          <>
            <button onClick={onToggle} className="ghost-button w-full py-2 text-xs">
              {expanded ? "Hide reasoning" : "View AI reasoning"}
            </button>
            {expanded && (
              <div className="mt-3">
                <AnalysisResultView result={pick.analysis} />
              </div>
            )}
          </>
        ) : (
          <p className="flex items-center justify-center gap-1.5 rounded-full border border-border py-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Reasoning locked
          </p>
        )}
      </div>
    </div>
  );
}
