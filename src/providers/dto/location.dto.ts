import { IsNumber, IsString, Min, Max, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty({
    example: 9.145,
    description: 'Latitude coordinate',
    type: Number
  })
  @IsOptional()
  @IsNumber({}, { message: 'latitude must be a valid number' })
  @Min(-90, { message: 'latitude must be between -90 and 90' })
  @Max(90, { message: 'latitude must be between -90 and 90' })
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    example: 40.4897,
    description: 'Longitude coordinate',
    type: Number
  })
  @IsOptional()
  @IsNumber({}, { message: 'longitude must be a valid number' })
  @Min(-180, { message: 'longitude must be between -180 and 180' })
  @Max(180, { message: 'longitude must be between -180 and 180' })
  @Type(() => Number)
  longitude: number;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Ethiopia' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}