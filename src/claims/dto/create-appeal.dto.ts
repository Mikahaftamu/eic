import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateAppealDto {
  @ApiProperty({
    description: 'Reason for appealing the claim',
    example: 'Additional documentation provided to support the claim',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Amount being appealed for',
    example: 1500.00,
  })
  @IsNumber()
  appealedAmount: number;

  @ApiProperty({
    description: 'Additional supporting information',
    required: false,
    example: 'Patient has been receiving treatment for this condition for over 6 months',
  })
  @IsOptional()
  @IsString()
  supportingInformation?: string;

  @ApiProperty({
    description: 'References to supporting documents',
    required: false,
    type: [String],
    example: ['doc123', 'doc456'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentReferences?: string[];
} 