/*
  Warnings:

  - You are about to drop the column `paymentQrId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the `PaymentQRCode` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentTypeId` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentTypeEnum" AS ENUM ('Cash', 'KPay', 'WavePay');

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_paymentQrId_fkey";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "paymentQrId",
DROP COLUMN "paymentType",
ADD COLUMN     "paymentTypeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PaymentQRCode";

-- DropEnum
DROP TYPE "PaymentType";

-- CreateTable
CREATE TABLE "PaymentType" (
    "id" TEXT NOT NULL,
    "type" "PaymentTypeEnum" NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentType_type_key" ON "PaymentType"("type");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "PaymentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
