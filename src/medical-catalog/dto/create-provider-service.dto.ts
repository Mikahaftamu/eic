import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsBoolean, IsOptional, IsString, Min } from 'class-validator';

export class CreateProviderServiceDto {
  @ApiProperty({ description: 'Provider ID' })
  @IsUUID()
  providerId: string;

  @ApiProperty({ description: 'Medical Service ID' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Provider-specific price for this service' })
  @IsNumber()
  @Min(0)
  providerPrice: number;

  @ApiProperty({ description: 'Whether this service is available at this provider', default: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Provider-specific notes about the service', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
} 