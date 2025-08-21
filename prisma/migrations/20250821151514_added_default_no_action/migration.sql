-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_cashierId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_saleId_fkey";

-- DropForeignKey
ALTER TABLE "StockInput" DROP CONSTRAINT "StockInput_addedById_fkey";

-- DropForeignKey
ALTER TABLE "StockInput" DROP CONSTRAINT "StockInput_productId_fkey";

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInput" ADD CONSTRAINT "StockInput_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInput" ADD CONSTRAINT "StockInput_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
