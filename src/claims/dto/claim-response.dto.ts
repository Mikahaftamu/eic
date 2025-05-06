import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ClaimStatus, ClaimType, SubmissionType } from '../entities/claim.entity';
import { ClaimItemResponseDto } from './claim-item-response.dto';
import { ClaimAdjustmentResponseDto } from './claim-adjustment-response.dto';

export class ClaimResponseDto {
  @ApiProperty({ description: 'Unique identifier for the claim' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'ID of the insurance company' })
  @Expose()
  insuranceCompanyId: string;

  @ApiProperty({ description: 'ID of the member' })
  @Expose()
  memberId: string;

  @ApiProperty({ description: 'ID of the provider', required: false })
  @Expose()
  providerId: string;

  @ApiProperty({ description: 'Unique claim number' })
  @Expose()
  claimNumber: string;

  @ApiProperty({ 
    description: 'Current status of the claim',
    enum: ClaimStatus,
    example: ClaimStatus.SUBMITTED
  })
  @Expose()
  status: ClaimStatus;

  @ApiProperty({ 
    description: 'Type of claim',
    enum: ClaimType,
    example: ClaimType.MEDICAL
  })
  @Expose()
  claimType: ClaimType;

  @ApiProperty({ 
    description: 'Type of submission',
    enum: SubmissionType,
    example: SubmissionType.ELECTRONIC
  })
  @Expose()
  submissionType: SubmissionType;

  @ApiProperty({ description: 'Start date of service' })
  @Expose()
  serviceStartDate: Date;

  @ApiProperty({ description: 'End date of service', required: false })
  @Expose()
  serviceEndDate?: Date;

  @ApiProperty({ description: 'Date of claim submission' })
  @Expose()
  submissionDate: Date;

  @ApiProperty({ description: 'Total amount of the claim' })
  @Expose()
  totalAmount: number;

  @ApiProperty({ description: 'Approved amount' })
  @Expose()
  approvedAmount: number;

  @ApiProperty({ description: 'Paid amount' })
  @Expose()
  paidAmount: number;

  @ApiProperty({ description: 'Member responsibility amount' })
  @Expose()
  memberResponsibility: number;

  @ApiProperty({ description: 'Reason for denial if applicable', required: false })
  @Expose()
  denialReason?: string;

  @ApiProperty({ description: 'Primary diagnosis code', required: false })
  @Expose()
  diagnosisCode?: string;

  @ApiProperty({ 
    description: 'Additional diagnosis codes',
    type: [String],
    required: false
  })
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

  @ApiProperty({ 
    description: 'Additional data in JSON format',
    required: false
  })
  @Expose()
  additionalData?: any;

  @ApiProperty({ 
    description: 'Line items for the claim',
    type: [ClaimItemResponseDto]
  })
  @Expose()
  @Type(() => ClaimItemResponseDto)
  items: ClaimItemResponseDto[];

  @ApiProperty({ 
    description: 'Adjustments made to the claim',
    type: [ClaimAdjustmentResponseDto],
    required: false
  })
  @Expose()
  @Type(() => ClaimAdjustmentResponseDto)
  adjustments: ClaimAdjustmentResponseDto[];

  @ApiProperty({ description: 'Date when the claim was created' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Date when the claim was last updated' })
  @Expose()
  updatedAt: Date;
}
