import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

class FetchedRecipe {
  public id: number;
  public createdAt: Date;
  public title: string;
  public description: string;
  public ingredients: string;
  public preparation: string;
}

export class FetchRecipesResponse {
  constructor(public fetchedRecipes: FetchedRecipe[]) {}

  public static from(fetchedRecipes: FetchedRecipe[]): FetchRecipesResponse {
    return new FetchRecipesResponse(fetchedRecipes);
  }
}
