import { User } from '@prisma/client';

export class SignUpResponse {
  constructor(public user: User) {}

  public static from(user: User): SignUpResponse {
    return new SignUpResponse(user);
  }
}
