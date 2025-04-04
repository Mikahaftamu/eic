import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AppealStatus } from '../entities/claim-appeal.entity';

export class ClaimAppealResponseDto {
  @ApiProperty({ description: 'Unique identifier for the appeal' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'ID of the claim being appealed' })
  @Expose()
  claimId: string;

  @ApiProperty({ description: 'ID of the user who submitted the appeal' })
  @Expose()
  submittedById: string;

  @ApiProperty({ description: 'Unique appeal reference number' })
  @Expose()
  appealNumber: string;

  @ApiProperty({ description: 'Current status of the appeal', enum: AppealStatus })
  @Expose()
  status: AppealStatus;

  @ApiProperty({ description: 'Date the appeal was submitted', type: Date })
  @Expose()
  submissionDate: Date;

  @ApiProperty({ description: 'Reason for the appeal' })
  @Expose()
  reason: string;

  @ApiProperty({ description: 'Additional supporting information', required: false })
  @Expose()
  supportingInformation?: string;

  @ApiProperty({ description: 'References to supporting documents', type: [String], required: false })
  @Expose()
  documentReferences?: string[];

  @ApiProperty({ description: 'ID of the user who reviewed the appeal', required: false })
  @Expose()
  reviewedById?: string;

  @ApiProperty({ description: 'Date the appeal was reviewed', type: Date, required: false })
  @Expose()
  reviewDate?: Date;

  @ApiProperty({ description: 'Notes regarding the appeal decision', required: false })
  @Expose()
  decisionNotes?: string;

  @ApiProperty({ description: 'Original amount claimed' })
  @Expose()
  originalAmount?: number;

  @ApiProperty({ description: 'Amount being appealed for' })
  @Expose()
  appealedAmount?: number;

  @ApiProperty({ description: 'Amount approved after appeal' })
  @Expose()
  approvedAmount?: number;

  @ApiProperty({ description: 'Whether the appeal has been escalated to a higher level' })
  @Expose()
  isEscalated: boolean;

  @ApiProperty({ description: 'Appeal level (1 for first level, 2 for second level, etc.)' })
  @Expose()
  appealLevel: number;

  @ApiProperty({ description: 'Date the appeal was created', type: Date })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Date the appeal was last updated', type: Date })
  @Expose()
  updatedAt: Date;
}
