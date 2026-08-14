"use client";

import { useMemo, useState } from "react";
import { usePaperTrading } from "@/lib/hooks/usePaperTrading";
import { simulateCurrentPrice } from "@/lib/mocks/priceSimulator";
import type { PaperPosition, Platform } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

export default function PaperTradingPage() {
  const { cashUsd, positions, hydrated, openPosition, closePosition, reset } = usePaperTrading();

  const openPositions = positions.filter((p) => p.status === "open");
  const closedPositions = positions.filter((p) => p.status === "closed");

  const { positionsValue, unrealizedPnl } = useMemo(() => {
    let value = 0;
    let pnl = 0;
    for (const p of openPositions) {
      const current = simulateCurrentPrice(p.id, p.entryPrice, p.openedAt);
      const shares = p.sizeUsd / p.entryPrice;
      value += shares * current;
      pnl += shares * current - p.sizeUsd;
    }
    return { positionsValue: value, unrealizedPnl: pnl };
  }, [openPositions]);

  const realizedPnl = closedPositions.reduce((sum, p) => {
    if (p.exitPrice == null) return sum;
    const shares = p.sizeUsd / p.entryPrice;
    return sum + (shares * p.exitPrice - p.sizeUsd);
  }, 0);

  if (!hydrated) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Paper Trading</h1>
          <p className="mt-1 text-sm text-gray-400">
            Virtual money only — nothing here is real. Prices for open positions are simulated,
            not live.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Reset paper trading? This clears all positions and restores $1,000 virtual cash.")) {
              reset();
            }
          }}
          className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/20"
        >
          Reset portfolio
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Virtual cash" value={formatUsd(cashUsd)} />
        <StatCard label="Open positions value" value={formatUsd(positionsValue)} />
        <StatCard
          label="Unrealized P&L"
          value={formatUsd(unrealizedPnl)}
          tone={unrealizedPnl >= 0 ? "yes" : "no"}
        />
        <StatCard
          label="Realized P&L"
          value={formatUsd(realizedPnl)}
          tone={realizedPnl >= 0 ? "yes" : "no"}
        />
      </div>

      <ManualOpenForm onOpen={openPosition} cashUsd={cashUsd} />

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Open positions
        </h2>
        {openPositions.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No open positions yet. Open one from an AI Analyzer result, or add one manually above.
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Closed positions
          </h2>
          <div className="mt-3 space-y-3">
            {closedPositions.map((p) => (
              <PositionRow key={p.id} position={p} onClose={closePosition} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "yes" | "no";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold ${
          tone === "yes" ? "text-yes" : tone === "no" ? "text-no" : "text-white"
        }`}
      >
        {value}
      </p>
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
          <p className={`text-sm font-medium ${pnl >= 0 ? "text-yes" : "text-no"}`}>
            {formatUsd(pnl)}
          </p>
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
}: {
  onOpen: (p: Omit<PaperPosition, "id" | "openedAt" | "status">) => void;
  cashUsd: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [platform, setPlatform] = useState<Platform>("polymarket");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [entryCents, setEntryCents] = useState("50");
  const [size, setSize] = useState("25");

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
        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/20"
      >
        + Add a position manually
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
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
        <button
          onClick={submit}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Open position
        </button>
        <button
          onClick={() => setExpanded(false)}
          className="text-sm text-gray-500 hover:text-white"
        >
          Cancel
        </button>
        <span className="text-xs text-gray-500">Available: {formatUsd(cashUsd)}</span>
      </div>
    </div>
  );
}
