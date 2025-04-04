import { ApiProperty } from '@nestjs/swagger';
import { PeriodDto } from './financial-summary.dto';

export class EnrollmentStatsDto {
  @ApiProperty({ description: 'Number of new enrollments' })
  newEnrollments: number;

  @ApiProperty({ description: 'Number of canceled enrollments' })
  canceledEnrollments: number;

  @ApiProperty({ description: 'Net change in enrollments' })
  netChange: number;

  @ApiProperty({ description: 'Growth rate percentage' })
  growthRate: number;
}

export class DemographicDto {
  @ApiProperty({ description: 'Demographic category (e.g., age group, gender)' })
  category: string;

  @ApiProperty({ description: 'Value of the demographic category' })
  value: string;

  @ApiProperty({ description: 'Count of members in this demographic' })
  count: number;

  @ApiProperty({ description: 'Percentage of total members' })
  percentage: number;
}

export class MemberAnalyticsDto {
  @ApiProperty({ description: 'Enrollment statistics', type: EnrollmentStatsDto })
  enrollmentStats: EnrollmentStatsDto;

  @ApiProperty({ description: 'Member demographics', type: [DemographicDto] })
  demographics: DemographicDto[];

  @ApiProperty({ description: 'Member retention rate percentage' })
  retentionRate: number;

  @ApiProperty({ description: 'Period for the member analytics', type: PeriodDto })
  period: PeriodDto;
}
