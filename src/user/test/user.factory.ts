import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

type CreateUserOverrides = {
  email?: string;
  password?: string;
};

type UserDaoResponse = {
  id?: number;
  email?: string;
  password?: string;
  role?: Role;
  activated?: boolean;
  accountActivationToken?: string;
};

export const createUser = (overrides: CreateUserOverrides = {}) => ({
  email: overrides.email ?? faker.internet.email(),
  password: overrides.password ?? faker.internet.password(),
});

export const userDaoResponse = (overrides: UserDaoResponse = {}) => ({
  id: overrides.id ?? faker.number.int({ max: 2147483647 }),
  email: overrides.email ?? faker.internet.email(),
  password: overrides.password ?? faker.internet.password(),
  role: overrides.role ?? Role.USER,
  activated: overrides.activated ?? true,
  accountActivationToken:
    overrides.accountActivationToken ?? faker.string.sample(64),
});
