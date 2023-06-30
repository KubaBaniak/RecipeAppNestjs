import { faker } from '@faker-js/faker';
import { Prisma, Recipe, User } from '@prisma/client';
import { UpdateRecipeRequest } from 'src/recipe/dto';

export class MockPrismaService {
  user = {
    create: function (request: {
      data: Prisma.UserCreateInput;
    }): Promise<User> {
      return Promise.resolve({
        id: faker.number.int(),
        email: request.data.email,
        password: request.data.password,
        role: 'USER',
      });
    },

    update: function (request: {
      where: { id: number };
      data: { email: string; password: string };
    }): Promise<User> {
      const { email, password } = request.data;
      return Promise.resolve({
        id: request.where.id,
        email,
        password,
        role: 'USER',
      });
    },

    delete: function (_request: { id: number }): Promise<void> {
      return Promise.resolve();
    },
  };

  recipe = {
    create: function (request: { data: Prisma.RecipeCreateInput }) {
      return Promise.resolve({
        id: faker.number.int(),
        createdAt: new Date(),
        ...request.data,
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
        },
        {
          id: 1,
          createdAt: new Date(),
          title: faker.word.noun(),
          description: faker.lorem.text(),
          ingredients: faker.lorem.words(4),
          preparation: faker.lorem.lines(5),
        },
      ]);
    },

    update: function (request: {
      where: { id: number };
      data: UpdateRecipeRequest;
    }): Promise<Recipe> {
      return Promise.resolve({
        id: request.where.id,
        createdAt: new Date(),
        ...request.data,
      });
    },

    delete: function (_request: number): Promise<void> {
      return Promise.resolve();
    },
  };
}
