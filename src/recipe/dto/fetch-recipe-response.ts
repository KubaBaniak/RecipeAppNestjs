import { Recipe } from '@prisma/client';
import { FetchedRecipe } from './fetched-recipe';

export class FetchRecipeResponse {
  public fetchedRecipe: FetchedRecipe;

  constructor(fetchedRecipe: FetchedRecipe) {
    this.fetchedRecipe = fetchedRecipe;
  }

  public static from(fetchedRecipe: Recipe): FetchRecipeResponse {
    return new FetchRecipeResponse(fetchedRecipe);
  }
}
