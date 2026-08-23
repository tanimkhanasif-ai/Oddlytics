import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId, requireSubscriber } from "@/lib/session";
import { fetchTraderTrades } from "@/lib/markets/polymarketTraders";

export const runtime = "nodejs";

const MIRROR_SLICE_FRACTION = 0.1;

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [follows, feed] = await Promise.all([
    prisma.copyFollow.findMany({ where: { userId }, orderBy: { followedAt: "desc" } }),
    prisma.mirroredTrade.findMany({ where: { userId }, orderBy: { at: "desc" }, take: 30 }),
  ]);
  return NextResponse.json({ follows, feed });
}

export async function POST(req: NextRequest) {
  // Writes are the paid half of these features — reads stay open so the
  // blurred preview behind the paywall still has something to show.
  const access = await requireSubscriber();
  if (!access.ok) return access.response;
  const userId = access.userId;

  const body = await req.json().catch(() => null);

  if (body?.action === "follow") {
    const { walletAddress, name, allocationUsd } = body;
    if (
      typeof walletAddress !== "string" ||
      typeof allocationUsd !== "number" ||
      allocationUsd <= 0
    ) {
      return NextResponse.json({ error: "Invalid follow request." }, { status: 400 });
    }
    const follow = await prisma.copyFollow.upsert({
      where: { userId_walletAddress: { userId, walletAddress } },
      update: { allocationUsd },
      create: {
        userId,
        walletAddress,
        name: name ?? null,
        allocationUsd,
        lastSeenTradeTimestampMs: Date.now(),
      },
    });
    return NextResponse.json({ follow });
  }

  if (body?.action === "unfollow" && typeof body.walletAddress === "string") {
    await prisma.copyFollow.deleteMany({ where: { userId, walletAddress: body.walletAddress } });
    return NextResponse.json({ ok: true });
  }

  if (body?.action === "sync") {
    const follows = await prisma.copyFollow.findMany({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let cashUsd = user?.cashUsd ?? 0;

    for (const f of follows) {
      try {
        const trades = await fetchTraderTrades(f.walletAddress, 10);
        const newTrades = trades
          .filter((t) => t.timestampMs > f.lastSeenTradeTimestampMs)
          .filter(
            (t) =>
              t.side === "BUY" &&
              t.outcome &&
              ["yes", "no"].includes(t.outcome.toLowerCase()) &&
              t.price > 0 &&
              t.price < 1
          )
          .sort((a, b) => a.timestampMs - b.timestampMs);

        for (const t of newTrades) {
          const sizeUsd = Math.min(f.allocationUsd * MIRROR_SLICE_FRACTION, cashUsd);
          if (sizeUsd < 1) continue;
          const side = t.outcome!.toLowerCase() === "yes" ? "YES" : "NO";
          const question = t.question || t.market;

          await prisma.$transaction([
            prisma.user.update({ where: { id: userId }, data: { cashUsd: { decrement: sizeUsd } } }),
            prisma.paperPosition.create({
              data: {
                userId,
                marketQuestion: question,
                platform: "polymarket",
                side,
                entryPrice: t.price,
                sizeUsd,
                source: "copy-trading",
                sourceTraderAddress: f.walletAddress,
              },
            }),
            prisma.mirroredTrade.create({
              data: {
                userId,
                traderLabel: f.name || f.walletAddress,
                question,
                outcome: t.outcome,
                price: t.price,
                sizeUsd,
              },
            }),
          ]);
          cashUsd -= sizeUsd;
        }

        if (newTrades.length) {
          await prisma.copyFollow.update({
            where: { id: f.id },
            data: { lastSeenTradeTimestampMs: newTrades[newTrades.length - 1].timestampMs },
          });
        }
      } catch {
        // Skip this trader on error (e.g. their trade history is temporarily unreachable) and continue syncing the rest.
      }
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
