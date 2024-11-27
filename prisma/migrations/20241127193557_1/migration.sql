/*
  Warnings:

  - You are about to drop the column `giftedProduct` on the `discount1` table. All the data in the column will be lost.
  - You are about to drop the column `requiredProduct` on the `discount1` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_discount1" (
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
INSERT INTO "new_discount1" ("counts", "createdAt", "description", "discountAmount", "endTime", "giftedProductId", "giftedQuantity", "id", "maxGiftedQuantity", "maxUsage", "name", "requiredProductId", "requiredQuantity", "shop", "spendThreshold", "startTime", "status", "type", "userEligibility") SELECT "counts", "createdAt", "description", "discountAmount", "endTime", "giftedProductId", "giftedQuantity", "id", "maxGiftedQuantity", "maxUsage", "name", "requiredProductId", "requiredQuantity", "shop", "spendThreshold", "startTime", "status", "type", "userEligibility" FROM "discount1";
DROP TABLE "discount1";
ALTER TABLE "new_discount1" RENAME TO "discount1";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
