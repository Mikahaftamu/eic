import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsEmail, IsOptional, IsObject, ValidateNested, IsUUID, IsArray } from 'class-validator';
import { PaymentFrequency } from '../types';
import { ServiceType, CoverageType } from '../entities/coverage-plan.entity';

export class ContactPersonDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'HR Manager' })
  @IsString()
  position: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;
}

export class ContractDetailsDto {
  @ApiProperty({ example: '2025-01-01' })
  @IsString()
  startDate: Date;

  @ApiProperty({ example: '2026-01-01' })
  @IsString()
  endDate: Date;

  @ApiProperty({ example: 'CNT-2025-001' })
  @IsString()
  contractNumber: string;

  @ApiProperty({ example: 'Monthly' })
  @IsString()
  paymentFrequency: PaymentFrequency;

  @ApiProperty({ example: '1000' })
  @IsString()
  premiumPerEmployee: number;

  @ApiProperty({ example: '10' })
  @IsString()
  minimumEmployees: number;

  @ApiProperty({ example: '1000' })
  @IsString()
  maximumEmployees: number;
}

export class CoveragePlanDto {
  @ApiProperty({ example: 'Medical' })
  @IsString()
  serviceType: ServiceType;

  @ApiProperty({ example: 'Outpatient' })
  @IsString()
  coverageType: CoverageType;

  @ApiProperty({ example: '{ "percentage": 80, "maxAmount": 1000 }' })
  @IsObject()
  coverageDetails: {
    percentage?: number;
    maxAmount?: number;
    annualLimit?: number;
    waitingPeriod?: number;
    preAuthorizationRequired?: boolean;
    exclusions?: string[];
  };
}

export class AdminCredentialsDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;
}

export class CreateCorporateClientDto {
  @ApiProperty({ example: 'Vite Technologies' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'REG-12345' })
  @IsString()
  registrationNumber: string;

  @ApiProperty({ example: 'Addis Ababa, Ethiopia' })
  @IsString()
  address: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'info@vite.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'www.vite.com', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ type: ContactPersonDto })
  @ValidateNested()
  @Type(() => ContactPersonDto)
  contactPerson: ContactPersonDto;

  @ApiProperty()
  @IsUUID()
  insuranceCompanyId: string;

  @ApiProperty({ type: ContractDetailsDto })
  @ValidateNested()
  @Type(() => ContractDetailsDto)
  contractDetails: ContractDetailsDto;

  @ApiProperty({ type: [CoveragePlanDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoveragePlanDto)
  coveragePlans: CoveragePlanDto[];

  @ApiProperty({ type: AdminCredentialsDto })
  @ValidateNested()
  @Type(() => AdminCredentialsDto)
  adminCredentials: AdminCredentialsDto;
}
