import { NUMBER_OF_2FA_RECOVERY_TOKENS } from '../../auth/constants';
import {
  Prisma,
  Recipe,
  User,
  Role,
  TwoFactorAuth,
  TwoFactorAuthRecoveryKey,
  PendingUsers,
} from '@prisma/client';
import { UpdateRecipeRequest } from '../../recipe/dto';
import { faker } from '@faker-js/faker';

let lastSearchedByIdUser: number;

export class MockPrismaService {
  user = {
    create: function (request: {
      data: Prisma.UserCreateInput;
    }): Promise<User> {
      return Promise.resolve({
        id: faker.number.int(),
        email: request.data.email,
        password: request.data.password,
        role: Role.USER,
        activated: false,
        accountActivationToken: null,
      });
    },

    update: function (request: {
      where: { id: number };
      data: {
        email?: string;
        password?: string;
        activated?: boolean;
        accountActivationToken?: string;
      };
    }): Promise<User> {
      const { email, password } = request.data;
      return Promise.resolve({
        id: request.where.id,
        email: email ?? faker.internet.email(),
        password: password ?? faker.internet.password(),
        role: Role.USER,
      });
    },

    delete: function (_request: { id: number }): Promise<void> {
      return Promise.resolve();
    },

    findUnique: function (request: {
      where: { id?: number; email?: string; password?: string };
    }): Promise<User> | Promise<void> {
      const { id, email } = request.where;
      // for signUp test
      if (email) {
        return Promise.resolve();
      }
      lastSearchedByIdUser = id;
      return Promise.resolve({
        id,
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: Role.USER,
        activated: false,
        accountActivationToken: null,
      });
    },
  };

  pendingUsers = {
    create: function (request: {
      data: Prisma.UserCreateInput;
    }): Promise<PendingUsers> {
      return Promise.resolve({
        id: faker.number.int(),
        email: request.data.email,
        password: request.data.password,
        accountActivationToken: faker.string.alphanumeric(32),
        createdAt: new Date(),
      });
    },

    update: function (request: {
      where: { id: number };
      data: {
        email?: string;
        password?: string;
        accountActivationToken?: string;
      };
    }): Promise<PendingUsers> {
      const { email, password, accountActivationToken } = request.data;
      return Promise.resolve({
        id: request.where.id,
        email: email ?? faker.internet.email(),
        password: password ?? faker.internet.password(),
        createdAt: new Date(),
        accountActivationToken: accountActivationToken ?? null,
      });
    },

    delete: function (_request: { id: number }): Promise<void> {
      return Promise.resolve();
    },

    findUnique: function (request: {
      where: { id?: number; email?: string };
    }): Promise<PendingUsers> | Promise<void> {
      const { id, email } = request.where;

      if (email) {
        return Promise.resolve();
      }
      return Promise.resolve({
        id,
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: new Date(),
        accountActivationToken: faker.string.alphanumeric(16),
      });
    },
  };

  recipe = {
    create: function (request: { data: Prisma.RecipeCreateInput }) {
      return Promise.resolve({
        id: faker.number.int(),
        createdAt: new Date(),
        ...request.data,
        imageKeys: [],
      });
    },

    findUnique: function (request: { where: { id: number } }): Promise<Recipe> {
      return Promise.resolve({
        id: request.where.id,
        createdAt: new Date(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
        authorId: lastSearchedByIdUser,
        imageKeys: [],
      });
    },

    findMany: function (): Promise<Recipe[]> {
      return Promise.all([
        {
          id: 0,
          createdAt: new Date(),
          title: faker.word.noun(),
          description: faker.lorem.text(),
          ingredients: faker.lorem.words(4),
          preparation: faker.lorem.lines(5),
          isPublic: true,
          authorId: faker.number.int(),
          imageKeys: [],
        },
        {
          id: 1,
          createdAt: new Date(),
          title: faker.word.noun(),
          description: faker.lorem.text(),
          ingredients: faker.lorem.words(4),
          preparation: faker.lorem.lines(5),
          isPublic: true,
          authorId: faker.number.int(),
          imageKeys: [],
        },
      ]);
    },

    update: function (request: {
      where: { id: number };
      data: UpdateRecipeRequest;
    }): Promise<Recipe> {
      const { title, description, ingredients, preparation, isPublic } =
        request.data;
      return Promise.resolve({
        id: request.where.id,
        createdAt: new Date(),
        title: title ?? 'base_title',
        description: description ?? 'base_description',
        ingredients: ingredients ?? 'base_ingredients',
        preparation: preparation ?? 'base_preparation',
        isPublic: isPublic ?? true,
        authorId: lastSearchedByIdUser,
        imageKeys: [],
      });
    },

    delete: function (_request: number): Promise<void> {
      return Promise.resolve();
    },
  };

  twoFactorAuth = {
    create: function (data: {
      userId: number;
      secretKey: string;
    }): Promise<TwoFactorAuth> {
      return Promise.resolve({
        id: faker.number.int(),
        ...data,
        isEnabled: false,
      });
    },

    findUnique: function (_where: {
      userId: number;
    }): Promise<{ recoveryKeys: { key: string; isUsed: boolean }[] }> {
      return Promise.resolve({
        recoveryKeys: Array.from(
          { length: NUMBER_OF_2FA_RECOVERY_TOKENS },
          () => {
            return { key: faker.string.alphanumeric(16), isUsed: false };
          },
        ),
      });
    },

    update: function (_where: { userId: number }): Promise<TwoFactorAuth> {
      return Promise.resolve({
        id: faker.number.int(),
        userId: faker.number.int(),
        secretKey: faker.string.alphanumeric(16),
        isEnabled: false,
      });
    },

    delete: function (_where: { id: number }): Promise<TwoFactorAuth> {
      return Promise.resolve({
        id: faker.number.int(),
        userId: faker.number.int(),
        secretKey: faker.string.numeric(6),
        isEnabled: true,
      });
    },
  };

  twoFactorAuthRecoveryKey = {
    update: function (where: {
      key: string;
    }): Promise<TwoFactorAuthRecoveryKey> {
      return Promise.resolve({
        id: faker.number.int(),
        key: where.key,
        isUsed: true,
        usedAt: new Date(),
        twoFactorAuthId: faker.number.int(),
      });
    },
  };
}
