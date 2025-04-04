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

export enum ClaimItemStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  ADJUSTED = 'ADJUSTED',
}

@Entity('claim_items')
export class ClaimItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  claimId: string;

  @ManyToOne(() => Claim, (claim) => claim.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'claimId' })
  claim: Claim;

  @Column({ type: 'varchar', length: 50 })
  serviceCode: string;

  @Column({ type: 'varchar', length: 255 })
  serviceDescription: string;

  @Column({ type: 'date' })
  serviceDate: Date;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  approvedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  memberResponsibility: number;

  @Column({
    type: 'enum',
    enum: ClaimItemStatus,
    default: ClaimItemStatus.PENDING,
  })
  status: ClaimItemStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  denialReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  modifiers: string;

  @Column({ type: 'boolean', default: false })
  isExcludedService: boolean;

  @Column({ type: 'boolean', default: false })
  isPreventiveCare: boolean;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
