import { Recipe } from '@prisma/client';

export class FetchAllRecipesResponse {
  constructor(public fetchedRecipes: Recipe[]) {}

  public static from(fetchedRecipes: Recipe[]): FetchAllRecipesResponse  {
    return new FetchAllRecipesResponse(fetchedRecipes);
  }
}
