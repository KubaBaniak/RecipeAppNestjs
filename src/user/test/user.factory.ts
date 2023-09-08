import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

type CreateUserOverrides = {
  email?: string;
  password?: string;
};

type CreateUserResponseOverrides = {
  id?: number;
  email?: string;
  password?: string;
  role?: Role;
  enabled2FA?: boolean;
  recoveryKeys?: string[];
};

export const createUser = (overrides: CreateUserOverrides = {}) => ({
  email: overrides.email ?? faker.internet.email(),
  password: overrides.password ?? faker.internet.password(),
});

export const createUserResponse = (
  overrides: CreateUserResponseOverrides = {},
) => ({
  id: overrides.id ?? faker.number.int(),
  email: overrides.email ?? faker.internet.email(),
  password: overrides.password ?? faker.internet.password(),
  role: overrides.role ?? Role.USER,
  enabled2FA: overrides.enabled2FA ?? false,
  recoveryKeys: overrides.recoveryKeys ?? [],
});
