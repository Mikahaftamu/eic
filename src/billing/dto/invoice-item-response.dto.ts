import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceItemResponseDto {
  @ApiProperty({ description: 'Unique identifier for the invoice item' })
  id: string;

  @ApiProperty({ description: 'Invoice ID this item belongs to' })
  invoiceId: string;

  @ApiProperty({ description: 'Description of the item' })
  description: string;

  @ApiProperty({ description: 'Unit price of the item' })
  unitPrice: number;

  @ApiProperty({ description: 'Quantity of the item' })
  quantity: number;

  @ApiProperty({ description: 'Discount amount for the item' })
  discount: number;

  @ApiProperty({ description: 'Tax amount for the item' })
  tax: number;

  @ApiProperty({ description: 'Total amount for the item' })
  total: number;

  @ApiPropertyOptional({ description: 'Start date for the billing period' })
  periodStart?: Date;

  @ApiPropertyOptional({ description: 'End date for the billing period' })
  periodEnd?: Date;

  @ApiPropertyOptional({ description: 'Type of item (premium, deductible, etc.)' })
  itemType?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the item' })
  notes?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}