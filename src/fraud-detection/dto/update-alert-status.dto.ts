import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';
import { AlertStatus, AlertResolution } from '../entities/claim-fraud-alert.entity';

export class UpdateAlertStatusDto {
  @ApiProperty({ description: 'New status for the alert', enum: AlertStatus })
  @IsEnum(AlertStatus)
  status: AlertStatus;

  @ApiProperty({ description: 'Resolution for the alert', enum: AlertResolution, required: false })
  @IsOptional()
  @IsEnum(AlertResolution)
  resolution?: AlertResolution;

  @ApiProperty({ description: 'Notes added by the reviewer', required: false })
  @IsOptional()
  @IsString()
  reviewNotes?: string;

  @ApiProperty({ description: 'ID of the user who is reviewing the alert' })
  @IsUUID()
  reviewedByUserId: string;
}
