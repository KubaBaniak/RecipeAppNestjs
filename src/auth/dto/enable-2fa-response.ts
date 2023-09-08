export class Enable2FARespnse {
  public recoveryKeys: string[];

  constructor(recoveryKeys: string[]) {
    this.recoveryKeys = recoveryKeys;
  }

  public static from(recoveryKeys: string[]): Enable2FARespnse {
    return new Enable2FARespnse(recoveryKeys);
  }
}
