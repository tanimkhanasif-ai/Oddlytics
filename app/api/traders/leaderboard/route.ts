import { NextRequest, NextResponse } from "next/server";
import { fetchTopTraders, type LeaderboardPeriod } from "@/lib/markets/polymarketTraders";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_PERIODS: LeaderboardPeriod[] = ["DAY", "WEEK", "MONTH", "ALL"];

export async function GET(req: NextRequest) {
  const periodParam = req.nextUrl.searchParams.get("period");
  const period: LeaderboardPeriod = VALID_PERIODS.includes(periodParam as LeaderboardPeriod)
    ? (periodParam as LeaderboardPeriod)
    : "WEEK";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 10, 25);

  try {
    const raw = await fetchTopTraders(period, limit);
    const counts = await prisma.copyFollow.groupBy({
      by: ["walletAddress"],
      where: { walletAddress: { in: raw.map((t) => t.walletAddress) } },
      _count: { walletAddress: true },
    });
    const countByWallet = new Map(counts.map((c) => [c.walletAddress, c._count.walletAddress]));
    const traders = raw.map((t) => ({ ...t, followerCount: countByWallet.get(t.walletAddress) ?? 0 }));
    return NextResponse.json({ traders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch leaderboard.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
