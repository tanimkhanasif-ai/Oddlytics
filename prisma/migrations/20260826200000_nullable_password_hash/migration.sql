-- Google-created accounts have no password to check, so passwordHash can no longer be required.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
