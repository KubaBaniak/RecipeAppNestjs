import { faker } from '@faker-js/faker';
import { Prisma, Recipe, User, Role } from '@prisma/client';
import { UpdateRecipeRequest } from 'src/recipe/dto';

let userId: number;

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
        role: Role.USER,
      });
    },

    delete: function (_request: { id: number }): Promise<void> {
      return Promise.resolve();
    },

    findUnique: function (request: { where: { id: number } }): Promise<User> {
      userId = request.where.id;
      return Promise.resolve({
        id: userId,
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: Role.USER,
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
        authorId: userId,
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
        authorId: userId,
        imageKeys: [],
      });
    },

    delete: function (_request: number): Promise<void> {
      return Promise.resolve();
    },
  };
}
