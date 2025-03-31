import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional, IsUUID, IsEnum, IsArray } from 'class-validator';
import { StaffRole } from '../../staff/entities/staff.entity';

export class RegisterStaffDto {
  @ApiProperty({
    example: 'staffjohn',
    description: 'Staff username',
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'staff@example.com',
    description: 'Staff email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'password123',
    description: 'Staff password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'Jane',
    description: 'Staff first name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Smith',
    description: 'Staff last name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '+251912345678',
    description: 'Staff phone number',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'EMP123',
    description: 'Staff employee ID',
  })
  @IsString()
  employeeId: string;

  @ApiProperty({
    example: StaffRole.GENERAL_STAFF,
    description: 'Staff role',
    enum: StaffRole,
  })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiProperty({
    example: 'Claims',
    description: 'Staff department',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: 'Claims Processor',
    description: 'Staff position',
    required: false,
  })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Insurance company ID',
  })
  @IsUUID()
  insuranceCompanyId: string;

  @ApiProperty({ example: 'Claims' })
  @IsString()
  @IsOptional()
  supervisor?: string;

  @ApiProperty({ example: ['VIEW_CLAIMS', 'PROCESS_CLAIMS'] })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}
