import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';
import { ProviderCategory } from '../../providers/enums/provider-category.enum';
import { HealthFacilityType } from '../../providers/enums/health-facility-type.enum';

class LocationDto {
  @ApiProperty()
  @IsString()
  address: string;

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

export class RegisterProviderDto {
  @ApiProperty({ example: 'drsmith' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'hospital@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Dr.' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'St. Paul Hospital' })
  @IsString()
  facilityName: string;

  @ApiProperty({ enum: ProviderCategory })
  @IsEnum(ProviderCategory)
  category: ProviderCategory;

  @ApiProperty({ enum: HealthFacilityType, required: false })
  @IsEnum(HealthFacilityType)
  @IsOptional()
  facilityType?: HealthFacilityType;

  @ApiProperty({ example: 'LIC123456' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  licenseExpiryDate: string;

  @ApiProperty({ example: 'TAX123456', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty()
  @IsObject()
  location: LocationDto;
}
