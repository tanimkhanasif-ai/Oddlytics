import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, positions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.paperPosition.findMany({ where: { userId }, orderBy: { openedAt: "desc" } }),
  ]);
  return NextResponse.json({ cashUsd: user?.cashUsd ?? 0, positions });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "Missing action." }, { status: 400 });
  }

  if (body.action === "open") {
    const { marketQuestion, platform, side, entryPrice, sizeUsd, source, sourceTraderAddress } = body;
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
      prisma.user.update({ where: { id: userId }, data: { cashUsd: 1000 } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
