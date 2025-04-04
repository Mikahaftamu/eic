import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, InvoiceType } from '../entities/invoice.entity';
import { InvoiceItemResponseDto } from './invoice-item-response.dto';
import { PaymentResponseDto } from './payment-response.dto';

export class InvoiceResponseDto {
  @ApiProperty({ description: 'Unique identifier for the invoice' })
  id: string;

  @ApiProperty({ description: 'Invoice number' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Current status of the invoice', enum: InvoiceStatus })
  status: InvoiceStatus;

  @ApiProperty({ description: 'Type of invoice', enum: InvoiceType })
  type: InvoiceType;

  @ApiProperty({ description: 'Date the invoice was issued' })
  issueDate: Date;

  @ApiProperty({ description: 'Date the invoice is due' })
  dueDate: Date;

  @ApiPropertyOptional({ description: 'Date the invoice was paid' })
  paidDate?: Date;

  @ApiProperty({ description: 'Subtotal amount before tax and discounts' })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount' })
  tax: number;

  @ApiProperty({ description: 'Discount amount' })
  discount: number;

  @ApiProperty({ description: 'Total amount including tax and discounts' })
  total: number;

  @ApiProperty({ description: 'Amount already paid' })
  amountPaid: number;

  @ApiProperty({ description: 'Amount still due' })
  amountDue: number;

  @ApiPropertyOptional({ description: 'Additional notes about the invoice' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment terms for the invoice' })
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Billing address' })
  billingAddress?: string;

  @ApiProperty({ description: 'Insurance company ID' })
  insuranceCompanyId: string;

  @ApiPropertyOptional({ description: 'Insurance company name' })
  insuranceCompanyName?: string;

  @ApiPropertyOptional({ description: 'Member ID if applicable' })
  memberId?: string;

  @ApiPropertyOptional({ description: 'Member name if applicable' })
  memberName?: string;

  @ApiPropertyOptional({ description: 'Corporate client ID if applicable' })
  corporateClientId?: string;

  @ApiPropertyOptional({ description: 'Corporate client name if applicable' })
  corporateClientName?: string;

  @ApiPropertyOptional({ description: 'Policy contract ID if applicable' })
  policyContractId?: string;

  @ApiPropertyOptional({ description: 'Policy number if applicable' })
  policyNumber?: string;

  @ApiProperty({ description: 'Whether payment reminder has been sent' })
  reminderSent: boolean;

  @ApiPropertyOptional({ description: 'Date of last payment reminder' })
  lastReminderDate?: Date;

  @ApiProperty({ description: 'Number of reminders sent' })
  reminderCount: number;

  @ApiProperty({ description: 'Whether this is a recurring invoice' })
  isRecurring: boolean;

  @ApiPropertyOptional({ description: 'Frequency of recurring invoice' })
  recurringFrequency?: string;

  @ApiPropertyOptional({ description: 'Next date for recurring invoice' })
  nextRecurringDate?: Date;

  @ApiPropertyOptional({ description: 'Invoice items', type: [InvoiceItemResponseDto] })
  items?: InvoiceItemResponseDto[];

  @ApiPropertyOptional({ description: 'Payments made for this invoice', type: [PaymentResponseDto] })
  payments?: PaymentResponseDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}