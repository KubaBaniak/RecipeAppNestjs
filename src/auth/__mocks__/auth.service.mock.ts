import { SignInRequest, SignUpRequest, UserRequest } from '../dto';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { userDaoResponse } from 'src/user/test/user.factory';

export class MockAuthService {
  signIn(_signInRequest: SignInRequest): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }

  signUp(signUpRequest: SignUpRequest): Promise<User> {
    return Promise.resolve(
      userDaoResponse({
        email: signUpRequest.email,
        password: signUpRequest.password,
      }),
    );
  }

  validateUser(userRequest: UserRequest): Promise<User> {
    return Promise.resolve(
      userDaoResponse({
        email: userRequest.email,
        password: userRequest.password,
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
    return Promise.resolve(userDaoResponse({ id }));
  }

  changePassword(_userId: number, _newPassword: string): Promise<void> {
    return Promise.resolve();
  }
}
