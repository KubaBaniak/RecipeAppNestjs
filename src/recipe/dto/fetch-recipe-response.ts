import { Recipe } from '@prisma/client';
class FetchedRecipe {
  public id: number;
  public createdAt: Date;
  public title: string;
  public description: string;
  public ingredients: string;
  public preparation: string;
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
