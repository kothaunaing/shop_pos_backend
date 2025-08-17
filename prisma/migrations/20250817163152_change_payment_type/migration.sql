-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Cash', 'KPay', 'WavePay');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "paymentQrId" TEXT,
ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'Cash';

-- CreateTable
CREATE TABLE "PaymentQRCode" (
    "id" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentQRCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentQRCode_type_key" ON "PaymentQRCode"("type");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_paymentQrId_fkey" FOREIGN KEY ("paymentQrId") REFERENCES "PaymentQRCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
