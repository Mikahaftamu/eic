import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InvoiceService } from '../billing/services/invoice.service';
import { PaymentService } from '../billing/services/payment.service';
import { ClaimsService } from '../claims/claims.service';
import { InsuranceCompanyService } from '../insurance/services/insurance-company.service';
import { ProviderService } from '../providers/services/provider.service';
import { PolicyContractService } from '../policy/services/policy-contract.service';
import { InvoiceType, InvoiceStatus } from '../billing/entities/invoice.entity';
import { PaymentStatus, PaymentType } from '../billing/entities/payment.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly paymentService: PaymentService,
    private readonly claimsService: ClaimsService,
    private readonly insuranceCompanyService: InsuranceCompanyService,
    private readonly providerService: ProviderService,
    private readonly policyContractService: PolicyContractService,
  ) {}

  // Financial Analytics
  async getFinancialSummary(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Get premium revenue
    const premiumRevenue = await this.invoiceService.getInvoiceStatsByDateRange(
      insuranceCompanyId,
      InvoiceType.PREMIUM,
      startDate,
      endDate,
    );

    // Get claim expenses
    const claimExpenses = await this.invoiceService.getInvoiceStatsByDateRange(
      insuranceCompanyId,
      InvoiceType.CLAIM,
      startDate,
      endDate,
    );

    // Get outstanding payments
    const outstandingPayments = await this.paymentService.getOutstandingPayments(
      insuranceCompanyId,
    );

    // Calculate profit/loss
    const profit = premiumRevenue.paid - claimExpenses.paid;

    return {
      revenue: {
        total: premiumRevenue.total,
        collected: premiumRevenue.paid,
        outstanding: premiumRevenue.outstanding,
      },
      expenses: {
        total: claimExpenses.total,
        paid: claimExpenses.paid,
        pending: claimExpenses.outstanding,
      },
      outstandingPayments,
      profit,
      period: {
        startDate,
        endDate,
      },
    };
  }

  // Monthly Revenue Trend
  async getMonthlyRevenueTrend(
    insuranceCompanyId: string,
    year: number,
  ): Promise<any> {
    return this.invoiceService.getRevenueByMonth(insuranceCompanyId, year);
  }

  // Claims Analytics
  async getClaimsAnalytics(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Get claims by status
    const claimsByStatus = await this.claimsService.getClaimsByStatus(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    // Get average processing time
    const avgProcessingTime = await this.claimsService.getAverageProcessingTime(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    // Get claims by provider
    const claimsByProvider = await this.claimsService.getClaimsByProvider(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    // Get top claim categories
    const topClaimCategories = await this.claimsService.getTopClaimCategories(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    return {
      claimsByStatus,
      avgProcessingTime,
      claimsByProvider,
      topClaimCategories,
      period: {
        startDate,
        endDate,
      },
    };
  }

  // Member Analytics
  async getMemberAnalytics(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Get member enrollment stats
    const enrollmentStats = await this.policyContractService.getMemberEnrollmentStats(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    // Get member demographics
    const demographics = await this.policyContractService.getMemberDemographics(
      insuranceCompanyId,
    );

    // Get member retention rate
    const retentionRate = await this.policyContractService.getMemberRetentionRate(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    return {
      enrollmentStats,
      demographics,
      retentionRate,
      period: {
        startDate,
        endDate,
      },
    };
  }

  // Provider Analytics
  async getProviderAnalytics(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Get provider performance
    const providerPerformance = await this.providerService.getProviderPerformanceMetrics(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    // Get top providers by claims
    const topProviders = await this.claimsService.getTopProvidersByClaims(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    // Get provider satisfaction ratings
    const satisfactionRatings = await this.providerService.getProviderSatisfactionRatings(
      insuranceCompanyId,
    );

    return {
      providerPerformance,
      topProviders,
      satisfactionRatings,
      period: {
        startDate,
        endDate,
      },
    };
  }

  // Policy Analytics
  async getPolicyAnalytics(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Get policy distribution
    const policyDistribution = await this.policyContractService.getPolicyDistribution(
      insuranceCompanyId,
    );

    // Get policy renewal rate
    const renewalRate = await this.policyContractService.getPolicyRenewalRate(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    // Get policy profitability
    const policyProfitability = await this.policyContractService.getPolicyProfitability(
      insuranceCompanyId,
      startDate,
      endDate,
    );

    return {
      policyDistribution,
      renewalRate,
      policyProfitability,
      period: {
        startDate,
        endDate,
      },
    };
  }

  // Dashboard Summary
  async getDashboardSummary(insuranceCompanyId: string): Promise<any> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Get current month financial summary
    const financialSummary = await this.getFinancialSummary(
      insuranceCompanyId,
      startOfMonth,
      endOfMonth,
    );
    
    // Get pending claims count
    const pendingClaims = await this.claimsService.getPendingClaimsCount(
      insuranceCompanyId,
    );
    
    // Get active members count
    const activeMembers = await this.policyContractService.getActiveMembersCount(
      insuranceCompanyId,
    );
    
    // Get active providers count
    const activeProviders = await this.providerService.getActiveProvidersCount(
      insuranceCompanyId,
    );
    
    // Get expiring policies in next 30 days
    const expiringPolicies = await this.policyContractService.getExpiringPoliciesCount(
      insuranceCompanyId,
      30,
    );
    
    return {
      financialSummary,
      pendingClaims,
      activeMembers,
      activeProviders,
      expiringPolicies,
      lastUpdated: new Date(),
    };
  }
}
