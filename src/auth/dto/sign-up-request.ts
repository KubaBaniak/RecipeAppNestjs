import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpRequest {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @MinLength(12, { message: 'Minimal length of a password is 12' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: `Password must contain: at least 1 upper case letter, at least 1 lower case letter and at least 1 number or special character`,
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
