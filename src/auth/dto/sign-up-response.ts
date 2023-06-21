import { User } from '@prisma/client';

export class SignUpResponse {
  constructor(
    public id: number,
    public email: string,
    public password: string,
    public role: string,
  ) {}

  public static from(user: User): SignUpResponse {
    return new SignUpResponse(user.id, user.email, user.password, user.role);
  }
}
