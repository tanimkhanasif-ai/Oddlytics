"use client";

import { useState } from "react";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { GlowButton } from "@/components/landing/primitives";
import type { AnalysisResult } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export default function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const isYes = result.recommendation === "YES";
  const canPaperTrade =
    result.recommendation === "YES"
      ? typeof result._yesPrice === "number"
      : typeof result._noPrice === "number";

  const betLabel = result.recommended_outcome_label
    ? `Bet ${isYes ? "Yes" : "No"} on ${result.recommended_outcome_label}`
    : `Bet ${isYes ? "Yes" : "No"}`;

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div
        className={`rounded-xl px-5 py-4 text-center text-lg font-bold shadow-[var(--glow-brand)] ${
          isYes ? "bg-brand text-[color:var(--on-brand)]" : "bg-no text-white"
        }`}
      >
        {betLabel}
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {result.platform === "screenshot" ? "From screenshot" : result.platform}
            </p>
            <PlatformBadge platform={result.platform} />
            {result._mock && (
              <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand">
                Demo data
              </span>
            )}
          </div>
          <h2 className="mt-1 text-lg font-medium text-foreground">{result.market_question}</h2>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
            isYes ? "bg-yes/15 text-yes" : "bg-no/15 text-no"
          }`}
        >
          {result.recommendation}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full ${isYes ? "bg-brand" : "bg-no"}`}
            style={{ width: `${result.confidence_pct}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">{result.confidence_pct}% confidence</span>
      </div>

      <Section title="Why">
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
          {result.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Key risks">
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
          {result.key_risks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Suggested position sizing">
        <p className="text-sm text-foreground/80">
          {result.position_sizing.suggested_pct_of_capital}% of capital
          {result.position_sizing.suggested_amount != null
            ? ` (~${formatUsd(result.position_sizing.suggested_amount)})`
            : ""}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{result.position_sizing.rationale}</p>
      </Section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoBox label="Take profit" value={result.take_profit.sell_if_price_reaches} tone="yes" />
        <InfoBox label="Stop loss" value={result.stop_loss.sell_if_price_falls_to} tone="no" />
      </div>

      <Section title="Exit if">
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
          {result.exit_if.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      {canPaperTrade && (
        <div className="mt-5 border-t border-border pt-5">
          <PaperTradeAction result={result} />
        </div>
      )}
    </div>
  );
}

function PaperTradeAction({ result }: { result: AnalysisResult }) {
  const { openPosition, cashUsd, hydrated } = usePaperTrading();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(
    String(result.position_sizing.suggested_amount ?? 25)
  );
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entryPrice =
    result.recommendation === "YES" ? result._yesPrice! : result._noPrice!;

  async function confirm() {
    const sizeUsd = Number(size);
    if (!sizeUsd || sizeUsd <= 0) return;
    setError(null);
    const ok = await openPosition({
      marketQuestion: result.market_question,
      platform: result.platform,
      side: result.recommendation,
      entryPrice,
      sizeUsd,
      source: "analyzer",
    });
    if (ok) {
      setConfirmed(true);
      setOpen(false);
    } else {
      setError("Not enough virtual cash for that size.");
    }
  }

  if (confirmed) {
    return <p className="text-sm text-yes">Added to Paper Trading — check the Paper Trading page.</p>;
  }

  if (!open) {
    return (
      <GlowButton size="sm" onClick={() => setOpen(true)}>
        Paper trade this pick
      </GlowButton>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-muted-foreground">
        Size (virtual USD)
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          inputMode="decimal"
          className="ml-2 w-24 rounded-lg border border-brand/25 bg-brand/[0.05] px-2 py-1 text-sm text-foreground outline-none focus:border-brand/50"
        />
      </label>
      <GlowButton size="sm" onClick={confirm} disabled={!hydrated}>
        Confirm {result.recommendation} @ {(entryPrice * 100).toFixed(0)}¢
      </GlowButton>
      <button
        onClick={() => setOpen(false)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Cancel
      </button>
      <span className="w-full text-xs text-muted-foreground">
        Available virtual cash: {formatUsd(cashUsd)}
      </span>
      {error && <p className="w-full text-xs text-no">{error}</p>}
    </div>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === "kalshi") {
    return (
      <span className="rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[color:var(--on-brand)] shadow-[var(--glow-soft)]">
        Kalshi
      </span>
    );
  }
  if (platform === "polymarket") {
    return (
      <span className="rounded-full bg-[#1652f0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[var(--glow-soft)]">
        Polymarket
      </span>
    );
  }
  return null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "yes" | "no";
}) {
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${
        tone === "yes" ? "border-yes/30 bg-yes/10" : "border-no/30 bg-no/10"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-foreground/90">{value}</p>
    </div>
  );
}
