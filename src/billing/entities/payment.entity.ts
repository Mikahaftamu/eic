import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { InsuranceCompany } from '../../insurance/entities/insurance-company.entity';
import { Member } from '../../members/entities/member.entity';
import { CorporateClient } from '../../corporate/entities/corporate-client.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
  MOBILE_MONEY = 'mobile_money',
  DIGITAL_WALLET = 'digital_wallet',
}

export enum PaymentType {
  PREMIUM = 'premium',
  CLAIM = 'claim',
  REFUND = 'refund',
  FEE = 'fee',
  OTHER = 'other',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  transactionId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  @JoinColumn()
  invoice: Invoice;

  @Column()
  invoiceId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payment_status_enum',
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.OTHER,
  })
  type: PaymentType;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ nullable: true })
  paymentReference: string;

  @Column({ nullable: true })
  paymentGateway: string;

  @Column({ nullable: true })
  gatewayTransactionId: string;

  @Column({ nullable: true })
  gatewayResponse: string;

  @Column({ nullable: true })
  notes: string;

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
  payerName: string;

  @Column({ nullable: true })
  payerEmail: string;

  @Column({ nullable: true })
  payerPhone: string;

  @Column({ nullable: true })
  cardLastFour: string;

  @Column({ nullable: true })
  cardType: string;

  @Column({ nullable: true })
  receiptSent: boolean;

  @Column({ nullable: true })
  receiptEmail: string;

  @Column({ type: 'timestamp', nullable: true })
  refundDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}