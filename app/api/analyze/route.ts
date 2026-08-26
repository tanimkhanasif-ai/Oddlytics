import { NextRequest, NextResponse } from "next/server";
import { requireSubscriber } from "@/lib/session";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient, ANALYSIS_MODEL } from "@/lib/anthropic";
import { ANALYSIS_ENGINE_SYSTEM_PROMPT } from "@/lib/prompts";
import { generateMockAnalysis } from "@/lib/mocks/analysis";
import { checkAnalysisRateLimit, ANALYSIS_LIMIT } from "@/lib/rateLimit";
import type { AnalysisResult, Platform } from "@/lib/types";

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

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  const access = await requireSubscriber();
  if (!access.ok) return access.response;

  const rateLimit = await checkAnalysisRateLimit(access.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `You've reached your limit of ${ANALYSIS_LIMIT} analyses for this 12-hour period.`,
        limitExceeded: true,
        resetAt: rateLimit.resetAt,
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    mode,
    platform,
    question,
    yesPrice,
    noPrice,
    marketId,
    imageBase64,
    imageMediaType,
    capitalUsd,
  } = body as Record<string, unknown>;

  const isScreenshot = mode === "screenshot";

  if (!isScreenshot) {
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
  } else if (typeof imageBase64 !== "string" || typeof imageMediaType !== "string") {
    return NextResponse.json({ error: "Missing screenshot image." }, { status: 400 });
  }

  const capital = typeof capitalUsd === "number" ? capitalUsd : undefined;

  // ---------------------------------------------------------------------
  // MOCK PATH (active whenever ANTHROPIC_API_KEY is unset — the default
  // for local dev right now). Returns realistic fake data matching the
  // exact analyzer output schema so the rest of the app is fully testable
  // without spending real API calls.
  // ---------------------------------------------------------------------
  if (!process.env.ANTHROPIC_API_KEY) {
    await delay(500 + Math.random() * 500);
    const mock = generateMockAnalysis({
      question: isScreenshot ? "Uploaded market screenshot" : (question as string),
      platform: isScreenshot ? "screenshot" : (platform as Platform),
      yesPrice: isScreenshot ? undefined : (yesPrice as number),
      noPrice: isScreenshot ? undefined : (noPrice as number),
      capitalUsd: capital,
    });
    return NextResponse.json({
      ...mock.result,
      _yesPrice: mock.yesPrice,
      _noPrice: mock.noPrice,
      _marketId: isScreenshot ? undefined : (marketId as string | undefined),
    });
  }

  // TODO: real Anthropic API call goes here. This block only runs once
  // ANTHROPIC_API_KEY is set in .env.local — nothing else needs to change
  // for the app to switch from mocked to live analysis.
  let userContent: Anthropic.MessageParam["content"];

  if (isScreenshot) {
    userContent = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: imageBase64 as string,
        },
      },
      {
        type: "text",
        text: [
          "This is a screenshot of a prediction market. Read the question and any visible prices/odds directly from the image. If it shows more than two possible outcomes, evaluate every outcome listed and follow the multi-outcome market instructions.",
          capital != null ? `Available trading capital: $${capital}` : "No capital figure was provided.",
        ].join("\n"),
      },
    ];
  } else {
    userContent = [
      `Market question: ${question}`,
      `Platform: ${platform}`,
      `Current YES price: ${((yesPrice as number) * 100).toFixed(1)}¢ (implied probability ${(
        (yesPrice as number) * 100
      ).toFixed(1)}%)`,
      `Current NO price: ${((noPrice as number) * 100).toFixed(1)}¢ (implied probability ${(
        (noPrice as number) * 100
      ).toFixed(1)}%)`,
      capital != null ? `Available trading capital: $${capital}` : "No capital figure was provided.",
    ].join("\n");
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

    return NextResponse.json({
      ...parsed,
      _yesPrice: isScreenshot ? undefined : (yesPrice as number),
      _noPrice: isScreenshot ? undefined : (noPrice as number),
      _marketId: isScreenshot ? undefined : (marketId as string | undefined),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
