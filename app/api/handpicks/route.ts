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

  // Non-subscribers get a taste: the first three, without the full reasoning.
  const visible = user?.subscribed ? picks : picks.slice(0, 3);
  const payload = visible.map((p) => ({
    id: p.id,
    rank: p.rank,
    platform: p.platform,
    question: p.question,
    url: p.url,
    side: p.side,
    confidence: p.confidence,
    marketPct: p.marketPct,
    edge: p.edge,
    volumeUsd: p.volumeUsd,
    analysis: user?.subscribed ? p.analysis : null,
  }));

  return NextResponse.json({
    picks: payload,
    lockedCount: user?.subscribed ? 0 : Math.max(0, picks.length - visible.length),
    subscribed: !!user?.subscribed,
    nextRefresh: nextWeekStart().toISOString(),
    minConfidence: MIN_CONFIDENCE,
  });
}
