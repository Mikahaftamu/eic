import { IsString, IsEnum, IsOptional, IsDate, ValidateNested, IsDefined, IsBoolean, IsArray, IsNotEmpty, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProviderCategory } from '../enums/provider-category.enum';
import { HealthFacilityType } from '../enums/health-facility-type.enum';
import { AdminCredentialsDto } from './admin-credentials.dto';
import { UserType } from '../../common/enums/user-type.enum';
import { LocationDto } from './location.dto';
import { OperatingHoursDto } from './operating-hours.dto';

export class ProviderServiceDto {
  @ApiProperty({ description: 'Medical Service ID' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'Provider-specific price for this service' })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateProviderDto {
  @ApiProperty({ example: 'provider_username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'provider@example.com', required: false })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserType, default: UserType.PROVIDER })
  @IsEnum(UserType)
  userType: UserType = UserType.PROVIDER;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean = true;

  @ApiProperty({ example: 'City Hospital' })
  @IsString()
  @IsNotEmpty()
  facilityName: string;

  @ApiProperty({ enum: ProviderCategory, default: ProviderCategory.HEALTH_FACILITY })
  @IsEnum(ProviderCategory)
  category: ProviderCategory = ProviderCategory.HEALTH_FACILITY;

  @ApiProperty({ enum: HealthFacilityType, required: false })
  @IsEnum(HealthFacilityType)
  @IsOptional()
  facilityType?: HealthFacilityType;

  @ApiProperty({ example: 'City Hospital LLC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+251112345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123 Medical Drive' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'MED-123456' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ enum: HealthFacilityType, example: HealthFacilityType.GENERAL_HOSPITAL })
  @IsEnum(HealthFacilityType)
  @IsNotEmpty()
  healthFacilityType: HealthFacilityType;

  @ApiProperty({ type: [String], example: ['Cardiology', 'Pediatrics'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  specialties: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  services?: any;

  @ApiProperty({ type: [String], example: ['Emergency', 'Surgery'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  facilityServices: string[];

  @ApiProperty({ default: true })
  @IsBoolean()
  active: boolean = true;

  @ApiProperty({ example: '2025-12-31' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  licenseExpiryDate: Date;

  @ApiProperty({ example: 'TAX-123456', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsDefined()
  location: LocationDto;

  @ApiProperty({ type: [OperatingHoursDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursDto as unknown as new () => OperatingHoursDto)
  @IsOptional()
  operatingHours?: OperatingHoursDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  accreditations?: any;

  @ApiProperty({ type: AdminCredentialsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminCredentialsDto)
  admin?: AdminCredentialsDto;

  @ApiProperty({ 
    type: [String],
    description: 'Array of medical service IDs that this provider offers',
    example: ['uuid1', 'uuid2']
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  medicalServiceIds?: string[];
}
