import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ subscribed: user?.subscribed ?? false });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (typeof body?.subscribed !== "boolean") {
    return NextResponse.json({ error: "Missing subscribed flag." }, { status: 400 });
  }
  await prisma.user.update({ where: { id: userId }, data: { subscribed: body.subscribed } });
  return NextResponse.json({ ok: true });
}
