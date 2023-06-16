export class SignInResponse {
  constructor(public accessToken: string) {}

  public static from(accessToken: string): SignInResponse {
    return new SignInResponse(accessToken);
  }
}
