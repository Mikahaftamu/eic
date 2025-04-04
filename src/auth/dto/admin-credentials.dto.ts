import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class AdminCredentialsDto {
  @ApiProperty({
    example: 'admin.ehi',
    description: 'Admin username',
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'admin@ehi.com',
    description: 'Admin email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'Admin password',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Admin first name',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Admin last name',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '+251911234567',
    description: 'Admin phone number',
  })
  @IsString()
  phoneNumber: string;
}
