import { User } from '@prisma/client';

export class SignUpResponseDto {
  constructor(public user: User) {}

  public static from(user: User): SignUpResponseDto {
    return new SignUpResponseDto(user);
  }
}
