import { Recipe } from '@prisma/client';

export class FetchRecipeResponse {
  constructor(
    public fetchedRecipe: {
      id: number;
      createdAt: Date;
      title: string;
      description: string;
      ingredients: string;
      preparation: string;
    },
  ) {}

  public static from(fetchedRecipe: Recipe): FetchRecipeResponse {
    console.log(fetchedRecipe);
    return new FetchRecipeResponse(fetchedRecipe);
  }
}
