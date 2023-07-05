import { SignInRequest, SignUpRequest, UserRequest } from '../dto';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';

export class MockAuthService {
  signIn(_signInRequest: SignInRequest): Promise<String> {
    return Promise.resolve(faker.string.sample(64));
  }

  signUp(signUpRequest: SignUpRequest): Promise<User> {
    return Promise.resolve({
      id: faker.number.int(),
      email: signUpRequest.email,
      password: signUpRequest.password,
      role: 'USER',
    });
  }

  validateUser(userRequest: UserRequest): Promise<User> {
    return Promise.resolve({
      id: faker.number.int(),
      email: userRequest.email,
      password: userRequest.password,
      role: 'USER',
    });
  }
}
