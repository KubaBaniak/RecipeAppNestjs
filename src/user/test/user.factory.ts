import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

type CreateUserOverrides = {
  email?: string;
};

type CreateUserResponseOverrides = {
  id?: number;
  email?: string;
  role?: Role;
};

export const createUser = (overrides: CreateUserOverrides = {}) => ({
  email: overrides.email ?? faker.internet.email(),
});

export const createUserResponse = (
  overrides: CreateUserResponseOverrides = {},
) => ({
  id: overrides.id ?? faker.number.int(),
  email: overrides.email ?? faker.internet.email(),
  role: overrides.role ?? Role.USER,
});
