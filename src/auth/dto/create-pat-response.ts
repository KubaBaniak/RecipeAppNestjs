export class CreatePatResponse {
  public patToken: string;

  constructor(patToken: string) {
    this.patToken = patToken;
  }

  public static from(patToken: string): CreatePatResponse {
    return new CreatePatResponse(patToken);
  }
}
