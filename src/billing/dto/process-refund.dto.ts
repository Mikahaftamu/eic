import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class ProcessRefundDto {
  @ApiProperty({ 
    description: 'Amount to be refunded',
    minimum: 0.01
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ 
    description: 'Reason for the refund'
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ 
    description: 'Transaction ID for the refund'
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ 
    description: 'Payment method for the refund',
    enum: PaymentMethod
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the refund'
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