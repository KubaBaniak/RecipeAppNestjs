import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpRequest {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @MinLength(12)
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
