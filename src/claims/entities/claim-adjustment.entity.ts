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

export enum AdjustmentType {
  DEDUCTIBLE = 'DEDUCTIBLE',
  COPAY = 'COPAY',
  COINSURANCE = 'COINSURANCE',
  NON_COVERED = 'NON_COVERED',
  OUT_OF_NETWORK = 'OUT_OF_NETWORK',
  DUPLICATE = 'DUPLICATE',
  BUNDLING = 'BUNDLING',
  COORDINATION_OF_BENEFITS = 'COORDINATION_OF_BENEFITS',
  MAXIMUM_ALLOWABLE = 'MAXIMUM_ALLOWABLE',
  POLICY_LIMITATION = 'POLICY_LIMITATION',
  OTHER = 'OTHER',
}

@Entity('claim_adjustments')
export class ClaimAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  claimId: string;

  @ManyToOne(() => Claim, (claim) => claim.adjustments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'claimId' })
  claim: Claim;

  @Column({ type: 'uuid', nullable: true })
  claimItemId: string;

  @Column({
    type: 'enum',
    enum: AdjustmentType,
  })
  adjustmentType: AdjustmentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  appliedById: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ type: 'date' })
  adjustmentDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
