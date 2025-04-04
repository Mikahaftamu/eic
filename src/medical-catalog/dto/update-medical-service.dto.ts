import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, MaxLength, Min, IsInt } from 'class-validator';
import { ServiceType } from '../entities/medical-service.entity';

export class UpdateMedicalServiceDto {
  @ApiProperty({ description: 'Code for the medical service', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Coding system (e.g., CPT, HCPCS, custom)', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  codingSystem?: string;

  @ApiProperty({ description: 'Name of the medical service', required: false })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the medical service', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type of service', enum: ServiceType, required: false })
  @IsEnum(ServiceType)
  @IsOptional()
  type?: ServiceType;

  @ApiProperty({ description: 'Category ID this service belongs to', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Base price of the service', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiProperty({ description: 'Standard duration of the service in minutes', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  standardDuration?: number;

  @ApiProperty({ description: 'Whether this service requires prior authorization', required: false })
  @IsBoolean()
  @IsOptional()
  requiresPriorAuth?: boolean;

  @ApiProperty({ description: 'Whether this service is active in the catalog', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Applicable diagnosis codes (ICD-10) that are valid for this service', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applicableDiagnosisCodes?: string[];

  @ApiProperty({ description: 'Applicable place of service codes', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  placeOfServiceCodes?: string[];

  @ApiProperty({ description: 'Valid modifiers for this service code', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  validModifiers?: string[];

  @ApiProperty({ description: 'Additional properties as JSON', required: false })
  @IsOptional()
  additionalProperties?: any;
}
