import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AnalyticsService.name);

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
    try {
      // Validate insurance company exists
      await this.insuranceCompanyService.findById(insuranceCompanyId);

      // Validate year
      if (!year || year < 2000 || year > new Date().getFullYear() + 1) {
        throw new Error(`Invalid year: ${year}`);
      }

      this.logger.debug(`Getting monthly revenue for company ${insuranceCompanyId} and year ${year}`);

      const revenueData = await this.invoiceService.getRevenueByMonth(insuranceCompanyId, year);
      
      this.logger.debug(`Retrieved revenue data: ${JSON.stringify(revenueData)}`);

      return revenueData;
    } catch (error) {
      this.logger.error(`Error getting monthly revenue: ${error.message}`, error.stack);
      throw error;
    }
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
    try {
      this.logger.debug(`Getting provider analytics for company ${insuranceCompanyId} from ${startDate} to ${endDate}`);

      // Validate insurance company exists
      try {
        await this.insuranceCompanyService.findById(insuranceCompanyId);
      } catch (error) {
        this.logger.error(`Insurance company not found: ${error.message}`);
        throw new Error(`Insurance company with ID ${insuranceCompanyId} not found`);
      }

      // Validate dates
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      // Get provider performance metrics
      this.logger.debug('Getting provider performance metrics...');
      let providerPerformance;
      try {
        providerPerformance = await this.providerService.getProviderPerformanceMetrics(
          insuranceCompanyId,
          startDate,
          endDate,
        );
        this.logger.debug(`Provider performance metrics: ${JSON.stringify(providerPerformance)}`);
      } catch (error) {
        this.logger.error(`Error getting provider performance metrics: ${error.message}`, error.stack);
        throw new Error(`Failed to get provider performance metrics: ${error.message}`);
      }

      // Get top providers by claims
      this.logger.debug('Getting top providers by claims...');
      let topProviders;
      try {
        topProviders = await this.claimsService.getTopProvidersByClaims(
          insuranceCompanyId,
          startDate,
          endDate,
        );
        this.logger.debug(`Top providers: ${JSON.stringify(topProviders)}`);
      } catch (error) {
        this.logger.error(`Error getting top providers: ${error.message}`, error.stack);
        throw new Error(`Failed to get top providers: ${error.message}`);
      }

      // Get provider satisfaction ratings
      this.logger.debug('Getting provider satisfaction ratings...');
      let satisfactionRatings;
      try {
        satisfactionRatings = await this.providerService.getProviderSatisfactionRatings(
          insuranceCompanyId,
        );
        this.logger.debug(`Satisfaction ratings: ${JSON.stringify(satisfactionRatings)}`);
      } catch (error) {
        this.logger.error(`Error getting satisfaction ratings: ${error.message}`, error.stack);
        throw new Error(`Failed to get satisfaction ratings: ${error.message}`);
      }

      // Get provider claims distribution
      this.logger.debug('Getting provider claims distribution...');
      let claimsDistribution;
      try {
        claimsDistribution = await this.claimsService.getClaimsDistributionByProvider(
          insuranceCompanyId,
          startDate,
          endDate,
        );
        this.logger.debug(`Claims distribution: ${JSON.stringify(claimsDistribution)}`);
      } catch (error) {
        this.logger.error(`Error getting claims distribution: ${error.message}`, error.stack);
        throw new Error(`Failed to get claims distribution: ${error.message}`);
      }

      // Get provider payment statistics
      this.logger.debug('Getting provider payment stats...');
      let paymentStats;
      try {
        paymentStats = await this.paymentService.getProviderPaymentStats(
          insuranceCompanyId,
          startDate,
          endDate,
        );
        this.logger.debug(`Payment stats: ${JSON.stringify(paymentStats)}`);
      } catch (error) {
        this.logger.error(`Error getting payment stats: ${error.message}`, error.stack);
        throw new Error(`Failed to get payment stats: ${error.message}`);
      }

      // Get provider network status
      this.logger.debug('Getting provider network status...');
      let networkStatus;
      try {
        networkStatus = await this.providerService.getProviderNetworkStatus(
          insuranceCompanyId,
        );
        this.logger.debug(`Network status: ${JSON.stringify(networkStatus)}`);
      } catch (error) {
        this.logger.error(`Error getting network status: ${error.message}`, error.stack);
        throw new Error(`Failed to get network status: ${error.message}`);
      }

      const result = {
        providerPerformance,
        topProviders,
        satisfactionRatings,
        claimsDistribution,
        paymentStats,
        networkStatus,
        period: {
          startDate,
          endDate,
        },
      };

      this.logger.debug(`Provider analytics result: ${JSON.stringify(result)}`);

      return result;
    } catch (error) {
      this.logger.error(`Error getting provider analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Policy Analytics
  async getPolicyAnalytics(
    insuranceCompanyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    try {
      this.logger.debug(`Getting policy analytics for company ${insuranceCompanyId} from ${startDate} to ${endDate}`);

      // Validate insurance company exists
      try {
        await this.insuranceCompanyService.findById(insuranceCompanyId);
      } catch (error) {
        this.logger.error(`Insurance company not found: ${error.message}`);
        throw new Error(`Insurance company with ID ${insuranceCompanyId} not found`);
      }

      // Validate dates
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }

      // Get policy distribution
      this.logger.debug('Getting policy distribution...');
      let policyDistribution;
      try {
        policyDistribution = await this.policyContractService.getPolicyDistribution(
          insuranceCompanyId,
        );
        this.logger.debug(`Policy distribution: ${JSON.stringify(policyDistribution)}`);
      } catch (error) {
        this.logger.error(`Error getting policy distribution: ${error.message}`, error.stack);
        throw new Error(`Failed to get policy distribution: ${error.message}`);
      }

      // Get policy renewal rate
      this.logger.debug('Getting policy renewal rate...');
      let renewalRate;
      try {
        renewalRate = await this.policyContractService.getPolicyRenewalRate(
          insuranceCompanyId,
          startDate,
          endDate,
        );
        this.logger.debug(`Renewal rate: ${JSON.stringify(renewalRate)}`);
      } catch (error) {
        this.logger.error(`Error getting renewal rate: ${error.message}`, error.stack);
        throw new Error(`Failed to get renewal rate: ${error.message}`);
      }

      // Get policy profitability
      this.logger.debug('Getting policy profitability...');
      let policyProfitability;
      try {
        policyProfitability = await this.policyContractService.getPolicyProfitability(
          insuranceCompanyId,
          startDate,
          endDate,
        );
        this.logger.debug(`Policy profitability: ${JSON.stringify(policyProfitability)}`);
      } catch (error) {
        this.logger.error(`Error getting policy profitability: ${error.message}`, error.stack);
        throw new Error(`Failed to get policy profitability: ${error.message}`);
      }

      const result = {
        policyDistribution,
        renewalRate,
        policyProfitability,
        period: {
          startDate,
          endDate,
        },
      };

      this.logger.debug(`Policy analytics result: ${JSON.stringify(result)}`);

      return result;
    } catch (error) {
      this.logger.error(`Error getting policy analytics: ${error.message}`, error.stack);
      throw error;
    }
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
