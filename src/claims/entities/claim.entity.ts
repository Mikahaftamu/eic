import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { ClaimItem } from './claim-item.entity';
import { ClaimAdjustment } from './claim-adjustment.entity';

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  DENIED = 'DENIED',
  APPEALED = 'APPEALED',
  PAID = 'PAID',
  VOID = 'VOID',
}

export enum ClaimType {
  MEDICAL = 'MEDICAL',
  DENTAL = 'DENTAL',
  VISION = 'VISION',
  PHARMACY = 'PHARMACY',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
}

export enum SubmissionType {
  ELECTRONIC = 'ELECTRONIC',
  PAPER = 'PAPER',
  PORTAL = 'PORTAL',
  MOBILE = 'MOBILE',
}

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @Column({ type: 'uuid' })
  memberId: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ type: 'uuid' })
  providerId: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ type: 'varchar', length: 50, unique: true })
  claimNumber: string;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.SUBMITTED,
  })
  status: ClaimStatus;

  @Column({
    type: 'enum',
    enum: ClaimType,
    default: ClaimType.MEDICAL,
  })
  claimType: ClaimType;

  @Column({
    type: 'enum',
    enum: SubmissionType,
    default: SubmissionType.ELECTRONIC,
  })
  submissionType: SubmissionType;

  @Column({ type: 'date' })
  serviceStartDate: Date;

  @Column({ type: 'date', nullable: true })
  serviceEndDate: Date;

  @Column({ type: 'date' })
  submissionDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  memberResponsibility: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  denialReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  diagnosisCode: string;

  @Column('text', { array: true, nullable: true })
  additionalDiagnosisCodes: string[];

  @Column({ type: 'boolean', default: false })
  isEmergency: boolean;

  @Column({ type: 'boolean', default: false })
  preAuthorizationRequired: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preAuthorizationNumber: string;

  @Column({ type: 'boolean', default: false })
  isOutOfNetwork: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: any;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @OneToMany(() => ClaimItem, (claimItem) => claimItem.claim, {
    cascade: true,
  })
  items: ClaimItem[];

  @OneToMany(() => ClaimAdjustment, (adjustment) => adjustment.claim, {
    cascade: true,
  })
  adjustments: ClaimAdjustment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
