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
    userObjectId: number,
    createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = createRecipeResponse({
      authorId: userObjectId,
      ...createRecipeRequest,
    });

    return Promise.resolve(CreateRecipeResponse.from(createdRecipe));
  }

  fetchRecipe(
    req: { userId: number },
    recipeId: number,
  ): Promise<FetchRecipeResponse> {
    const fetchedRecipe = createRecipeResponse({
      id: recipeId,
      authorId: req.userId,
    });

    return Promise.resolve(FetchRecipeResponse.from(fetchedRecipe));
  }

  fetchRecipesByAuthorId(
    _req: { userId: number },
    _email: string,
  ): Promise<FetchRecipesResponse> {
    const fetchedUsersRecipes = [
      createRecipeResponse({ id: 0 }),
      createRecipeResponse({ id: 1 }),
    ];

    return Promise.resolve(FetchRecipesResponse.from(fetchedUsersRecipes));
  }

  fetchAllRecipes(req: { userId: number }): Promise<FetchRecipesResponse> {
    const fetchedRecipes = [
      createRecipeResponse({ id: 0, authorId: req.userId }),
      createRecipeResponse({ id: 1 }),
    ];

    return Promise.resolve(FetchRecipesResponse.from(fetchedRecipes));
  }

  updateRecipe(
    req: { userId: number },
    id: number,
    updateRecipeRequest: UpdateRecipeRequest,
  ): UpdatedRecipeResponse {
    const updatedRecipe = createRecipeResponse({
      id,
      ...updateRecipeRequest,
      authorId: req.userId,
    });

    return UpdatedRecipeResponse.from(updatedRecipe);
  }

  deleteRecipe(_req: { userId: number }, _id: number): Promise<void> {
    return Promise.resolve();
  }
}
