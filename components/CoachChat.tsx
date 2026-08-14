"use client";

import { useState } from "react";
import type { AnalysisResult, ChatMessage } from "@/lib/types";

export default function CoachChat({ context }: { context: AnalysisResult | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Coach reply failed.");
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-4">
      <div>
        <h3 className="font-medium text-white">AI Coach</h3>
        <p className="text-xs text-gray-500">
          Ask what a term means or have this pick explained. Informational only — not advice.
        </p>
      </div>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            Try: &ldquo;what does confidence score mean here?&rdquo; or &ldquo;explain maker vs
            taker fees.&rdquo;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-white text-black"
                : "bg-white/10 text-gray-200"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-sm text-gray-500">Thinking…</p>}
        {error && <p className="text-sm text-no">{error}</p>}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Ask the coach..."
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30"
        />
        <button
          onClick={send}
          disabled={loading}
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
