import { CreateRecipeRequest, UpdateRecipeRequest } from '../dto';
import { Recipe } from '@prisma/client';
import { createRecipeResponse } from '../test/recipe.factory';

export class MockRecipeService {
  createRecipe(
    userId: number,
    createRecipeRequest: CreateRecipeRequest,
  ): Promise<Recipe> {
    return Promise.resolve(
      createRecipeResponse({ ...createRecipeRequest, authorId: userId }),
    );
  }

  fetchRecipe(recipeId: number, userId: number): Promise<Recipe> {
    return Promise.resolve(
      createRecipeResponse({ id: recipeId, authorId: userId }),
    );
  }

  fetchRecipesByAuthorId(
    authorId: number,
    _principalId: string,
  ): Promise<Recipe[]> {
    return Promise.all([
      createRecipeResponse({ authorId }),
      createRecipeResponse({ authorId }),
    ]);
  }

  fetchAllRecipes(_userId: number): Promise<Recipe[]> {
    return Promise.all([createRecipeResponse(), createRecipeResponse()]);
  }

  updateRecipe(
    userId: number,
    recipeId: number,
    updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<Recipe> {
    return Promise.resolve(
      createRecipeResponse({
        id: recipeId,
        ...updateRecipeRequest,
        authorId: userId,
      }),
    );
  }

  deleteRecipe(_userId: number, _id: number): Promise<void> {
    return Promise.resolve();
  }
}
