import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMoneyInoutDto } from './money-inout.dto';
import { InOutType, MoneyServiceType, Prisma } from '@prisma/client';
import { ImagekitService } from 'src/imagekit/imagekit.service';
import { RevenueRulesService } from 'src/revenue-rules/revenue-rules.service';

interface MoneyInoutStats {
  totalIn: number;
  totalOut: number;
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  inOutRatio: number;
  serviceTypeBreakdown: {
    serviceType: MoneyServiceType;
    count: number;
    totalAmount: number;
  }[];
  dailyAverages: {
    averageIn: number;
    averageOut: number;
    averageRevenue: number;
  };
}

interface DetailedStats {
  period: string;
  totalIn: number;
  totalOut: number;
  totalRevenue: number;
  transactionCount: number;
}

interface AdminOverview {
  stats: MoneyInoutStats;
  recentTransactions: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

@Injectable()
export class MoneyInoutService {
  constructor(
    private prisma: PrismaService,
    private imageKit: ImagekitService,
    private ruleService: RevenueRulesService,
  ) {}

  async createMoneyInout(
    createMoneyInoutDto: CreateMoneyInoutDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    try {
      const uploadResult = await this.imageKit.uploadFile(file);

      const revenue = await this.ruleService.calculateRevenue(
        createMoneyInoutDto.quantity,
        createMoneyInoutDto.type,
        createMoneyInoutDto.serviceType,
      );

      const moneyInout = await this.prisma.moneyInOut.create({
        data: {
          quantity: createMoneyInoutDto.quantity,
          revenue: revenue,
          serviceType: createMoneyInoutDto.serviceType as MoneyServiceType,
          type: createMoneyInoutDto.type as InOutType,
          screenshotUrl: uploadResult.url,
          addedByUserId: userId,
        },
        include: {
          addedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return this.toResponseDto(moneyInout);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create money in/out record: ${error.message}`,
      );
    }
  }

  async getAllMoneyInouts(
    page: number = 1,
    limit: number = 10,
    type?: InOutType,
    serviceType?: MoneyServiceType,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.MoneyInOutWhereInput = {};

    if (type) {
      where.type = type as InOutType;
    }

    if (serviceType) {
      where.serviceType = serviceType as MoneyServiceType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [moneyInouts, totalCount] = await Promise.all([
      this.prisma.moneyInOut.findMany({
        where,
        include: {
          addedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.moneyInOut.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: moneyInouts.map((moneyInout) => this.toResponseDto(moneyInout)),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
        limit,
      },
    };
  }

  async getMoneyInoutStats(
    startDate?: string,
    endDate?: string,
  ): Promise<MoneyInoutStats> {
    const where: Prisma.MoneyInOutWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [
      totalInResult,
      totalOutResult,
      totalRevenueResult,
      totalTransactions,
      serviceTypeBreakdown,
    ] = await Promise.all([
      // Total IN
      this.prisma.moneyInOut.aggregate({
        where: { ...where, type: InOutType.IN },
        _sum: { quantity: true },
      }),
      // Total OUT
      this.prisma.moneyInOut.aggregate({
        where: { ...where, type: InOutType.OUT },
        _sum: { quantity: true },
      }),
      // Total Revenue
      this.prisma.moneyInOut.aggregate({
        where,
        _sum: { revenue: true },
      }),
      // Total Transactions
      this.prisma.moneyInOut.count({ where }),
      // Service Type Breakdown
      this.prisma.moneyInOut.groupBy({
        by: ['serviceType'],
        where,
        _count: { _all: true },
        _sum: { quantity: true },
      }),
    ]);

    const totalIn = totalInResult._sum.quantity || 0;
    const totalOut = totalOutResult._sum.quantity || 0;
    const totalRevenue = totalRevenueResult._sum.revenue || 0;
    const averageTransaction =
      totalTransactions > 0 ? (totalIn + totalOut) / totalTransactions : 0;
    const inOutRatio = totalOut > 0 ? totalIn / totalOut : 0;

    // Calculate daily averages (assuming 30 days period if no date range provided)
    const dateRangeDays = this.calculateDateRangeDays(startDate, endDate);
    const dailyAverages = {
      averageIn: totalIn / dateRangeDays,
      averageOut: totalOut / dateRangeDays,
      averageRevenue: totalRevenue / dateRangeDays,
    };

    return {
      totalIn,
      totalOut,
      totalRevenue,
      totalTransactions,
      averageTransaction,
      inOutRatio: parseFloat(inOutRatio.toFixed(2)),
      serviceTypeBreakdown: serviceTypeBreakdown.map((item) => ({
        serviceType: item.serviceType,
        count: item._count._all,
        totalAmount: item._sum.quantity || 0,
      })),
      dailyAverages,
    };
  }
  async getFilteredStats(filters: {
    type?: InOutType;
    serviceType?: MoneyServiceType;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.MoneyInOutWhereInput = {};

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Type filter (IN/OUT)
    if (filters.type) {
      where.type = filters.type;
    }

    // Service Type filter - KPay or WavePay
    if (filters.serviceType) {
      where.serviceType = filters.serviceType;
    }

    const [
      totalInResult,
      totalOutResult,
      totalRevenueResult,
      totalTransactions,
      serviceTypeBreakdown,
    ] = await Promise.all([
      // Total IN (respects serviceType and date filters, but not type filter for IN calculation)
      this.prisma.moneyInOut.aggregate({
        where: {
          ...where,
          // Remove type filter for IN calculation to get all IN transactions

          type: InOutType.IN,
          serviceType: filters.serviceType,
        },
        _sum: { quantity: true },
      }),
      // Total OUT (respects serviceType and date filters, but not type filter for OUT calculation)
      this.prisma.moneyInOut.aggregate({
        where: {
          ...where,
          // Remove type filter for OUT calculation to get all OUT transactions

          type: InOutType.OUT,
          serviceType: filters.serviceType,
        },
        _sum: { quantity: true },
      }),
      // Total Revenue (respects all filters)
      this.prisma.moneyInOut.aggregate({
        where,
        _sum: { revenue: true },
      }),
      // Total Transactions (respects all filters)
      this.prisma.moneyInOut.count({ where }),
      // Service Type Breakdown (respects all filters)
      this.prisma.moneyInOut.groupBy({
        by: ['serviceType'],
        where,
        _count: { _all: true },
        _sum: { quantity: true, revenue: true },
      }),
    ]);

    const totalIn = totalInResult._sum.quantity || 0;
    const totalOut = totalOutResult._sum.quantity || 0;
    const totalRevenue = totalRevenueResult._sum.revenue || 0;
    const totalTransactionsCount = totalTransactions;
    const averageTransaction =
      totalTransactionsCount > 0
        ? (totalIn + totalOut) / totalTransactionsCount
        : 0;
    const inOutRatio = totalOut > 0 ? totalIn / totalOut : 0;

    // Calculate daily averages
    const dateRangeDays = this.calculateDateRangeDays(
      filters.startDate,
      filters.endDate,
    );
    const dailyAverages = {
      averageIn: totalIn / dateRangeDays,
      averageOut: totalOut / dateRangeDays,
      averageRevenue: totalRevenue / dateRangeDays,
    };

    return {
      totalIn,
      totalOut,
      totalRevenue,
      totalTransactions: totalTransactionsCount,
      averageTransaction,
      inOutRatio: parseFloat(inOutRatio.toFixed(2)),
      serviceTypeBreakdown: serviceTypeBreakdown.map((item) => ({
        serviceType: item.serviceType,
        count: item._count._all,
        totalAmount: item._sum.quantity || 0,
        totalRevenue: item._sum.revenue || 0,
      })),
      dailyAverages,
      filters, // Optionally include applied filters in response
    };
  }

  async getDetailedMoneyInoutStats(
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<DetailedStats[]> {
    const where: Prisma.MoneyInOutWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get all transactions in the date range
    const transactions = await this.prisma.moneyInOut.findMany({
      where,
      select: {
        quantity: true,
        revenue: true,
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by period
    const groupedData = new Map<string, DetailedStats>();

    transactions.forEach((transaction) => {
      const period = this.getPeriodKey(transaction.createdAt, groupBy);

      if (!groupedData.has(period)) {
        groupedData.set(period, {
          period,
          totalIn: 0,
          totalOut: 0,
          totalRevenue: 0,
          transactionCount: 0,
        });
      }

      const periodData = groupedData.get(period)!;

      if (transaction.type === InOutType.IN) {
        periodData.totalIn += transaction.quantity;
      } else {
        periodData.totalOut += transaction.quantity;
      }

      periodData.totalRevenue += transaction.revenue;
      periodData.transactionCount += 1;
    });

    return Array.from(groupedData.values());
  }

  async getAdminOverview(
    page: number = 1,
    limit: number = 10,
    type?: InOutType,
    serviceType?: MoneyServiceType,
    startDate?: string,
    endDate?: string,
  ): Promise<AdminOverview> {
    const [stats, recentTransactionsData] = await Promise.all([
      this.getFilteredStats({
        type,
        serviceType,
        endDate,
        startDate,
      }),
      this.getAllMoneyInouts(
        page,
        limit,
        type,
        serviceType,
        startDate,
        endDate,
      ),
    ]);

    return {
      stats,
      recentTransactions: recentTransactionsData.data,
      pagination: recentTransactionsData.pagination,
    };
  }

  async getMoneyInoutById(id: string) {
    const moneyInout = await this.prisma.moneyInOut.findUnique({
      where: { id },
      include: {
        addedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!moneyInout) {
      throw new NotFoundException(
        `Money in/out record with ID ${id} not found`,
      );
    }

    return this.toResponseDto(moneyInout);
  }

  async deleteMoneyInout(id: string, userId: string): Promise<void> {
    const moneyInout = await this.prisma.moneyInOut.findUnique({
      where: { id },
    });

    if (!moneyInout) {
      throw new NotFoundException(
        `Money in/out record with ID ${id} not found`,
      );
    }

    if (moneyInout.addedByUserId !== userId) {
      throw new BadRequestException('You can only delete your own records');
    }

    await this.prisma.moneyInOut.delete({
      where: { id },
    });
  }

  // private calculateRevenue(quantity: number, type: InOutType): number {
  //   if (type === InOutType.IN) {
  //     return quantity * 0;
  //   } else {
  //     const percentage = quantity >= 400000 ? 0.05 : 0.01;
  //     return quantity * percentage;
  //   }
  // }

  private toResponseDto(moneyInout: any) {
    return {
      id: moneyInout.id,
      quantity: moneyInout.quantity,
      revenue: moneyInout.revenue,
      serviceType: moneyInout.serviceType,
      type: moneyInout.type,
      screenshotUrl: moneyInout.screenshotUrl,
      addedByUserId: moneyInout.addedByUserId,
      createdAt: moneyInout.createdAt,
      updatedAt: moneyInout.updatedAt,
      addedBy: moneyInout.addedBy,
    };
  }

  private calculateDateRangeDays(startDate?: string, endDate?: string): number {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 1); // Ensure at least 1 day
  }

  private getPeriodKey(date: Date, groupBy: 'day' | 'week' | 'month'): string {
    const d = new Date(date);

    switch (groupBy) {
      case 'day':
        return d.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'week':
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'month':
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      default:
        return d.toISOString().split('T')[0];
    }
  }
}
