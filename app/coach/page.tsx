"use client";

import CoachChat from "@/components/CoachChat";
import { useAnalysisHistory } from "@/lib/hooks/useAnalysisHistory";

export default function CoachPage() {
  const { history } = useAnalysisHistory();
  const latest = history[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">AI Coach</h1>
        <p className="mt-1 text-sm text-gray-400">
          Ask about prediction-market or trading concepts in plain language.
          {latest && " I'll keep your most recent AI Analyzer result in view as context."}
        </p>
      </div>
      <div className="h-[520px]">
        <CoachChat context={latest} />
      </div>
    </div>
  );
}
