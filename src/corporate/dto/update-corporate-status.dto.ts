import { IsNotEmpty, IsBoolean, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCorporateStatusDto {
  @ApiProperty({ 
    description: 'New corporate client status',
    example: true,
    required: true
  })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ 
    description: 'Reason for the status change',
    example: 'Contract terminated'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the status update',
    example: 'Client requested termination due to business closure'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Effective date of the status change',
    example: '2024-03-21T00:00:00Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveDate?: Date;

  @ApiPropertyOptional({ 
    description: 'Reference number for the status change',
    example: 'TERM-2024-001'
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
} 