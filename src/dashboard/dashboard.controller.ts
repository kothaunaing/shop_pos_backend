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
@ApiBearerAuth()
@UseGuards(AuthGuard)
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
