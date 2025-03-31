import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Claim } from './claim.entity';

export enum AppealStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ADDITIONAL_INFO_REQUIRED = 'ADDITIONAL_INFO_REQUIRED',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  DENIED = 'DENIED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

@Entity('claim_appeals')
export class ClaimAppeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  claimId: string;

  @ManyToOne(() => Claim, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claimId' })
  claim: Claim;

  @Column({ type: 'uuid' })
  submittedById: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  appealNumber: string;

  @Column({
    type: 'enum',
    enum: AppealStatus,
    default: AppealStatus.SUBMITTED,
  })
  status: AppealStatus;

  @Column({ type: 'date' })
  submissionDate: Date;

  @Column({ type: 'varchar', length: 1000 })
  reason: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  supportingInformation: string;

  @Column({ type: 'simple-array', nullable: true })
  documentReferences: string[];

  @Column({ type: 'uuid', nullable: true })
  reviewedById: string;

  @Column({ type: 'date', nullable: true })
  reviewDate: Date;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  decisionNotes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  appealedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'boolean', default: false })
  isEscalated: boolean;

  @Column({ type: 'int', default: 1 })
  appealLevel: number;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
