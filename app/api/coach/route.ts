import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, COACH_MODEL } from "@/lib/anthropic";
import { AI_COACH_SYSTEM_PROMPT } from "@/lib/prompts";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

function isChatMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== "object") return false;
  const v = m as Record<string, unknown>;
  return (v.role === "user" || v.role === "assistant") && typeof v.content === "string";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const messages = body?.messages;
  const context = body?.context;

  if (!Array.isArray(messages) || messages.length === 0 || !messages.every(isChatMessage)) {
    return NextResponse.json({ error: "Missing chat messages." }, { status: 400 });
  }

  const system = context
    ? `${AI_COACH_SYSTEM_PROMPT}\n\nThe user currently has this on screen (reference it naturally if relevant, but don't dump it back verbatim):\n${JSON.stringify(
        context
      )}`
    : AI_COACH_SYSTEM_PROMPT;

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: 500,
      system,
      messages: messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Coach reply failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
