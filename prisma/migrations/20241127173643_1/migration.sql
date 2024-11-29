-- CreateTable
CREATE TABLE "discount2" (
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
    "requiredProduct" TEXT,
    "requiredQuantity" INTEGER DEFAULT 1,
    "giftedProductId" TEXT,
    "giftedProduct" TEXT,
    "giftedQuantity" INTEGER DEFAULT 1,
    "maxGiftedQuantity" INTEGER DEFAULT 1
);
