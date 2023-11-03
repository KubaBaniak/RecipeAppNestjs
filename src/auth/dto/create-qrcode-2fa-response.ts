export class CreateQrCodeFor2FA {
  public qrCodeUrl: string;

  constructor(qrCodeUrl: string) {
    this.qrCodeUrl = qrCodeUrl;
  }

  public static from(qrCodeUrl: string): CreateQrCodeFor2FA {
    return new CreateQrCodeFor2FA(qrCodeUrl);
  }
}
