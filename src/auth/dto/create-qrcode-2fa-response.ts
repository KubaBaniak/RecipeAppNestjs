export class CreateQrCodeFor2FA {
  public qrCodeUrl: string;
  public urlToEnable2FA = `${process.env.BASE_URL}/api/auth/enable-2fa`;

  constructor(qrCodeUrl: string) {
    this.qrCodeUrl = qrCodeUrl;
  }

  public static from(qrCodeUrl: string): CreateQrCodeFor2FA {
    return new CreateQrCodeFor2FA(qrCodeUrl);
  }
}
