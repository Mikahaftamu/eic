import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional, IsUUID, IsEnum, IsArray, IsObject, IsBoolean } from 'class-validator';
import { StaffRole } from '../../staff/entities/staff.entity';

interface ClaimsPermissions {
  view?: boolean;
  process?: boolean;
  approve?: boolean;
  deny?: boolean;
}

interface PoliciesPermissions {
  view?: boolean;
  create?: boolean;
  modify?: boolean;
  terminate?: boolean;
}

interface ProvidersPermissions {
  view?: boolean;
  create?: boolean;
  modify?: boolean;
  deactivate?: boolean;
}

interface ReportsPermissions {
  view?: boolean;
  generate?: boolean;
  export?: boolean;
}

interface StaffPermissions {
  claims?: ClaimsPermissions;
  policies?: PoliciesPermissions;
  providers?: ProvidersPermissions;
  reports?: ReportsPermissions;
}

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

  @ApiProperty({
    example: {
      claims: {
        view: true,
        process: true,
        approve: false,
        deny: false
      },
      providers: {
        view: true,
        create: true,
        modify: true,
        deactivate: false
      }
    }
  })
  @IsObject()
  @IsOptional()
  permissions?: StaffPermissions;
}
