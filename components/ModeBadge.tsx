"use client";

import { useAppConfig } from "@/lib/hooks/useAppConfig";

export default function ModeBadge() {
  const config = useAppConfig();
  if (!config) return null;

  const live = config.aiEnabled;

  return (
    <span
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        live ? "bg-yes/15 text-yes" : "bg-white/10 text-gray-400"
      }`}
      title={
        live
          ? "Connected to the real Anthropic API."
          : "Running on mocked AI responses — set ANTHROPIC_API_KEY to go live."
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-yes" : "bg-gray-500"}`} />
      {live ? "Live" : "Demo mode"}
    </span>
  );
}
