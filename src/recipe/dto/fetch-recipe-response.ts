import { Recipe } from '@prisma/client';

export class FetchRecipeResponse {
  constructor(public fetchedRecipe: Recipe) {}

  public static from(fetchedRecipe: Recipe): FetchRecipeResponse {
    return new FetchRecipeResponse(fetchedRecipe);
  }
}
