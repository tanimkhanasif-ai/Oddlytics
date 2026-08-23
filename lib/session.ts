import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export type Access =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * The real paywall. Every feature is paid, so the blur in the UI is only the
 * polite half — this is the half that actually stops a non-subscriber from
 * calling the endpoint directly and spending our Anthropic credits.
 *
 * 401 means "log in", 402 means "logged in, needs a subscription"; the client
 * tells those apart to decide between the login page and the pricing popup.
 */
export async function requireSubscriber(): Promise<Access> {
  const userId = await requireUserId();
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized", reason: "unauthenticated" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscribed: true },
  });
  if (!user?.subscribed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "This feature requires an Oddlytics subscription.", reason: "unsubscribed" },
        { status: 402 },
      ),
    };
  }

  return { ok: true, userId };
}

/** True when the caller is a paying subscriber — for routes that return a blurred teaser instead of refusing. */
export async function isSubscriber(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { subscribed: true } });
  return !!user?.subscribed;
}
