import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsBoolean, IsNumber, IsString, IsArray, Min, Max } from 'class-validator';
import { ServiceType, CoverageType } from '../entities/coverage-plan.entity';

export class CoverageDetailsDto {
  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAmount?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  annualLimit?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  waitingPeriod?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  preAuthorizationRequired?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  exclusions?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateCoveragePlanDto {
  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({ enum: CoverageType })
  @IsEnum(CoverageType)
  coverageType: CoverageType;

  @ApiProperty({ type: CoverageDetailsDto })
  @IsObject()
  coverageDetails: CoverageDetailsDto;
}
