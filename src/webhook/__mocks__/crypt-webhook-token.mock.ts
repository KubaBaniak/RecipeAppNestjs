import { faker } from '@faker-js/faker';
import { TokenCrypt } from '../utils/crypt-webhook-token';

export class MockTokenCrypt implements Required<TokenCrypt> {
  encryptToken(_token: string): {
    encryptedToken: string;
    iv: string;
    authTag: string;
  } {
    return {
      encryptedToken: faker.string.alphanumeric(16),
      iv: faker.string.alphanumeric(16),
      authTag: faker.string.alphanumeric(16),
    };
  }

  decryptToken(_encryptedToken: string, _iv: string, _authTag: string): string {
    return faker.string.alphanumeric(16);
  }
}
