import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wallets = await prisma.trackedWallet.findMany({
    where: { userId },
    orderBy: { trackedAt: "desc" },
  });
  return NextResponse.json({ wallets });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);

  if (body?.action === "untrack" && typeof body.walletAddress === "string") {
    await prisma.trackedWallet.deleteMany({ where: { userId, walletAddress: body.walletAddress } });
    return NextResponse.json({ ok: true });
  }

  if (typeof body?.walletAddress === "string") {
    const wallet = await prisma.trackedWallet.upsert({
      where: { userId_walletAddress: { userId, walletAddress: body.walletAddress } },
      update: {},
      create: { userId, walletAddress: body.walletAddress, name: body.name ?? null },
    });
    return NextResponse.json({ wallet });
  }

  return NextResponse.json({ error: "Invalid request." }, { status: 400 });
}
