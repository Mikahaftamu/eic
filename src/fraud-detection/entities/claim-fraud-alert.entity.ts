import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { FraudRule, RuleSeverity } from './fraud-rule.entity';

export enum AlertStatus {
  NEW = 'NEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CONFIRMED_FRAUD = 'CONFIRMED_FRAUD',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
  RESOLVED = 'RESOLVED'
}

export enum AlertResolution {
  NONE = 'NONE',
  CLAIM_DENIED = 'CLAIM_DENIED',
  CLAIM_ADJUSTED = 'CLAIM_ADJUSTED',
  PROVIDER_WARNED = 'PROVIDER_WARNED',
  PROVIDER_SUSPENDED = 'PROVIDER_SUSPENDED',
  MEMBER_WARNED = 'MEMBER_WARNED',
  MEMBER_TERMINATED = 'MEMBER_TERMINATED',
  REFERRED_TO_AUTHORITIES = 'REFERRED_TO_AUTHORITIES',
  OTHER = 'OTHER'
}

@Entity('claim_fraud_alerts')
export class ClaimFraudAlert {
  @ApiProperty({ description: 'Unique identifier for the fraud alert' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the claim that triggered the alert' })
  @Column({ type: 'uuid' })
  claimId: string;

  @ApiProperty({ description: 'ID of the rule that was triggered' })
  @Column({ type: 'uuid' })
  ruleId: string;

  @ManyToOne(() => FraudRule)
  @JoinColumn({ name: 'ruleId' })
  rule: FraudRule;

  @ApiProperty({ description: 'Severity of the alert', enum: RuleSeverity })
  @Column({ 
    type: 'enum', 
    enum: RuleSeverity
  })
  severity: RuleSeverity;

  @ApiProperty({ description: 'Status of the alert', enum: AlertStatus })
  @Column({ 
    type: 'enum', 
    enum: AlertStatus,
    default: AlertStatus.NEW
  })
  status: AlertStatus;

  @ApiProperty({ description: 'Resolution of the alert', enum: AlertResolution })
  @Column({ 
    type: 'enum', 
    enum: AlertResolution,
    default: AlertResolution.NONE
  })
  resolution: AlertResolution;

  @ApiProperty({ description: 'Detailed explanation of why the alert was triggered' })
  @Column({ type: 'text' })
  explanation: string;

  @ApiProperty({ description: 'Score or confidence level of the fraud detection (0-100)' })
  @Column({ type: 'int' })
  confidenceScore: number;

  @ApiProperty({ description: 'Additional data related to the alert as JSON' })
  @Column({ type: 'jsonb', nullable: true })
  additionalData: any;

  @ApiProperty({ description: 'ID of the user who reviewed the alert' })
  @Column({ type: 'uuid', nullable: true })
  reviewedByUserId: string;

  @ApiProperty({ description: 'Date the alert was reviewed' })
  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @ApiProperty({ description: 'Notes added by the reviewer' })
  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @ApiProperty({ description: 'Insurance company ID that owns this alert' })
  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @ApiProperty({ description: 'Date the alert was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date the alert was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
