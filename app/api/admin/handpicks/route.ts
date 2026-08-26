import { NextRequest, NextResponse } from "next/server";
import { publishManualPicks } from "@/lib/handpicks";

export const runtime = "nodejs";

/**
 * Manual weekly-picks publish path: a batch of already-analyzed picks (e.g.
 * from market screenshots the user sent Claude directly in chat, rather than
 * the automated live-market scan) gets published here. Same secret-gated
 * pattern as /api/cron/handpicks — no public write access to this table.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set on the server." }, { status: 501 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const picks = body?.picks;
  if (!Array.isArray(picks) || picks.length === 0) {
    return NextResponse.json({ error: "Missing a non-empty 'picks' array." }, { status: 400 });
  }

  try {
    const result = await publishManualPicks(picks);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Publish failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
