import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CorporateClient } from './corporate-client.entity';

export enum ServiceType {
  GENERAL_MEDICAL = 'GENERAL_MEDICAL',
  SPECIALIST = 'SPECIALIST',
  DENTAL = 'DENTAL',
  VISION = 'VISION',
  MATERNITY = 'MATERNITY',
  EMERGENCY = 'EMERGENCY',
  PRESCRIPTION = 'PRESCRIPTION',
  LABORATORY = 'LABORATORY',
  IMAGING = 'IMAGING',
  PHYSIOTHERAPY = 'PHYSIOTHERAPY',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  CHRONIC_CARE = 'CHRONIC_CARE'
}

export enum CoverageType {
  FULL = 'FULL',           // 100% coverage
  PARTIAL = 'PARTIAL',     // Percentage coverage
  CAPPED = 'CAPPED',       // Up to a maximum amount
  EXCLUDED = 'EXCLUDED'    // Not covered
}

@Entity('coverage_plan')
export class CoveragePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  corporateClientId: string;

  @ManyToOne(() => CorporateClient, client => client.coveragePlans)
  @JoinColumn({ name: 'corporateClientId' })
  corporateClient: CorporateClient;

  @Column({ type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @Column({ type: 'enum', enum: CoverageType })
  coverageType: CoverageType;

  @Column('jsonb')
  coverageDetails: {
    percentage?: number;        // For PARTIAL coverage
    maxAmount?: number;         // For CAPPED coverage
    annualLimit?: number;       // Overall annual limit
    waitingPeriod?: number;     // Waiting period in days
    preAuthorizationRequired?: boolean;
    exclusions?: string[];
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
