import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Unique identifier for the payment' })
  id: string;

  @ApiProperty({ description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ description: 'Invoice ID this payment is for' })
  invoiceId: string;

  @ApiProperty({ description: 'Invoice number associated with this payment' })
  invoiceNumber?: string;

  @ApiProperty({ description: 'Amount paid' })
  amount: number;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  method: PaymentMethod;

  @ApiProperty({ description: 'Date of payment' })
  paymentDate: Date;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Payment gateway used' })
  paymentGateway?: string;

  @ApiPropertyOptional({ description: 'Transaction ID from payment gateway' })
  gatewayTransactionId?: string;

  @ApiPropertyOptional({ description: 'Response from payment gateway' })
  gatewayResponse?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string;

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

  @ApiPropertyOptional({ description: 'Name of payer' })
  payerName?: string;

  @ApiPropertyOptional({ description: 'Email of payer' })
  payerEmail?: string;

  @ApiPropertyOptional({ description: 'Phone number of payer' })
  payerPhone?: string;

  @ApiPropertyOptional({ description: 'Last four digits of card used' })
  cardLastFour?: string;

  @ApiPropertyOptional({ description: 'Type of card used' })
  cardType?: string;

  @ApiPropertyOptional({ description: 'Whether receipt was sent' })
  receiptSent?: boolean;

  @ApiPropertyOptional({ description: 'Email receipt was sent to' })
  receiptEmail?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}