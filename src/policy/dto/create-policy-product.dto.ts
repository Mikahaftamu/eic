import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyType } from '../enums/policy-type.enum';
import { CoverageType } from '../enums/coverage-type.enum';
import { PremiumFrequency } from '../enums/premium-frequency.enum';
import { PremiumCalculationType } from '../enums/premium-calculation-type.enum';
import { LimitType } from '../enums/limit-type.enum';
import { ServiceType } from '../enums/service-type.enum';

class AgeRangeDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  minAge: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxAge: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  premium: number;
}

class PremiumConfigDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  baseAmount: number;

  @ApiProperty({ enum: PremiumFrequency })
  @IsEnum(PremiumFrequency)
  frequency: PremiumFrequency;

  @ApiProperty({ enum: PremiumCalculationType })
  @IsEnum(PremiumCalculationType)
  calculationType: PremiumCalculationType;

  @ApiProperty({ type: [AgeRangeDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgeRangeDto)
  ageRanges?: AgeRangeDto[];
}

class CopaymentDto {
  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED'] })
  @IsEnum(['PERCENTAGE', 'FIXED'])
  type: 'PERCENTAGE' | 'FIXED';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  value: number;
}

class BenefitDto {
  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  coverageLimit: number;

  @ApiProperty({ enum: LimitType })
  @IsEnum(LimitType)
  limitType: LimitType;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CopaymentDto)
  copayment?: CopaymentDto;
}

class EligibilityRulesDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  minAge: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxAge: number;

  @ApiProperty({ enum: ['ACCEPT', 'REJECT', 'WAITING_PERIOD'] })
  @IsEnum(['ACCEPT', 'REJECT', 'WAITING_PERIOD'])
  preExistingConditions: 'ACCEPT' | 'REJECT' | 'WAITING_PERIOD';

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  requiredDocuments: string[];
}

class AgeFactorDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  minAge: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxAge: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  factor: number;
}

class FamilySizeFactorDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  size: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  factor: number;
}

class LoadingFactorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  percentage: number;
}

class DiscountFactorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  percentage: number;
}

class PremiumModifiersDto {
  @ApiProperty({ type: [AgeFactorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgeFactorDto)
  ageFactors: AgeFactorDto[];

  @ApiProperty({ type: [FamilySizeFactorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilySizeFactorDto)
  familySizeFactors: FamilySizeFactorDto[];

  @ApiProperty({ type: [LoadingFactorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoadingFactorDto)
  loadingFactors: LoadingFactorDto[];

  @ApiProperty({ type: [DiscountFactorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountFactorDto)
  discountFactors: DiscountFactorDto[];
}

export class CreatePolicyProductDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: PolicyType })
  @IsEnum(PolicyType)
  type: PolicyType;

  @ApiProperty({ type: [String], enum: CoverageType })
  @IsArray()
  @IsEnum(CoverageType, { each: true })
  coverageTypes: CoverageType[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  waitingPeriod: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMembers?: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PremiumConfigDto)
  premium: PremiumConfigDto;

  @ApiProperty({ type: [BenefitDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenefitDto)
  benefits: BenefitDto[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => EligibilityRulesDto)
  eligibilityRules: EligibilityRulesDto;

  @ApiProperty({ enum: CoverageType })
  @IsEnum(CoverageType)
  coverageType: CoverageType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  basePremium: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PremiumModifiersDto)
  premiumModifiers: PremiumModifiersDto;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validTo?: Date;
}
