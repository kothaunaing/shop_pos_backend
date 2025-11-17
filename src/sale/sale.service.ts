import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto, FindSaleDto, UpdateSaleDto } from './dto/sale.dto';
import { userSelect } from 'src/common/utils/includes-selects';
import { Prisma, PaymentTypeEnum } from '@prisma/client';

@Injectable()
export class SaleService {
  constructor(private prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto, cashierId: string) {
    // Validate payment type exists
    const paymentType = await this.prisma.paymentType.findUnique({
      where: { type: createSaleDto.paymentType },
    });

    if (!paymentType) {
      throw new BadRequestException('Invalid payment type');
    }

    const productIds = createSaleDto.items.map((item) => item.productId);

    // Fetch all required products at once
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const saleItemsData: any = [];
    let total = 0;

    for (const item of createSaleDto.items) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`,
        );
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      saleItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create sale and update stock in a transaction
    return this.prisma.$transaction(async (tx) => {
      const saleData: Prisma.SaleCreateInput = {
        cashier: {
          connect: { id: cashierId },
        },
        total,
        paid: true, // Mark as paid if cash paymentf
        paymentType: {
          connect: { type: createSaleDto.paymentType },
        },
        items: {
          create: saleItemsData,
        },
      };

      const sale = await tx.sale.create({
        data: saleData,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          cashier: {
            select: userSelect,
          },
          paymentType: true,
        },
      });

      for (const item of createSaleDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });
  }
  async findAll(dto: FindSaleDto) {
    const page = dto.page;
    const size = dto.size;
    const skip = (page - 1) * size;

    const whereClause: Prisma.SaleWhereInput = {};

    // 💰 Cashier filter (Existing)
    if (dto.cashierId) {
      whereClause.cashierId = dto.cashierId;
    }

    // 💵 Total range filter (Existing)
    if (dto.minTotal !== undefined || dto.maxTotal !== undefined) {
      whereClause.total = {
        ...(dto.minTotal !== undefined ? { gte: dto.minTotal } : {}),
        ...(dto.maxTotal !== undefined ? { lte: dto.maxTotal } : {}),
      };
    }

    // 🗓️ Date filtering (Existing)
    if (dto.filterBy) {
      let gte: Date | undefined = undefined;
      let lte: Date | undefined = undefined;
      const now = new Date();

      switch (dto.filterBy) {
        case 'today':
          gte = new Date();
          gte.setHours(0, 0, 0, 0);
          lte = new Date();
          lte.setHours(23, 59, 59, 999);
          break;

        case 'month': {
          const year = dto.year ?? now.getFullYear();
          const month = dto.month ?? now.getMonth() + 1;
          gte = new Date(year, month - 1, 1);
          lte = new Date(year, month, 0, 23, 59, 59, 999);
          break;
        }

        case 'week': {
          const year = dto.year ?? now.getFullYear();
          const month = dto.month ?? now.getMonth() + 1;
          const week = dto.week ?? 1;

          const startDay = (week - 1) * 7 + 1;
          const lastDayOfMonth = new Date(year, month, 0).getDate();
          const endDay = Math.min(week * 7, lastDayOfMonth);

          gte = new Date(year, month - 1, startDay, 0, 0, 0, 0);
          lte = new Date(year, month - 1, endDay, 23, 59, 59, 999);
          break;
        }

        case 'custom': {
          if (dto.startDate) {
            gte = new Date(dto.startDate);
            gte.setHours(0, 0, 0, 0);
          }
          if (dto.endDate) {
            lte = new Date(dto.endDate);
            lte.setHours(23, 59, 59, 999);
          }
          break;
        }
      }

      if (gte || lte) {
        whereClause.createdAt = {
          ...(gte ? { gte } : {}),
          ...(lte ? { lte } : {}),
        };
      }
    }

    // 1. Fetch sales and total counts using the filter
    const [sales, totalElements, totalAll] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        take: size,
        skip,
        where: whereClause,
        include: {
          // Must include 'product' to access 'import_price' for profit calculation
          items: { include: { product: true } },
          paymentType: true,
          cashier: {
            select: { name: true, email: true },
          },
        },
        orderBy: {
          [dto.sortBy]: dto.sortDirection,
        },
      }),
      this.prisma.sale.count({ where: whereClause }), // totalElements (filtered)
      this.prisma.sale.count(), // totalAll (unfiltered)
    ]);

    // 2. Aggregate sales statistics using the same filter
    const aggregates = await this.prisma.sale.aggregate({
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      where: whereClause,
    });

    const totalRevenue = aggregates._sum.total || 0;
    const totalTransactions = aggregates._count.id;

    // 3. Calculate Profit and Revenue for each sale and total profit
    let totalProfit = 0;

    const salesWithProfit = sales.map((sale) => {
      let saleCost = 0;

      // Calculate the cost of goods sold (COGS) for the sale
      for (const item of sale.items) {
        // Use optional chaining for safety in case product is null/undefined
        const importPrice =
          item.product?.import_price || item.product?.price || 0;
        saleCost += importPrice * item.quantity;
      }

      // Revenue for a sale is the total amount collected from the customer
      const saleRevenue = sale.total;
      const saleProfit = saleRevenue - saleCost;

      totalProfit += saleProfit;

      // Return the sale object with the new profit and revenue fields
      return {
        ...sale,
        // Add 'revenue' which is the same as 'total' but for clarity
        revenue: saleRevenue,
        profit: saleProfit,
      };
    });

    const totalSales = totalElements; // Same as totalTransactions (filtered count)

    const totalPages = Math.ceil(totalElements / size);
    const hasNextPage = page < totalPages;

    // 4. Update the return object
    return {
      page,
      size,
      totalPages,
      totalElements, // Count of sales under the current filter
      total: totalAll, // Unfiltered total count of all sales
      elements: salesWithProfit.length,
      nextPage: hasNextPage ? page + 1 : null,

      // Aggregates for the current filter
      totalSales: totalSales, // Total count of sales (same as totalElements)
      totalTransactions: totalTransactions, // Total count of transactions (same as totalElements)
      totalRevenue: totalRevenue, // Sum of all 'total' fields (Sales amount)
      totalProfit: totalProfit, // Calculated total profit for filtered sales

      // The list of sales, now including 'revenue' and 'profit' for each one
      results: salesWithProfit,
    };
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        paymentType: true,
        cashier: {
          select: userSelect,
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        paid: updateSaleDto.paid,
        paymentType: updateSaleDto.paymentType
          ? {
              update: { type: updateSaleDto.paymentType },
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        paymentType: true,
        cashier: {
          select: userSelect,
        },
      },
    });
  }
}
