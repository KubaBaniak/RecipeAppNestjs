import { faker } from '@faker-js/faker';
import { Prisma, Recipe, User, Role, PendingUser } from '@prisma/client';
import { UpdateRecipeRequest } from '../../recipe/dto';

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
      data: { email?: string; password?: string };
      where: { id: number };
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

  pendingUser = {
    create: function (request: {
      data: Prisma.UserCreateInput;
    }): Promise<PendingUser> {
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
    }): Promise<PendingUser> {
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
    }): Promise<PendingUser> | Promise<void> {
      const { id, email } = request.where;

      if (email) {
        return Promise.resolve();
      }
      return Promise.resolve({
        id,
        email: faker.internet.email(),
        password: faker.internet.password(),
        createdAt: new Date(),
        accountActivationToken: null,
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
}
