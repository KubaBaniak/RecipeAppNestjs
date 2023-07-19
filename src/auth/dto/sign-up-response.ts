import { UserDto } from '../../user/dto/user-response';

export class SignUpResponse {
  constructor(public id: number, public email: string, public role: string) {}

  public static from(user: UserDto): SignUpResponse {
    return new SignUpResponse(user.id, user.email, user.role);
  }
}
