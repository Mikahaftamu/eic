import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  IsISO8601,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClaimType, SubmissionType } from '../entities/claim.entity';
import { CreateClaimItemDto } from './create-claim-item.dto';

@ValidatorConstraint({ name: 'isDateOrISOString', async: false })
export class IsDateOrISOStringConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (value instanceof Date) return true;
    if (typeof value === 'string') {
      // Try parsing as ISO string
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    return false;
  }

  defaultMessage() {
    return 'must be a valid date or ISO 8601 date string';
  }
}

export class CreateClaimDto {
  @ApiProperty({ description: 'ID of the insurance company', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  insuranceCompanyId: string;

  @ApiProperty({ description: 'ID of the member', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ description: 'ID of the provider', example: '123e4567-e89b-12d3-a456-426614174002', required: false })
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @ApiProperty({ 
    description: 'Type of claim', 
    enum: ClaimType,
    default: ClaimType.MEDICAL,
    example: ClaimType.MEDICAL
  })
  @IsEnum(ClaimType)
  @IsNotEmpty()
  claimType: ClaimType;

  @ApiProperty({ 
    description: 'Type of submission', 
    enum: SubmissionType,
    default: SubmissionType.ELECTRONIC,
    example: SubmissionType.ELECTRONIC
  })
  @IsEnum(SubmissionType)
  @IsNotEmpty()
  submissionType: SubmissionType;

  @ApiProperty({ 
    description: 'Start date of service', 
    example: '2025-03-15',
    type: Date
  })
  @IsDateString()
  serviceStartDate: string;

  @ApiProperty({ 
    description: 'End date of service (if different from start date)', 
    example: '2025-03-15',
    required: false,
    type: Date
  })
  @IsDateString()
  @IsOptional()
  serviceEndDate?: string;

  @ApiProperty({ 
    description: 'Date of claim submission', 
    example: '2025-03-20',
    type: Date
  })
  @IsDateString()
  submissionDate: string;

  @ApiProperty({ description: 'Primary diagnosis code', example: 'J20.9', required: false })
  @IsString()
  @IsOptional()
  diagnosisCode?: string;

  @ApiProperty({ 
    description: 'Additional diagnosis codes', 
    example: ['E11.9', 'I10'],
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additionalDiagnosisCodes?: string[];

  @ApiProperty({ description: 'Whether the service was for an emergency', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isEmergency?: boolean;

  @ApiProperty({ description: 'Whether pre-authorization was required', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  preAuthorizationRequired?: boolean;

  @ApiProperty({ 
    description: 'Pre-authorization number if applicable', 
    example: 'AUTH12345',
    required: false
  })
  @IsString()
  @IsOptional()
  preAuthorizationNumber?: string;

  @ApiProperty({ description: 'Whether the provider is out of network', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isOutOfNetwork?: boolean;

  @ApiProperty({ description: 'Additional notes about the claim', example: 'Patient was referred by Dr. Smith', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ 
    description: 'Additional data in JSON format', 
    example: { referringProvider: 'Dr. Jane Smith', facilityCode: 'FAC001' },
    required: false
  })
  @IsOptional()
  additionalData?: any;

  @ApiProperty({ 
    description: 'Line items for the claim', 
    type: [CreateClaimItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClaimItemDto)
  items: CreateClaimItemDto[];
}
