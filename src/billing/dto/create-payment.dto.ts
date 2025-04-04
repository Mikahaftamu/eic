import { IsNotEmpty, IsEnum, IsOptional, IsUUID, IsNumber, IsString, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Invoice ID this payment is for' })
  @IsNotEmpty()
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ description: 'Amount to be paid' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ description: 'Payment type', enum: PaymentType })
  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ description: 'Date of payment' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiPropertyOptional({ description: 'Payment reference number' })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Payment gateway used' })
  @IsOptional()
  @IsString()
  paymentGateway?: string;

  @ApiPropertyOptional({ description: 'Transaction ID from payment gateway' })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @ApiPropertyOptional({ description: 'Response from payment gateway' })
  @IsOptional()
  @IsString()
  gatewayResponse?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Insurance company ID' })
  @IsNotEmpty()
  @IsUUID()
  insuranceCompanyId: string;

  @ApiPropertyOptional({ description: 'Member ID if applicable' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Corporate client ID if applicable' })
  @IsOptional()
  @IsUUID()
  corporateClientId?: string;

  @ApiPropertyOptional({ description: 'Name of payer' })
  @IsOptional()
  @IsString()
  payerName?: string;

  @ApiPropertyOptional({ description: 'Email of payer' })
  @IsOptional()
  @IsString()
  payerEmail?: string;

  @ApiPropertyOptional({ description: 'Phone number of payer' })
  @IsOptional()
  @IsString()
  payerPhone?: string;

  @ApiPropertyOptional({ description: 'Last four digits of card used' })
  @IsOptional()
  @IsString()
  cardLastFour?: string;

  @ApiPropertyOptional({ description: 'Type of card used' })
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiPropertyOptional({ description: 'Whether to send receipt' })
  @IsOptional()
  @IsString()
  receiptEmail?: string;
}