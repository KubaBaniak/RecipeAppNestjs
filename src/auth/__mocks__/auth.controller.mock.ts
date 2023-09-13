import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';
import {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from '../dto';

export class MockAuthController {
  signIn(_signInRequest: SignInRequest): Promise<SignInResponse> {
    const accessToken = faker.string.sample(64);

    return Promise.resolve(SignInResponse.from(accessToken));
  }

  signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const signedUpUser = {
      id: faker.number.int(),
      email: signUpRequest.email,
      password: signUpRequest.password,
      role: Role.USER,
    };

    return Promise.resolve(SignUpResponse.from(signedUpUser));
  }
}
