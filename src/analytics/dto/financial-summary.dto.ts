import { ApiProperty } from '@nestjs/swagger';

export class RevenueSummaryDto {
  @ApiProperty({ description: 'Total revenue amount' })
  total: number;

  @ApiProperty({ description: 'Collected revenue amount' })
  collected: number;

  @ApiProperty({ description: 'Outstanding revenue amount' })
  outstanding: number;
}

export class ExpenseSummaryDto {
  @ApiProperty({ description: 'Total expenses amount' })
  total: number;

  @ApiProperty({ description: 'Paid expenses amount' })
  paid: number;

  @ApiProperty({ description: 'Pending expenses amount' })
  pending: number;
}

export class PeriodDto {
  @ApiProperty({ description: 'Start date of the period' })
  startDate: Date;

  @ApiProperty({ description: 'End date of the period' })
  endDate: Date;
}

export class FinancialSummaryDto {
  @ApiProperty({ description: 'Revenue summary', type: RevenueSummaryDto })
  revenue: RevenueSummaryDto;

  @ApiProperty({ description: 'Expenses summary', type: ExpenseSummaryDto })
  expenses: ExpenseSummaryDto;

  @ApiProperty({ description: 'Outstanding payments amount' })
  outstandingPayments: number;

  @ApiProperty({ description: 'Profit/loss amount' })
  profit: number;

  @ApiProperty({ description: 'Period for the financial summary', type: PeriodDto })
  period: PeriodDto;
}
