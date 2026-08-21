"use client";

import { useState } from "react";
import { DollarSign, Trophy, TrendingUp } from "lucide-react";

/** Whole-dollar formatting (no cents) — matches the reference design for this component only. */
function formatWholeUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function ProfitCalculator() {
  const [avgProfit, setAvgProfit] = useState(100);
  const [picksPerMonth, setPicksPerMonth] = useState(120);
  const total = avgProfit * picksPerMonth;

  return (
    <div className="rounded-2xl border border-brand/20 bg-white/[0.03] p-6 sm:p-8">
      <div className="space-y-7">
        <SliderField
          icon={DollarSign}
          label="Average profit per winning bet"
          value={avgProfit}
          onChange={setAvgProfit}
          min={0}
          max={1000}
          step={10}
          format={(v) => (v >= 1000 ? "$1000+" : formatWholeUsd(v))}
        />
        <SliderField
          icon={Trophy}
          label="AI winning picks per month"
          value={picksPerMonth}
          onChange={setPicksPerMonth}
          min={0}
          max={1000}
          step={10}
          format={(v) => (v >= 1000 ? "1000+" : String(v))}
        />
      </div>

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-brand-bright">
            <TrendingUp className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <p className="text-sm text-gray-300">Your estimated monthly profit</p>
        </div>
        <div className="rounded-xl border border-brand/40 bg-brand/10 px-5 py-2.5">
          <p className="text-xl font-bold text-brand-bright sm:text-2xl">{formatWholeUsd(total)}</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        Hypothetical, for illustration only — not a projection or guarantee. Real results vary and
        can be negative.
      </p>
    </div>
  );
}

function SliderField({
  icon: Icon,
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-brand-bright">
        <Icon className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">{label}</span>
          <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-semibold text-brand-bright">
            {format(value)}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-2 w-full accent-brand"
        />
      </div>
    </div>
  );
}
