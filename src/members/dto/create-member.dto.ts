import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  postalCode: string;
}

class DependentDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty()
  @IsString()
  relationship: string;

  @ApiProperty()
  @IsString()
  gender: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationalId?: string;
}

class MedicalHistoryDto {
  @ApiProperty()
  @IsString()
  condition: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  diagnosedDate: Date;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

class BenefitsDto {
  @ApiProperty()
  @IsString()
  planType: string;

  @ApiProperty()
  @IsString()
  coverageLevel: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  deductible: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  copay: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  outOfPocketMax: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  prescriptionCoverage?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  dentalCoverage?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  visionCoverage?: boolean;
}

export class CreateMemberDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({ required: false, type: [DependentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependentDto)
  dependents?: DependentDto[];

  @ApiProperty({ required: false, type: [MedicalHistoryDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalHistoryDto)
  medicalHistory?: MedicalHistoryDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  coverageStartDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  coverageEndDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BenefitsDto)
  benefits?: BenefitsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  policyContractId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  insuranceCompanyId?: string;
}
