import { NextResponse } from "next/server";
import { getCurrentPicks, nextWeekStart, MIN_CONFIDENCE } from "@/lib/handpicks";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const picks = await getCurrentPicks();

  // Non-subscribers get the full week's grid so the blurred preview behind the
  // paywall looks like the real thing — but never the AI reasoning, which is
  // the part they're actually paying for.
  const payload = picks.map((p) => ({
    id: p.id,
    rank: p.rank,
    platform: p.platform,
    question: p.question,
    url: p.url,
    imageUrl: p.imageUrl,
    side: p.side,
    confidence: p.confidence,
    marketPct: p.marketPct,
    edge: p.edge,
    volumeUsd: p.volumeUsd,
    analysis: user?.subscribed ? p.analysis : null,
  }));

  return NextResponse.json({
    picks: payload,
    subscribed: !!user?.subscribed,
    nextRefresh: nextWeekStart().toISOString(),
    minConfidence: MIN_CONFIDENCE,
  });
}
