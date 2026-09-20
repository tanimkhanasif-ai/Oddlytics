// Split out from lib/rateLimit.ts so client components can read this constant
// without pulling in Prisma (server-only) as a transitive import.

// 8 per rolling 24h window — sized to hold an 80%+ worst-case profit margin
// on Haiku 4.5 pricing at the current subscription price. Re-derive this
// number if the model or price ever changes.
export const ANALYSIS_LIMIT = 8;
