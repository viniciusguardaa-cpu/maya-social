import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller('organizations/:organizationId/brands/:brandId/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get brand dashboard with aggregated metrics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getDashboard(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(startDate, endDate);
    return this.analyticsService.getBrandDashboard(brandId, range);
  }

  @Get('report')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate full brand report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getReport(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(startDate, endDate);
    return this.analyticsService.generateReport(brandId, range);
  }

  @Get('content/:contentItemId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get performance metrics for a specific content' })
  async getContentPerformance(@Param('contentItemId') contentItemId: string) {
    return this.analyticsService.getContentPerformance(contentItemId);
  }

  @Post('compare')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Compare performance of multiple content items' })
  async compareContent(
    @Param('brandId') brandId: string,
    @Body() data: { contentIds: string[] },
  ) {
    return this.analyticsService.getComparison(brandId, data.contentIds);
  }

  @Get('best-times')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get best posting times based on engagement' })
  async getBestTimes(@Param('brandId') brandId: string) {
    return this.analyticsService.getBestPostingTimes(brandId);
  }

  @Get('content-types')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get performance analysis by content type' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getContentTypeAnalysis(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(startDate, endDate);
    return this.analyticsService.getContentTypeAnalysis(brandId, range);
  }

  @Get('growth')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get growth metrics with period comparison' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getGrowth(
    @Param('brandId') brandId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const range = this.getDateRange(startDate, endDate);
    return this.analyticsService.getGrowthMetrics(brandId, range);
  }

  @Post('sync')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Sync insights from Instagram for all published content' })
  async syncInsights(
    @Param('brandId') brandId: string,
    @CurrentUser() user: any,
  ) {
    return this.analyticsService.syncAllInsights(brandId, user.id);
  }

  private getDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return { startDate: start, endDate: end };
  }
}
