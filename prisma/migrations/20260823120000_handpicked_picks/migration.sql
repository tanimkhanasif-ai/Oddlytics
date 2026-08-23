-- Weekly AI-curated picks, cached so all subscribers see the same set
CREATE TABLE "HandpickedPick" (
    "id" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "rank" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "url" TEXT,
    "side" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "marketPct" DOUBLE PRECISION NOT NULL,
    "edge" DOUBLE PRECISION NOT NULL,
    "volumeUsd" DOUBLE PRECISION NOT NULL,
    "analysis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandpickedPick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HandpickedPick_weekOf_platform_marketId_key" ON "HandpickedPick"("weekOf", "platform", "marketId");
CREATE INDEX "HandpickedPick_weekOf_rank_idx" ON "HandpickedPick"("weekOf", "rank");
