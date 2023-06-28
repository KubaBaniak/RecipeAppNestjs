import { faker } from '@faker-js/faker';

export class mockAuthController {
  public signIn(_request: { email: string; password: string }) {
    return Promise.resolve({
      accessToken: faker.string.sample(64),
    });
  }

  public signUp(request: { email: string; password: string }) {
    return Promise.resolve({
      id: faker.number.int(),
      email: request.email,
      role: 'USER',
    });
  }
}
