import { User } from '@prisma/client';

export class UserPayloadRequest {
  constructor(
    public id: number,
    public email: string,
    public role: string,
    public enabled2FA: boolean,
    public password?: string,
  ) {}

  public static from(user: User): UserPayloadRequest {
    return new UserPayloadRequest(
      user.id,
      user.email,
      user.role,
      user.enabled2FA,
    );
  }

  public static withPasswordFrom(user: User): UserPayloadRequest {
    return new UserPayloadRequest(
      user.id,
      user.email,
      user.role,
      user.enabled2FA,
      user.password,
    );
  }
}
