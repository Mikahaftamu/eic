import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateClaimItemDto {
  @ApiProperty({ description: 'Service or procedure code', example: '99213' })
  @IsString()
  @IsNotEmpty()
  serviceCode: string;

  @ApiProperty({ description: 'Description of the service or procedure', example: 'Office visit, established patient, 15 minutes' })
  @IsString()
  @IsNotEmpty()
  serviceDescription: string;

  @ApiProperty({ 
    description: 'Date the service was provided', 
    example: '2025-03-15',
    type: Date
  })
  @IsDateString()
  serviceDate: string;

  @ApiProperty({ description: 'Quantity of the service provided', example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Price per unit of service', example: 125.50 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Total price for this service (quantity × unitPrice)', example: 125.50 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ 
    description: 'Service code modifiers if applicable', 
    example: 'GP',
    required: false
  })
  @IsString()
  @IsOptional()
  modifiers?: string;

  @ApiProperty({ 
    description: 'Whether this service is excluded from coverage', 
    example: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isExcludedService?: boolean;

  @ApiProperty({ 
    description: 'Whether this service is preventive care', 
    example: true,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isPreventiveCare?: boolean;

  @ApiProperty({ 
    description: 'Additional data in JSON format', 
    example: { placeOfService: '11', renderingProviderNPI: '1234567890' },
    required: false
  })
  @IsOptional()
  additionalData?: any;
}
