import { UserPayloadRequest } from '../../user/dto/user-request';

export class SignUpResponse {
  constructor(
    public id: number,
    public email: string,
    public role: string,
    public enabled2FA: boolean,
  ) {}

  public static from(user: UserPayloadRequest): SignUpResponse {
    return new SignUpResponse(user.id, user.email, user.role, user.enabled2FA);
  }
}
