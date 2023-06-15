export class SignInResponseDto {
  constructor(public accessToken: string) {}

  public static from(accessToken: string): SignInResponseDto {
    return new SignInResponseDto(accessToken);
  }
}
