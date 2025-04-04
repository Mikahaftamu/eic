import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AdjustmentType } from '../entities/claim-adjustment.entity';

export class ClaimAdjustmentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the adjustment' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'ID of the parent claim' })
  @Expose()
  claimId: string;

  @ApiProperty({ description: 'ID of the specific claim item this adjustment applies to', required: false })
  @Expose()
  claimItemId?: string;

  @ApiProperty({ description: 'Type of adjustment', enum: AdjustmentType })
  @Expose()
  adjustmentType: AdjustmentType;

  @ApiProperty({ description: 'Amount of the adjustment' })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'Reason for the adjustment' })
  @Expose()
  reason: string;

  @ApiProperty({ description: 'ID of the user who applied the adjustment', required: false })
  @Expose()
  appliedById?: string;

  @ApiProperty({ description: 'Reference number for the adjustment', required: false })
  @Expose()
  referenceNumber?: string;

  @ApiProperty({ description: 'Date the adjustment was applied', type: Date })
  @Expose()
  adjustmentDate: Date;

  @ApiProperty({ description: 'Date the adjustment was created', type: Date })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Date the adjustment was last updated', type: Date })
  @Expose()
  updatedAt: Date;
}
