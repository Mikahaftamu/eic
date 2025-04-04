import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminCredentialsDto } from '../../auth/dto/admin-credentials.dto';

export class CreateInsuranceCompanyDto {
  @ApiProperty({
    example: 'Ethio Health Insurance',
    description: 'Name of the insurance company',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'EHI',
    description: 'Unique code for the insurance company',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'info@ehi.com',
    description: 'Email of the insurance company',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '+251911234567',
    description: 'Phone number of the insurance company',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'Addis Ababa, Ethiopia',
    description: 'Physical address of the insurance company',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'www.ehi.com',
    description: 'Website of the insurance company',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: 'LIC-123',
    description: 'License number of the insurance company',
  })
  @IsString()
  license: string;

  @ApiProperty({
    example: 'Leading health insurance provider in Ethiopia',
    description: 'Description of the insurance company',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: {
      claimProcessingRules: {},
      premiumCalculationRules: {},
    },
    description: 'Company specific settings',
    required: false,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiProperty({
    description: 'Admin user credentials for the insurance company',
    type: AdminCredentialsDto,
  })
  @ValidateNested()
  @Type(() => AdminCredentialsDto)
  adminCredentials: AdminCredentialsDto;
}
