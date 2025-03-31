import { ApiProperty } from '@nestjs/swagger';
import { PeriodDto } from './financial-summary.dto';

export class PolicyDistributionDto {
  @ApiProperty({ description: 'Policy type' })
  policyType: string;

  @ApiProperty({ description: 'Number of policies of this type' })
  count: number;

  @ApiProperty({ description: 'Percentage of total policies' })
  percentage: number;
}

export class RenewalRateDto {
  @ApiProperty({ description: 'Policy type' })
  policyType: string;

  @ApiProperty({ description: 'Number of policies eligible for renewal' })
  eligibleCount: number;

  @ApiProperty({ description: 'Number of policies renewed' })
  renewedCount: number;

  @ApiProperty({ description: 'Renewal rate percentage' })
  renewalRate: number;
}

export class PolicyProfitabilityDto {
  @ApiProperty({ description: 'Policy type' })
  policyType: string;

  @ApiProperty({ description: 'Total premium revenue' })
  premiumRevenue: number;

  @ApiProperty({ description: 'Total claim expenses' })
  claimExpenses: number;

  @ApiProperty({ description: 'Profit amount' })
  profit: number;

  @ApiProperty({ description: 'Profit margin percentage' })
  profitMargin: number;
}

export class PolicyAnalyticsDto {
  @ApiProperty({ description: 'Policy distribution', type: [PolicyDistributionDto] })
  policyDistribution: PolicyDistributionDto[];

  @ApiProperty({ description: 'Policy renewal rates', type: [RenewalRateDto] })
  renewalRate: RenewalRateDto[];

  @ApiProperty({ description: 'Policy profitability metrics', type: [PolicyProfitabilityDto] })
  policyProfitability: PolicyProfitabilityDto[];

  @ApiProperty({ description: 'Period for the policy analytics', type: PeriodDto })
  period: PeriodDto;
}
