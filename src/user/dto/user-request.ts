import { PendingUsers, User } from '@prisma/client';

export class UserPayloadRequest {
  constructor(public id: number, public email: string) {}

  public static from(user: User | PendingUsers): UserPayloadRequest {
    return new UserPayloadRequest(user.id, user.email);
  }

  public static withPasswordFrom(user: User): UserPayloadRequest {
    return new UserPayloadRequest(user.id, user.email);
  }
}
