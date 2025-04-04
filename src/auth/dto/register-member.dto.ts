import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class RegisterMemberDto {
  @ApiProperty({ example: 'johnDoe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+251912345678' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: 'ETH123456' })
  @IsString()
  nationalId: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  region: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  employerId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  insuranceCompanyId: string;
}
