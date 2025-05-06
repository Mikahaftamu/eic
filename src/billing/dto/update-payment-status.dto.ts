import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../entities/payment.entity';

export class UpdatePaymentStatusDto {
  @ApiProperty({ 
    description: 'New payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED
  })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({ 
    description: 'Amount of the payment',
    minimum: 0.01
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ 
    description: 'Transaction ID from payment gateway'
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ 
    description: 'Payment method used',
    enum: PaymentMethod
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the status update'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Response from payment gateway'
  })
  @IsOptional()
  @IsString()
  gatewayResponse?: string;
} 