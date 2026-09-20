import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * One-time owner override: marks the site owner's own account as subscribed
 * without going through Whop checkout. The target email is hardcoded (not
 * read from the request) so this can only ever affect this one account,
 * regardless of who calls it — there's no input that could touch any other
 * user's row. Gated behind CRON_SECRET, the same "prove you're the owner"
 * secret already used for the handpicks cron.
 */
const OWNER_EMAIL = "tanim.khan.asif@gmail.com";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set on the server." }, { status: 501 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.update({
      where: { email: OWNER_EMAIL },
      data: { subscribed: true },
    });
    return NextResponse.json({ ok: true, email: user.email, subscribed: user.subscribed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
