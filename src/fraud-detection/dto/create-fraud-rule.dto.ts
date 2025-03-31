import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsUUID, IsBoolean, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { RuleType, RuleSeverity, RuleStatus } from '../entities/fraud-rule.entity';
import { Type } from 'class-transformer';

export class CreateFraudRuleDto {
  @ApiProperty({ description: 'Code for the fraud rule', example: 'FREQ-SURG-001' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Name of the fraud rule', example: 'Frequent Surgical Procedures' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the fraud rule', example: 'Detects when a patient receives the same surgical procedure multiple times within a short period' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Type of rule', enum: RuleType, example: RuleType.FREQUENCY })
  @IsEnum(RuleType)
  type: RuleType;

  @ApiProperty({ description: 'Severity of the rule', enum: RuleSeverity, example: RuleSeverity.MEDIUM })
  @IsEnum(RuleSeverity)
  severity: RuleSeverity;

  @ApiProperty({ description: 'Status of the rule', enum: RuleStatus, example: RuleStatus.ACTIVE })
  @IsEnum(RuleStatus)
  status: RuleStatus;

  @ApiProperty({ 
    description: 'Rule configuration as JSON', 
    example: {
      timeframeDays: 30,
      procedureCodes: ['27447', '27130'],
      maxOccurrences: 1,
      excludeDiagnosisCodes: ['S72.0']
    }
  })
  @IsObject()
  configuration: any;

  @ApiProperty({ description: 'Insurance company ID that owns this rule', required: false })
  @IsOptional()
  @IsUUID()
  insuranceCompanyId?: string;

  @ApiProperty({ description: 'Whether this is a system-wide rule', default: false })
  @IsBoolean()
  @IsOptional()
  isSystemWide?: boolean;
}
