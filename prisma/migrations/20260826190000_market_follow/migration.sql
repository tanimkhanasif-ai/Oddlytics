-- "Copy a Kalshi market" instead of a trader — Kalshi has no public trader
-- data, so this mirrors the AI's own read on a followed market instead of
-- another person's trades.
CREATE TABLE "MarketFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "url" TEXT,
    "allocationUsd" DOUBLE PRECISION NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAnalyzedAt" TIMESTAMP(3),

    CONSTRAINT "MarketFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketFollow_userId_platform_marketId_key" ON "MarketFollow"("userId", "platform", "marketId");

-- AddForeignKey
ALTER TABLE "MarketFollow" ADD CONSTRAINT "MarketFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MirroredTrade now covers both wallet-copy (Polymarket) and market-copy (Kalshi) entries,
-- so the feed needs to know which platform each row came from.
ALTER TABLE "MirroredTrade" ADD COLUMN "platform" TEXT NOT NULL DEFAULT 'polymarket';
