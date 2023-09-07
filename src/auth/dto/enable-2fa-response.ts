export class Enable2FAResponse {
  public recoveryKeys: string[];
  public qrcodeUrl: string;

  constructor(recoveryKeys: string[], qrcodeUrl: string) {
    this.recoveryKeys = recoveryKeys;
    this.qrcodeUrl = qrcodeUrl;
  }

  public static from(dataObject: {
    recoveryKeys: string[];
    qrcodeUrl: string;
  }): Enable2FAResponse {
    return new Enable2FAResponse(dataObject.recoveryKeys, dataObject.qrcodeUrl);
  }
}
