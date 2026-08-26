-- Real market identifier for live re-pricing of open Paper Trading positions
-- (a Polymarket Gamma event id, or a Kalshi ticker). Nullable: positions
-- opened without a resolvable real market (screenshots, manual entries)
-- keep the simulated price walk.
ALTER TABLE "PaperPosition" ADD COLUMN "marketId" TEXT;
