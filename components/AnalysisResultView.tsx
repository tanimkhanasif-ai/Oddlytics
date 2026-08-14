"use client";

import { useState } from "react";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import type { AnalysisResult } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export default function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const isYes = result.recommendation === "YES";
  const canPaperTrade =
    result.recommendation === "YES"
      ? typeof result._yesPrice === "number"
      : typeof result._noPrice === "number";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {result.platform === "screenshot" ? "From screenshot" : result.platform}
            </p>
            {result._mock && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                Demo data
              </span>
            )}
          </div>
          <h2 className="mt-1 text-lg font-medium text-white">{result.market_question}</h2>
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
            className={`h-full ${isYes ? "bg-yes" : "bg-no"}`}
            style={{ width: `${result.confidence_pct}%` }}
          />
        </div>
        <span className="text-sm text-gray-400">{result.confidence_pct}% confidence</span>
      </div>

      <Section title="Why">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
          {result.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Key risks">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
          {result.key_risks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Suggested position sizing">
        <p className="text-sm text-gray-300">
          {result.position_sizing.suggested_pct_of_capital}% of capital
          {result.position_sizing.suggested_amount != null
            ? ` (~${formatUsd(result.position_sizing.suggested_amount)})`
            : ""}
        </p>
        <p className="mt-1 text-sm text-gray-500">{result.position_sizing.rationale}</p>
      </Section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoBox label="Take profit" value={result.take_profit.sell_if_price_reaches} tone="yes" />
        <InfoBox label="Stop loss" value={result.stop_loss.sell_if_price_falls_to} tone="no" />
      </div>

      <Section title="Exit if">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
          {result.exit_if.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>

      {canPaperTrade && (
        <div className="mt-5 border-t border-white/10 pt-5">
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

  const entryPrice =
    result.recommendation === "YES" ? result._yesPrice! : result._noPrice!;

  function confirm() {
    const sizeUsd = Number(size);
    if (!sizeUsd || sizeUsd <= 0) return;
    openPosition({
      marketQuestion: result.market_question,
      platform: result.platform,
      side: result.recommendation,
      entryPrice,
      sizeUsd,
      source: "analyzer",
    });
    setConfirmed(true);
    setOpen(false);
  }

  if (confirmed) {
    return <p className="text-sm text-yes">Added to Paper Trading — check the Paper Trading page.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
      >
        Paper trade this pick
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm text-gray-400">
        Size (virtual USD)
        <input
          value={size}
          onChange={(e) => setSize(e.target.value)}
          inputMode="decimal"
          className="ml-2 w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
        />
      </label>
      <button
        onClick={confirm}
        disabled={!hydrated}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        Confirm {result.recommendation} @ {(entryPrice * 100).toFixed(0)}¢
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-sm text-gray-500 hover:text-white"
      >
        Cancel
      </button>
      <span className="w-full text-xs text-gray-500">
        Available virtual cash: {formatUsd(cashUsd)}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
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
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-gray-200">{value}</p>
    </div>
  );
}
