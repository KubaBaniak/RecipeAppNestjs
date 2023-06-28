import { faker } from '@faker-js/faker';
class MockRecipeRequest {
  data: {
    title: string;
    description: string;
    ingredients: string;
    preparation: string;
  };
}

export class mockRecipeService {
  public recipe = {
    create: function (request: MockRecipeRequest) {
      return Promise.resolve({
        id: 420,
        createdAt: Date.now(),
        ...request.data,
      });
    },

    findUnique: function (request: { where: { id: number } }) {
      return Promise.resolve({
        id: request.where.id,
        createdAt: Date.now(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
      });
    },

    findMany: function () {
      return Promise.resolve([
        {
          id: 0,
          createdAt: Date.now(),
          title: faker.word.noun(),
          description: faker.lorem.text(),
          ingredients: faker.lorem.words(4),
          preparation: faker.lorem.lines(5),
        },
        {
          id: 1,
          createdAt: Date.now(),
          title: faker.word.noun(),
          description: faker.lorem.text(),
          ingredients: faker.lorem.words(4),
          preparation: faker.lorem.lines(5),
        },
      ]);
    },

    update: function (request: {
      where: { id: number };
      data: MockRecipeRequest;
    }) {
      return Promise.resolve({
        id: request.where.id,
        createdAt: Date.now(),
        ...request.data,
      });
    },
    delete: function (_request: number) {
      return Promise.resolve();
    },
  };
}
