import { Recipe } from '@prisma/client';

interface FetchedRecipe {
  id: number;
  createdAt: Date;
  title: string;
  description: string;
  ingredients: string;
  preparation: string;
}

export class FetchRecipeResponse {
  public fetchedRecipe: FetchedRecipe;

  constructor(fetchedRecipe: FetchedRecipe) {
    this.fetchedRecipe = fetchedRecipe;
  }

  public static from(fetchedRecipe: Recipe): FetchRecipeResponse {
    return new FetchRecipeResponse(fetchedRecipe);
  }
}
