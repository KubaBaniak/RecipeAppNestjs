import crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenCrypt {
  private iv = crypto.randomBytes(16);

  encryptToken(token: string) {
    const secretKey = process.env.WEBHOOK_TOKEN_SECRET_KEY;
    const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, this.iv);
    let encryptedText = cipher.update(token, 'utf-8', 'hex');
    return (encryptedText += cipher.final('hex'));
  }

  decryptToken(encryptedToken: string) {
    const secretKey = process.env.WEBHOOK_TOKEN_SECRET_KEY;
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, this.iv);
    let decryptedText = decipher.update(encryptedToken, 'hex', 'utf-8');

    return (decryptedText += decipher.final('utf-8'));
  }
}
