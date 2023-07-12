import { Recipe } from '@prisma/client';
class FetchedRecipe {
  public id: number;
  public createdAt: Date;
  public title: string;
  public description: string;
  public ingredients: string;
  public preparation: string;
  public isPublic: boolean;
  public authorId: number;
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
