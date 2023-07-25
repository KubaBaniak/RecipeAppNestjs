import { Recipe } from '@prisma/client';
import { FetchedRecipe } from './fetched-recipe';

export class FetchRecipesResponse {
  public fetchedRecipes: FetchedRecipe[];

  constructor(fetchedRecipes: FetchedRecipe[]) {
    this.fetchedRecipes = fetchedRecipes;
  }

  public static from(fetchedRecipes: Recipe[]): FetchRecipesResponse {
    return new FetchRecipesResponse(fetchedRecipes);
  }
}
