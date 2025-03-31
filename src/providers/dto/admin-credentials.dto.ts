import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminCredentialsDto {
  @ApiProperty({ example: 'admin.hospital' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'admin@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '+251911234567' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ 
    example: 'Admin@123',
    description: 'Password for the provider admin account'
  })
  @IsString()
  @MinLength(8)
  password: string;
}
