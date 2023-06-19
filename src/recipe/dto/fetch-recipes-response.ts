import { Recipe } from '@prisma/client';

export class FetchRecipesResponse {
  constructor(public fetchedRecipes: Recipe[]) {}

  public static from(fetchedRecipes: Recipe[]): FetchRecipesResponse {
    return new FetchRecipesResponse(fetchedRecipes);
  }
}
