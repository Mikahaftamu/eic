import { ApiProperty } from '@nestjs/swagger';
import { PolicyType } from '../enums/policy-type.enum';
import { ProductStatus } from '../enums/product-status.enum';
import { CoverageType } from '../enums/coverage-type.enum';
import { PremiumFrequency } from '../enums/premium-frequency.enum';
import { PremiumCalculationType } from '../enums/premium-calculation-type.enum';
import { LimitType } from '../enums/limit-type.enum';

export class AgeRangeResponse {
  @ApiProperty({ example: 0 })
  minAge: number;

  @ApiProperty({ example: 65 })
  maxAge: number;

  @ApiProperty({ example: 1000 })
  premium: number;
}

export class PremiumConfigResponse {
  @ApiProperty({ example: 1000 })
  baseAmount: number;

  @ApiProperty({ enum: PremiumFrequency, example: PremiumFrequency.MONTHLY })
  frequency: PremiumFrequency;

  @ApiProperty({ enum: PremiumCalculationType, example: PremiumCalculationType.FIXED })
  calculationType: PremiumCalculationType;

  @ApiProperty({ type: [AgeRangeResponse], required: false })
  ageRanges?: AgeRangeResponse[];
}

export class CopaymentResponse {
  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED'], example: 'PERCENTAGE' })
  type: 'PERCENTAGE' | 'FIXED';

  @ApiProperty({ example: 20 })
  value: number;
}

export class BenefitResponse {
  @ApiProperty({ example: 'General Consultation' })
  serviceType: string;

  @ApiProperty({ example: 5000 })
  coverageLimit: number;

  @ApiProperty({ enum: LimitType, example: LimitType.PER_VISIT })
  limitType: LimitType;

  @ApiProperty({ type: CopaymentResponse, required: false })
  copayment?: CopaymentResponse;
}

export class EligibilityRulesResponse {
  @ApiProperty({ example: 18 })
  minAge: number;

  @ApiProperty({ example: 65 })
  maxAge: number;

  @ApiProperty({ 
    enum: ['ACCEPT', 'REJECT', 'WAITING_PERIOD'],
    example: 'WAITING_PERIOD'
  })
  preExistingConditions: 'ACCEPT' | 'REJECT' | 'WAITING_PERIOD';

  @ApiProperty({ 
    type: [String],
    example: ['National ID', 'Proof of Address']
  })
  requiredDocuments: string[];
}

export class PolicyProductResponse {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'uuid-v4' })
  insuranceCompanyId: string;

  @ApiProperty({ example: 'GOLD-2025' })
  code: string;

  @ApiProperty({ example: 'Gold Health Plan 2025' })
  name: string;

  @ApiProperty({ example: 'Comprehensive health coverage for individuals and families' })
  description: string;

  @ApiProperty({ enum: PolicyType, example: PolicyType.INDIVIDUAL })
  type: PolicyType;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status: ProductStatus;

  @ApiProperty({ 
    type: [String],
    enum: CoverageType,
    example: [CoverageType.INPATIENT, CoverageType.OUTPATIENT]
  })
  coverageTypes: CoverageType[];

  @ApiProperty({ example: 30 })
  waitingPeriod: number;

  @ApiProperty({ required: false, example: 5 })
  maxMembers?: number;

  @ApiProperty({ type: PremiumConfigResponse })
  premium: PremiumConfigResponse;

  @ApiProperty({ type: [BenefitResponse] })
  benefits: BenefitResponse[];

  @ApiProperty({ type: EligibilityRulesResponse })
  eligibilityRules: EligibilityRulesResponse;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  validFrom: Date;

  @ApiProperty({ required: false, example: '2025-12-31T23:59:59.999Z' })
  validTo?: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
