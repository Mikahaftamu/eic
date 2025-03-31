import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserType } from '../common/enums/user-type.enum';
import { AnalyticsService } from './analytics.service';
import { FinancialSummaryDto } from './dto/financial-summary.dto';
import { MonthlyRevenueTrendDto } from './dto/monthly-revenue-trend.dto';
import { ClaimsAnalyticsDto } from './dto/claims-analytics.dto';
import { MemberAnalyticsDto } from './dto/member-analytics.dto';
import { ProviderAnalyticsDto } from './dto/provider-analytics.dto';
import { PolicyAnalyticsDto } from './dto/policy-analytics.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('financial-summary')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get financial summary for a specific period' })
  @ApiResponse({ status: 200, description: 'Financial summary data', type: FinancialSummaryDto })
  @ApiQuery({ name: 'insuranceCompanyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getFinancialSummary(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<FinancialSummaryDto> {
    return this.analyticsService.getFinancialSummary(
      insuranceCompanyId,
      startDate,
      endDate,
    );
  }

  @Get('monthly-revenue')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get monthly revenue trend for a specific year' })
  @ApiResponse({ status: 200, description: 'Monthly revenue trend data', type: [MonthlyRevenueTrendDto] })
  @ApiQuery({ name: 'insuranceCompanyId', required: true })
  @ApiQuery({ name: 'year', required: true, type: Number })
  async getMonthlyRevenueTrend(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('year') year: number,
  ): Promise<MonthlyRevenueTrendDto[]> {
    return this.analyticsService.getMonthlyRevenueTrend(
      insuranceCompanyId,
      year,
    );
  }

  @Get('claims')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get claims analytics for a specific period' })
  @ApiResponse({ status: 200, description: 'Claims analytics data', type: ClaimsAnalyticsDto })
  @ApiQuery({ name: 'insuranceCompanyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getClaimsAnalytics(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<ClaimsAnalyticsDto> {
    return this.analyticsService.getClaimsAnalytics(
      insuranceCompanyId,
      startDate,
      endDate,
    );
  }

  @Get('members')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get member analytics for a specific period' })
  @ApiResponse({ status: 200, description: 'Member analytics data', type: MemberAnalyticsDto })
  @ApiQuery({ name: 'insuranceCompanyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getMemberAnalytics(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<MemberAnalyticsDto> {
    return this.analyticsService.getMemberAnalytics(
      insuranceCompanyId,
      startDate,
      endDate,
    );
  }

  @Get('providers')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get provider analytics for a specific period' })
  @ApiResponse({ status: 200, description: 'Provider analytics data', type: ProviderAnalyticsDto })
  @ApiQuery({ name: 'insuranceCompanyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getProviderAnalytics(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<ProviderAnalyticsDto> {
    return this.analyticsService.getProviderAnalytics(
      insuranceCompanyId,
      startDate,
      endDate,
    );
  }

  @Get('policies')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get policy analytics for a specific period' })
  @ApiResponse({ status: 200, description: 'Policy analytics data', type: PolicyAnalyticsDto })
  @ApiQuery({ name: 'insuranceCompanyId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getPolicyAnalytics(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<PolicyAnalyticsDto> {
    return this.analyticsService.getPolicyAnalytics(
      insuranceCompanyId,
      startDate,
      endDate,
    );
  }

  @Get('dashboard')
  @Roles(UserType.ADMIN, UserType.INSURANCE_ADMIN)
  @ApiOperation({ summary: 'Get dashboard summary data' })
  @ApiResponse({ status: 200, description: 'Dashboard summary data', type: DashboardSummaryDto })
  @ApiQuery({ name: 'insuranceCompanyId', required: true })
  async getDashboardSummary(
    @Query('insuranceCompanyId') insuranceCompanyId: string,
  ): Promise<DashboardSummaryDto> {
    return this.analyticsService.getDashboardSummary(insuranceCompanyId);
  }
}
