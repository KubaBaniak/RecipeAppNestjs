import { faker } from '@faker-js/faker';
import { CreateRecipeRequest, UpdateRecipeRequest } from '../dto';
import { Recipe } from '@prisma/client';

export class MockRecipeService {
  createRecipe(
    createRecipeRequest: CreateRecipeRequest,
    userId: number,
  ): Promise<Recipe> {
    return Promise.resolve({
      id: faker.number.int(),
      createdAt: new Date(),
      ...createRecipeRequest,
      authorId: userId,
    });
  }

  fetchRecipe(recipeId: number, userId: number): Promise<Recipe> {
    return Promise.resolve({
      id: recipeId,
      createdAt: new Date(),
      title: faker.word.noun(),
      description: faker.lorem.text(),
      ingredients: faker.lorem.words(4),
      preparation: faker.lorem.lines(5),
      isPublic: true,
      authorId: userId,
    });
  }

  fetchAllRecipes(userId: number): Promise<Recipe[]> {
    return Promise.all([
      {
        id: 0,
        createdAt: new Date(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
        authorId: userId,
      },
      {
        id: 1,
        createdAt: new Date(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
        authorId: 2,
      },
    ]);
  }

  updateRecipe(
    userId: number,
    recipeId: number,
    updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<Recipe> {
    return Promise.resolve({
      id: recipeId,
      createdAt: new Date(),
      ...updateRecipeRequest,
      authorId: userId,
    });
  }

  deleteRecipe(_userId: number, _id: number): Promise<void> {
    return Promise.resolve();
  }
}
