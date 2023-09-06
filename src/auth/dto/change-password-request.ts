import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordRequest {
  @MinLength(12)
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  newPassword: string;
}
