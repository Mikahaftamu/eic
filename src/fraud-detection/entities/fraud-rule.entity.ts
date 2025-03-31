import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum RuleType {
  FREQUENCY = 'FREQUENCY',
  COMPATIBILITY = 'COMPATIBILITY',
  UPCODING = 'UPCODING',
  PHANTOM_BILLING = 'PHANTOM_BILLING',
  DUPLICATE = 'DUPLICATE',
  UNBUNDLING = 'UNBUNDLING',
  MEDICAL_NECESSITY = 'MEDICAL_NECESSITY',
  PROVIDER_SPECIALTY = 'PROVIDER_SPECIALTY',
  MEMBER_ELIGIBILITY = 'MEMBER_ELIGIBILITY',
  GEOGRAPHIC = 'GEOGRAPHIC',
  CUSTOM = 'CUSTOM'
}

export enum RuleSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TESTING = 'TESTING'
}

@Entity('fraud_rules')
export class FraudRule {
  @ApiProperty({ description: 'Unique identifier for the fraud rule' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Code for the fraud rule' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({ description: 'Name of the fraud rule' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Description of the fraud rule' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Type of rule', enum: RuleType })
  @Column({ 
    type: 'enum', 
    enum: RuleType
  })
  type: RuleType;

  @ApiProperty({ description: 'Severity of the rule', enum: RuleSeverity })
  @Column({ 
    type: 'enum', 
    enum: RuleSeverity,
    default: RuleSeverity.MEDIUM
  })
  severity: RuleSeverity;

  @ApiProperty({ description: 'Status of the rule', enum: RuleStatus })
  @Column({ 
    type: 'enum', 
    enum: RuleStatus,
    default: RuleStatus.ACTIVE
  })
  status: RuleStatus;

  @ApiProperty({ description: 'Rule configuration as JSON' })
  @Column({ type: 'jsonb' })
  configuration: any;

  @ApiProperty({ description: 'Insurance company ID that owns this rule' })
  @Column({ type: 'uuid', nullable: true })
  insuranceCompanyId: string;

  @ApiProperty({ description: 'Whether this is a system-wide rule' })
  @Column({ type: 'boolean', default: false })
  isSystemWide: boolean;

  @ApiProperty({ description: 'Date the rule was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date the rule was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
