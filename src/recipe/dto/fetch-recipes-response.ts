import { Recipe } from '@prisma/client';

interface FetchedRecipe {
  id: number;
  createdAt: Date;
  title: string;
  description: string;
  ingredients: string;
  preparation: string;
}

export class FetchRecipesResponse {
  public fetchedRecipes: FetchedRecipe[];

  constructor(fetchedRecipes: FetchedRecipe[]) {
    this.fetchedRecipes = fetchedRecipes;
  }

  public static from(fetchedRecipes: Recipe[]): FetchRecipesResponse {
    return new FetchRecipesResponse(fetchedRecipes);
  }
}
