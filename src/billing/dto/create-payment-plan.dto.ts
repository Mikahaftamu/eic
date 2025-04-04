import { IsNotEmpty, IsEnum, IsOptional, IsUUID, IsNumber, IsBoolean, IsString, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentFrequency } from '../entities/payment-plan.entity';

export class CreatePaymentPlanDto {
  @ApiProperty({ description: 'Invoice ID this payment plan is for' })
  @IsNotEmpty()
  @IsUUID()
  invoiceId: string;

  @ApiProperty({ description: 'Payment frequency', enum: PaymentFrequency })
  @IsNotEmpty()
  @IsEnum(PaymentFrequency)
  frequency: PaymentFrequency;

  @ApiProperty({ description: 'Total amount to be paid in the plan' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @ApiProperty({ description: 'Amount per installment' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  installmentAmount: number;

  @ApiProperty({ description: 'Total number of installments' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  totalInstallments: number;

  @ApiProperty({ description: 'Start date of the payment plan' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'End date of the payment plan' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({ description: 'Next due date for payment' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextDueDate?: Date;

  @ApiPropertyOptional({ description: 'Grace period in days before late fee' })
  @IsOptional()
  @IsInt()
  @Min(0)
  gracePeriodDays?: number;

  @ApiPropertyOptional({ description: 'Whether to auto-debit payments' })
  @IsOptional()
  @IsBoolean()
  autoDebit?: boolean;

  @ApiPropertyOptional({ description: 'Payment method to use for auto-debit' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment details for auto-debit' })
  @IsOptional()
  @IsString()
  paymentDetails?: string;

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

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether to enable payment reminders' })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Days before due date to send reminder' })
  @IsOptional()
  @IsInt()
  @Min(1)
  reminderDaysBefore?: number;
}