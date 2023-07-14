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
      isPublic: true,
      authorId: faker.number.int(),
    };

    return Promise.resolve(CreateRecipeResponse.from(createdRecipe));
  }

  fetchRecipe(
    req: { userId: number },
    recipeId: number,
  ): Promise<FetchRecipeResponse> {
    const fetchedRecipe = {
      id: recipeId,
      createdAt: new Date(),
      title: faker.word.noun(),
      description: faker.lorem.text(),
      ingredients: faker.lorem.words(4),
      preparation: faker.lorem.lines(5),
      isPublic: true,
      authorId: req.userId,
    };

    return Promise.resolve(FetchRecipeResponse.from(fetchedRecipe));
  }

  fetchUsersRecipes(
    _req: { userId: number },
    _email: string,
  ): Promise<FetchRecipesResponse> {
    const authorId = faker.number.int();
    const fetchedUsersRecipes = [
      {
        id: 0,
        createdAt: new Date(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
        authorId,
      },
      {
        id: 1,
        createdAt: new Date(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
        authorId,
      },
    ];

    return Promise.resolve(FetchRecipesResponse.from(fetchedUsersRecipes));
  }

  fetchAllRecipes(req: { userId: number }): Promise<FetchRecipesResponse> {
    const fetchedRecipes = [
      {
        id: 0,
        createdAt: new Date(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
        authorId: req.userId,
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
      },
    ];

    return Promise.resolve(FetchRecipesResponse.from(fetchedRecipes));
  }

  updateRecipe(
    req: { userId: number },
    id: number,
    updateRecipeRequest: UpdateRecipeRequest,
  ): UpdatedRecipeResponse {
    const { title, description, ingredients, preparation, isPublic } =
      updateRecipeRequest;
    const updatedRecipe = {
      id,
      createdAt: new Date(),
      title: title ?? faker.word.noun(),
      description: description ?? faker.lorem.text(),
      ingredients: ingredients ?? faker.lorem.words(4),
      preparation: preparation ?? faker.lorem.lines(5),
      isPublic: isPublic ?? true,
      authorId: req.userId,
    };

    return UpdatedRecipeResponse.from(updatedRecipe);
  }

  deleteRecipe(_req: { userId: number }, _id: number): Promise<void> {
    return Promise.resolve();
  }
}
