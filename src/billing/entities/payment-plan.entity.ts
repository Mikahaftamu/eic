import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { Member } from '../../members/entities/member.entity';
import { CorporateClient } from '../../corporate/entities/corporate-client.entity';

export enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

export enum PaymentFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

@Entity()
export class PaymentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  planNumber: string;

  @ManyToOne(() => Invoice)
  @JoinColumn()
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @Column({
    type: 'enum',
    enum: PaymentPlanStatus,
    default: PaymentPlanStatus.ACTIVE,
  })
  status: PaymentPlanStatus;

  @Column({
    type: 'enum',
    enum: PaymentFrequency,
    default: PaymentFrequency.MONTHLY,
  })
  frequency: PaymentFrequency;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({ type: 'int' })
  totalInstallments: number;

  @Column({ type: 'int', default: 0 })
  installmentsPaid: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  nextDueDate: Date;

  @Column({ type: 'int', default: 0 })
  gracePeriodDays: number;

  @Column({ default: false })
  autoDebit: boolean;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentDetails: string;

  @ManyToOne(() => InsuranceCompany)
  @JoinColumn()
  insuranceCompany: InsuranceCompany;

  @Column()
  insuranceCompanyId: string;

  @ManyToOne(() => Member, { nullable: true })
  @JoinColumn()
  member: Member;

  @Column({ nullable: true })
  memberId: string;

  @ManyToOne(() => CorporateClient, { nullable: true })
  @JoinColumn()
  corporateClient: CorporateClient;

  @Column({ nullable: true })
  corporateClientId: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  reminderEnabled: boolean;

  @Column({ type: 'int', default: 3 })
  reminderDaysBefore: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}