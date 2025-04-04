import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateMedicalCategoryDto {
  @ApiProperty({ description: 'Code for the medical category' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Name of the medical category' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description of the medical category', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Parent category ID if this is a subcategory', required: false })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Whether this category is active', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Insurance company ID that owns this category' })
  @IsUUID()
  insuranceCompanyId: string;
}
