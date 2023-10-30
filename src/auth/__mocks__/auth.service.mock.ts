import { SignInRequest, SignUpRequest, UserRequest } from '../dto';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { createUserResponse } from '../../user/test/user.factory';
import qrcode from 'qrcode';
import { NUMBER_OF_2FA_RECOVERY_TOKENS } from '../constants';

export class MockAuthService {
  signIn(_signInRequest: SignInRequest): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }

  signUp(signUpRequest: SignUpRequest): Promise<User> {
    return Promise.resolve(
      createUserResponse({
        email: signUpRequest.email,
      }),
    );
  }

  generateAccountActivationToken(_id: number): string {
    return faker.string.sample(64);
  }

  verifyAccountActivationToken(_token: string): Promise<{ id: number }> {
    return Promise.resolve({ id: faker.number.int() });
  }

  activateAccount(id: number): Promise<User> {
    return Promise.resolve(createUserResponse({ id }));
  }

  validateUser(_userRequest: UserRequest): Promise<User> {
    return Promise.resolve(createUserResponse());
  }

  changePassword(_userId: number, _newPassword: string): Promise<void> {
    return Promise.resolve();
  }

  generateResetPasswordToken(_email: string): string {
    return faker.string.sample(64);
  }

  async successfullLoginToken(_id: number, _email: string): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }

  async createQrCodeFor2fa(_userId: number): Promise<string> {
    const data = {
      email: faker.internet.email(),
      service: faker.word.noun(),
    };

    return qrcode.toDataURL(JSON.stringify(data));
  }

  async enable2fa(_userId: number, _providedToken: string): Promise<string[]> {
    return Promise.resolve(
      Array.from({ length: NUMBER_OF_2FA_RECOVERY_TOKENS }, () =>
        faker.string.alphanumeric(16),
      ),
    );
  }

  async disable2fa(userId: number, _providedToken: string): Promise<User> {
    return Promise.resolve(createUserResponse({ id: userId }));
  }

  async verify2fa(_userId: number, _token: string): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }

  async recoverAccountWith2fa(
    _userId: number,
    _providedRecoveryKey: string,
  ): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }
}
