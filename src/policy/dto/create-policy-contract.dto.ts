import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDate, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ContractStatus } from '../enums/contract-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

class LoadingDto {
  @ApiProperty({ example: 'Pre-existing condition' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  percentage: number;
}

class WaitingPeriodDto {
  @ApiProperty({ example: 'Maternity' })
  @IsString()
  condition: string;

  @ApiProperty({ example: 90 })
  @IsNumber()
  periodInDays: number;
}

class SpecialTermsDto {
  @ApiProperty({ type: [String], example: ['Pre-existing conditions', 'Cosmetic procedures'] })
  @IsArray()
  @IsString({ each: true })
  exclusions: string[];

  @ApiProperty({ type: [LoadingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadingDto)
  loadings: LoadingDto[];

  @ApiProperty({ type: [WaitingPeriodDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaitingPeriodDto)
  waitingPeriods: WaitingPeriodDto[];
}

export class CreatePolicyContractDto {
  @ApiProperty()
  @IsString()
  contractNumber: string;

  @ApiProperty()
  @IsUUID()
  policyProductId: string;

  @ApiProperty()
  @IsUUID()
  primaryMemberId: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  dependentMemberIds?: string[];

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  premiumAmount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalCoverageAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpecialTermsDto)
  specialTerms?: SpecialTermsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  previousContractId?: string;
}
