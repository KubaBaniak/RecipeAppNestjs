import { User } from '@prisma/client';

export class SignUpResponse {
  public id: number;
  public email: string;
  public password: string;
  public role: string;

  constructor(id: number, email: string, password: string, role: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  public static from(user: User): SignUpResponse {
    return new SignUpResponse(user.id, user.email, user.password, user.role);
  }
}
