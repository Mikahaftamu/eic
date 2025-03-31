import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min, Max, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PlanType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  CUSTOM = 'CUSTOM',
}

export enum CoverageLevel {
  INDIVIDUAL = 'INDIVIDUAL',
  FAMILY = 'FAMILY',
  EMPLOYEE_PLUS_SPOUSE = 'EMPLOYEE_PLUS_SPOUSE',
  EMPLOYEE_PLUS_CHILDREN = 'EMPLOYEE_PLUS_CHILDREN',
}

export class DeductibleDto {
  @ApiProperty({ description: 'Individual deductible amount', example: 1000 })
  @IsNumber()
  @Min(0)
  individual: number;

  @ApiProperty({ description: 'Family deductible amount', example: 3000 })
  @IsNumber()
  @Min(0)
  family: number;
}

export class CoinsuranceDto {
  @ApiProperty({ description: 'In-network coinsurance percentage', example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  inNetwork: number;

  @ApiProperty({ description: 'Out-of-network coinsurance percentage', example: 40 })
  @IsNumber()
  @Min(0)
  @Max(100)
  outOfNetwork: number;
}

export class CopayDto {
  @ApiProperty({ description: 'Primary care visit copay', example: 25 })
  @IsNumber()
  @Min(0)
  primaryCare: number;

  @ApiProperty({ description: 'Specialist visit copay', example: 50 })
  @IsNumber()
  @Min(0)
  specialist: number;

  @ApiProperty({ description: 'Emergency room visit copay', example: 250 })
  @IsNumber()
  @Min(0)
  emergencyRoom: number;

  @ApiProperty({ description: 'Urgent care visit copay', example: 75 })
  @IsNumber()
  @Min(0)
  urgentCare: number;
}

export class OutOfPocketMaxDto {
  @ApiProperty({ description: 'Individual out-of-pocket maximum', example: 6000 })
  @IsNumber()
  @Min(0)
  individual: number;

  @ApiProperty({ description: 'Family out-of-pocket maximum', example: 12000 })
  @IsNumber()
  @Min(0)
  family: number;
}

export class BenefitsDto {
  @ApiProperty({ 
    description: 'Type of health plan', 
    enum: PlanType,
    example: PlanType.STANDARD
  })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiProperty({ 
    description: 'Coverage level', 
    enum: CoverageLevel,
    example: CoverageLevel.FAMILY
  })
  @IsEnum(CoverageLevel)
  coverageLevel: CoverageLevel;

  @ApiProperty({ description: 'Plan name or identifier', example: 'Gold 1000' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({ description: 'Deductible information' })
  @IsObject()
  @ValidateNested()
  @Type(() => DeductibleDto)
  deductible: DeductibleDto;

  @ApiProperty({ description: 'Coinsurance information' })
  @IsObject()
  @ValidateNested()
  @Type(() => CoinsuranceDto)
  coinsurance: CoinsuranceDto;

  @ApiProperty({ description: 'Copay information' })
  @IsObject()
  @ValidateNested()
  @Type(() => CopayDto)
  copay: CopayDto;

  @ApiProperty({ description: 'Out-of-pocket maximum information' })
  @IsObject()
  @ValidateNested()
  @Type(() => OutOfPocketMaxDto)
  outOfPocketMax: OutOfPocketMaxDto;

  @ApiProperty({ 
    description: 'Whether prescription drugs are covered', 
    example: true 
  })
  @IsBoolean()
  prescriptionDrugCoverage: boolean;

  @ApiProperty({ 
    description: 'Whether dental services are covered', 
    example: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  dentalCoverage?: boolean;

  @ApiProperty({ 
    description: 'Whether vision services are covered', 
    example: false,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  visionCoverage?: boolean;

  @ApiProperty({ 
    description: 'Whether mental health services are covered', 
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  mentalHealthCoverage?: boolean;

  @ApiProperty({ 
    description: 'Whether maternity services are covered', 
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  maternityCoverage?: boolean;

  @ApiProperty({ 
    description: 'Additional notes about the benefits', 
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
