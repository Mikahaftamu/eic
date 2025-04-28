import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PolicyType } from '../enums/policy-type.enum';
import { ProductStatus } from '../enums/product-status.enum';
import { CoverageType } from '../enums/coverage-type.enum';
import { PremiumFrequency } from '../enums/premium-frequency.enum';
import { PremiumCalculationType } from '../enums/premium-calculation-type.enum';
import { LimitType } from '../enums/limit-type.enum';
import { ServiceType } from '../enums/service-type.enum';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { Member } from '../../members/entities/member.entity';

class Benefit
{
  @ApiProperty({
    enum: ServiceType,
    description: 'Type of medical service covered',
    example: ServiceType.GENERAL_CONSULTATION
  })
  serviceType: ServiceType;

  @ApiProperty({
    description: 'Maximum amount covered for this service',
    example: 5000
  })
  coverageLimit: number;

  @ApiProperty({
    enum: LimitType,
    description: 'How the coverage limit is applied (per visit, per year, etc)',
    example: LimitType.PER_VISIT
  })
  limitType: LimitType;

  @ApiProperty({
    description: 'Cost-sharing arrangement for this service',
    example: { type: 'PERCENTAGE', value: 20 }
  })
  copayment?: {
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
  };
}

@Entity('policy_products')
export class PolicyProduct
{
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Insurance company ID' })
  @Column({ type: 'varchar' })
  insuranceCompanyId: string;

  @ManyToOne(() => InsuranceCompany)
  @JoinColumn({ name: 'insuranceCompanyId' })
  insuranceCompany: InsuranceCompany;

  @ApiProperty({ description: 'Product code' })
  @Column({ type: 'varchar', unique: true })
  code: string;

  @ApiProperty({ description: 'Product name' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ description: 'Product description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: PolicyType })
  @Column({ type: 'enum', enum: PolicyType })
  type: PolicyType;

  @ApiProperty({ enum: ProductStatus })
  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @ApiProperty({ description: 'Coverage types' })
  @Column({ type: 'enum', enum: CoverageType, array: true })
  coverageTypes: CoverageType[];

  @ApiProperty({ description: 'Waiting period in days' })
  @Column({ type: 'integer', default: 0 })
  waitingPeriod: number;

  @ApiProperty({ description: 'Maximum number of members (for family/group policies)' })
  @Column({ type: 'integer', nullable: true })
  maxMembers?: number;

  @ApiProperty({ description: 'Premium configuration' })
  @Column({ type: 'jsonb' })
  premium: {
    baseAmount: number;
    frequency: PremiumFrequency;
    calculationType: PremiumCalculationType;
    ageRanges?: Array<{
      minAge: number;
      maxAge: number;
      premium: number;
    }>;
  };

  @ApiProperty({
    description: 'Benefits configuration',
    type: [Benefit],
    example: [
      {
        serviceType: ServiceType.GENERAL_CONSULTATION,
        coverageLimit: 1000,
        limitType: LimitType.PER_VISIT,
        copayment: { type: 'PERCENTAGE', value: 20 }
      },
      {
        serviceType: ServiceType.HOSPITALIZATION,
        coverageLimit: 100000,
        limitType: LimitType.PER_YEAR,
        copayment: { type: 'FIXED', value: 1000 }
      }
    ]
  })
  @Column({ type: 'jsonb' })
  benefits: Benefit[];

  @ApiProperty({ description: 'Eligibility rules' })
  @Column({ type: 'jsonb' })
  eligibilityRules: {
    minAge: number;
    maxAge: number;
    preExistingConditions: 'ACCEPT' | 'REJECT' | 'WAITING_PERIOD';
    requiredDocuments: string[];
  };

  @ApiProperty({ description: 'Valid from date' })
  @Column({ type: 'timestamp' })
  validFrom: Date;

  @ApiProperty({ description: 'Valid to date' })
  @Column({ type: 'timestamp', nullable: true })
  validTo?: Date;

  @ApiProperty({ description: 'Base premium amount' })
  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true, default: 0 })
  basePremium: number;

  @ApiProperty({ description: 'Coverage type' })
  @Column({ type: 'varchar', length: 50, nullable: true, default: 'BASIC' })
  coverageType: string;

  @ApiProperty({ description: 'Premium modifiers' })
  @Column({
    type: 'jsonb', nullable: true, default: () => `'${JSON.stringify({
      ageFactors: [
        { minAge: 0, maxAge: 17, factor: 0.5 },
        { minAge: 18, maxAge: 29, factor: 0.8 },
        { minAge: 30, maxAge: 39, factor: 1.0 },
        { minAge: 40, maxAge: 49, factor: 1.2 },
        { minAge: 50, maxAge: 59, factor: 1.5 },
        { minAge: 60, maxAge: 69, factor: 2.0 },
        { minAge: 70, maxAge: 999, factor: 2.5 },
      ],
      familySizeFactors: [
        { size: 1, factor: 1.0 },
        { size: 2, factor: 1.8 },
        { size: 3, factor: 2.4 },
        { size: 4, factor: 2.8 },
        { size: 5, factor: 3.0 },
        { size: 6, factor: 3.2 },
      ],
      loadingFactors: [],
      discountFactors: [],
    })}'`
  })
  premiumModifiers: Record<string, any>;

  @OneToMany(() => Member, (member) => member.policyProduct)
  members: Member[];

  // @ManyToOne(() => Member, (member) => member.policies)
  // member: Member;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
