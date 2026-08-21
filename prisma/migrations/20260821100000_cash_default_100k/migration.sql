-- Virtual starting cash is now $100,000 (was $1,000), matching the redesigned Virtual Trading UI
ALTER TABLE "User" ALTER COLUMN "cashUsd" SET DEFAULT 100000;
