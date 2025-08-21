-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_cashierId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_paymentTypeId_fkey";

-- AlterTable
ALTER TABLE "Sale" ALTER COLUMN "paymentTypeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "saleId" DROP NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StockInput" ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "addedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "PaymentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
