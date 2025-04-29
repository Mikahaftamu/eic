import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClaimStatus } from '../entities/claim.entity';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'New status for the claim',
    enum: ClaimStatus,
    example: ClaimStatus.APPROVED,
  })
  @IsEnum(ClaimStatus)
  status: ClaimStatus;

  @ApiProperty({
    description: 'Optional notes about the status change',
    required: false,
    example: 'Approved after review of medical documentation',
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 