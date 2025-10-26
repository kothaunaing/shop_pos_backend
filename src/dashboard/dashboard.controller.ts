import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from 'src/auth/auth.guard';

class DashboardStatsResponse {
  todayRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  activeUsers: number;
  avgOrderValue: number;
}

class SalesDataPoint {
  date: string;
  revenue: number;
}

class DailyStatsResponse {
  date: string;
  revenue: number;
  transactions: number;
}

class MonthlyStatsResponse {
  month: string;
  revenue: number;
  transactions: number;
}

class RevenueTransactionStatsResponse {
  daily: DailyStatsResponse[];
  monthly: MonthlyStatsResponse[];
}

class RecentActivity {
  id: string;
  type:
    | 'USER_ADDED'
    | 'INVENTORY_UPDATED'
    | 'SALE_COMPLETED'
    | 'LOW_STOCK_ALERT';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStockLevel: number;
  lastUpdated: Date;
}

@ApiTags('Dashboard')
// @ApiBearerAuth()
// @UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard key statistics' })
  @ApiOkResponse({
    description: 'Returns key dashboard statistics',
    type: DashboardStatsResponse,
  })
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('sales/overview')
  @ApiOperation({ summary: 'Get sales overview for the last 7 days' })
  @ApiOkResponse({
    description: 'Returns sales data points for the last 7 days',
    type: [SalesDataPoint],
  })
  async getSalesOverview() {
    return this.dashboardService.getSalesOverview();
  }

  @Get('sales/daily')
  @ApiOperation({
    summary:
      'Get daily revenue and transaction statistics for a specific month',
    description:
      'Returns revenue and number of transactions for each day in the specified month',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year for the statistics (default: current year)',
    type: Number,
    example: 2024,
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Month for the statistics (1-12, default: current month)',
    type: Number,
    example: 3,
  })
  @ApiOkResponse({
    description: 'Returns daily revenue and transaction statistics',
    type: [DailyStatsResponse],
  })
  @ApiBadRequestResponse({
    description: 'Invalid year or month parameter',
  })
  async getDailyStatsForMonth(
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;

    // Validate parameters
    if (targetYear < 2000 || targetYear > 2100) {
      throw new Error(
        'Invalid year parameter. Year must be between 2000 and 2100.',
      );
    }

    if (targetMonth < 1 || targetMonth > 12) {
      throw new Error(
        'Invalid month parameter. Month must be between 1 and 12.',
      );
    }

    return this.dashboardService.getDailyStatsForMonth(targetYear, targetMonth);
  }

  @Get('sales/monthly')
  @ApiOperation({
    summary:
      'Get monthly revenue and transaction statistics for a specific year',
    description:
      'Returns revenue and number of transactions for each month in the specified year',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year for the statistics (default: current year)',
    type: Number,
    example: 2024,
  })
  @ApiOkResponse({
    description: 'Returns monthly revenue and transaction statistics',
    type: [MonthlyStatsResponse],
  })
  @ApiBadRequestResponse({
    description: 'Invalid year parameter',
  })
  async getMonthlyStatsForYear(@Query('year') year: number) {
    const targetYear = year || new Date().getFullYear();

    // Validate parameter
    if (targetYear < 2000 || targetYear > 2100) {
      throw new Error(
        'Invalid year parameter. Year must be between 2000 and 2100.',
      );
    }

    return this.dashboardService.getMonthlyStatsForYear(targetYear);
  }

  @Get('sales/combined-stats')
  @ApiOperation({
    summary:
      'Get combined daily and monthly revenue and transaction statistics for current period',
    description:
      'Returns both daily stats for current month and monthly stats for current year',
  })
  @ApiOkResponse({
    description:
      'Returns combined daily and monthly revenue and transaction statistics',
    type: RevenueTransactionStatsResponse,
  })
  async getRevenueAndTransactionStats() {
    return this.dashboardService.getRevenueAndTransactionStats();
  }

  @Get('sales/overview-with-transactions')
  @ApiOperation({
    summary: 'Get sales overview with transaction count for the last 7 days',
    description:
      'Returns revenue and transaction count for each of the last 7 days',
  })
  @ApiOkResponse({
    description: 'Returns sales overview with transaction count',
    type: [DailyStatsResponse],
  })
  async getSalesOverviewWithTransactions() {
    return this.dashboardService.getSalesOverviewWithTransactions();
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    description: 'Custom threshold for low stock (default: 10)',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Returns list of items with low stock',
    type: [LowStockItem],
  })
  async getLowStockItems(@Query('threshold') threshold: number = 10) {
    return this.dashboardService.getLowStockItems(threshold);
  }

  @Get('activity/recent')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return (default: 10)',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Returns recent system activities',
    type: [RecentActivity],
  })
  async getRecentActivities(@Query('limit') limit: number = 10) {
    return this.dashboardService.getRecentActivities(limit);
  }
}
