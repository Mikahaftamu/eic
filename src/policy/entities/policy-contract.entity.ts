import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus } from '../enums/contract-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { CancellationReason } from '../enums/cancellation-reason.enum';
import { PolicyProduct } from './policy-product.entity';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { Member } from '../../members/entities/member.entity';

@Entity('policy_contracts')
export class PolicyContract
{
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Policy number' })
  @Column({ unique: true })
  policyNumber: string;

  @ApiProperty({ description: 'Contract number' })
  @Column({ type: 'varchar', unique: true })
  contractNumber: string;

  @ApiProperty({ description: 'Insurance company ID' })
  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @ManyToOne(() => InsuranceCompany)
  @JoinColumn({ name: 'insuranceCompanyId' })
  insuranceCompany: InsuranceCompany;

  @ApiProperty({ description: 'Policy product ID' })
  @Column({ type: 'uuid' })
  policyProductId: string;

  @ManyToOne(() => PolicyProduct)
  @JoinColumn({ name: 'policyProductId' })
  policyProduct: PolicyProduct;

  @ApiProperty({ description: 'Primary member ID' })
  @Column({ type: 'uuid' })
  primaryMemberId: string;

  // @ManyToOne(() => Member, (member) => member.policyContract)
  // @JoinColumn({ name: 'primaryMemberId' })
  // primaryMember: Member;

  @ManyToOne(() => Member, (member) => member.policies)
  @JoinColumn({ name: 'primaryMemberId' })
  member: Member;

  @ApiProperty({ description: 'Dependent member IDs' })
  @Column({ type: 'uuid', array: true, default: '{}' })
  dependentMemberIds: string[];

  // @OneToMany(() => Member, member => member.policyContract)
  // dependentMembers: Member[];

  @ApiProperty({ enum: ContractStatus })
  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT
  })
  status: ContractStatus;

  @ApiProperty({ enum: PaymentStatus })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Contract effective date' })
  @Column({ type: 'timestamp' })
  effectiveDate: Date;

  @ApiProperty({ description: 'Contract end date' })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiProperty({ description: 'Next premium due date' })
  @Column({ type: 'timestamp' })
  nextPremiumDueDate: Date;

  @ApiProperty({ description: 'Premium amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premiumAmount: number;

  @ApiProperty({ description: 'Total coverage amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCoverageAmount: number;

  @ApiProperty({ description: 'Waiting period end date' })
  @Column({ type: 'timestamp', nullable: true })
  waitingPeriodEndDate?: Date;

  @ApiProperty({ description: 'Grace period end date' })
  @Column({ type: 'timestamp', nullable: true })
  gracePeriodEndDate?: Date;

  @ApiProperty({ enum: CancellationReason })
  @Column({
    type: 'enum',
    enum: CancellationReason,
    nullable: true
  })
  cancellationReason?: CancellationReason;

  @ApiProperty({ description: 'Cancellation date' })
  @Column({ type: 'timestamp', nullable: true })
  cancellationDate?: Date;

  @ApiProperty({ description: 'Previous contract ID (for renewals)' })
  @Column({ type: 'uuid', nullable: true })
  previousContractId?: string;

  @ManyToOne(() => PolicyContract)
  @JoinColumn({ name: 'previousContractId' })
  previousContract?: PolicyContract;

  @ApiProperty({ description: 'Special terms and conditions' })
  @Column({ type: 'jsonb', nullable: true })
  specialTerms?: {
    exclusions: string[];
    loadings: Array<{
      reason: string;
      percentage: number;
    }>;
    waitingPeriods: Array<{
      condition: string;
      periodInDays: number;
    }>;
  };

  @ApiProperty({ description: 'Payment history' })
  @Column({ type: 'jsonb', default: '[]' })
  paymentHistory: Array<{
    date: Date;
    amount: number;
    status: PaymentStatus;
    transactionId: string;
    method: string;
  }>;

  @ApiProperty({ description: 'Contract document URLs' })
  @Column({ type: 'jsonb', default: '[]' })
  documents: Array<{
    type: 'POLICY' | 'ENDORSEMENT' | 'RENEWAL' | 'CANCELLATION';
    url: string;
    uploadedAt: Date;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
