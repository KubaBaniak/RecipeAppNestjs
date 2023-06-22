import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInRequest {
  @ApiProperty({
    description: "User's email",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User's password",
    example: 'examplepassword',
  })
  @MinLength(12)
  @IsNotEmpty()
  @IsString()
  password: string;
}
