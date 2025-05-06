//src/corporate/entities/corporate-client.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PaymentFrequency } from '../types';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { CoveragePlan } from './coverage-plan.entity';

@Entity('corporate_client')
export class CorporateClient
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ nullable: true, type: 'varchar' })
  website: string | null;

  @Column('jsonb')
  contactPerson: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };

  @Column({ type: 'uuid' })
  insuranceCompanyId: string;

  @ManyToOne(() => InsuranceCompany)
  @JoinColumn({ name: 'insuranceCompanyId' })
  insuranceCompany: InsuranceCompany;

  @Column('jsonb')
  contractDetails: {
    startDate: Date;
    endDate: Date;
    contractNumber: string;
    paymentFrequency: PaymentFrequency;
    premiumPerEmployee: number;
    minimumEmployees: number;
    maximumEmployees: number;
  };

  @OneToMany(() => CoveragePlan, plan => plan.corporateClient)
  coveragePlans: CoveragePlan[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
