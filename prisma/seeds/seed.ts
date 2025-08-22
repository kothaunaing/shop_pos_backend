import {
  PrismaClient,
  ProductCategory,
  Role,
  PaymentTypeEnum,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { sampleProducts } from './constants';

const prisma = new PrismaClient();

async function main() {
  // --- Create Users ---
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@shop.com',
      password: await bcrypt.hash('admin', 10),
      role: Role.ADMIN,
      profilePic: null,
    },
  });

  const cashier = await prisma.user.create({
    data: {
      name: 'Cashier 1',
      email: 'cashier@shop.com',
      password: await bcrypt.hash('cashier', 10),
      role: Role.CASHIER,
      profilePic: null,
    },
  });

  // --- Create Payment Types ---
  const paymentTypes = await Promise.all([
    prisma.paymentType.create({
      data: {
        type: PaymentTypeEnum.Cash,
        imageUrl: '/images/payment/cash.png',
        isActive: true,
      },
    }),
    prisma.paymentType.create({
      data: {
        type: PaymentTypeEnum.KPay,
        imageUrl: '/images/payment/kpay.png',
        isActive: true,
      },
    }),
    prisma.paymentType.create({
      data: {
        type: PaymentTypeEnum.WavePay,
        imageUrl: '/images/payment/wavepay.png',
        isActive: true,
      },
    }),
  ]);

  const cashPayment = paymentTypes.find(
    (pt) => pt.type === PaymentTypeEnum.Cash,
  );
  const kpayPayment = paymentTypes.find(
    (pt) => pt.type === PaymentTypeEnum.KPay,
  );
  const wavepayPayment = paymentTypes.find(
    (pt) => pt.type === PaymentTypeEnum.WavePay,
  );

  // --- Create Payment QR Codes ---
  // Note: PaymentQRCode model has been removed from the schema
  // We'll only create payment types and handle sales with paymentTypeId
  const kpayPaymentType = paymentTypes.find(
    (pt) => pt.type === PaymentTypeEnum.KPay,
  );
  const wavepayPaymentType = paymentTypes.find(
    (pt) => pt.type === PaymentTypeEnum.WavePay,
  );

  // --- Create Products ---
  const products = await Promise.all(
    sampleProducts.map((product) => {
      return prisma.product.create({
        data: { ...product, category: product.category as ProductCategory },
      });
    }),
  );

  // --- Create Sales and SaleItems ---
  for (let i = 0; i < 5; i++) {
    const saleItems = faker.helpers.arrayElements(products, 3);
    let total = 0;

    // Randomly select a payment type
    const selectedPaymentType = faker.helpers.arrayElement([
      { id: cashPayment!.id, type: PaymentTypeEnum.Cash },
      { id: kpayPaymentType!.id, type: PaymentTypeEnum.KPay },
      { id: wavepayPaymentType!.id, type: PaymentTypeEnum.WavePay },
    ]);

    const saleData = {
      cashierId: cashier.id,
      total: 0,
      paid: true,
      paymentTypeId: selectedPaymentType.id,
    };

    const sale = await prisma.sale.create({
      data: saleData,
    });

    for (const product of saleItems) {
      const quantity = faker.number.int({ min: 1, max: 5 });
      const price = product.price;

      await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: product.id,
          quantity,
          price,
        },
      });

      total += quantity * price;

      // Optionally decrease stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: quantity } },
      });
    }

    await prisma.sale.update({
      where: { id: sale.id },
      data: { total: parseFloat(total.toFixed(2)) },
    });
  }

  // --- Create Stock Inputs ---
  for (let i = 0; i < 5; i++) {
    const product = faker.helpers.arrayElement(products);
    const quantity = faker.number.int({ min: 10, max: 50 });

    await prisma.stockInput.create({
      data: {
        productId: product.id,
        quantity,
        addedById: admin.id,
      },
    });

    // Optionally increase stock
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: { increment: quantity } },
    });
  }

  console.log('✅ POS Shop System Seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
