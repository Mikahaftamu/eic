import { ApiProperty } from '@nestjs/swagger';
import
{
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
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PolicyType } from '../enums/policy-type.enum';
import { ProductStatus } from '../enums/product-status.enum';
import { CoverageType } from '../enums/coverage-type.enum';
import { PremiumFrequency } from '../enums/premium-frequency.enum';
import { PremiumCalculationType } from '../enums/premium-calculation-type.enum';
import { LimitType } from '../enums/limit-type.enum';
import { ServiceType } from '../enums/service-type.enum';
import UUID from 'uuid';

class AgeRangeDto
{
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

class PremiumConfigDto
{
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

class CopaymentDto
{
  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED'] })
  @IsEnum(['PERCENTAGE', 'FIXED'])
  type: 'PERCENTAGE' | 'FIXED';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  value: number;
}

class BenefitDto
{
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

class EligibilityRulesDto
{
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

class AgeFactorDto
{
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

class FamilySizeFactorDto
{
  @ApiProperty()
  @IsNumber()
  @Min(1)
  size: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  factor: number;
}

class LoadingFactorDto
{
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  percentage: number;
}

class DiscountFactorDto
{
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  percentage: number;
}

class PremiumModifiersDto
{
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

export class CreatePolicyProductDto
{
  @ApiProperty({ description: 'Product code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: PolicyType })
  @IsEnum(PolicyType)
  type: PolicyType;

  @ApiProperty({ enum: ProductStatus, required: false })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ type: [String], enum: CoverageType })
  @IsArray()
  @IsEnum(CoverageType, { each: true })
  coverageTypes: CoverageType[];

  @ApiProperty({ description: 'Waiting period in days', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  waitingPeriod?: number;

  @ApiProperty({ description: 'Maximum number of members (for family/group policies)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMembers?: number;

  @ApiProperty({ description: 'Premium configuration' })
  @ValidateNested()
  @Type(() => PremiumConfigDto)
  premium: PremiumConfigDto;

  @ApiProperty({
    description: 'Benefits configuration',
    type: [BenefitDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenefitDto)
  benefits: BenefitDto[];

  @ApiProperty({ description: 'Eligibility rules' })
  @ValidateNested()
  @Type(() => EligibilityRulesDto)
  eligibilityRules: EligibilityRulesDto;

  @ApiProperty({ description: 'Valid from date' })
  @IsDate()
  @Type(() => Date)
  validFrom: Date;

  @ApiProperty({ description: 'Valid to date', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  validTo?: Date;

  @ApiProperty({ description: 'Base premium amount', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePremium?: number;

  @ApiProperty({ description: 'Coverage type', required: false })
  @IsOptional()
  @IsString()
  coverageType?: string;

  @ApiProperty({
    description: 'Premium modifiers',
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PremiumModifiersDto)
  premiumModifiers?: PremiumModifiersDto;
}