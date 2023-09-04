export class CreatePatResponse {
  public personalAccessToken: string;

  constructor(personalAccessToken: string) {
    this.personalAccessToken = personalAccessToken;
  }

  public static from(personalAccessToken: string): CreatePatResponse {
    return new CreatePatResponse(personalAccessToken);
  }
}
