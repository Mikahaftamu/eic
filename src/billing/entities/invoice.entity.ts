import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { Member } from '../../members/entities/member.entity';
import { CorporateClient } from '../../corporate/entities/corporate-client.entity';
import { PolicyContract } from '../../policy/entities/policy-contract.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  UNPAID = 'unpaid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  VOID = 'void',
  REFUNDED = 'refunded'
}

export enum InvoiceType {
  PREMIUM = 'premium',
  CLAIM = 'claim',
  REFUND = 'refund',
  FEE = 'fee',
  OTHER = 'other',
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.PREMIUM,
  })
  type: InvoiceType;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountDue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  paymentTerms: string;

  @Column({ nullable: true })
  billingAddress: string;

  @Column({ nullable: true })
  paymentReference: string;

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

  @ManyToOne(() => PolicyContract, { nullable: true })
  @JoinColumn()
  policyContract: PolicyContract;

  @Column({ nullable: true })
  policyContractId: string;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ nullable: true })
  lastReminderDate: Date;

  @Column({ default: 0 })
  reminderCount: number;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurringFrequency: string;

  @Column({ nullable: true })
  nextRecurringDate: Date;

  @OneToMany(() => InvoiceItem, (item: InvoiceItem) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Payment, (payment: Payment) => payment.invoice)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return {
      ...this,
      items: this.items?.map((invoiceItem) => ({
        ...invoiceItem,
        invoice: undefined,
      })),
      payments: this.payments?.map((payment) => ({
        ...payment,
        invoice: undefined,
      })),
    };
  }
}