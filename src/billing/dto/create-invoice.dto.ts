import { IsNotEmpty, IsEnum, IsOptional, IsUUID, IsNumber, IsBoolean, IsString, IsDate, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, InvoiceType } from '../entities/invoice.entity';

export class CreateInvoiceItemDto {
  @ApiProperty({ description: 'Description of the invoice item' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Unit price of the item' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Quantity of the item', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Discount amount for the item' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax amount for the item' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ description: 'Start date for the billing period' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periodStart?: Date;

  @ApiPropertyOptional({ description: 'End date for the billing period' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  periodEnd?: Date;

  @ApiPropertyOptional({ description: 'Type of item (premium, deductible, etc.)' })
  @IsOptional()
  @IsString()
  itemType?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the item' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Type of invoice', enum: InvoiceType })
  @IsNotEmpty()
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @ApiProperty({ description: 'Issue date of the invoice' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @ApiProperty({ description: 'Due date of the invoice' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiPropertyOptional({ description: 'Additional notes for the invoice' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment terms for the invoice' })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({ description: 'Billing address for the invoice' })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiProperty({ description: 'Insurance company ID' })
  @IsNotEmpty()
  @IsUUID()
  insuranceCompanyId: string;

  @ApiPropertyOptional({ description: 'Member ID if the invoice is for a member' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Corporate client ID if the invoice is for a corporate client' })
  @IsOptional()
  @IsUUID()
  corporateClientId?: string;

  @ApiPropertyOptional({ description: 'Policy contract ID if the invoice is related to a policy' })
  @IsOptional()
  @IsUUID()
  policyContractId?: string;

  @ApiProperty({ description: 'Invoice items', type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  @ApiPropertyOptional({ description: 'Whether this is a recurring invoice' })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ description: 'Frequency of recurring invoice (monthly, quarterly, annually)' })
  @IsOptional()
  @IsString()
  recurringFrequency?: string;

  @ApiPropertyOptional({ description: 'Next date for recurring invoice' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextRecurringDate?: Date;
}