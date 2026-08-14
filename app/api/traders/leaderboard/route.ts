import { NextRequest, NextResponse } from "next/server";
import { fetchTopTraders, type LeaderboardPeriod } from "@/lib/markets/polymarketTraders";

export const runtime = "nodejs";

const VALID_PERIODS: LeaderboardPeriod[] = ["DAY", "WEEK", "MONTH", "ALL"];

export async function GET(req: NextRequest) {
  const periodParam = req.nextUrl.searchParams.get("period");
  const period: LeaderboardPeriod = VALID_PERIODS.includes(periodParam as LeaderboardPeriod)
    ? (periodParam as LeaderboardPeriod)
    : "WEEK";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 10, 25);

  try {
    const traders = await fetchTopTraders(period, limit);
    return NextResponse.json({ traders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch leaderboard.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
