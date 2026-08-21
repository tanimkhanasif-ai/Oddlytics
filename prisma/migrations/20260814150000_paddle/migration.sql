-- Replace Stripe with Paddle as the payment provider
DROP INDEX "User_stripeCustomerId_key";

ALTER TABLE "User" RENAME COLUMN "stripeCustomerId" TO "paddleCustomerId";

CREATE UNIQUE INDEX "User_paddleCustomerId_key" ON "User"("paddleCustomerId");
