import { ApiProperty } from '@nestjs/swagger';
import { PeriodDto } from './financial-summary.dto';

export class ProviderPerformanceDto {
  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Provider name' })
  providerName: string;

  @ApiProperty({ description: 'Number of claims processed' })
  claimsProcessed: number;

  @ApiProperty({ description: 'Average processing time in days' })
  avgProcessingTime: number;

  @ApiProperty({ description: 'Approval rate percentage' })
  approvalRate: number;
}

export class TopProviderDto {
  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Provider name' })
  providerName: string;

  @ApiProperty({ description: 'Number of claims' })
  claimsCount: number;

  @ApiProperty({ description: 'Total amount of claims' })
  claimsAmount: number;
}

export class SatisfactionRatingDto {
  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Provider name' })
  providerName: string;

  @ApiProperty({ description: 'Average satisfaction rating (1-5)' })
  averageRating: number;

  @ApiProperty({ description: 'Number of ratings' })
  ratingsCount: number;
}

export class ProviderAnalyticsDto {
  @ApiProperty({ description: 'Provider performance metrics', type: [ProviderPerformanceDto] })
  providerPerformance: ProviderPerformanceDto[];

  @ApiProperty({ description: 'Top providers by claims', type: [TopProviderDto] })
  topProviders: TopProviderDto[];

  @ApiProperty({ description: 'Provider satisfaction ratings', type: [SatisfactionRatingDto] })
  satisfactionRatings: SatisfactionRatingDto[];

  @ApiProperty({ description: 'Period for the provider analytics', type: PeriodDto })
  period: PeriodDto;
}
