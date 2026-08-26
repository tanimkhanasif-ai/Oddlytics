import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, ANALYSIS_MODEL } from "@/lib/anthropic";
import { ANALYSIS_ENGINE_SYSTEM_PROMPT } from "@/lib/prompts";
import { generateMockAnalysis } from "@/lib/mocks/analysis";
import type { AnalysisResult, Platform } from "@/lib/types";

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.market_question === "string" &&
    (v.recommendation === "YES" || v.recommendation === "NO") &&
    typeof v.confidence_pct === "number" &&
    Array.isArray(v.reasons) &&
    Array.isArray(v.key_risks) &&
    typeof v.position_sizing === "object" &&
    typeof v.take_profit === "object" &&
    typeof v.stop_loss === "object" &&
    Array.isArray(v.exit_if)
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface AnalyzeLiveMarketInput {
  platform: Platform;
  question: string;
  yesPrice: number;
  noPrice: number;
  marketId?: string;
  capitalUsd?: number;
}

/**
 * Shared live-market analysis path (mock-vs-real Anthropic gating), used by both
 * /api/analyze (single market, user-driven) and the "Find me the perfect bet"
 * batch flow so the two never drift out of sync.
 */
export async function analyzeLiveMarket({
  platform,
  question,
  yesPrice,
  noPrice,
  marketId,
  capitalUsd,
}: AnalyzeLiveMarketInput): Promise<AnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    await delay(300 + Math.random() * 300);
    const mock = generateMockAnalysis({ question, platform, yesPrice, noPrice, capitalUsd });
    return { ...mock.result, _yesPrice: mock.yesPrice, _noPrice: mock.noPrice, _marketId: marketId };
  }

  const userContent: Anthropic.MessageParam["content"] = [
    `Market question: ${question}`,
    `Platform: ${platform}`,
    `Current YES price: ${(yesPrice * 100).toFixed(1)}¢ (implied probability ${(yesPrice * 100).toFixed(1)}%)`,
    `Current NO price: ${(noPrice * 100).toFixed(1)}¢ (implied probability ${(noPrice * 100).toFixed(1)}%)`,
    capitalUsd != null ? `Available trading capital: $${capitalUsd}` : "No capital figure was provided.",
  ].join("\n");

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 1500,
    system: ANALYSIS_ENGINE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from the model.");
  }

  const parsed = extractJson(textBlock.text);
  if (!isAnalysisResult(parsed)) {
    throw new Error("The model's response didn't match the expected analysis shape.");
  }

  return { ...parsed, _yesPrice: yesPrice, _noPrice: noPrice, _marketId: marketId };
}
