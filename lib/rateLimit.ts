import { prisma } from "@/lib/prisma";

const WINDOW_MS = 12 * 60 * 60 * 1000;
export const ANALYSIS_LIMIT = 10;

export interface RateLimitResult {
  allowed: boolean;
  /** ISO timestamp — when the oldest analysis in the current window ages out, freeing up a slot. */
  resetAt?: string;
}

/**
 * Caps a user to ANALYSIS_LIMIT analyses per rolling 12h window, counted from
 * AnalysisRecord (already written on every real analyze) rather than a
 * separate counter table. "Find me the perfect bet" burns several real API
 * calls per single recorded result, so it's gated by this same check before
 * it starts, not after.
 */
export async function checkAnalysisRateLimit(userId: string): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - WINDOW_MS);
  const recent = await prisma.analysisRecord.findMany({
    where: { userId, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  if (recent.length < ANALYSIS_LIMIT) return { allowed: true };
  const resetAt = new Date(recent[0].createdAt.getTime() + WINDOW_MS);
  return { allowed: false, resetAt: resetAt.toISOString() };
}
