import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'johnDoe',
    description: 'User username',
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
