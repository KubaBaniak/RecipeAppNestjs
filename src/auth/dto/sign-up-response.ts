import { UserPayloadRequest } from '../../user/dto/user-request';

export class SignUpResponse {
  constructor(public id: number, public email: string) {}

  public static from(user: UserPayloadRequest): SignUpResponse {
    return new SignUpResponse(user.id, user.email);
  }
}
