import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDate, IsEnum, IsISO8601, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum MedicalConditionType {
  CHRONIC = 'CHRONIC',
  ACUTE = 'ACUTE',
  SURGICAL = 'SURGICAL',
  MEDICATION = 'MEDICATION',
  ALLERGY = 'ALLERGY',
  IMMUNIZATION = 'IMMUNIZATION',
  OTHER = 'OTHER',
}

export class MedicalHistoryDto {
  @ApiProperty({ 
    description: 'Type of medical condition', 
    enum: MedicalConditionType,
    example: MedicalConditionType.CHRONIC
  })
  @IsEnum(MedicalConditionType)
  conditionType: MedicalConditionType;

  @ApiProperty({ 
    description: 'Name of the condition or procedure', 
    example: 'Hypertension' 
  })
  @IsString()
  @IsNotEmpty()
  conditionName: string;

  @ApiProperty({ 
    description: 'Date when the condition was diagnosed or procedure performed', 
    example: '2020-01-15',
    type: Date 
  })
  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  diagnosisDate: Date;

  @ApiProperty({ 
    description: 'Whether the condition is currently active', 
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Name of the treating physician', 
    example: 'Dr. Jane Smith',
    required: false
  })
  @IsString()
  @IsOptional()
  treatingPhysician?: string;

  @ApiProperty({ 
    description: 'Name of the hospital or clinic where treatment was received', 
    example: 'City General Hospital',
    required: false
  })
  @IsString()
  @IsOptional()
  treatmentFacility?: string;

  @ApiProperty({ 
    description: 'Current medications related to this condition', 
    example: 'Lisinopril 10mg daily',
    required: false
  })
  @IsString()
  @IsOptional()
  medications?: string;

  @ApiProperty({ 
    description: 'Additional notes about the condition', 
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
