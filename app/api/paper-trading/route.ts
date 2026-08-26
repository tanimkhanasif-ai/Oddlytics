import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireSubscriber } from "@/lib/session";
import { fetchLiveYesPrice } from "@/lib/markets/livePrice";

export const runtime = "nodejs";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, positions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.paperPosition.findMany({ where: { userId }, orderBy: { openedAt: "desc" } }),
  ]);

  // Real live prices for open positions that have a resolvable market id.
  // Positions without one (screenshots, manual entries) get livePrice: null
  // and the client falls back to the simulated walk.
  const withLivePrice = await Promise.all(
    positions.map(async (p) => ({
      ...p,
      livePrice:
        p.status === "open" ? await fetchLiveYesPrice(p.platform, p.marketId) : null,
    }))
  );

  return NextResponse.json({ cashUsd: user?.cashUsd ?? 0, positions: withLivePrice });
}

export async function POST(req: NextRequest) {
  // Writes are the paid half of these features — reads stay open so the
  // blurred preview behind the paywall still has something to show.
  const access = await requireSubscriber();
  if (!access.ok) return access.response;
  const userId = access.userId;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "Missing action." }, { status: 400 });
  }

  if (body.action === "open") {
    const { marketQuestion, platform, marketId, side, entryPrice, sizeUsd, source, sourceTraderAddress } =
      body;
    if (
      typeof marketQuestion !== "string" ||
      typeof platform !== "string" ||
      (side !== "YES" && side !== "NO") ||
      typeof entryPrice !== "number" ||
      typeof sizeUsd !== "number" ||
      sizeUsd <= 0
    ) {
      return NextResponse.json({ error: "Invalid position." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || sizeUsd > user.cashUsd) {
      return NextResponse.json({ error: "Insufficient virtual cash." }, { status: 400 });
    }

    const [, position] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { cashUsd: { decrement: sizeUsd } } }),
      prisma.paperPosition.create({
        data: {
          userId,
          marketQuestion,
          platform,
          marketId: typeof marketId === "string" ? marketId : null,
          side,
          entryPrice,
          sizeUsd,
          source: typeof source === "string" ? source : null,
          sourceTraderAddress: typeof sourceTraderAddress === "string" ? sourceTraderAddress : null,
        },
      }),
    ]);
    return NextResponse.json({ position });
  }

  if (body.action === "close") {
    const { id, exitPrice } = body;
    if (typeof id !== "string" || typeof exitPrice !== "number") {
      return NextResponse.json({ error: "Invalid close request." }, { status: 400 });
    }
    const position = await prisma.paperPosition.findFirst({
      where: { id, userId, status: "open" },
    });
    if (!position) return NextResponse.json({ error: "Position not found." }, { status: 404 });

    const shares = position.sizeUsd / position.entryPrice;
    const payout = shares * exitPrice;

    await prisma.$transaction([
      prisma.paperPosition.update({
        where: { id },
        data: { status: "closed", closedAt: new Date(), exitPrice },
      }),
      prisma.user.update({ where: { id: userId }, data: { cashUsd: { increment: payout } } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reset") {
    await prisma.$transaction([
      prisma.paperPosition.deleteMany({ where: { userId } }),
      prisma.user.update({ where: { id: userId }, data: { cashUsd: 100000 } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
