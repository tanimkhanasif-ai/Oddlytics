import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireSubscriber } from "@/lib/session";
import { fetchKalshiQuote } from "@/lib/markets/kalshi";
import { analyzeLiveMarket } from "@/lib/analyzeMarket";
import { MIN_CONFIDENCE } from "@/lib/handpicks";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Don't re-analyze (and potentially re-trade) a followed market more often than this. */
const REANALYZE_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const follows = await prisma.marketFollow.findMany({
    where: { userId },
    orderBy: { followedAt: "desc" },
  });
  return NextResponse.json({ follows });
}

export async function POST(req: NextRequest) {
  // Writes are the paid half of this feature — reads stay open so the
  // blurred preview behind the paywall still has something to show.
  const access = await requireSubscriber();
  if (!access.ok) return access.response;
  const userId = access.userId;

  const body = await req.json().catch(() => null);

  if (body?.action === "follow") {
    const { marketId, question, url, allocationUsd } = body;
    if (
      typeof marketId !== "string" ||
      typeof question !== "string" ||
      typeof allocationUsd !== "number" ||
      allocationUsd <= 0
    ) {
      return NextResponse.json({ error: "Invalid follow request." }, { status: 400 });
    }
    const follow = await prisma.marketFollow.upsert({
      where: { userId_platform_marketId: { userId, platform: "kalshi", marketId } },
      update: { allocationUsd },
      create: {
        userId,
        platform: "kalshi",
        marketId,
        question,
        url: typeof url === "string" ? url : null,
        allocationUsd,
      },
    });
    return NextResponse.json({ follow });
  }

  if (body?.action === "unfollow" && typeof body.marketId === "string") {
    await prisma.marketFollow.deleteMany({
      where: { userId, platform: "kalshi", marketId: body.marketId },
    });
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "sync") {
    const follows = await prisma.marketFollow.findMany({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let cashUsd = user?.cashUsd ?? 0;

    for (const f of follows) {
      if (f.lastAnalyzedAt && Date.now() - f.lastAnalyzedAt.getTime() < REANALYZE_COOLDOWN_MS) {
        continue;
      }

      try {
        const quote = await fetchKalshiQuote(f.marketId);
        const analysis = await analyzeLiveMarket({
          platform: "kalshi",
          question: quote.question,
          yesPrice: quote.yesPrice,
          noPrice: quote.noPrice,
          marketId: f.marketId,
        });

        if (analysis.confidence_pct >= MIN_CONFIDENCE) {
          const sizeUsd = Math.min(f.allocationUsd, cashUsd);
          if (sizeUsd >= 1) {
            const entryPrice = analysis.recommendation === "YES" ? quote.yesPrice : quote.noPrice;

            await prisma.$transaction([
              prisma.user.update({ where: { id: userId }, data: { cashUsd: { decrement: sizeUsd } } }),
              prisma.paperPosition.create({
                data: {
                  userId,
                  marketQuestion: quote.question,
                  platform: "kalshi",
                  marketId: f.marketId,
                  side: analysis.recommendation,
                  entryPrice,
                  sizeUsd,
                  source: "copy-trading",
                },
              }),
              prisma.mirroredTrade.create({
                data: {
                  userId,
                  platform: "kalshi",
                  traderLabel: "AI pick — Kalshi market",
                  question: quote.question,
                  outcome: analysis.recommendation,
                  price: entryPrice,
                  sizeUsd,
                },
              }),
            ]);
            cashUsd -= sizeUsd;
          }
        }

        await prisma.marketFollow.update({
          where: { id: f.id },
          data: { lastAnalyzedAt: new Date() },
        });
      } catch {
        // Skip this market on error (e.g. temporarily unreachable) and continue syncing the rest.
      }
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
