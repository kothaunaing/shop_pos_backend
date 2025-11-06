-- CreateEnum
CREATE TYPE "Operator" AS ENUM ('GT', 'LT', 'EQ', 'GTE', 'LTE', 'BETWEEN');

-- CreateTable
CREATE TABLE "RevenueRules" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "operator" "Operator" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "secondValue" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION NOT NULL,
    "serviceType" "MoneyServiceType" NOT NULL DEFAULT 'KPay',
    "inOutType" "InOutType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueRules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RevenueRules" ADD CONSTRAINT "RevenueRules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
