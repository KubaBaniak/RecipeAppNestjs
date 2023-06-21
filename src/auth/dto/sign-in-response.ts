export class SignInResponse {
  public accessToken: string;

  constructor(token: string) {
    this.accessToken = token;
  }

  public static from(token: string): SignInResponse {
    return new SignInResponse(token);
  }
}
