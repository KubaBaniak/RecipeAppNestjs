import { User } from '@prisma/client';

export class UserPayloadRequest {
  constructor(
    public id: number,
    public email: string,
    public role: string,
    public activated?: boolean,
    public password?: string,
  ) {}

  public static from(user: User): UserPayloadRequest {
    return new UserPayloadRequest(
      user.id,
      user.email,
      user.role,
      user.activated,
    );
  }

  public static withPasswordFrom(user: User): UserPayloadRequest {
    return new UserPayloadRequest(
      user.id,
      user.email,
      user.role,
      user.activated,
      user.password,
    );
  }
}
