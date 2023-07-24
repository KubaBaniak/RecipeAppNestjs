import {
  CreateRecipeRequest,
  CreateRecipeResponse,
  FetchRecipeResponse,
  FetchRecipesResponse,
  UpdatedRecipeResponse,
  UpdateRecipeRequest,
} from '../dto';
import { createRecipeResponse } from '../test/recipe.factory';

export class MockRecipeController {
  createRecipe(
    userId: number,
    createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = createRecipeResponse({
      authorId: userId,
      ...createRecipeRequest,
    });

    return Promise.resolve(CreateRecipeResponse.from(createdRecipe));
  }

  fetchRecipe(userId: number, recipeId: number): Promise<FetchRecipeResponse> {
    const fetchedRecipe = createRecipeResponse({
      id: recipeId,
      authorId: userId,
    });

    return Promise.resolve(FetchRecipeResponse.from(fetchedRecipe));
  }

  fetchRecipesByAuthorId(
    _userId: number,
    _email: string,
  ): Promise<FetchRecipesResponse> {
    const fetchedUsersRecipes = [
      createRecipeResponse({ id: 0 }),
      createRecipeResponse({ id: 1 }),
    ];

    return Promise.resolve(FetchRecipesResponse.from(fetchedUsersRecipes));
  }

  fetchRecipes(userId: number): Promise<FetchRecipesResponse> {
    const fetchedRecipes = [
      createRecipeResponse({ id: 0, authorId: userId }),
      createRecipeResponse({ id: 1 }),
    ];

    return Promise.resolve(FetchRecipesResponse.from(fetchedRecipes));
  }

  updateRecipe(
    userId: number,
    id: number,
    updateRecipeRequest: UpdateRecipeRequest,
  ): UpdatedRecipeResponse {
    const updatedRecipe = createRecipeResponse({
      id,
      ...updateRecipeRequest,
      authorId: userId,
    });

    return UpdatedRecipeResponse.from(updatedRecipe);
  }

  deleteRecipe(_userId: number, _id: number): Promise<void> {
    return Promise.resolve();
  }
}
