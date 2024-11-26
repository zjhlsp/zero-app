-- CreateTable
CREATE TABLE "newdiscount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "shsdfsop" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "counts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spendThreshold" REAL,
    "discountAmount" REAL,
    "requiredProductId" INTEGER,
    "requiredQuantity" INTEGER DEFAULT 1,
    "giftedProductId" INTEGER,
    "giftedQuantity" INTEGER DEFAULT 1
);
