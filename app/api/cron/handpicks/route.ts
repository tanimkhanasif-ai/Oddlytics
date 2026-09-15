import { NextRequest, NextResponse } from "next/server";
import { curateWeeklyPicks } from "@/lib/handpicks";

export const runtime = "nodejs";
// Scanning + analyzing dozens of markets takes a while.
export const maxDuration = 300;

/**
 * Weekly curation run. Vercel Cron calls this with an Authorization header
 * matching CRON_SECRET; without that secret set, the endpoint stays closed so
 * nobody can trigger paid analysis runs from the outside.
 *
 * HANDPICKS_AUTOMATION_ENABLED is a separate on/off switch for the paid part
 * of this run (kept apart from CRON_SECRET so pausing spend doesn't mean
 * re-opening the secret). Leave it unset/"false" pre-launch so the Monday
 * cron doesn't burn API credits scanning markets nobody's looking at yet.
 * Flip it to "true" in Vercel once there are real users, no code change needed.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not set on the server." },
      { status: 501 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.HANDPICKS_AUTOMATION_ENABLED !== "true") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "HANDPICKS_AUTOMATION_ENABLED is not set to \"true\" — paid curation is paused.",
    });
  }

  try {
    const result = await curateWeeklyPicks();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Curation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
