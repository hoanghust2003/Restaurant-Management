import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('revenue')
  getRevenueAnalytics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('groupBy') groupBy: 'daily' | 'monthly' = 'daily',
  ) {
    return this.analyticsService.getRevenueAnalytics(startDate, endDate, groupBy);
  }

  @Get('top-selling')
  getTopSellingItems(
    @Query('limit', ParseIntPipe) limit: number = 5,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.analyticsService.getTopSellingItems(limit, period);
  }

  @Get('ingredient-cost')
  getIngredientCostAnalysis(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.analyticsService.getIngredientCostAnalysis(startDate, endDate);
  }

  @Get('table-usage')
  getTableUsageAnalytics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.analyticsService.getTableUsageAnalytics(startDate, endDate);
  }

  @Get('inventory-alerts')
  getInventoryAlerts() {
    return this.analyticsService.getInventoryAlerts();
  }
}
