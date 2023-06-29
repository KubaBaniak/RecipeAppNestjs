import { faker } from '@faker-js/faker';
import { SignInRequest } from '../dto';

export class MockJwtService {
  signAsync(_signInRequest: SignInRequest): Promise<string> {
    return Promise.resolve(faker.string.sample(64));
  }
}
