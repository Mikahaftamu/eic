import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateMedicalCategoryDto {
  @ApiProperty({ description: 'Code for the medical category', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Name of the medical category', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the medical category', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Parent category ID if this is a subcategory', required: false })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Whether this category is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
