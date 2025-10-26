import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  startOfDay,
  endOfDay,
  subDays,
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
} from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const [
      todaySales,
      totalSales,
      totalProducts,
      activeCashiers,
      totalRevenue,
      saleCount,
      lowStockCount,
    ] = await Promise.all([
      // Today's revenue
      this.prisma.sale.aggregate({
        _sum: { total: true },
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          paid: true,
        },
      }),
      // Total sales (transactions)
      this.prisma.sale.count({
        where: { paid: true },
      }),
      // Total products
      this.prisma.product.count(),
      // Active cashiers (users with role CASHIER or ADMIN who made sales in the last 30 days)
      this.prisma.user.count({
        where: {
          role: {
            in: ['CASHIER', 'ADMIN'],
          },
          sales: {
            some: {
              createdAt: {
                gte: subDays(new Date(), 30),
              },
            },
          },
        },
      }),
      // Total revenue for average calculation
      this.prisma.sale.aggregate({
        _sum: { total: true },
        where: { paid: true },
      }),
      // Total completed sales for average calculation
      this.prisma.sale.count({
        where: { paid: true },
      }),
      this.prisma.product.count({ where: { stock: { lte: 10 } } }),
    ]);

    const avgSaleValue =
      saleCount > 0
        ? Number((totalRevenue._sum.total || 0) / saleCount).toFixed(2)
        : 0;

    return {
      todayRevenue: Number(todaySales._sum.total || 0).toFixed(2),
      totalTransactions: totalSales,
      totalProducts,
      activeUsers: activeCashiers,
      avgOrderValue: Number(avgSaleValue),
      lowStockCount,
    };
  }

  async getSalesOverview() {
    const sevenDaysAgo = subDays(new Date(), 6);
    const startDate = startOfDay(sevenDaysAgo);

    // Generate date range for the last 7 days
    const dateRange = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        start: startOfDay(date),
        end: endOfDay(date),
      };
    });

    // Get sales data for each day
    const salesData = await Promise.all(
      dateRange.map(async ({ date, start, end }) => {
        const result = await this.prisma.sale.aggregate({
          _sum: { total: true },
          where: {
            paid: true,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });

        return {
          date,
          revenue: Number(result._sum.total || 0).toFixed(2),
        };
      }),
    );

    return salesData;
  }

  // New method: Get daily revenue and transactions for a specific month
  async getDailyStatsForMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    const daysInMonth = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    const dailyStats = await Promise.all(
      daysInMonth.map(async (day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const dateStr = format(day, 'yyyy-MM-dd');

        const [revenueResult, transactionCount] = await Promise.all([
          // Revenue for the day
          this.prisma.sale.aggregate({
            _sum: { total: true },
            where: {
              paid: true,
              createdAt: {
                gte: dayStart,
                lte: dayEnd,
              },
            },
          }),
          // Transaction count for the day
          this.prisma.sale.count({
            where: {
              paid: true,
              createdAt: {
                gte: dayStart,
                lte: dayEnd,
              },
            },
          }),
        ]);

        return {
          date: dateStr,
          revenue: Number(revenueResult._sum.total || 0),
          transactions: transactionCount,
        };
      }),
    );

    return dailyStats;
  }

  // New method: Get monthly revenue and transactions for a specific year
  async getMonthlyStatsForYear(year: number) {
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31); // December 31st

    const monthsInYear = eachMonthOfInterval({
      start: startDate,
      end: endDate,
    });

    const monthlyStats = await Promise.all(
      monthsInYear.map(async (month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthStr = format(month, 'yyyy-MM');

        const [revenueResult, transactionCount] = await Promise.all([
          // Revenue for the month
          this.prisma.sale.aggregate({
            _sum: { total: true },
            where: {
              paid: true,
              createdAt: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          }),
          // Transaction count for the month
          this.prisma.sale.count({
            where: {
              paid: true,
              createdAt: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          }),
        ]);

        return {
          month: monthStr,
          revenue: Number(revenueResult._sum.total || 0),
          transactions: transactionCount,
        };
      }),
    );

    return monthlyStats;
  }

  // New method: Get combined daily and monthly stats for current period
  async getRevenueAndTransactionStats() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const [dailyStats, monthlyStats] = await Promise.all([
      this.getDailyStatsForMonth(currentYear, currentMonth),
      this.getMonthlyStatsForYear(currentYear),
    ]);

    return {
      daily: dailyStats,
      monthly: monthlyStats,
    };
  }

  // Updated method to include transaction count in sales overview
  async getSalesOverviewWithTransactions() {
    const sevenDaysAgo = subDays(new Date(), 6);
    const startDate = startOfDay(sevenDaysAgo);

    // Generate date range for the last 7 days
    const dateRange = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        start: startOfDay(date),
        end: endOfDay(date),
      };
    });

    // Get sales data for each day including transaction count
    const salesData = await Promise.all(
      dateRange.map(async ({ date, start, end }) => {
        const [revenueResult, transactionCount] = await Promise.all([
          this.prisma.sale.aggregate({
            _sum: { total: true },
            where: {
              paid: true,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          }),
          this.prisma.sale.count({
            where: {
              paid: true,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          }),
        ]);

        return {
          date,
          revenue: Number(revenueResult._sum.total || 0).toFixed(2),
          transactions: transactionCount,
        };
      }),
    );

    return salesData;
  }

  async getLowStockItems(threshold: number = 10) {
    return this.prisma.product.findMany({
      where: {
        stock: {
          lte: threshold,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        updatedAt: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });
  }

  async getRecentActivities(limit: number = 10) {
    // Get recent sales
    const recentSales = await this.prisma.sale.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        cashier: {
          select: {
            name: true,
          },
        },
      },
      where: {
        paid: true,
      },
    });

    // Get recent user registrations
    const newUsers = await this.prisma.user.findMany({
      take: Math.ceil(limit / 2),
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Get recent inventory updates (using stock inputs)
    const stockInputs = await this.prisma.stockInput.findMany({
      take: Math.ceil(limit / 2),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        addedBy: {
          select: {
            name: true,
          },
        },
      },
    });

    // Combine and sort all activities
    const activities = [
      ...recentSales.map((sale) => ({
        id: `sale-${sale.id}`,
        type: 'SALE_COMPLETED' as const,
        description: `Sale completed by ${sale.cashier.name} - $${sale.total.toFixed(2)}`,
        timestamp: sale.createdAt,
        metadata: {
          saleId: sale.id,
          amount: sale.total,
          cashier: sale.cashier.name,
        },
      })),
      ...newUsers.map((user) => ({
        id: `user-${user.id}`,
        type: 'USER_ADDED' as const,
        description: `New ${user.role.toLowerCase()} registered: ${user.name}`,
        timestamp: user.createdAt,
        metadata: {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
      })),
      ...stockInputs.map((input) => ({
        id: `stock-${input.id}`,
        type: 'INVENTORY_UPDATED' as const,
        description: `Stock updated: ${input.quantity} units of ${input.product?.name} added by ${input.addedBy?.name}`,
        timestamp: input.createdAt,
        metadata: {
          productId: input.productId,
          quantity: input.quantity,
          addedById: input.addedById,
        },
      })),
    ];

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
