import { IsString, IsEnum, IsOptional, IsDate, IsNumber, ValidateNested, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProviderCategory } from '../enums/provider-category.enum';
import { HealthFacilityType } from '../enums/health-facility-type.enum';
import { AdminCredentialsDto } from './admin-credentials.dto';

export class LocationDto {
  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;

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

export class CreateProviderDto {
  @ApiProperty()
  @IsString()
  facilityName: string;

  @ApiProperty({ enum: ProviderCategory })
  @IsEnum(ProviderCategory)
  category: ProviderCategory;

  @ApiProperty({ enum: HealthFacilityType, required: false })
  @IsEnum(HealthFacilityType)
  @IsOptional()
  facilityType?: HealthFacilityType;

  @ApiProperty()
  @IsString()
  licenseNumber: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  licenseExpiryDate: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ type: AdminCredentialsDto })
  @ValidateNested()
  @Type(() => AdminCredentialsDto)
  @IsDefined()
  admin: AdminCredentialsDto;
}
