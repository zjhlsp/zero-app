/*
  Warnings:

  - You are about to drop the column `giftedProduct` on the `discount2` table. All the data in the column will be lost.
  - You are about to drop the column `requiredProduct` on the `discount2` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_discount2" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "counts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "userEligibility" TEXT,
    "maxUsage" INTEGER,
    "spendThreshold" REAL,
    "discountAmount" REAL,
    "requiredProductId" TEXT,
    "requiredQuantity" INTEGER DEFAULT 1,
    "giftedProductId" TEXT,
    "giftedQuantity" INTEGER DEFAULT 1,
    "maxGiftedQuantity" INTEGER DEFAULT 1
);
INSERT INTO "new_discount2" ("counts", "createdAt", "description", "discountAmount", "endTime", "giftedProductId", "giftedQuantity", "id", "maxGiftedQuantity", "maxUsage", "name", "requiredProductId", "requiredQuantity", "shop", "spendThreshold", "startTime", "status", "type", "userEligibility") SELECT "counts", "createdAt", "description", "discountAmount", "endTime", "giftedProductId", "giftedQuantity", "id", "maxGiftedQuantity", "maxUsage", "name", "requiredProductId", "requiredQuantity", "shop", "spendThreshold", "startTime", "status", "type", "userEligibility" FROM "discount2";
DROP TABLE "discount2";
ALTER TABLE "new_discount2" RENAME TO "discount2";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
