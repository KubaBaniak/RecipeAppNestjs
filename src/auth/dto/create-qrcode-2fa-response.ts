export class CreateQrcodeFor2FA {
  public qrcodeUrl: string;
  public urlToEnable2FA = `${process.env.URL}/api/auth/enable-2fa`;

  constructor(qrcodeUrl: string) {
    this.qrcodeUrl = qrcodeUrl;
  }

  public static from(qrcodeUrl: string): CreateQrcodeFor2FA {
    return new CreateQrcodeFor2FA(qrcodeUrl);
  }
}
