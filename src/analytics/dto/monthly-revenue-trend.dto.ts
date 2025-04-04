import { ApiProperty } from '@nestjs/swagger';

export class MonthlyRevenueTrendDto {
  @ApiProperty({ description: 'Month number (1-12)', minimum: 1, maximum: 12 })
  month: number;

  @ApiProperty({ description: 'Revenue amount for the month' })
  revenue: number;
}
