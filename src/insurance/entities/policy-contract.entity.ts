import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { InsuranceCompany } from './insurance-company.entity';
import { Member } from '../../members/entities/member.entity';

export enum PolicyStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
  RENEWED = 'RENEWED',
}

@Entity('policy_contracts')
export class PolicyContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @ManyToOne(() => InsuranceCompany)
  @JoinColumn({ name: 'insuranceCompanyId' })
  insuranceCompany: InsuranceCompany;

  @Column({ type: 'uuid' })
  memberId: string;

  @ManyToOne(() => Member, (member) => member.policies)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ type: 'varchar', length: 50 })
  policyNumber: string;

  @Column({ type: 'varchar', length: 100 })
  policyType: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: PolicyStatus,
    default: PolicyStatus.PENDING,
  })
  status: PolicyStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premium: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deductible: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  coinsurance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  outOfPocketMax: number;

  @Column({ type: 'jsonb', nullable: true })
  coverageDetails: any;

  @Column({ type: 'jsonb', nullable: true })
  benefitLimits: any;

  @Column({ type: 'boolean', default: false })
  isAutoRenew: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
