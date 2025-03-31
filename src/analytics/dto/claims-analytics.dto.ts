import { ApiProperty } from '@nestjs/swagger';
import { PeriodDto } from './financial-summary.dto';

export class ClaimsByStatusDto {
  @ApiProperty({ description: 'Status name' })
  status: string;

  @ApiProperty({ description: 'Number of claims with this status' })
  count: number;

  @ApiProperty({ description: 'Total amount of claims with this status' })
  amount: number;
}

export class ClaimsByProviderDto {
  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Provider name' })
  providerName: string;

  @ApiProperty({ description: 'Number of claims from this provider' })
  count: number;

  @ApiProperty({ description: 'Total amount of claims from this provider' })
  amount: number;
}

export class TopClaimCategoryDto {
  @ApiProperty({ description: 'Category name' })
  category: string;

  @ApiProperty({ description: 'Number of claims in this category' })
  count: number;

  @ApiProperty({ description: 'Total amount of claims in this category' })
  amount: number;
}

export class ClaimsAnalyticsDto {
  @ApiProperty({ description: 'Claims by status', type: [ClaimsByStatusDto] })
  claimsByStatus: ClaimsByStatusDto[];

  @ApiProperty({ description: 'Average processing time in days' })
  avgProcessingTime: number;

  @ApiProperty({ description: 'Claims by provider', type: [ClaimsByProviderDto] })
  claimsByProvider: ClaimsByProviderDto[];

  @ApiProperty({ description: 'Top claim categories', type: [TopClaimCategoryDto] })
  topClaimCategories: TopClaimCategoryDto[];

  @ApiProperty({ description: 'Period for the claims analytics', type: PeriodDto })
  period: PeriodDto;
}
