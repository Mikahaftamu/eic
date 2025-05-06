import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../entities/invoice.entity';

export class UpdateInvoiceStatusDto {
  @ApiProperty({ 
    description: 'New invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.PAID
  })
  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @ApiPropertyOptional({ 
    description: 'Amount paid for this invoice',
    minimum: 0.01
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amountPaid?: number;

  @ApiPropertyOptional({ 
    description: 'Date when the invoice was paid'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Due date for the invoice'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the status update'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Reason for the status change'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Payment reference number'
  })
  @IsOptional()
  @IsString()
  paymentReference?: string;
} 