"use client";

import { useState } from "react";
import { formatUsd } from "@/lib/utils";

export default function ProfitCalculator() {
  const [avgProfit, setAvgProfit] = useState(50);
  const [picksPerMonth, setPicksPerMonth] = useState(20);
  const total = avgProfit * picksPerMonth;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-center text-xl font-semibold text-white">
        See what consistent picks could add up to
      </h3>
      <div className="mt-6 space-y-6">
        <SliderField
          label="Average result per winning pick"
          value={avgProfit}
          onChange={setAvgProfit}
          min={0}
          max={500}
          step={10}
          format={(v) => formatUsd(v)}
        />
        <SliderField
          label="Winning picks acted on per month"
          value={picksPerMonth}
          onChange={setPicksPerMonth}
          min={0}
          max={100}
          step={1}
          format={(v) => String(v)}
        />
      </div>
      <div className="mt-6 rounded-lg bg-black/30 p-4 text-center">
        <p className="text-xs uppercase tracking-wide text-gray-500">Illustrative monthly total</p>
        <p className="mt-1 text-2xl font-semibold text-yes">{formatUsd(total)}</p>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">
        Hypothetical, for illustration only — not a projection or guarantee. Real results vary and
        can be negative.
      </p>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-white">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-white"
      />
    </div>
  );
}
