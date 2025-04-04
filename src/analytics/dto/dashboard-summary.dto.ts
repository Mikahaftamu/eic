import { ApiProperty } from '@nestjs/swagger';
import { FinancialSummaryDto } from './financial-summary.dto';

export class DashboardSummaryDto {
  @ApiProperty({ description: 'Financial summary for the current month', type: FinancialSummaryDto })
  financialSummary: FinancialSummaryDto;

  @ApiProperty({ description: 'Number of pending claims' })
  pendingClaims: number;

  @ApiProperty({ description: 'Number of active members' })
  activeMembers: number;

  @ApiProperty({ description: 'Number of active providers' })
  activeProviders: number;

  @ApiProperty({ description: 'Number of policies expiring in the next 30 days' })
  expiringPolicies: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;
}
