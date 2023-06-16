import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(12)
  @IsNotEmpty()
  @IsString()
  password: string;
}
