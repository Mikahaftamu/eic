import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ResetProviderPasswordDto {
  @ApiProperty({
    description: 'The ID of the provider whose password needs to be reset',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'The new password for the provider',
    example: 'NewSecurePassword123!'
  })
  @IsString()
  newPassword: string;
}
