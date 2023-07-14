import { User } from '@prisma/client';

export class UserDto {
  constructor(public id: number, public email: string, public role: string) {}

  public static from(user: User): UserDto {
    return new UserDto(user.id, user.email, user.role);
  }
}
