export class SignInResponse {
  public accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  public static from(accessToken: string): SignInResponse {
    return new SignInResponse(accessToken);
  }
}
