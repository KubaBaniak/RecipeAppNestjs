import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordRequest {
  @MinLength(12, { message: 'Minimal length of a password is 12' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: `Password must contain: at least 1 upper case letter, at least 1 lower case letter and at least 1 number or special character`,
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  newPassword: string;
}
