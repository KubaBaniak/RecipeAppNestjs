import { faker } from '@faker-js/faker';
import { CreateRecipeRequest, UpdateRecipeRequest } from '../dto';
import { Recipe } from '@prisma/client';

export class MockRecipeService {
  createRecipe(createRecipeRequest: CreateRecipeRequest): Promise<Recipe> {
    return Promise.resolve({
      id: faker.number.int(),
      createdAt: new Date(),
      ...createRecipeRequest,
    });
  }

  fetchRecipe(id: number): Promise<Recipe> {
    return Promise.resolve({
      id,
      createdAt: new Date(),
      title: faker.word.noun(),
      description: faker.lorem.text(),
      ingredients: faker.lorem.words(4),
      preparation: faker.lorem.lines(5),
    });
  }

  fetchAllRecipes(): Promise<Recipe[]> {
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
  }

  updateRecipe(
    id: number,
    updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<Recipe> {
    return Promise.resolve({
      id,
      createdAt: new Date(),
      ...updateRecipeRequest,
    });
  }

  deleteRecipe(_id: number): Promise<void> {
    return Promise.resolve();
  }
}
