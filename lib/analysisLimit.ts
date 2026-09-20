// Split out from lib/rateLimit.ts so client components can read this constant
// without pulling in Prisma (server-only) as a transitive import.

// 4 per 12h = 8/day max — sized to hold an 80%+ worst-case profit margin
// on Haiku 4.5 pricing at the current subscription price. Re-derive this
// number if the model or price ever changes.
export const ANALYSIS_LIMIT = 4;
