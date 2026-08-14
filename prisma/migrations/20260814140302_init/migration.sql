-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashUsd" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "subscribed" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaperPosition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketQuestion" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "sizeUsd" DOUBLE PRECISION NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'open',
    "closedAt" TIMESTAMP(3),
    "exitPrice" DOUBLE PRECISION,
    "source" TEXT,
    "sourceTraderAddress" TEXT,

    CONSTRAINT "PaperPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackedWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "name" TEXT,
    "trackedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackedWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopyFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "name" TEXT,
    "allocationUsd" DOUBLE PRECISION NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenTradeTimestampMs" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "CopyFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MirroredTrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "traderLabel" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "outcome" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "sizeUsd" DOUBLE PRECISION NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MirroredTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "PaperPosition_userId_idx" ON "PaperPosition"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedWallet_userId_walletAddress_key" ON "TrackedWallet"("userId", "walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "CopyFollow_userId_walletAddress_key" ON "CopyFollow"("userId", "walletAddress");

-- CreateIndex
CREATE INDEX "MirroredTrade_userId_idx" ON "MirroredTrade"("userId");

-- CreateIndex
CREATE INDEX "AnalysisRecord_userId_idx" ON "AnalysisRecord"("userId");

-- AddForeignKey
ALTER TABLE "PaperPosition" ADD CONSTRAINT "PaperPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackedWallet" ADD CONSTRAINT "TrackedWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyFollow" ADD CONSTRAINT "CopyFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MirroredTrade" ADD CONSTRAINT "MirroredTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRecord" ADD CONSTRAINT "AnalysisRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
