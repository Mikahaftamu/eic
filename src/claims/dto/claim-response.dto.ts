import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ClaimStatus, ClaimType, SubmissionType } from '../entities/claim.entity';
import { ClaimItemResponseDto } from './claim-item-response.dto';
import { ClaimAdjustmentResponseDto } from './claim-adjustment-response.dto';

export class ClaimResponseDto {
  @ApiProperty({ description: 'Unique identifier for the claim' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Insurance company ID' })
  @Expose()
  insuranceCompanyId: string;

  @ApiProperty({ description: 'Member ID' })
  @Expose()
  memberId: string;

  @ApiProperty({ description: 'Provider ID', required: false })
  @Expose()
  providerId?: string;

  @ApiProperty({ description: 'Unique claim number' })
  @Expose()
  claimNumber: string;

  @ApiProperty({ description: 'Current status of the claim', enum: ClaimStatus })
  @Expose()
  status: ClaimStatus;

  @ApiProperty({ description: 'Type of claim', enum: ClaimType })
  @Expose()
  claimType: ClaimType;

  @ApiProperty({ description: 'How the claim was submitted', enum: SubmissionType })
  @Expose()
  submissionType: SubmissionType;

  @ApiProperty({ description: 'Start date of service', type: Date })
  @Expose()
  serviceStartDate: Date;

  @ApiProperty({ description: 'End date of service', type: Date, required: false })
  @Expose()
  serviceEndDate?: Date;

  @ApiProperty({ description: 'Date the claim was submitted', type: Date })
  @Expose()
  submissionDate: Date;

  @ApiProperty({ description: 'Total amount claimed' })
  @Expose()
  totalAmount: number;

  @ApiProperty({ description: 'Amount approved for payment' })
  @Expose()
  approvedAmount: number;

  @ApiProperty({ description: 'Amount actually paid' })
  @Expose()
  paidAmount: number;

  @ApiProperty({ description: 'Amount the member is responsible for' })
  @Expose()
  memberResponsibility: number;

  @ApiProperty({ description: 'Reason for denial if applicable', required: false })
  @Expose()
  denialReason?: string;

  @ApiProperty({ description: 'Primary diagnosis code', required: false })
  @Expose()
  diagnosisCode?: string;

  @ApiProperty({ description: 'Additional diagnosis codes', type: [String], required: false })
  @Expose()
  additionalDiagnosisCodes?: string[];

  @ApiProperty({ description: 'Whether the service was for an emergency' })
  @Expose()
  isEmergency: boolean;

  @ApiProperty({ description: 'Whether pre-authorization was required' })
  @Expose()
  preAuthorizationRequired: boolean;

  @ApiProperty({ description: 'Pre-authorization number if applicable', required: false })
  @Expose()
  preAuthorizationNumber?: string;

  @ApiProperty({ description: 'Whether the provider is out of network' })
  @Expose()
  isOutOfNetwork: boolean;

  @ApiProperty({ description: 'Additional notes about the claim', required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ description: 'Line items for the claim', type: [ClaimItemResponseDto] })
  @Expose()
  @Type(() => ClaimItemResponseDto)
  items: ClaimItemResponseDto[];

  @ApiProperty({ description: 'Adjustments applied to the claim', type: [ClaimAdjustmentResponseDto] })
  @Expose()
  @Type(() => ClaimAdjustmentResponseDto)
  adjustments: ClaimAdjustmentResponseDto[];

  @ApiProperty({ description: 'Date the claim was created', type: Date })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Date the claim was last updated', type: Date })
  @Expose()
  updatedAt: Date;
}
