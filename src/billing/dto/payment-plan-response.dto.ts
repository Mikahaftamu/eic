import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentPlanStatus, PaymentFrequency } from '../entities/payment-plan.entity';

export class PaymentPlanResponseDto {
  @ApiProperty({ description: 'Unique identifier for the payment plan' })
  id: string;

  @ApiProperty({ description: 'Plan number' })
  planNumber: string;

  @ApiProperty({ description: 'Invoice ID this payment plan is for' })
  invoiceId: string;

  @ApiProperty({ description: 'Invoice number associated with this payment plan' })
  invoiceNumber?: string;

  @ApiProperty({ description: 'Status of the payment plan', enum: PaymentPlanStatus })
  status: PaymentPlanStatus;

  @ApiProperty({ description: 'Payment frequency', enum: PaymentFrequency })
  frequency: PaymentFrequency;

  @ApiProperty({ description: 'Total amount to be paid in the plan' })
  totalAmount: number;

  @ApiProperty({ description: 'Amount already paid' })
  amountPaid: number;

  @ApiProperty({ description: 'Amount per installment' })
  installmentAmount: number;

  @ApiProperty({ description: 'Total number of installments' })
  totalInstallments: number;

  @ApiProperty({ description: 'Number of installments paid' })
  installmentsPaid: number;

  @ApiProperty({ description: 'Start date of the payment plan' })
  startDate: Date;

  @ApiProperty({ description: 'End date of the payment plan' })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Next due date for payment' })
  nextDueDate?: Date;

  @ApiProperty({ description: 'Grace period in days before late fee' })
  gracePeriodDays: number;

  @ApiProperty({ description: 'Whether auto-debit is enabled' })
  autoDebit: boolean;

  @ApiPropertyOptional({ description: 'Payment method used for auto-debit' })
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment details for auto-debit' })
  paymentDetails?: string;

  @ApiProperty({ description: 'Insurance company ID' })
  insuranceCompanyId: string;

  @ApiProperty({ description: 'Insurance company name' })
  insuranceCompanyName?: string;

  @ApiPropertyOptional({ description: 'Member ID if applicable' })
  memberId?: string;

  @ApiProperty({ description: 'Member name' })
  memberName?: string;

  @ApiPropertyOptional({ description: 'Corporate client ID if applicable' })
  corporateClientId?: string;

  @ApiProperty({ description: 'Corporate client name' })
  corporateClientName?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string;

  @ApiProperty({ description: 'Whether payment reminders are enabled' })
  reminderEnabled: boolean;

  @ApiProperty({ description: 'Days before due date to send reminder' })
  reminderDaysBefore: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}