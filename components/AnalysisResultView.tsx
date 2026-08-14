import type { AnalysisResult } from "@/lib/types";

export default function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const isYes = result.recommendation === "YES";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {result.platform === "screenshot" ? "From screenshot" : result.platform}
          </p>
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
            ? ` (~$${result.position_sizing.suggested_amount.toLocaleString()})`
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
