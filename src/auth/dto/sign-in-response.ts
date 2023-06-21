export class SignInResponse {
  constructor(public accessToken: string) {}

  public static from(token: string): SignInResponse {
    return new SignInResponse(token);
  }
}
