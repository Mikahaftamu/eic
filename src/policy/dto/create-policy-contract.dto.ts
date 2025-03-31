import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDate, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ContractStatus } from '../enums/contract-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

class SpecialTermsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  exclusions: string[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  loadings: Array<{
    reason: string;
    percentage: number;
  }>;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  waitingPeriods: Array<{
    condition: string;
    periodInDays: number;
  }>;
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
