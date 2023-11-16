import { SignUpRequest } from '../dto';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { createUserResponse } from '../../user/test/user.factory';
import qrcode from 'qrcode';
import { NUMBER_OF_2FA_RECOVERY_TOKENS } from '../constants';

export class MockAuthService {
  signIn(): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }

  signUp(
    signUpRequest: SignUpRequest,
  ): Promise<{ email: string; accountActivationToken: string }> {
    return Promise.resolve({
      email: signUpRequest.email,
      accountActivationToken: faker.string.alphanumeric({ length: 64 }),
    });
  }

  verifyAccountActivationToken(): Promise<{ id: number }> {
    return Promise.resolve({ id: faker.number.int() });
  }

  activateAccount(id: number): Promise<User> {
    return Promise.resolve(createUserResponse({ id }));
  }

  validateUser(): Promise<User> {
    return Promise.resolve(createUserResponse());
  }

  changePassword(): Promise<void> {
    return Promise.resolve();
  }

  generateResetPasswordToken(): string {
    return faker.string.sample(64);
  }

  async successfullLoginToken(): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }

  async createQrCodeFor2fa(): Promise<string> {
    const data = {
      email: faker.internet.email(),
      service: faker.word.noun(),
    };

    return qrcode.toDataURL(JSON.stringify(data));
  }

  async enable2fa(): Promise<string[]> {
    return Promise.resolve(
      Array.from({ length: NUMBER_OF_2FA_RECOVERY_TOKENS }, () =>
        faker.string.alphanumeric(16),
      ),
    );
  }

  async disable2fa(userId: number): Promise<User> {
    return Promise.resolve(createUserResponse({ id: userId }));
  }

  async verify2fa(): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }

  async recoverAccountWith2fa(): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }
}
