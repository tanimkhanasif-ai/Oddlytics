import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, ANALYSIS_MODEL } from "@/lib/anthropic";
import { ANALYSIS_ENGINE_SYSTEM_PROMPT } from "@/lib/prompts";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { mode, platform, question, yesPrice, noPrice, imageBase64, imageMediaType, capitalUsd } =
    body as Record<string, unknown>;

  let userContent: Anthropic.MessageParam["content"];

  if (mode === "screenshot") {
    if (typeof imageBase64 !== "string" || typeof imageMediaType !== "string") {
      return NextResponse.json({ error: "Missing screenshot image." }, { status: 400 });
    }
    userContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageMediaType as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp",
          data: imageBase64,
        },
      },
      {
        type: "text",
        text: [
          "This is a screenshot of a prediction-market question. Read the question and any visible prices/odds directly from the image.",
          typeof capitalUsd === "number"
            ? `Available trading capital: $${capitalUsd}`
            : "No capital figure was provided.",
        ].join("\n"),
      },
    ];
  } else {
    if (
      typeof question !== "string" ||
      typeof yesPrice !== "number" ||
      typeof noPrice !== "number" ||
      (platform !== "polymarket" && platform !== "kalshi")
    ) {
      return NextResponse.json(
        { error: "Missing market question, platform, or prices." },
        { status: 400 }
      );
    }
    const lines = [
      `Market question: ${question}`,
      `Platform: ${platform}`,
      `Current YES price: ${(yesPrice * 100).toFixed(1)}¢ (implied probability ${(
        yesPrice * 100
      ).toFixed(1)}%)`,
      `Current NO price: ${(noPrice * 100).toFixed(1)}¢ (implied probability ${(
        noPrice * 100
      ).toFixed(1)}%)`,
      typeof capitalUsd === "number"
        ? `Available trading capital: $${capitalUsd}`
        : "No capital figure was provided.",
    ];
    userContent = lines.join("\n");
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: ANALYSIS_MODEL,
      max_tokens: 1500,
      system: ANALYSIS_ENGINE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from the model." }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = extractJson(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "The model did not return valid JSON.", raw: textBlock.text },
        { status: 502 }
      );
    }

    if (!isAnalysisResult(parsed)) {
      return NextResponse.json(
        { error: "The model's response didn't match the expected analysis shape.", raw: parsed },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
