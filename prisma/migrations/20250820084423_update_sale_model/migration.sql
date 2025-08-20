-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_paymentTypeId_fkey";

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_paymentTypeId_fkey" FOREIGN KEY ("paymentTypeId") REFERENCES "PaymentType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
