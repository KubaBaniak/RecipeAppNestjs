import { faker } from '@faker-js/faker';

type CreateUserOverrides = {
  email?: string;
  password?: string;
};

export const createUser = (overrides: CreateUserOverrides = {}) => ({
  email: overrides.email ?? faker.internet.email(),
  password: overrides.password ?? faker.internet.password(),
});
