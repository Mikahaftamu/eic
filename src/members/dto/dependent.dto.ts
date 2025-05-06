import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDate, IsEnum, IsISO8601 } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum RelationshipType {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER',
}

export class DependentDto {
  @ApiProperty({ description: 'First name of the dependent', example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the dependent', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ 
    description: 'Date of birth of the dependent', 
    example: '1990-01-01',
    type: Date 
  })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ 
    description: 'Relationship to the primary member', 
    enum: RelationshipType,
    example: RelationshipType.SPOUSE
  })
  @IsEnum(RelationshipType)
  relationship: RelationshipType;

  @ApiProperty({ 
    description: 'Gender of the dependent', 
    example: 'Female',
    required: false
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ 
    description: 'National ID of the dependent', 
    example: '123-45-6789',
    required: false
  })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiProperty({ 
    description: 'Additional notes about the dependent', 
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
