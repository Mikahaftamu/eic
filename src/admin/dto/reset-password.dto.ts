import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The ID of the insurance company admin whose password needs to be reset',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  adminId: string;

  @ApiProperty({
    description: 'The new password for the insurance company admin',
    example: 'NewSecurePassword123!'
  })
  @IsString()
  newPassword: string;
}
