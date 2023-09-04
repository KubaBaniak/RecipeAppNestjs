import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { TokenEncryption } from '../dto';

@Injectable()
export class CryptoUtils {
  private algorithm: crypto.CipherGCMTypes = 'aes-256-gcm';

  encryptToken(token: string): TokenEncryption {
    const iv = crypto.randomBytes(16).toString('hex');
    const secretKey = Buffer.from(process.env.WEBHOOK_TOKEN_SECRET_KEY, 'hex');

    const cipher = crypto.createCipheriv(this.algorithm, secretKey, iv);

    let encryptedToken = cipher.update(token, 'utf-8', 'hex');

    encryptedToken += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return { encryptedToken, iv, authTag };
  }

  decryptToken(tokenEncryptionData: TokenEncryption): string {
    const secretKey = Buffer.from(process.env.WEBHOOK_TOKEN_SECRET_KEY, 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      secretKey,
      tokenEncryptionData.iv,
    );
    decipher.setAuthTag(Buffer.from(tokenEncryptionData.authTag, 'hex'));

    let decryptedText = decipher.update(
      tokenEncryptionData.encryptedToken,
      'hex',
      'utf-8',
    );

    return (decryptedText += decipher.final('utf-8'));
  }
}
