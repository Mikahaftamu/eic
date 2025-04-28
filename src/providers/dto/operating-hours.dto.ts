import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class OperatingHoursDto {
  @ApiProperty()
  @IsString()
  day: string;

  @ApiProperty()
  @IsString()
  openingTime: string;

  @ApiProperty()
  @IsString()
  closingTime: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isClosed?: boolean;
} 