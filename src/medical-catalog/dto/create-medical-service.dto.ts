import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, MaxLength, Min, IsInt } from 'class-validator';
import { ServiceType } from '../entities/medical-service.entity';

export class CreateMedicalServiceDto {
  @ApiProperty({ description: 'Code for the medical service (e.g., CPT, HCPCS)' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Coding system (e.g., CPT, HCPCS, custom)' })
  @IsString()
  @MaxLength(50)
  codingSystem: string;

  @ApiProperty({ description: 'Name of the medical service' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Description of the medical service', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Type of service', enum: ServiceType })
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({ description: 'Category ID this service belongs to' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Base price of the service' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Standard duration of the service in minutes', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  standardDuration?: number;

  @ApiProperty({ description: 'Whether this service requires prior authorization', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  requiresPriorAuth?: boolean;

  @ApiProperty({ description: 'Whether this service is active in the catalog', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Insurance company ID that owns this service' })
  @IsUUID()
  insuranceCompanyId: string;

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
