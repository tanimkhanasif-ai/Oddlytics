import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ email: user.email, name: user.name, subscribed: user.subscribed });
}

export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);

  if (body?.action === "reset") {
    await prisma.$transaction([
      prisma.paperPosition.deleteMany({ where: { userId } }),
      prisma.trackedWallet.deleteMany({ where: { userId } }),
      prisma.copyFollow.deleteMany({ where: { userId } }),
      prisma.mirroredTrade.deleteMany({ where: { userId } }),
      prisma.analysisRecord.deleteMany({ where: { userId } }),
      prisma.user.update({ where: { id: userId }, data: { cashUsd: 100000, subscribed: false } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (typeof body?.name === "string") {
    await prisma.user.update({ where: { id: userId }, data: { name: body.name } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown request." }, { status: 400 });
}
