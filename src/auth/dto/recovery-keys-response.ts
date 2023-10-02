export class RecoveryKeysRespnse {
  public recoveryKeys: string[];

  constructor(recoveryKeys: string[]) {
    this.recoveryKeys = recoveryKeys;
  }

  public static from(recoveryKeys: string[]): RecoveryKeysRespnse {
    return new RecoveryKeysRespnse(recoveryKeys);
  }
}
