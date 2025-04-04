import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, MaxLength, Min } from 'class-validator';
import { MedicalItemType } from '../entities/medical-item.entity';

export class CreateMedicalItemDto {
  @ApiProperty({ description: 'Code for the medical item (e.g., NDC code for drugs)' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Name of the medical item' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Description of the medical item', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type of medical item', enum: MedicalItemType })
  @IsEnum(MedicalItemType)
  type: MedicalItemType;

  @ApiProperty({ description: 'Category ID this item belongs to' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Unit of measurement (e.g., tablet, ml, etc.)' })
  @IsString()
  @MaxLength(50)
  unit: string;

  @ApiProperty({ description: 'Base price of the item' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Whether this item requires prior authorization', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  requiresPriorAuth?: boolean;

  @ApiProperty({ description: 'Whether this item is active in the catalog', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Insurance company ID that owns this item' })
  @IsUUID()
  insuranceCompanyId: string;

  @ApiProperty({ description: 'Generic alternative codes, if applicable', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genericAlternatives?: string[];

  @ApiProperty({ description: 'Brand name, if applicable', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  brandName?: string;

  @ApiProperty({ description: 'Manufacturer name, if applicable', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ description: 'Additional properties as JSON', required: false })
  @IsOptional()
  additionalProperties?: any;
}
