-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "commissionRate" REAL NOT NULL DEFAULT 0.10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Referral" ("code", "commissionRate", "createdAt", "id", "updatedAt", "userId") SELECT "code", "commissionRate", "createdAt", "id", "updatedAt", "userId" FROM "Referral";
DROP TABLE "Referral";
ALTER TABLE "new_Referral" RENAME TO "Referral";
CREATE UNIQUE INDEX "Referral_userId_key" ON "Referral"("userId");
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
