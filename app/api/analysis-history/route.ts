import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

const MAX_ITEMS = 10;

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const records = await prisma.analysisRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_ITEMS,
  });
  return NextResponse.json({ history: records.map((r) => r.data) });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.result) return NextResponse.json({ error: "Missing result." }, { status: 400 });

  await prisma.analysisRecord.create({ data: { userId, data: body.result } });

  const count = await prisma.analysisRecord.count({ where: { userId } });
  if (count > MAX_ITEMS) {
    const stale = await prisma.analysisRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: count - MAX_ITEMS,
      select: { id: true },
    });
    await prisma.analysisRecord.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
  }

  return NextResponse.json({ ok: true });
}
