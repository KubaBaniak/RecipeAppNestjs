import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignInRequest {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @MinLength(12)
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  token?: string;
}
