-- CreateEnum
CREATE TYPE "MoneyServiceType" AS ENUM ('KPay', 'WavePay');

-- CreateEnum
CREATE TYPE "InOutType" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "MoneyInOut" (
    "id" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "serviceType" "MoneyServiceType" NOT NULL DEFAULT 'KPay',
    "type" "InOutType" NOT NULL DEFAULT 'OUT',
    "screenshotUrl" TEXT NOT NULL,
    "addedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoneyInOut_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MoneyInOut" ADD CONSTRAINT "MoneyInOut_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
