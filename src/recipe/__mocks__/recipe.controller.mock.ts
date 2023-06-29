import { faker } from '@faker-js/faker';
import {
  CreateRecipeRequest,
  CreateRecipeResponse,
  FetchRecipeResponse,
  FetchRecipesResponse,
  UpdatedRecipeResponse,
  UpdateRecipeRequest,
} from '../dto';

export class MockRecipeController {
  createRecipe(
    createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = {
      id: faker.number.int(),
      createdAt: new Date(),
      ...createRecipeRequest,
    };

    return Promise.resolve(CreateRecipeResponse.from(createdRecipe));
  }

  fetchRecipe(id: number): Promise<FetchRecipeResponse> {
    const fetchedRecipe = {
      id,
      createdAt: new Date(),
      title: faker.word.noun(),
      description: faker.lorem.text(),
      ingredients: faker.lorem.words(4),
      preparation: faker.lorem.lines(5),
    };

    return Promise.resolve(FetchRecipeResponse.from(fetchedRecipe));
  }

  fetchAllRecipes(): Promise<FetchRecipesResponse> {
    const fetchedRecipes = [
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
    ];

    return Promise.resolve(FetchRecipesResponse.from(fetchedRecipes));
  }
  updateRecipe(
    id: number,
    updateRecipeRequest: UpdateRecipeRequest,
  ): UpdatedRecipeResponse {
    const { title, description, ingredients, preparation } =
      updateRecipeRequest;
    const updatedRecipe = {
      id,
      createdAt: new Date(),
      title: title ?? faker.word.noun(),
      description: description ?? faker.lorem.text(),
      ingredients: ingredients ?? faker.lorem.words(4),
      preparation: preparation ?? faker.lorem.lines(5),
    };

    return UpdatedRecipeResponse.from(updatedRecipe);
  }

  deleteRecipe(_id: number): Promise<void> {
    return Promise.resolve();
  }
}
